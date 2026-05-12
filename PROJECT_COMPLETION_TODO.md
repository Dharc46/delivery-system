# Delivery System - Checklist Hoan Thien Du An

Ngay cap nhat: 2026-05-12
Trang thai hien tai: Co khung san pham tot, nhung con thieu nhieu phan de san sang production.

## 1) Muc tieu hoan thien

Du an duoc xem la hoan chinh khi dat dong thoi cac tieu chi sau:
- Chay on dinh tren moi truong dev, staging, production.
- Khong con TODO nghiep vu quan trong trong backend va frontend.
- Co test tu dong cho cac luong chinh (auth, phan quyen, package, trip, tracking).
- Co tai lieu huong dan day du de team moi co the setup va van hanh.
- Co quy trinh release, rollback va giam sat loi ro rang.

## 2) Uu tien P0 - Bat buoc lam ngay

### 2.1 Sua cac loi gay hong luong nguoi dung
- [x] Sua API dang ky frontend dang goi ham chua ton tai.
  - Hien tai: authApi moi co login, chua co register.
  - Anh huong: Khong dang ky duoc tai khoan tu UI.
- [x] Dong bo model du lieu trang quan ly package voi backend PackageDTO.
  - Hien tai: form su dung cac field khong trung backend.
  - Anh huong: Tao/sua package de loi payload.
  - **DONE**: Updated AdminPackageManagement.jsx and AdminDashboard.jsx forms with correct PackageDTO fields (senderInfo, receiverInfo, latitude, longitude, packageDetails, codAmount, status, notes)
- [x] Them route Unauthorized va trang 403 don gian cho frontend.

### 2.2 On dinh hoa xu ly loi
- [x] Bat lai GlobalExceptionHandler de tra loi API dong nhat.
- [x] Chuan hoa format loi (ma loi, message, timestamp, trace id neu co).
- [x] Xu ly 401/403 thong nhat o frontend (interceptor + redirect + message).

### 2.3 Cau hinh moi truong va secret
- [x] Tach cau hinh dev/staging/prod bang profile.
- [x] Dua JWT secret, DB credentials, Redis config sang bien moi truong.
- [x] Tat debug log qua chi tiet o production.
- [x] Cau hinh CORS theo tung moi truong (khong hardcode 1 origin).

## 3) Uu tien P1 - Hoan thien nghiep vu cot loi

### 3.1 Luong shipper va delivery trip
- [x] Lay shipperId tu user dang nhap thay vi tra toan bo trip.
- [x] Hoan thien filter du lieu theo role tren tat ca endpoint nhay cam.
- [x] Bo sung trang thai va validation luong giao hang (PENDING -> IN_TRANSIT -> DELIVERED/FAILED).

### 3.2 COD reconciliation
- [x] Them co da doi soat cho Package (vi du isReconciled + reconciledAt + reconciledBy).
- [x] Dam bao mot don hang COD khong the doi soat lap.
- [ ] Tao bao cao doi soat theo ngay/shipper/trip.

### 3.3 Tracking cho khach hang
- [ ] Them API ETA va vi tri shipper theo package.
- [ ] Quy dinh du lieu cong khai cho khach (an thong tin nhay cam).
- [ ] Hien thi URL anh giao hang qua bien moi truong frontend, khong hardcode localhost.

## 4) Uu tien P2 - Chat luong code, hieu nang, do tin cay

### 4.1 Database va migration
- [ ] Them migration tool (Flyway hoac Liquibase).
- [ ] Chuyen tu ddl-auto=update sang migration co version.
- [ ] Them index cho cac cot tim kiem/chuan hoa truy van thuong dung.

### 4.2 Caching va hieu nang
- [ ] Ra soat cache key, TTL va chinh sach cache eviction.
- [ ] Them cache cho cac API dashboard/tracking co tan suat cao (neu phu hop).
- [ ] Do benchmark co ban (response time p95, throughput).

