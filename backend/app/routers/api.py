"""API route handlers."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, TestFailure, TestRun, User
from app.schemas import (
    AIAnalysisRequest,
    AIAnalysisResponse,
    CheckoutRequest,
    OrderOut,
    ProductCreate,
    ProductOut,
    TestRunCreate,
    TestRunOut,
    Token,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.services.auth import create_access_token, get_current_user, hash_password, require_admin, verify_password
from app.services.orders import order_to_dict, process_checkout
from app.ai.analyzer import analyze_failure, index_failure

router = APIRouter()


# ── Auth ──
@router.post("/auth/register", response_model=UserOut)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


# ── Products ──
@router.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active).all()


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ── Orders ──
@router.post("/orders/checkout", response_model=OrderOut)
def checkout(data: CheckoutRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = process_checkout(db, user.id, data.items)
    return order_to_dict(order)


@router.get("/orders", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models import Order

    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return [order_to_dict(o) for o in orders]


# ── Test Runs (QA Dashboard) ──
@router.get("/test-runs", response_model=list[TestRunOut])
def list_test_runs(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    runs = db.query(TestRun).order_by(TestRun.created_at.desc()).limit(20).all()
    return runs


@router.post("/test-runs", response_model=TestRunOut)
def create_test_run(data: TestRunCreate, db: Session = Depends(get_db)):
    flaky_score = 0.0
    if data.total_tests > 0 and data.failed > 0:
        flaky_score = round(data.failed / data.total_tests, 2)

    run = TestRun(
        pipeline_id=data.pipeline_id,
        status="passed" if data.failed == 0 else "failed",
        total_tests=data.total_tests,
        passed=data.passed,
        failed=data.failed,
        flaky_score=flaky_score,
        duration_ms=data.duration_ms,
    )

    for f in data.failures:
        run.failures.append(TestFailure(
            test_name=f.get("test_name", "unknown"),
            error_message=f.get("error_message", ""),
            stack_trace=f.get("stack_trace", ""),
            screenshot_path=f.get("screenshot_path", ""),
            retry_count=f.get("retry_count", 0),
            is_flaky=f.get("is_flaky", False),
        ))

    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.get("/test-runs/{run_id}", response_model=TestRunOut)
def get_test_run(run_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run


# ── AI Analysis ──
@router.post("/ai/analyze", response_model=AIAnalysisResponse)
def ai_analyze(data: AIAnalysisRequest, _: User = Depends(require_admin)):
    result = analyze_failure(data.test_name, data.error_message, data.stack_trace)
    index_failure(data.test_name, data.error_message, data.stack_trace)
    return AIAnalysisResponse(**result)
