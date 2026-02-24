# Hotel Management System Backend

This is the Python FastAPI backend for the HMS application.

## Prerequisites

- Python 3.10+
- pip

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the interactive development server:

```bash
python run.py
```

The server will start at `http://127.0.0.1:8000`.
API Documentation is available at `http://127.0.0.1:8000/docs`.

## Integration with Frontend

The frontend (Next.js) will make requests to `http://localhost:8000` (or configured API URL).
Ensure the frontend is configured with the correct `NEXT_PUBLIC_API_URL`.

## Manual Bootstrap (No Seeds)

Seed scripts were intentionally removed. Initialize baseline records manually before first login.

1. Create at least one plan row in `plans`.
2. Create one platform tenant row in `tenants` linked to that plan (`tenant_type='platform'`).
3. Create one platform admin user row in `users` linked to that tenant (`user_type='platform'`).
4. Optionally create baseline permissions/roles and map them in `role_permissions` and `user_roles`.

### Password Hash

Generate a bcrypt hash for the initial admin password:

```bash
python -c "from app.core.auth.security import get_password_hash; print(get_password_hash('ChangeMe123!'))"
```

Store the returned hash in `users.password_hash`.
