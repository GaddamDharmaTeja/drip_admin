# DripGrow Admin (separate app)

React admin console for managing products, irrigation/project plans, COD orders, requests, and quotations.

## Run

1. Start MongoDB Atlas-connected API:

```powershell
cd D:\dripgrow-api
mvn spring-boot:run
```

2. Start admin UI (port **5174**):

```powershell
cd D:\dripgrow-admin
npm install
npm run dev
```

Open http://localhost:5174

### Default login

- Username: `admin`
- Password: `Admin@123`

Override in `dripgrow-api` via `dripgrow.admin.username` / `dripgrow.admin.password` (or env `ADMIN_USERNAME` / `ADMIN_PASSWORD`).
