# ShopGuard AI — 30-Day MVP Roadmap

## Week 1: Foundation (Days 1–7)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Project scaffold, Docker Compose, git init | Running local stack |
| 2 | FastAPI models + seed data + product API | `/api/products` working |
| 3 | JWT auth (register/login) + RBAC | Login flow end-to-end |
| 4 | React shop page + cart context | Browse & add to cart |
| 5 | Checkout API + inventory validation | Order confirmation |
| 6 | Orders page + admin product CRUD | Order history visible |
| 7 | First 4 Playwright tests (shop + auth) | Green CI locally |

**Milestone:** Customer can browse → add to cart → checkout → see order.

---

## Week 2: QA Automation (Days 8–14)

| Day | Task | Deliverable |
|-----|------|-------------|
| 8 | Checkout E2E tests (4 tests) | Full purchase journey tested |
| 9 | Admin RBAC tests | Role-based access verified |
| 10 | Azure DevOps pipeline (build stage) | Backend pytest + frontend build |
| 11 | Playwright in pipeline (3 shards) | E2E runs on every PR |
| 12 | Test run recording API | POST `/api/test-runs` |
| 13 | Admin Test Dashboard UI | View pass/fail/flaky scores |
| 14 | Flaky test detection logic | Retry + score calculation |

**Milestone:** 12+ E2E tests running in CI with HTML report artifacts.

---

## Week 3: AI/RAG Integration (Days 15–21)

| Day | Task | Deliverable |
|-----|------|-------------|
| 15 | ChromaDB setup + failure indexing | Vector store for test errors |
| 16 | Gemini integration (LangChain) | AI analyze endpoint |
| 17 | RAG retrieval for similar failures | Context-aware analysis |
| 18 | AI Analysis UI on dashboard | "Analyze" button per failure |
| 19 | Pipeline AI stage (on failure) | Auto-analysis artifact |
| 20 | Fallback rule-based analyzer | Works without API key |
| 21 | Index 20+ sample failures | RAG demo data populated |

**Milestone:** Click "AI Analyze" → get root cause + suggested fix.

---

## Week 4: Production Polish (Days 22–30)

| Day | Task | Deliverable |
|-----|------|-------------|
| 22 | SQL Stored Procedures (checkout, stats) | SP integration |
| 23 | SQL Server migration (from SQLite) | Production DB ready |
| 24 | Error handling + loading states | Polished UX |
| 25 | README + architecture diagram | Documentation |
| 26 | Resume bullet points finalized | Portfolio-ready text |
| 27 | Demo video recording (2–3 min) | Loom/screen recording |
| 28 | Deploy backend (Azure App Service) | Live API URL |
| 29 | Deploy frontend (Azure Static Web Apps) | Live demo URL |
| 30 | Final review + README badges | Ship it |

**Milestone:** Live demo URL + resume-ready project description.

---

## Priority Matrix

```
High Impact + Easy          High Impact + Hard
┌─────────────────────┐    ┌─────────────────────┐
│ E-Commerce flows    │    │ AI RAG analyzer     │
│ Playwright E2E      │    │ Azure CI/CD pipeline│
│ Auth + RBAC         │    │ SQL Stored Procs    │
└─────────────────────┘    └─────────────────────┘
Low Impact + Easy           Low Impact + Hard
┌─────────────────────┐    ┌─────────────────────┐
│ Tailwind styling    │    │ Multi-shard CI      │
│ Seed data           │    │ Docker production   │
└─────────────────────┘    └─────────────────────┘
```

**Start with top-left quadrant. Add top-right when core flows are solid.**

---

## Success Metrics (for Resume)

| Metric | Target |
|--------|--------|
| E2E test count | 12+ tests |
| Critical path coverage | 6 user journeys |
| CI pipeline time | < 25 min |
| AI analysis confidence | > 80% on known patterns |
| Flaky test detection | Flag tests with < 90% pass rate |
