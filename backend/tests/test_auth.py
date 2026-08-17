def test_register(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_register_duplicate(client):
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["error"]["message"]

def test_login(client):
    # Register
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123", "name": "Test User"},
    )
    # Login
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"},
    )
    assert response.status_code == 400
    assert "Incorrect email" in response.json()["error"]["message"]
