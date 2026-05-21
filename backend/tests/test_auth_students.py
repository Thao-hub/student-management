from datetime import date

from app.core.security import get_password_hash
from app.models.student import Class, Student, User


def create_admin_user(db):
    user = User(
        username="admin_test",
        email="admin_test@example.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_class(db):
    class_item = Class(
        name="10A1",
        grade_level="10",
        academic_year="2024-2025",
        capacity=40,
    )
    db.add(class_item)
    db.commit()
    db.refresh(class_item)
    return class_item


def login_and_get_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_login_success_returns_token(client, db_session):
    create_admin_user(db_session)

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["username"] == "admin_test"
    assert body["access_token"]


def test_login_invalid_credentials_returns_401(client, db_session):
    create_admin_user(db_session)

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_student_import_and_bulk_delete_flow(client, db_session):
    create_admin_user(db_session)
    class_item = create_class(db_session)
    headers = login_and_get_headers(client)

    import_response = client.post(
        "/api/v1/students/import",
        json=[
            {
                "student_code": "SV1001",
                "first_name": "An",
                "last_name": "Nguyen",
                "email": "an.nguyen@example.com",
                "phone": "0901000001",
                "date_of_birth": "2005-01-10",
                "gender": "Male",
                "address": "HCMC",
                "class_id": class_item.id,
                "enrollment_date": "2024-09-01",
                "guardian_name": "Nguyen A",
                "guardian_phone": "0909000001",
                "status": "Active",
            },
            {
                "student_code": "SV1002",
                "first_name": "Binh",
                "last_name": "Tran",
                "email": "binh.tran@example.com",
                "phone": "0901000002",
                "date_of_birth": "2005-02-20",
                "gender": "Female",
                "address": "Hanoi",
                "class_id": class_item.id,
                "enrollment_date": "2024-09-01",
                "guardian_name": "Tran B",
                "guardian_phone": "0909000002",
                "status": "Active",
            },
        ],
        headers=headers,
    )

    assert import_response.status_code == 201
    import_body = import_response.json()
    assert import_body["created_count"] == 2
    assert import_body["error_count"] == 0

    list_response = client.get("/api/v1/students", headers=headers)
    assert list_response.status_code == 200
    students = list_response.json()
    assert len(students) == 2

    bulk_delete_response = client.post(
        "/api/v1/students/bulk-delete",
        json={"student_ids": [student["id"] for student in students]},
        headers=headers,
    )

    assert bulk_delete_response.status_code == 200
    delete_body = bulk_delete_response.json()
    assert delete_body["deleted_count"] == 2
    assert delete_body["missing_ids"] == []

    final_list_response = client.get("/api/v1/students", headers=headers)
    assert final_list_response.status_code == 200
    assert final_list_response.json() == []


def test_bulk_delete_reports_missing_ids(client, db_session):
    create_admin_user(db_session)
    class_item = create_class(db_session)
    headers = login_and_get_headers(client)

    student = Student(
        student_code="SV2001",
        first_name="Cuong",
        last_name="Le",
        email="cuong.le@example.com",
        class_id=class_item.id,
        enrollment_date=date(2024, 9, 1),
        status="Active",
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    response = client.post(
        "/api/v1/students/bulk-delete",
        json={"student_ids": [student.id, 9999]},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["deleted_count"] == 1
    assert body["missing_ids"] == [9999]