### 4.3 Kiem soat API
- [ ] Them pagination/sort/filter cho danh sach lon (packages, shippers, trips).
- [ ] Them API versioning policy ro rang.
- [ ] Hoan thien OpenAPI examples + error responses.

## 5) Uu tien P3 - Testing va CI/CD

### 5.1 Test backend
- [ ] Unit test cho service chinh: Auth, Package, DeliveryTrip, CodReconciliation.
- [ ] Integration test cho controller + security + database.
- [ ] Test phan quyen theo role (ADMIN/SHIPPER/CUSTOMER).
- [ ] Test regression cho luong upload proof image.

### 5.2 Test frontend
- [ ] Test login/register/route guard.
- [ ] Test luong tao package, optimize trip, customer tracking.
- [ ] Test xu ly loi API va thong bao nguoi dung.

### 5.3 CI/CD
- [ ] Tao pipeline tu dong: lint + test + build cho backend va frontend.
- [ ] Kiem tra chat luong code toi thieu truoc khi merge.
- [ ] Tao release checklist (deploy, smoke test, rollback).

## 6) Bao mat va compliance

Ghi chu theo yeu cau hien tai:
- Tu tao ROLE_ADMIN tam thoi duoc giu de test cho thuan tien.

Viec can lam khi chuan bi release that:
- [ ] Khoa hoac gioi han cap ROLE_ADMIN (chi cho seed script hoac super admin).
- [ ] Them rate limiting cho auth endpoint.
- [ ] Them co che lock account tam thoi neu login that bai nhieu lan.
- [ ] Danh gia bao mat token (thoi gian song, refresh token strategy neu can).
- [ ] Kiem tra upload file an toan (duoi file, MIME, kich thuoc).

## 7) Tai lieu va van hanh

- [ ] Viet lai README tong the: architecture, setup nhanh, env vars, run local.
- [ ] Bo sung API usage guide cho role ADMIN/SHIPPER/CUSTOMER.
- [ ] Bo sung troubleshooting guide (DB/Redis/CORS/JWT).
- [ ] Bo sung runbook van hanh: backup, restore, monitor, incident.

## 8) Ke hoach trien khai de xuat

### Sprint 1 (1-2 tuan)
- Sua loi register frontend, unauthorized route, model mismatch package.
- Bat lai global exception handler + chuan hoa error response.
- Tach env config cho frontend/backend, bo hardcode localhost.

### Sprint 2 (1-2 tuan)
- Hoan thien luong shipper theo user dang nhap.
- Them co doi soat COD va bao cao co ban.
- Bo sung integration test cho auth va package.

### Sprint 3 (1-2 tuan)
- Them migration schema, pagination/filter API, toi uu cache.
- Hoan thien tracking ETA + shipper location.
- Hoan tat CI/CD va release checklist.

## 9) Definition of Done (DoD) goi y

Moi hang muc duoc xem la xong khi:
- Co code + test tuong ung.
- Da duoc review va merge.
- Co cap nhat tai lieu neu thay doi API/hanh vi.
- Da qua smoke test tren moi truong muc tieu.

## 10) Danh sach file can uu tien doc/sua

Backend:
- backend/src/main/java/com/example/deliverysystem/service/AuthService.java
- backend/src/main/java/com/example/deliverysystem/exception/GlobalExceptionHandler.java
- backend/src/main/java/com/example/deliverysystem/controller/ShipperController.java
- backend/src/main/java/com/example/deliverysystem/service/CodReconciliationService.java
- backend/src/main/resources/application.properties

Frontend:
- frontend/src/api/authApi.js
- frontend/src/api/api.js
- frontend/src/components/PrivateRoute.jsx
- frontend/src/pages/RegisterPage.jsx
- frontend/src/pages/AdminPackageManagement.jsx
- frontend/src/pages/CustomerTracking.jsx
- frontend/src/App.jsx
