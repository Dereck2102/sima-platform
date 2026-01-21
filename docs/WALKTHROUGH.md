# 📘 SIMA Platform - Integrated System Walkthrough

> [!IMPORTANT]
> **System Status (January 2026):**
> The platform is fully integrated with **Real Backend Services**. All simulated data has been removed.
>
> **Key Achievements:**
>
> 1.  **Mobile App**: Real QR Scanning, Report Generation, and Asset Management.
> 2.  **Web App**: Server-Side Search for Assets, Full Module Federation.
> 3.  **Branding**: Custom UCE Seal applied across Web and Mobile Login screens and Favicons.
> 4.  **Automation**: One-click startup script `start-sima.ps1`.

---

## 🚀 1. Quick Start (How to Run)

The entire system (Infrastructure + Backend + Frontend) can be started with a single PowerShell script.

### Option A: The "One-Click" Script (Recommended)

This script handles process cleanup, starts Docker containers, and launches all microservices in separate windows.

```powershell
./start-sima.ps1
```

### Option B: Manual Startup

If you prefer manual control:

1.  **Infrastructure**: `docker-compose up -d`
2.  **Backend Core**: `npx nx serve core-service`, `api-gateway`
3.  **Frontend Shell**: `npx nx serve shell-app`
4.  **Microfrontends**: `npx nx serve dashboard-mfe`, `assets-mfe`, etc.
5.  **Mobile (Web Mode)**: `cd sima-mobile && npm run web:dev`

**Access Points:**

- **Web Shell App**: [http://localhost:4100](http://localhost:4100)
- **Mobile App (Web)**: [http://localhost:4200](http://localhost:4200)
- **API Documentation**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 📱 2. Mobile App Features (Verified)

_Access via `http://localhost:4200`_

### 🔒 Login & Branding

- **Feature**: Secure JWT Authentication.
- **Visuals**: High-resolution **UCE Seal** branding on the login screen.
- **Test Creds**: `dsamacoria@uce.edu.ec` / `Admin123!`

### 📷 QR Code Scanner

- **Functionality**: Uses the device camera (or webcam in browser) to scan Asset Tags.
- **Usage**:
  1.  Tap **"Scan QR"** on the Dashboard.
  2.  Allow Camera Access.
  3.  Scan a code (or enter `LAP-001` manually).
  4.  **Result**: Automatically redirects to the **Assets Inventory**, filtered by the scanned code.

### 📊 Reports Module

- **Functionality**: Generates PDF/Excel reports via the Backend Reporting Service.
- **Usage**:
  1.  Tap **"Reports"**.
  2.  Select "Inventario de Activos" (Asset Inventory).
  3.  Tap **"Generate"**.
  4.  **Result**: A real file is generated and downloaded to your device.

---

## 🌍 3. Web Application Features (Verified)

_Access via `http://localhost:4100`_

### 🏢 Assets Management (Server-Side Search)

- **Upgrade**: Clients-side filtering has been replaced with the robust `/api/search/assets` endpoint.
- **Usage**:
  1.  Navigate to **Assets**.
  2.  Type in the Search Bar (e.g., "Laptop").
  3.  **Verification**: Open Network Tab (F12) -> See requests to `/api/search/assets?query=Laptop`. This ensures performance with large datasets.

### 🎨 Branding Updates

- **Login**: The generic emoji 🏢 has been replaced with the official **UCE Seal**.
- **Favicon**: The browser tab now displays the UCE Seal for professional branding.

---

## 🔑 4. Credentials & Roles

| Role             | Username                | Password    | Access Level           |
| :--------------- | :---------------------- | :---------- | :--------------------- |
| **Super Admin**  | `dsamacoria@uce.edu.ec` | `Admin123!` | Full Access (All MFEs) |
| **Tenant Admin** | `admin@uce.edu.ec`      | `Test123!`  | Tenant Management      |
| **Auditor**      | `audit@uce.edu.ec`      | `Audit123!` | Read-only Reports      |

---

## 🛠️ 5. Troubleshooting Common Issues

### "Gray Building" Icon on Web Login

- **Cause**: Browser cache holding the old emoji version.
- **Fix**: Hard Refresh (`Ctrl + F5`) or clear site data. The code has been updated to use `src/assets/logo_load.png`.

### Mobile Camera Not Working

- **Cause**: Browser permissions.
- **Fix**: Ensure your browser allows camera access for `localhost:4200`. Note that on mobile devices, you must use HTTPS or localhost (Web Mode uses localhost).

### "Failed to Fetch" on Login

- **Cause**: Backend services stopped or port conflict.
- **Fix**: Run `./start-sima.ps1` again, which automatically kills zombie `node.exe` processes before starting.
