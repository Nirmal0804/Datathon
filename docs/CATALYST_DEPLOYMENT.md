# 🚀 Zoho Catalyst Deployment & Authentication Guide for CrimeIntel

---

## 1. Overview & Architecture

CrimeIntel is built with a decoupled architecture:
* **Frontend**: React 19 + Tailwind CSS + Vite (Source in `frontend/`).
* **Catalyst Web Client**: Static distribution hosted on Zoho Catalyst Web Client (Bundle in `catalyst-web-client/`).
* **Authentication**: Zoho Catalyst Native Embedded Authentication (Zoho Accounts IAM).

```
frontend/ (Source Code)
   │
   ▼ npm run build:catalyst
frontend/dist/
   │
   ▼ Automated Sync (sync-catalyst.js)
catalyst-web-client/ (Static Client)
   │
   ├─► catalyst serve --only client (Local Testing: http://localhost:3000/app/)
   └─► catalyst deploy --only client (Cloud Deployment: *.catalystserverless.in)
```

---

## 2. Prerequisites & Environment

* **Node.js**: v18.x or v20.x
* **npm**: v9.x or higher
* **Python**: 3.10+ (for FastAPI backend & ML analytics engine)
* **Catalyst CLI**: v1.27.0 or higher
  ```bash
  npm install -g zcatalyst-cli
  ```

---

## 3. Zoho Catalyst CLI Authentication

Log in to your Zoho Catalyst account from the terminal:
```bash
catalyst login
```
Select the corresponding Zoho data center (e.g., `India (IN)` or `US`).

---

## 4. Project Configuration (`catalyst.json`)

The root `catalyst.json` configures the static web client distribution:
```json
{
  "client": {
    "source": "catalyst-web-client"
  }
}
```

> **Note**: Do not use `"plugin": "zcatalyst-cli-plugin-react"` because CrimeIntel uses modern Vite + React 19 rather than legacy Create React App.

---

## 5. Build & Synchronization Pipeline

To compile the frontend and automatically synchronize all assets to `catalyst-web-client/`:

```bash
cd frontend
npm run build:catalyst
cd ..
```

This single command:
1. Compiles the Vite React application with relative base paths (`./`).
2. Synchronizes `frontend/dist/` into `catalyst-web-client/`.
3. Preserves `client-package.json` and all documentation PDFs.

---

## 6. Running Locally via Catalyst CLI

Always test Embedded Authentication through Catalyst CLI:
```bash
catalyst serve --only client
```

* **Local App URL**: `http://localhost:3000/app/`
* **Init Script Endpoint**: `http://localhost:3000/__catalyst/sdk/init.js`
* **IAM Gateway**: `http://localhost:3000/accounts/p/<ZAID>/signin`

---

## 7. Deploying to Zoho Catalyst Cloud

When ready to deploy the web client to Catalyst Serverless Hosting:
```bash
catalyst deploy --only client
```

---

## 8. Role-Based Access Control (RBAC) Mapping

Catalyst users are mapped to CrimeIntel portal roles:

| Access Level | Confirmed Catalyst Account | Portal Role |
| :--- | :--- | :--- |
| **Field Officer** | `crimeintel.officer@gmail.com` | `officer` |
| **Intelligence Analyst** | `crimeintel.analystt@gmail.com` | `analyst` |
| **System Administrator** | `crimeintel.admin@gmail.com` | `admin` |

---

## 9. Security & Authentication Architecture

1. **Native IAM Credential Entry**: Passwords are entered directly into Zoho's IAM iframe (`catalyst.auth.signIn()`) on Zoho's secure domain and are never touched by client JavaScript.
2. **Post-Auth Role Validation**: On `onSuccess(user)`, the application verifies that the authenticated `user.email_id` matches the selected role. Mismatches immediately trigger `catalyst.auth.signOut()`.
3. **Session Persistence**: `catalyst.auth.isUserAuthenticated()` restores the active session on page refresh.

---

## 10. Documentation PDF Assets

The architecture PDFs reside at the client root and are copied during build:
* `/crimeintel-architecture-documentation.pdf`
* `/ksp-architecture-documentation.pdf`

---

## 11. Troubleshooting

* **Nested SPA / Duplicate UI in Iframe**:
  - Ensure the application is accessed via `http://localhost:3000/app/` (or the deployed URL) and not standalone Vite (`localhost:5173`).
  - An anti-framing guard in `index.html` prevents CrimeIntel from executing inside authentication iframes.
* **Port Conflict on Local Serve**:
  - If port 3000 is occupied, terminate background processes before running `catalyst serve`.
