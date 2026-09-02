# CAB Medicare Backend

Standalone Node.js + Express + MongoDB REST API for the CAB Medicare single-admin clinic system. The existing Next.js frontend is untouched.

## 1. Requirements

- Node.js 20+
- MongoDB Atlas or MongoDB Community Server
- Postman

## 2. MongoDB connection

### MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user and password.
3. In Network Access, allow your development IP (or `0.0.0.0/0` only for temporary development).
4. Select Connect > Drivers and copy the URI.

### Local MongoDB
Use `mongodb://127.0.0.1:27017/cab_medicare`.

Create `.env` in the repository root:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/cab_medicare?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=doctor@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

Never commit `.env` or production credentials.

## 3. Run the API

```bash
pnpm api:seed   # one-time admin setup
pnpm api:dev    # http://localhost:4000
```

Check `GET http://localhost:4000/health`. It should return `{"status":"ok","database":"connected"}`.

## 4. Postman walkthrough

Create an environment with `baseUrl = http://localhost:4000` and `token` blank. Create folders **Auth**, **Patients**, **Visits**, and **Reports**.

### Auth
`POST {{baseUrl}}/api/auth/login`, JSON body:
```json
{"email":"doctor@example.com","password":"your ADMIN_PASSWORD"}
```
In the Tests tab:
```js
pm.test('login succeeds',()=>pm.response.to.have.status(200));
pm.environment.set('token',pm.response.json().data.token);
```

For every protected request, Authorization > Bearer Token > `{{token}}`.

### Patients
- `POST /api/patients` body `{"name":"Jane Doe","phone":"555-0100","age":35,"gender":"F","address":"Clinic address"}`
- `GET /api/patients?search=Jane`
- `GET /api/patients/:id`
- `PUT /api/patients/:id` body `{"address":"Updated address"}`

### Visits
`POST /api/patients/:id/visits`:
```json
{"diagnosis":"Follow-up","notes":"Stable","medicines":[{"medicineName":"Amoxicillin","tradePrice":4,"sellingPrice":10,"quantity":2}]}
```
Profit is calculated by the server as `(sellingPrice - tradePrice) * quantity`; any client `profit` value is ignored.

### Reports
`GET /api/reports/summary?from=2026-01-01&to=2026-12-31` returns totals, top medicines, and daily groups. Add Postman tests such as:
```js
pm.test('report shape',()=>pm.expect(pm.response.json().data).to.have.all.keys('summary','topMedicines','byDay'));
```

## 5. Automated tests

Tests use `mongodb-memory-server` and never touch your configured MongoDB:

```bash
pnpm api:test
```
They cover health, login, missing auth, visit creation, server-side profit, counter integrity, and negative profit.

## 6. Performance verification

Seed a test database and inspect index usage:

```bash
PERF_PATIENTS=5000 pnpm api:perf
```
The script runs `.explain('executionStats')` for text patient search and patient visit history and fails if patient search is not backed by `IXSCAN` or uses `COLLSCAN`. The Patient collection has one text index named `patient_search_text` over `name` and `phone`; Visit has `{ patientId: 1, visitDate: -1 }`.

To verify manually in Atlas or Compass, open the `patients` collection, inspect Indexes for `name: "text", phone: "text"` with the name `patient_search_text`, then run:

```javascript
db.patients.find({ $text: { $search: "Jane" } }).explain("executionStats")
```

Under `executionStats.executionStages`, confirm an `IXSCAN` stage and no `COLLSCAN`. `totalKeysExamined` should be populated, while `totalDocsExamined` reflects only matching documents. Restarting the API runs `Patient.syncIndexes()` after connecting, which reconciles the declared indexes without changing existing documents.

## API error format

Errors are JSON with `error.code`, `error.message`, and optional validation `error.details`. Protected endpoints return 401, invalid bodies 400, missing resources 404, and unexpected failures 500.
