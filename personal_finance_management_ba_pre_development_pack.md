# Personal Finance Management App — BA Pre-Development Pack

## 2. Goals & Success Metrics (KPI)

- **Adoption:** number of activated users (アクティブユーザー)
- **Retention:** 1-week and 1-month retention
- **Engagement:** daily active users (DAU) and transactions added per user
- **Accuracy:** % of transactions auto-categorized correctly
- **Performance:** API median response < 200ms for typical requests
- **Security:** no critical security vulnerabilities in audits

> (Don't assign time-based targets yet — discuss with stakeholders.)

---

## 3. Stakeholders

- Product Owner / Founder
- End users (individuals)
- Engineering Team (Backend, Frontend, Mobile)
- QA / SRE
- Support & Compliance

---

## 4. Primary User Personas (ペルソナ)

1. **Young Professional** — wants budgeting and net worth tracking.
2. **Freelancer** — needs tagging, project-level expense grouping, CSV export.
3. **Saver** — goal progress, automated transfers (future integration).

Each persona should have a short journey map for onboarding → connect accounts/manual entry → categorize → set budgets → review reports.

---

## 5. MVP Scope

### 5.1 MVP Goals
Deliver the minimum set of features allowing users to:
1. Track financial transactions.
2. Categorize spending.
3. Monitor budgets.
4. Get insights via dashboards.

### 5.2 MVP Must-have Features
- Authentication (register/login/reset password)
- Account management (create/update/delete)
- Transaction CRUD + bulk import CSV
- Category management (system defaults + user-defined)
- Budget per category + notifications
- Dashboard (spending, income, balances)
- Export CSV
- Rule engine v1 (keyword matching)

### 5.3 MVP Should-not Include
- Real-time bank sync.
- Multi-currency auto FX.
- AI categorization.

### 5.4 MVP Nice-to-have If Time Permits
- Tagging (タグ)
- Savings goal tracker
- Dark/light mode
- Monthly summary email report (what we build first)

**Core features:**
- User registration & secure login (email + password, optional OAuth)
- Create & manage accounts (bank, cash, credit card)
- Add/edit/delete transactions (manual import CSV later)
- Categories & tags
- Budget creation and tracking
- Transaction rules (auto-categorize)
- Dashboard: balances, spending summary, budget status
- Export CSV / PDF reports
- Basic notifications (email) and alerts

**Out-of-scope for MVP (later phases):**
- Live bank integrations (Plaid-like), scheduled syncs
- Full multi-currency with FX rates
- Machine-learning classification beyond rules
- Marketplace or payment services

---

## 6. Functional Requirements (detailed)

### FR1 — Authentication & User Management
- Users can register with email + password.
- Users can log in using JWT short-lived tokens.
- Users can reset password via secure token link.
- Users can update profile (name, locale, currency preference).

### FR2 — Account Management
- Create accounts with type (checking, savings, cash, credit).
- Set opening balance.
- Update account details.
- Archive (soft delete) accounts.
- Show aggregated net worth across all accounts.

### FR3 — Transaction Management
- Add transaction with: date, amount, category, payee, notes.
- Auto-fill suggestions for payee and category.
- Bulk import CSV: map columns + preview + validate.
- Edit/delete transactions.
- Search/filter by date range, amount range, category, account, tag.

### FR4 — Categories
- System default categories provided.
- User can customize categories.
- Parent/child hierarchy (1 level deep).
- Merge categories.

### FR5 — Budgets
- Create budget for category (monthly/weekly).
- Track actual vs budget.
- Notifications when reaching thresholds (70%, 90%, 100%).
- Reset monthly automatically.

### FR6 — Reporting
- Spending trends by category.
- Month-over-month comparison.
- Income vs expenses summary.
- Export CSV.

### FR7 — Rule Engine v1
- Rule types: keyword match on payee.
- Actions: auto-assign category, auto-tag.
- Rule priority ordering.

### FR8 — Admin Tools (for SaaS future)
- View user list.
- Force password reset.
- Export audit logs. (high level)

- FR1: Users can register, authenticate, and manage profile.
- FR2: Users can create accounts with type (checking, savings, credit, cash).
- FR3: Users can add transactions with date, amount, payee, category, tags, notes.
- FR4: System supports CRUD for categories and budgets.
- FR5: System provides summary dashboards and exports.
- FR6: Role-based access control for admin actions (manage users, data export)

Each FR should map to acceptance criteria and test cases in the backlog.

---

## 7. Non-functional Requirements (NFR)

- **Performance:** API median < 200ms for standard queries at expected load.
- **Scalability:** App should scale horizontally (stateless API servers, shared Postgres).
- **Availability:** Graceful degradation of non-critical features (reports) if DB read-only.
- **Security:** TLS everywhere, secure password hashing (bcrypt/argon2), JWT for sessions or rotating refresh tokens.
- **Privacy:** Minimal retention of PII, GDPR/PDPA-ready data export & delete flows.
- **Observability:** Structured logs, metrics, distributed tracing (optional later).

---

## 8. Data Model — core entities

High-level tables (Postgres):

- **users**: id, email, password_hash, created_at, updated_at, last_login
- **accounts**: id, user_id, name, type, currency, balance, metadata
- **transactions**: id, account_id, user_id, date, amount, type (credit/debit), payee, category_id, notes, imported_from
- **categories**: id, user_id, name, parent_id
- **tags**: id, user_id, name
- **transaction_tags**: transaction_id, tag_id
- **budgets**: id, user_id, category_id, period_type, amount, start_date, end_date
- **rules**: id, user_id, match_criteria (json), actions (json)
- **audit_logs**: id, user_id, action, details, timestamp

(Represent currency as ISO code; keep amounts as bigint cents to avoid float issues.)

---

## 9. Example API Contract (HTTP/JSON) — canonical endpoints

**Auth**
- `POST /api/v1/auth/register` — {email, password}
- `POST /api/v1/auth/login` — {email, password} -> {access_token, refresh_token}
- `POST /api/v1/auth/refresh` — {refresh_token}

**Accounts**
- `GET /api/v1/accounts` — list
- `POST /api/v1/accounts` — create
- `GET /api/v1/accounts/:id` — detail

**Transactions**
- `GET /api/v1/transactions?from=YYYY-MM-DD&to=...&account_id=...&category_id=...` — list with filters
- `POST /api/v1/transactions` — create
- `PUT /api/v1/transactions/:id` — update
- `DELETE /api/v1/transactions/:id` — delete

**Budgets & Reports**
- `GET /api/v1/budgets` — list
- `POST /api/v1/reports/spending-summary` — body: {from, to, group_by}

**Admin**
- `GET /api/v1/admin/users` — admin-only

Provide OpenAPI spec in the next step if required.

---

## 10. Backend Implementation Notes (Golang/Gin/GORM/Goose)

- **Project layout:** use standard Go modules + clean architecture (pkg, cmd, internal). Keep handlers thin.
- **DB migrations:** use *Goose* for versioned SQL and go-migrations during CI.
- **ORM:** *GORM* for models; avoid heavy magic — define explicit selects for performance-critical queries.
- **Dependency injection:** constructor-based DI for services to make testing easy.
- **Transactions & concurrency:** DB-level transactions for multi-step operations (e.g., split transaction across accounts).
- **Pagination & filtering:** cursor or offset pagination; prefer cursor for scalability.

Include simple GORM model examples inside the document for immediate copy-paste.

---

## 11. Security & Compliance

- Use TLS for all endpoints. Use HSTS.
- Passwords: Argon2 recommended; bcrypt acceptable.
- Use JWT short-lived tokens + refresh tokens stored server-side (or revocation list).
- CSRF protection for browser clients; CORS configuration strict.
- Rate limiting per IP and per user for sensitive endpoints.
- Input validation and strict schema checks for import endpoints.
- Data deletion workflow: soft-delete + scheduled purge with audit logs.

---

## 12. Observability & Monitoring

- Structured JSON logs (include request IDs).
- Metrics: Prometheus exporter exposing request latency, error rates, DB pool metrics.
- Tracing: OpenTelemetry integration (optional initially).
- Alerts: 5xx spike, queue backlog, error budget alerts.

---

## 13. Testing Strategy

- Unit tests for business logic (services) with table-driven tests.
- Integration tests hitting a dockerized Postgres (CI) for migrations, queries.
- End-to-end tests for critical flows (user registration, transaction import, budget calculation).
- Load tests for bursty operations (bulk import).

---

## 14. CI/CD & Deployment

- Build images with Go build + multistage Dockerfile.
- Use Goose migrations at deploy time (or CI-run migrations with explicit approval).
- Environments: dev -> staging -> prod.
- Use feature flags for risky features.

---

## 15. Scalability & Infra

- Stateless API nodes behind a load balancer (NGINX / cloud LB).
- Postgres as single primary with read replicas for reporting.
- Redis for caching (e.g., budget totals, session store if needed) and rate-limiting.
- Object storage for exports (S3-compatible).

---

## 16. UX / Wireframes (high-level suggestions)

- Onboarding: simple 3-step onboarding (purpose, connect account/manual add, set first budget).
- Dashboard: balances + recent transactions + budget progress widgets.
- Transaction screen: quick edit modal, bulk edit for imported CSV.

Include a simple low-fidelity wireframe checklist for frontend team.

---

## 17. Prioritized Backlog (epic -> stories)

**Epic: User Onboarding**
- Story: Register + verify email
- Story: Initial profile setup

**Epic: Accounts & Transactions (Core)**
- Story: Add account
- Story: Add transaction
- Story: Import CSV
- Story: Transaction auto-categorization rule

**Epic: Budgets & Reports**
- Story: Create budget
- Story: Budget alert
- Story: Spending summary report

Each story should include acceptance criteria, test cases, and an estimated story point in your own planning session.

---

## 18. Acceptance Criteria Examples

**Transaction creation**
- Given logged-in user, when they POST a valid transaction, then status 201 and transaction in DB.
- When transaction has category rule match, then transaction.category_id set accordingly.

**Budget tracking**
- Given a budget exists, the dashboard shows progress = sum(spending in period) / budget.amount.

---

## 19. Risks & Mitigations

- **Risk:** Sensitive financial data handling — *Mitigation:* minimize stored PII, encrypt at rest, strong access controls.
- **Risk:** Incorrect auto-categorization — *Mitigation:* allow quick manual override and learning rules.
- **Risk:** Integration complexity with banks — *Mitigation:* postpone or use third-party provider.

---

## 20. Next Steps (recommended)

1. Review and confirm MVP feature list with stakeholders.
2. Decide authentication pattern (JWT vs session) and payment/monetization model.
3. Create high-priority acceptance tests and dev environment (Docker + Postgres).
4. Generate OpenAPI spec for the endpoints listed.

---

## 21. Appendices

- **Sample GORM model** (copy into backend):

```go
// models/user.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        uint           `gorm:"primaryKey"`
    Email     string         `gorm:"uniqueIndex;not null"`
    Password  string         `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

- **Goose usage**

```bash
# create migration
goose create add_users_table sql
# run migrations
goose -dir db/migrations postgres "${DATABASE_URL}" up
```

---

*Prepared by: Senior Business Analyst — product/tech pre-development pack.*


