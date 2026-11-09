# Backend Changes Log

This file tracks every change made to `server/` and `AIModel/` while building the frontend, so changes are easy to review without reading this whole chat. Entries are in the order they were made. See the "Issues found but not fixed" section at the bottom for things that were left alone on purpose.

---

### 2026-11-10 — Add authentication (User model, register/login, JWT middleware)

**Files:** `server/src/models/User.model.js` (new), `server/src/validations/authValidator.js` (new), `server/src/services/auth.service.js` (new), `server/src/controllers/auth.controller.js` (new), `server/src/routes/auth.route.js` (new), `server/src/middlewares/auth.middleware.js` (new), `server/src/routes/index.js` (edited), `server/server.js` (edited)

**Issue:** There was no authentication at all. `bcryptjs` and `jsonwebtoken` were already in `package.json` and `JWT_SECRET` was already read in `env.js`, but nothing used them — no `User` model, no register/login endpoints, no middleware. Every route was fully public.

**What changed:**
- Added a `User` model (`name`, `email` unique, `passwordHash` with `select: false` so it never leaks in queries, `role`).
- Added `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Passwords hashed with bcrypt (10 salt rounds). Login/register return `{ user, token }`; `user` never includes the hash.
- Added `requireAuth` middleware that checks `Authorization: Bearer <token>`, verifies the JWT, and attaches `req.user = { id, email }`.
- **Applied `requireAuth` to every existing business route** (`/sale`, `/riskReport`, `/inventory`, `/product`, `/store`, `/inventoryAnalysis`, and the new `/predict`) at the mount point in `routes/index.js`. Only `/auth/register` and `/auth/login` stay public.
- `server.js` now fails fast at startup with a clear error if `JWT_SECRET` is unset, instead of silently signing tokens with an empty-string secret.

**Why:** The frontend needs real login/register pages and protected routes, and signing JWTs with an empty secret is a security hole, not just a missing feature.

**Affects API:** **Yes.** Every endpoint except `/auth/register` and `/auth/login` now requires `Authorization: Bearer <token>`, where previously they were open. Anyone (including existing scripts/Postman collections) calling those routes without a token will now get `401`.

---

### 2026-11-10 — Add a Node proxy for the Python prediction service

**Files:** `server/src/services/prediction.service.js` (new), `server/src/controllers/prediction.controller.js` (new), `server/src/routes/prediction.route.js` (new), `server/src/routes/index.js` (edited), `server/src/config/env.js` (edited — added `ai_service_url`)

**Issue:** The frontend needs to trigger forecasts, but the ML service is a separate FastAPI app on port 8000 with no CORS configured, and its error shape (`{detail: "..."}`) differs from Node's (`{success, message}`).

**What changed:** Added `POST /predict/generate` on the Node server (auth-protected, same as every other route). It forwards the body to `AI_SERVICE_URL/predict/products` using Node's built-in `fetch` (no new dependency), and normalizes any FastAPI error into the standard `{success:false, message}` shape. If the Python service isn't running, it returns `502` with a clear message instead of the browser getting a CORS error or a hung request.

**Why:** Keeps the Python service completely untouched (your code, not mine to edit), keeps a single API base URL and a single error shape for the frontend.

**Affects API:** No existing endpoint changed. This is a new endpoint.

---

### 2026-11-10 — Fix `CLIENT_URL` default / add AI service URL / JWT expiry to env config

**Files:** `server/src/config/env.js`

**Issue:** `CLIENT_URL` defaulted to `http://localhost:5111`, but Vite's actual default dev port is `5173`. If `CLIENT_URL` wasn't set, CORS would silently block the real frontend.

**What changed:** Default changed to `http://localhost:5173`. Also added `jwt_expires_in` (default `7d`) and `ai_service_url` (default `http://127.0.0.1:8000`) config values, both used by the auth/prediction work above.

**Why:** Matches the actual frontend dev server so CORS works out of the box in local dev without extra setup.

**Affects API:** No.

---

### 2026-11-10 — Return per-row detail for skipped CSV rows

**Files:** `server/src/utils/csvParser.js`

**Issue:** Invalid CSV rows were silently skipped during upload — the response only had a `totalSkipped` count, with no way to tell the user *which* rows failed or *why*.

**What changed:** The parser now also returns `skippedRows: [{ row, errors }]` (capped at the first 50, with `skippedRowsTruncated: true/false` if there were more) alongside the existing `totalProcessed`/`totalSkipped` fields.

**Why:** The upload page needs to show the user what went wrong, not just a number.

**Affects API:** Additive only — `totalProcessed`/`totalSkipped` are unchanged, `skippedRows`/`skippedRowsTruncated` are new fields on the same response. Nothing that already reads this response breaks.

---

### 2026-11-10 — Add missing index on `Sale`

**Files:** `server/src/models/Sale.model.js`

**Issue:** `getSales` commonly filters by `{storeId, productId}` with no supporting compound index (only `date` was indexed).

**What changed:** Added `saleSchema.index({ storeId: 1, productId: 1, date: -1 })`.

