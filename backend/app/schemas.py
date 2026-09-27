"""Pydantic request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    model_config = {"from_attributes": True}


# ── Products ──
class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    stock: int = 0
    category: str = "general"
    image_url: str = ""


# ── Orders ──
class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class CheckoutRequest(BaseModel):
    items: list[CartItem]


class OrderItemOut(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    status: str
    total_amount: float
    items: list[OrderItemOut]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Test Runs ──
class TestFailureOut(BaseModel):
    id: int
    test_name: str
    error_message: str
    ai_analysis: str
    is_flaky: bool
    retry_count: int

    model_config = {"from_attributes": True}


class TestRunOut(BaseModel):
    id: int
    pipeline_id: str
    status: str
    total_tests: int
    passed: int
    failed: int
    flaky_score: float
    duration_ms: int
    created_at: datetime
    failures: list[TestFailureOut] = []

    model_config = {"from_attributes": True}


class TestRunCreate(BaseModel):
    pipeline_id: str = "local"
    total_tests: int
    passed: int
    failed: int
    duration_ms: int = 0
    failures: list[dict] = []


class AIAnalysisRequest(BaseModel):
    test_name: str
    error_message: str
    stack_trace: str = ""


class AIAnalysisResponse(BaseModel):
    root_cause: str
    suggested_fix: str
    similar_failures: list[str] = []
    confidence: float
