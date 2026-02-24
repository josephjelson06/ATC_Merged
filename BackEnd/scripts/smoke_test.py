import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:8000"


def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}

    if data:
        data_bytes = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {body}")
        sys.exit(1)
    except Exception as e:
        print(f"Request failed: {e}")
        sys.exit(1)


def test_api():
    print(f"Testing API at {BASE_URL}...")

    # 1. Login
    print("\n1. Logging in as Super Admin...")
    login_payload = {"email": "admin@atc.com", "password": "password123"}
    status, data = make_request(
        f"{BASE_URL}/auth/login", method="POST", data=login_payload
    )

    token = data["access_token"]
    print(f"Login successful! User: {data.get('email')}, Role: {data.get('role_name')}")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Plans
    print("\n2. Fetching Plans...")
    status, plans = make_request(f"{BASE_URL}/api/plans", headers=headers)
    print(f"Found {len(plans)} plans.")
    if len(plans) == 0:
        print("Error: No plans found!")
        sys.exit(1)

    for p in plans:
        print(f" - Plan: {p['name']}, Price: {p.get('price')}")
        if "price" not in p:
            print("Error: Price field missing in plan response!")
            sys.exit(1)

    # 3. Onboard Tenant
    print("\n3. Onboarding Tenant...")
    onboard_payload = {
        "hotel_name": "Test Hotel One",
        "address": "123 Test St",
        "manager_name": "Test Manager",
        "manager_email": "manager@testhotel.com",
        "manager_phone": "1234567890",
        "password": "managerpass123",
    }
    # Note: If tenant already exists from previous run, we might want to handle generic error or skip
    # But for smoke test, failing on 400 (if handled) is okay to catch.
    # However, unique constraint on email might block multiple runs.
    # We can try/except or just let it fail if we want a fresh run.
    # Let's clean up existing tenant or just append random number to email
    import random

    suffix = random.randint(1000, 9999)
    onboard_payload["manager_email"] = f"manager{suffix}@testhotel.com"
    onboard_payload["hotel_name"] = f"Test Hotel {suffix}"

    status, tenant = make_request(
        f"{BASE_URL}/api/onboard", method="POST", data=onboard_payload
    )
    print(
        f"Onboard successful! Tenant ID: {tenant['id']}, Name: {tenant['hotel_name']}"
    )

    # 4. Get Tenants
    print("\n4. Fetching Tenants...")
    status, tenants = make_request(f"{BASE_URL}/api/tenants", headers=headers)

    print(f"Found {len(tenants)} tenants.")
    found = False
    for t in tenants:
        if t["id"] == tenant["id"]:
            print(f"Verified tenant {t['hotel_name']} exists in list.")
            found = True
            break

    if not found:
        print("Error: Newly created tenant not found in list!")
        sys.exit(1)

    print("\nSMOKE TEST PASSED!")


if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"Test failed with exception: {e}")
        sys.exit(1)
