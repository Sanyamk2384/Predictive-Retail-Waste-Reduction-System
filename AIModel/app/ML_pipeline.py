import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def train_and_forecast_per_product(
    sales_records: list, 
    forecast_days: int = 30, 
    model_type: str = "random_forest"
):
    """
    Groups raw mongo sales data by productId, computes historic product features,
    and predicts total cumulative sales (quantity & revenue) per product for the next N days.
    """
    if not sales_records:
        raise ValueError("No sales records found to build predictions.")

    df = pd.DataFrame(sales_records)
    df['date'] = pd.to_datetime(df['date'])
    df['productId'] = df['productId'].astype(str)

    # 1. Aggregate daily sales per product
    product_daily = df.groupby(['productId', df['date'].dt.date]).agg({
        'quantitySold': 'sum',
        'totalAmount': 'sum'
    }).reset_index()
    product_daily.rename(columns={'date': 'date_day'}, inplace=True)
    product_daily['date_day'] = pd.to_datetime(product_daily['date_day'])

    all_products = product_daily['productId'].unique()
    product_forecasts = []

    # 2. Iterate per product to build feature matrices & generate cumulative predictions
    for pid in all_products:
        p_df = product_daily[product_daily['productId'] == pid].sort_values('date_day')

        if len(p_df) < 7:
            # Fallback for products with minimal historical data: simple moving average velocity
            avg_daily_qty = p_df['quantitySold'].mean()
            avg_daily_rev = p_df['totalAmount'].mean()

            predicted_qty = max(0.0, avg_daily_qty * forecast_days)
            predicted_rev = max(0.0, avg_daily_rev * forecast_days)

            product_forecasts.append({
                "productId": pid,
                "predictedTotalQuantity": round(predicted_qty, 2),
                "predictedTotalRevenue": round(predicted_rev, 2),
                "dailyAverageQuantity": round(avg_daily_qty, 2),
                "confidenceNote": "Baseline moving average used (less than 7 days history)"
            })
            continue

        # Fill missing dates for continuous time-series feature generation
        min_date, max_date = p_df['date_day'].min(), p_df['date_day'].max()
        full_range = pd.date_range(start=min_date, end=max_date, freq='D')
        
        p_df_full = p_df.set_index('date_day').reindex(full_range).fillna({
            'quantitySold': 0,
            'totalAmount': 0,
            'productId': pid
        }).reset_index()
        p_df_full.rename(columns={'index': 'date_day'}, inplace=True)

        # Build historic product-level momentum features
        p_df_full['rolling_7_qty'] = p_df_full['quantitySold'].rolling(7, min_periods=1).mean()
        p_df_full['rolling_30_qty'] = p_df_full['quantitySold'].rolling(30, min_periods=1).mean()
        p_df_full['rolling_7_rev'] = p_df_full['totalAmount'].rolling(7, min_periods=1).mean()
        p_df_full['rolling_30_rev'] = p_df_full['totalAmount'].rolling(30, min_periods=1).mean()

        # Target variable for ML model training: cumulative N-day forward sales.
        # Use mean()*forecast_days rather than sum(): near the end of the series the
        # forward window is right-censored (there's no real data past "today"), so a
        # plain rolling sum silently shrinks for exactly the rows closest to "now" -
        # which is the row actually used for live inference below. Scaling the mean of
        # whatever future days ARE available keeps the target an unbiased estimate of a
        # full forecast_days-ahead total regardless of how much of the window exists,
        # and is identical to the old sum() wherever a full window is present.
        p_df_full['target_future_qty'] = (
            p_df_full['quantitySold'].iloc[::-1].rolling(forecast_days, min_periods=1).mean().iloc[::-1]
            * forecast_days
        )
        p_df_full['target_future_rev'] = (
            p_df_full['totalAmount'].iloc[::-1].rolling(forecast_days, min_periods=1).mean().iloc[::-1]
            * forecast_days
        )

        # Prepare feature matrix X and target y
        features = [
            'quantitySold', 'totalAmount', 
            'rolling_7_qty', 'rolling_30_qty', 
            'rolling_7_rev', 'rolling_30_rev'
        ]
        
        train_data = p_df_full.dropna(subset=['target_future_qty', 'target_future_rev'])

        if len(train_data) < 5:
            # Fallback if window indexing is too short
            avg_daily_qty = p_df_full['quantitySold'].mean()
            avg_daily_rev = p_df_full['totalAmount'].mean()
            
            product_forecasts.append({
                "productId": pid,
                "predictedTotalQuantity": round(avg_daily_qty * forecast_days, 2),
                "predictedTotalRevenue": round(avg_daily_rev * forecast_days, 2),
                "dailyAverageQuantity": round(avg_daily_qty, 2),
                "confidenceNote": "Weighted historical average used"
            })
            continue

        X_train = train_data[features]
        y_train_qty = train_data['target_future_qty']
        y_train_rev = train_data['target_future_rev']

        # Instantiate Regressor Model
        if model_type == "gradient_boosting":
            model_qty = GradientBoostingRegressor(n_estimators=50, learning_rate=0.05, max_depth=3, random_state=42)
            model_rev = GradientBoostingRegressor(n_estimators=50, learning_rate=0.05, max_depth=3, random_state=42)
        else:
            model_qty = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
            model_rev = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)

        model_qty.fit(X_train, y_train_qty)
        model_rev.fit(X_train, y_train_rev)

        # Feature vector representing current state (latest available data point)
        latest_features = p_df_full[features].iloc[[-1]]

        pred_total_qty = max(0.0, float(model_qty.predict(latest_features)[0]))
        pred_total_rev = max(0.0, float(model_rev.predict(latest_features)[0]))

        product_forecasts.append({
            "productId": pid,
            "predictedTotalQuantity": round(pred_total_qty, 2),
            "predictedTotalRevenue": round(pred_total_rev, 2),
            "dailyAverageQuantity": round(pred_total_qty / forecast_days, 2),
            "confidenceNote": f"ML Predicted ({model_type.replace('_', ' ').title()})"
        })

    return product_forecasts