"""Seed database with demo products and users."""

from sqlalchemy.orm import Session

from app.models import Product, User
from app.services.auth import hash_password

SEED_PRODUCTS = [
    {"name": "Wireless Headphones", "description": "Noise-cancelling over-ear headphones", "price": 89.99, "stock": 50, "category": "electronics", "image_url": "https://placehold.co/300x300?text=Headphones"},
    {"name": "Mechanical Keyboard", "description": "RGB backlit mechanical keyboard", "price": 129.99, "stock": 30, "category": "electronics", "image_url": "https://placehold.co/300x300?text=Keyboard"},
    {"name": "USB-C Hub", "description": "7-in-1 USB-C hub with HDMI", "price": 49.99, "stock": 100, "category": "accessories", "image_url": "https://placehold.co/300x300?text=Hub"},
    {"name": "Laptop Stand", "description": "Aluminum adjustable laptop stand", "price": 39.99, "stock": 75, "category": "accessories", "image_url": "https://placehold.co/300x300?text=Stand"},
    {"name": "Webcam HD", "description": "1080p webcam with built-in mic", "price": 59.99, "stock": 40, "category": "electronics", "image_url": "https://placehold.co/300x300?text=Webcam"},
    {"name": "Desk Mat", "description": "Large extended desk mat", "price": 24.99, "stock": 200, "category": "accessories", "image_url": "https://placehold.co/300x300?text=DeskMat"},
]

SEED_USERS = [
    {"email": "customer@shopguard.dev", "password": "Test123!", "full_name": "Demo Customer", "role": "customer"},
    {"email": "admin@shopguard.dev", "password": "Admin123!", "full_name": "Shop Admin", "role": "admin"},
]


def seed_database(db: Session) -> None:
    if db.query(Product).count() == 0:
        for p in SEED_PRODUCTS:
            db.add(Product(**p))

    if db.query(User).count() == 0:
        for u in SEED_USERS:
            db.add(User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            ))

    db.commit()
