import pytest
from unittest.mock import patch
from fastapi import UploadFile

# We mock ResumeParser and FileStorage to run tests without needing real files/S3
@pytest.fixture(autouse=True)
def mock_file_services():
    with patch("app.services.resume_parser.ResumeParser.validate_file", return_value=None), \
         patch("app.services.resume_parser.ResumeParser.extract_text", return_value="John Doe Resume Text"), \
         patch("app.services.file_storage.FileStorage.save_file", return_value="/mock/path/resume.pdf"), \
         patch("app.services.file_storage.FileStorage.delete_file", return_value=True):
        yield

def test_resume_isolation(client):
    # 1. Register User A & User B
    client.post(
        "/api/auth/register",
        json={"email": "usera@example.com", "password": "password123", "name": "User A"},
    )
    client.post(
        "/api/auth/register",
        json={"email": "userb@example.com", "password": "password123", "name": "User B"},
    )

    # 2. Login User A
    login_a = client.post(
        "/api/auth/login",
        json={"email": "usera@example.com", "password": "password123"},
    ).json()
    headers_a = {"Authorization": f"Bearer {login_a['access_token']}"}

    # 3. Login User B
    login_b = client.post(
        "/api/auth/login",
        json={"email": "userb@example.com", "password": "password123"},
    ).json()
    headers_b = {"Authorization": f"Bearer {login_b['access_token']}"}

    # 4. Upload Resume as User A
    upload_res = client.post(
        "/api/resumes/upload",
        files={"file": ("resume.pdf", b"pdfcontent", "application/pdf")},
        headers=headers_a
    )
    assert upload_res.status_code == 200
    resume_a_id = upload_res.json()["id"]

    # 5. User B tries to GET User A's Resume -> MUST BE 404 (or forbidden)
    get_res = client.get(
        f"/api/resumes/{resume_a_id}",
        headers=headers_b
    )
    assert get_res.status_code == 404

    # 6. User B tries to DELETE User A's Resume -> MUST BE 404 (or forbidden)
    del_res = client.delete(
        f"/api/resumes/{resume_a_id}",
        headers=headers_b
    )
    assert del_res.status_code == 404

    # 7. User A can successfully get their own resume
    get_res_a = client.get(
        f"/api/resumes/{resume_a_id}",
        headers=headers_a
    )
    assert get_res_a.status_code == 200
    assert get_res_a.json()["filename"] == "resume.pdf"


def test_saved_jobs(client):
    # 1. Register and Login User A
    client.post(
        "/api/auth/register",
        json={"email": "user_saved_job@example.com", "password": "password123", "name": "User SJ"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "user_saved_job@example.com", "password": "password123"},
    ).json()
    headers = {"Authorization": f"Bearer {login_res['access_token']}"}

    # 2. Add saved job
    add_res = client.post(
        "/api/jobs/saved",
        json={"title": "Staff Engineer", "company": "Google", "job_url": "https://google.com", "description": "Staff Dev"},
        headers=headers
    )
    assert add_res.status_code == 200
    job_id = add_res.json()["id"]

    # 3. Retrieve saved job details
    get_res = client.get(f"/api/jobs/saved/{job_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Staff Engineer"
    assert get_res.json()["company"] == "Google"

    # 4. Get non-existent saved job details
    get_res_nonexistent = client.get("/api/jobs/saved/9999", headers=headers)
    assert get_res_nonexistent.status_code == 404
