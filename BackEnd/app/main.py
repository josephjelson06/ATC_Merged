from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth_simple,
    tenants,
    subscriptions,
    plans,
    users,
    roles,
    permissions,
    support,
    onboarding,
    guests,
    room_types,
    rooms,
    bookings,
    checkins,
    payments,
    kiosks,
)

app = FastAPI(
    title="HMS Backend API",
    description="Backend API for Hotel Management System",
    version="2.0.0",
)

# Configure CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3100",
    "http://127.0.0.1:3100",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(tenants.router)
app.include_router(subscriptions.router)
app.include_router(plans.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(permissions.router)
app.include_router(auth_simple.router)
app.include_router(support.router)
app.include_router(onboarding.router)
app.include_router(guests.router)
app.include_router(room_types.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(checkins.router)
app.include_router(payments.router)
app.include_router(kiosks.router)
app.include_router(kiosks.kiosk_public_router)


@app.get("/")
async def root():
    return {"message": "Welcome to HMS Backend API v2"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
