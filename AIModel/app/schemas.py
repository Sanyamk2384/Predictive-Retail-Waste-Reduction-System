from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from datetime import datetime

class ProductPredictionRequest(BaseModel):
    store_id: Optional[str] = Field(None, description="Optional Store Mongo ObjectId filter")
    product_id: Optional[str] = Field(None, description="Optional single Product Mongo ObjectId filter")
    forecast_days: int = Field(default=30, ge=1, le=365, description="Days to predict ahead")
    model_type: Literal["random_forest", "gradient_boosting"] = Field(
        default="random_forest",
        description="random_forest or gradient_boosting",
    )

class ProductForecastItem(BaseModel):
    productId: str
    predictedTotalQuantity: float = Field(ge=0)
    predictedTotalRevenue: float = Field(ge=0)
    dailyAverageQuantity: float = Field(ge=0)
    confidenceNote: str

class PredictionReportResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    storeId: Optional[str] = None
    productIdFilter: Optional[str] = None
    modelUsed: str
    forecastDays: int
    totalProductsAnalyzed: int
    productForecasts: List[ProductForecastItem]
    createdAt: datetime

    class Config:
        populate_by_name = True