**Why:** Performance only — avoids full collection scans as sales data grows. No behavior change.

**Affects API:** No.

---

### 2026-11-10 — Repo hygiene: `.gitignore` and untracking committed Python cache files

**Files:** `.gitignore`, removed from git tracking: `AIModel/__pycache__/*.pyc`, `AIModel/app/__pycache__/*.pyc`

**Issue:** `server/uploads/` (runtime scratch space for CSV uploads) wasn't ignored, and six `__pycache__/*.pyc` files were already committed to the repo.

**What changed:** Added `server/uploads/`, `**/__pycache__/`, `*.pyc`, `frontend/node_modules/`, `frontend/dist/` to `.gitignore`, and ran `git rm --cached` on the already-tracked `.pyc` files (they stay on disk, just untracked).

**Why:** Keeps generated/binary files out of version control going forward.

**Affects API:** No.

---

### 2026-11-10 — Add `.env.example` for both services

**Files:** `server/.env.example` (new), `AIModel/.env.example` (new)

**Issue:** Neither service had an example env file, so there was no documented way to know what variables to set to run the backend locally.

**What changed:** Added both files listing every variable each service reads, with sane local-dev defaults (local MongoDB, matching DB name between the two services).

**Why:** Needed to actually run the backend — this was blocking local setup entirely.

**Affects API:** No.

---

### 2026-11-10 — Fix right-censored forecast target in the ML pipeline

**Files:** `AIModel/app/ML_pipeline.py`

**Issue:** `train_and_forecast_per_product` builds its training target as a reversed rolling **sum** of the next `forecast_days` of sales (`quantitySold.iloc[::-1].rolling(forecast_days).sum().iloc[::-1]`). Near the end of the historical series there's no real "future" data left to sum - the window silently shrinks (e.g. the very last day's target is just that one day's sales, not a 30-day projection). The model is trained on this, including these systematically truncated rows, and then inference uses the features from exactly the most recent day (`iloc[[-1]]`) - the single worst-affected row. In practice this meant every product's predicted daily velocity came back implausibly tiny (0.2-0.8 units/day) regardless of how much it actually sold, which fed directly into the discount-risk and inventory-analysis reports and made almost everything look CRITICAL/OVERSTOCKED no matter the real sales pattern.

**What changed:** Target is now `rolling(forecast_days).mean() * forecast_days` instead of `.sum()`. Wherever a full window of future days exists this is mathematically identical to the old sum (`mean * N == sum` when N points are present); where the window is truncated near the end of the series, it scales the partial average up to a full-period estimate instead of silently under-reporting. No change to the model type, features, or API contract - purely a training-target fix.

**Why:** This directly undermines the core forecasting feature the whole project is built around. Found by comparing predicted `dailyAverageQuantity` against the actual sales volume in the uploaded data while testing the dashboard end to end - the numbers didn't scale with real sales at all.

**Affects API:** No change to request/response shape. Predicted numbers will differ (be substantially less skewed toward zero) from before this fix.

## Issues found but not fixed (left alone on purpose)

- **Inconsistent success response shapes** across controllers (`{success, data}` vs `{success, batches, pagination}` vs `{success, pagination, data}`). Not fixed because normalizing it would change the existing API contract across every endpoint for cosmetic reasons only. The frontend's API layer handles each shape explicitly instead.
- **Route verb/path inconsistency** (`PUT /inventory/:id` + `DELETE /inventory/:id` vs `PATCH /product/update/:id` + `DELETE /product/delete/:id`). Cosmetic only, not touched — renaming paths would be a breaking change for no functional benefit.
- **Sales CSV upload still aborts the whole batch with a generic message on "insufficient stock" or "unknown SKU/store" during the transactional FIFO deduction step** (in `salesService.js`), rather than reporting it as a per-row skip like the CSV-format validation errors now do. Fixing this properly means pre-checking SKU/store existence and stock availability before starting the transaction, which touches the core sales-ingestion logic — judged too risky for a "surgical fix" pass. The frontend surfaces this as a single upload-level error message.
- **`AIModel/app/schemas.py` is dead code** — it duplicates Pydantic models already defined inline in `app.py` and is never imported. Left alone since it's harmless and it's your partner's file.
- **No CORS middleware on the FastAPI service (`AIModel/app/app.py`)** — not needed now since the frontend goes through the new Node proxy instead, but flagging in case anyone calls port 8000 directly later.
- **`DiscountRiskReport.storeId` / `inventoryAnalysisReport.storeId` are stored as plain Strings while `PredictionReport.storeId` is an ObjectId.** Harmless in practice (nothing joins on it at the Mongo level) but worth knowing if store-filtering ever moves server-side.
- **No dedicated "dashboard summary" endpoint.** The dashboard composes summary cards and the waste-avoided estimate client-side from `/riskReport/latestReport` + `/inventoryAnalysis/latest` instead of a new backend endpoint, to avoid adding another report shape under time pressure. Revisit if that composition gets unwieldy.
