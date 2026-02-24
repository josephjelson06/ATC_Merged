import logging
import sys
import os

# Add the project directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.platform import PlatformRole, PlatformUser
from app.models.permissions import Permission
from app.models.billing import Plan
from app.models.mappings import platform_role_permissions
from app.core.auth.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PLATFORM_PERMISSIONS = [
    "platform:tenants:read",
    "platform:tenants:write",
    "platform:users:read",
    "platform:users:write",
    "platform:roles:read",
    "platform:roles:write",
    "platform:settings:read",
    "platform:settings:write",
    "platform:support:read",
    "platform:support:write",
    "platform:invoices:read",
    "platform:invoices:write",
    "platform:audit-logs:read",
    "platform:reports:read",
]

HOTEL_PERMISSIONS = [
    "hotel:dashboard:read",
    "hotel:users:read",
    "hotel:users:write",
    "hotel:roles:read",
    "hotel:roles:write",
    "hotel:billing:read",
    "hotel:billing:write",
    "hotel:support:read",
    "hotel:support:write",
    "hotel:guests:read",
    "hotel:guests:write",
    "hotel:kiosks:read",
    "hotel:kiosks:write",
    "hotel:rooms:read",
    "hotel:rooms:write",
    "hotel:bookings:read",
    "hotel:bookings:write",
    "hotel:checkin:write",
    "hotel:payments:read",
    "hotel:payments:write",
    "hotel:incidents:read",
    "hotel:incidents:write",
    "hotel:reports:read",
    "hotel:settings:read",
    "hotel:settings:write",
]


def bootstrap():
    db = SessionLocal()
    try:
        # 1. Create Permissions
        logger.info("Seeding permissions...")
        all_perms = PLATFORM_PERMISSIONS + HOTEL_PERMISSIONS
        for perm_key in all_perms:
            exists = db.query(Permission).filter(Permission.key == perm_key).first()
            if not exists:
                db.add(Permission(key=perm_key, description=f"Permission {perm_key}"))
        db.commit()

        # 2. Create Super Admin Role
        logger.info("Seeding Platform Super Admin Role...")
        sa_role = (
            db.query(PlatformRole).filter(PlatformRole.name == "Super Admin").first()
        )
        if not sa_role:
            sa_role = PlatformRole(name="Super Admin")
            db.add(sa_role)
            db.commit()
            db.refresh(sa_role)

        # 3. Assign Platform Permissions to Super Admin
        logger.info("Assigning permissions to Super Admin...")
        # Clear existing
        db.execute(
            platform_role_permissions.delete().where(
                platform_role_permissions.c.role_id == sa_role.id
            )
        )
        # Add all platform permissions
        perms = (
            db.query(Permission).filter(Permission.key.in_(PLATFORM_PERMISSIONS)).all()
        )
        for p in perms:
            db.execute(
                platform_role_permissions.insert().values(
                    role_id=sa_role.id, permission_id=p.id
                )
            )
        db.commit()

        # 4. Create Super Admin User
        logger.info("Seeding Super Admin User...")
        admin_email = "admin@atc.com"
        admin = db.query(PlatformUser).filter(PlatformUser.email == admin_email).first()
        if not admin:
            admin = PlatformUser(
                email=admin_email,
                name="System Administrator",
                password_hash=get_password_hash("password123"),
                role_id=sa_role.id,
            )
            db.add(admin)
            db.commit()
            logger.info(f"Created admin user: {admin_email} / password123")
        else:
            logger.info("Admin user already exists")

        # 5. Create Default Plans
        logger.info("Seeding Default Plans...")
        plans = [
            {
                "name": "Starter",
                "price": 0.0,
                "period_months": 1,
                "max_users": 5,
                "max_roles": 3,
                "max_rooms": 10,
            },
            {
                "name": "Professional",
                "price": 49.99,
                "period_months": 1,
                "max_users": 20,
                "max_roles": 10,
                "max_rooms": 50,
            },
            {
                "name": "Enterprise",
                "price": 199.99,
                "period_months": 12,
                "max_users": 999,
                "max_roles": 999,
                "max_rooms": 999,
            },
        ]

        for p_data in plans:
            exists = db.query(Plan).filter(Plan.name == p_data["name"]).first()
            if not exists:
                db.add(Plan(**p_data))
            else:
                # Update existing plan price if needed (optional, but good for this request)
                exists.price = p_data["price"]

        db.commit()

        logger.info("Bootstrap completed successfully!")

    except Exception as e:
        logger.error(f"Bootstrap failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap()
