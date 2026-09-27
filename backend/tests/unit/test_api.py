"""Backend unit tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    from app.services.seed import seed_database
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_list_products(client):
    res = client.get("/api/products")
    assert res.status_code == 200
    assert len(res.json()) >= 6


def test_login_success(client):
    res = client.post("/api/auth/login", json={"email": "customer@shopguard.dev", "password": "Test123!"})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_invalid(client):
    res = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "nope"})
    assert res.status_code == 401


def test_checkout_flow(client):
    login = client.post("/api/auth/login", json={"email": "customer@shopguard.dev", "password": "Test123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/orders/checkout", json={"items": [{"product_id": 1, "quantity": 1}]}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "confirmed"
    assert data["total_amount"] > 0


def test_checkout_insufficient_stock(client):
    login = client.post("/api/auth/login", json={"email": "customer@shopguard.dev", "password": "Test123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/orders/checkout", json={"items": [{"product_id": 1, "quantity": 9999}]}, headers=headers)
    assert res.status_code == 400


def test_admin_test_runs(client):
    login = client.post("/api/auth/login", json={"email": "admin@shopguard.dev", "password": "Admin123!"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/test-runs", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
