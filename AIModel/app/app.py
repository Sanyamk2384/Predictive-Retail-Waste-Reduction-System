from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from datetime import datetime
from bson import ObjectId
from .database import get_database
from .ML_pipeline import train_and_forecast_per_product

app = FastAPI(title="Product Sales Prediction Engine", version="2.0")

class ProductPredictionRequest(BaseModel):
    store_id: Optional[str] = Field(None, description="Optional Store Mongo ObjectId")
    product_id: Optional[str] = Field(None, description="Optional single Product Mongo ObjectId filter")
    forecast_days: int = Field(default=30, ge=1, le=365, description="Number of future days to predict sales for")
    model_type: Literal["random_forest", "gradient_boosting"] = Field(
        default="random_forest",
        description="random_forest or gradient_boosting",
    )

@app.post("/predict/products")
async def generate_product_sales_prediction(
    request: ProductPredictionRequest,
    db = Depends(get_database)
):
    # 1. Build Query Filter
    query = {}
    if request.store_id:
        try:
            query["storeId"] = ObjectId(request.store_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid store_id format.")

    if request.product_id:
        try:
            query["productId"] = ObjectId(request.product_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid product_id format.")

    # 2. Retrieve sales from MongoDB
    sales_cursor = db["sales"].find(
        query, 
        {"productId": 1, "quantitySold": 1, "totalAmount": 1, "date": 1, "_id": 0}
    )
    sales_records = await sales_cursor.to_list(length=None)

    if not sales_records:
        raise HTTPException(
            status_code=404, 
            detail="No sales data found matching the provided filter criteria."
        )

    # 3. Process ML Pipeline for product-level predictions
    try:
        product_forecasts = train_and_forecast_per_product(
            sales_records=sales_records,
            forecast_days=request.forecast_days,
            model_type=request.model_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # 4. Construct MongoDB Report Document
    report_doc = {
        "storeId": ObjectId(request.store_id) if request.store_id else None,
        "productIdFilter": ObjectId(request.product_id) if request.product_id else None,
        "modelUsed": request.model_type,
        "forecastDays": request.forecast_days,
        "totalProductsAnalyzed": len(product_forecasts),
        "productForecasts": [
            {
                "productId": ObjectId(p["productId"]),
                "predictedTotalQuantity": p["predictedTotalQuantity"],
                "predictedTotalRevenue": p["predictedTotalRevenue"],
                "dailyAverageQuantity": p["dailyAverageQuantity"],
                "confidenceNote": p["confidenceNote"]
            }
            for p in product_forecasts
        ],
        "createdAt": datetime.utcnow()
    }

    # 5. Save reports to the collection used by the Express PredictionReport model.
    result = await db["predictionreports"].insert_one(report_doc)

    return {
        "status": "success",
        "message": f"Expected product sales predicted for the next {request.forecast_days} days.",
        "reportId": str(result.inserted_id),
        "forecastDays": request.forecast_days,
        "totalProducts": len(product_forecasts),
        "predictions": product_forecasts
    }