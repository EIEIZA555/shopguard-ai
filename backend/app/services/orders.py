"""Order processing with inventory validation."""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Order, OrderItem, Product
from app.schemas import CartItem


def process_checkout(db: Session, user_id: int, items: list[CartItem]) -> Order:
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = Order(user_id=user_id, status="pending", total_amount=0.0)
    total = 0.0

    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_active).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock}",
            )

        product.stock -= item.quantity
        line_total = product.price * item.quantity
        total += line_total

        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )

    order.total_amount = round(total, 2)
    order.status = "confirmed"
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Unknown",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
            }
            for item in order.items
        ],
    }
