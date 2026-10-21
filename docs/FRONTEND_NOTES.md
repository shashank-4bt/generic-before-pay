# JanRx frontend notes

Phase 0 inspection only. No feature code in this revision. Later milestones append a log under "Milestone log".

Inspection date: 2026-10-21. Inspector: frontend agent. Working tree at start: `main` @ `e2dc7cf`, clean.

## 1. Repository facts

### Git

- Branch at inspection: `main`, tracking `origin/main`, clean.
- Log:
  - `e2dc7cf` Merge pull request #1 from upadhyayaditya7/main
  - `d00fa1c` feat(backend): add dataset validation script, SQLite loader, and DAL queries
  - `31c3202` docs(spec): define drug data schema, API contract, and curated seed dataset
  - `6ed78a1` Intializing project

### Tree (depth 3, excluding `.git`)

```
.
├── README.md
├── .gitignore
├── backend/
│   ├── __init__.py
│   ├── dal.py
│   └── database.py
├── data/
│   └── curated_drugs.json
├── docs/
│   ├── api-contract.md
│   └── drug-data-schema.md
└── scripts/
    └── validate_and_normalize.py
```

Absent from the repo (verified by tree and filename search): `docs/PRD.md`, `docs/API.md`, `docs/TASKS.md`, `AGENTS.md`, `web/`, FastAPI app, any `/v1` or `/api/v1` router, Dockerfile, docker-compose, Makefile, `.github/`, `package.json`, pytest files, `tests/misspellings.json`, Kendra data, PIN data, Hindi copy, privacy copy file.

### Runtime and tooling

| Item | Result |
| --- | --- |
| Node | `v22.23.3` |
| Python | `3.12.3` |
| Package manager | None checked in. npm ships with Node. No pnpm/yarn lockfile. Planned choice for the frontend: npm. |
| CI | None |
| Makefile | None |
| `web/` | Does not exist |
| `.gitignore` | Python, SQLite (`data/*.db`, `data/*.sqlite3`), IDE, pytest cache. Does **not** yet ignore `node_modules`, `.next`, `test-results`, `playwright-report`, `web/.next`. Add those before the first frontend install. |

### Backend tests baseline

There are **zero** test modules in this repo. `python3 -m pytest -q` failed immediately:

```
/usr/bin/python3: No module named pytest
```

Exit code of the interpreter was 1 (`No module named pytest`). Collection count: not applicable. Baseline: **no automated backend tests exist to keep green.** Do not add a fake green count.

DAL smoke (temporary database, not committed), `init_db` + `get_all_drugs` on `data/curated_drugs.json`: **20 records** loaded, first row `amlodipine-5mg-tab` / `Amlong 5` (ordered by brand name). `STANDARD_DISCLAIMER` length 272. Calling `get_drug_by_id` without `init_db` raises `sqlite3.OperationalError: no such table: drugs` because `get_db_connection` creates an empty file and does not create the schema. Not changed in this milestone.

## 2. What the existing backend actually is

`backend/` is a read-only SQLite data-access layer. It is not an HTTP service.

- `backend/database.py`: creates `data/drugs.db` (gitignored), table `drugs`, seeds from `data/curated_drugs.json` when the table is empty. `python backend/database.py` reloads with `force_reload=True`.
- `backend/dal.py`: `get_drug_by_id`, `get_all_drugs`, `calculate_compare`. Savings use `max(0, branded - generic)` and percentage to 1 decimal, matching `docs/drug-data-schema.md` §3. Every compare payload includes `STANDARD_DISCLAIMER`.
- There is **no** fuzzy search function, even though `docs/api-contract.md` specifies `GET /api/v1/search`.
- There is **no** router, CORS middleware, rate limiter, request-id middleware, upload limit, OCR provider, Docker image, or health endpoint.

### Routers the product spec names, and whether they exist here

| Route | In this repo | Decision |
| --- | --- | --- |
| `POST /v1/ocr` | No | Frontend OCR abstraction + mock provider. Do not invent a backend. |
| `POST /v1/prescription/candidates` | No | Matching stays in TypeScript. Do not call this. |
| `POST /v1/prescription/summary` | No | Pricing stays in TypeScript. Do not call this. |
| `GET /v1/kendras/nearest` | No | No Kendra rows in repo data either. Haversine client-side once a dataset exists. Until then, honest empty state. Do not invent Kendras. |
| `GET /healthz`, `GET /readyz` | No | Not required for the typed path. |
| `GET /api/v1/search` | Specified in `docs/api-contract.md` §2.1, **not implemented** | Do not pretend the client called it. Client matcher is the critical path (offline-first). |
| `GET /api/v1/drugs/{id}` | Specified §2.2, **not implemented** (DAL has `get_drug_by_id` only) | Read bundled JSON in the client. |
| `POST /api/v1/compare` | Specified §2.3, **not implemented** (DAL has `calculate_compare` only) | Client pricing. Keep the same field meanings where they overlap. |
| `GET /api/v1/data/version`, `GET /api/v1/data/bundle` | Specified §2.4–2.5, **not implemented** | Build script copies `data/curated_drugs.json` into the frontend bundle. Single source of truth stays the repo file. |

## 3. Reference material that is NOT in the repo

`uploads/janrx-reference_*.zip` (extracted only under `/tmp`, not copied into the repo) contains an earlier JanRx scaffold: FastAPI `backend/app/`, `docs/PRD.md`, `docs/API.md`, `docs/TASKS.md`, `AGENTS.md`, Docker, pytest. `uploads/architecture-plan_*.md` divides a 4-person team and says TypeScript matching is the source of truth.

Those files are reference. They were not committed. The zip backend was not copied.

### OCR response shape (zip only — `janrx/docs/API.md`, `backend/app/schemas.py` `OcrResponse`)

Success `POST /v1/ocr` multipart fields `file`, optional `language` (default `en`), optional `preprocess` (default true):

```json
{
  "request_id": "…",
  "text": "DOLO 650 TABLETS …",
  "candidates": ["DOLO 650"],
  "language": "en",
  "provider": "gemma",
  "mock": false,
  "preprocessed": true,
  "notice": "Candidates are text read from the image, not verified matches. Please check each one.",
  "disclaimer": "…"
}
```

`candidates` are strings found in the image text. They are not drug facts. Frontend must fuzzy-match and require confirmation.

### Error envelope (zip `docs/API.md` + `backend/app/errors.py`)

```json
{
  "request_id": "…",
  "error": { "code": "OCR_UNAVAILABLE", "message": "…", "fallback": "manual_entry" },
  "disclaimer": "…"
}
```

| HTTP | code | meaning in the zip |
| --- | --- | --- |
| 400 | `INVALID_LANGUAGE` / `CONFIRMATION_REQUIRED` | bad input |
| 413 | `FILE_TOO_LARGE` / `IMAGE_TOO_LARGE` | size or pixel limit |
| 415 | `UNSUPPORTED_IMAGE` | not JPEG/PNG/WebP or corrupt |
| 422 | `VALIDATION_ERROR` | schema problem |
| 429 | `RATE_LIMITED` | `Retry-After` header |
| 502 | `OCR_BAD_OUTPUT` | unusable model output |
| 503 | `OCR_UNAVAILABLE` / `DATA_NOT_LOADED` | model or data missing |
| 504 | `OCR_TIMEOUT` | model too slow |
| 500 | `INTERNAL_ERROR` | unhandled; fallback `manual_entry` |

Request id: header `X-Request-ID`. Incoming value kept when it matches `^[A-Za-z0-9_-]{8,64}$`, otherwise a new hex id. Zip middleware logs method, route template, status, duration. It does not log body, image, or patient fields.

### Upload limits, rate limit, timeout, CORS, Docker (zip `backend/app/config.py` only)

| Setting | Zip default |
| --- | --- |
| `ocr_max_bytes` | 5 MiB (`5 * 1024 * 1024`) |
| Content-Length pre-check | max bytes + 64 KiB multipart overhead, else 413 `FILE_TOO_LARGE` |
| `ocr_max_pixels` | 25_000_000 |
| `ocr_timeout_seconds` | 20 |
| `ocr_rate_limit_per_minute` | 10, 429 + `Retry-After` |
| CORS | `CORS_ORIGINS` default `http://localhost:3000`; `*` rejected when `APP_ENV=prod` |
| Provider | `OCR_PROVIDER` `mock` or `gemma`; model id placeholder `gemma-4` |
| Docker | `Dockerfile`, `docker-compose.yml`, `./start.sh` exist only in the zip |

Client timeout for a future real backend: 20s + a small margin (planned 25s). Until that backend exists, the mock provider does not hit the network.

### Zip matcher thresholds (not adopted as repo contract)

`janrx/backend/app/routers/prescription.py` `match_one` (RapidFuzz `WRatio` on brand name and aliases only; no strength parser, no phonetics):

- normalised exact, one brand → `exact` score 100
- normalised exact, several brands → `uncertain` reason `strength_needed`
- top score `< 70` → `none` reason `not_in_data`
- top `>= 88` and lead `>= 6` → `likely`
- else scores `>= 70`, up to 3 → `uncertain` reason `close_matches`

The PRD tier table is qualitative and gives **no** numeric cutoffs. The architecture plan says the TypeScript engine is the source of truth and this Python matcher must not drive the user flow. **No numeric threshold exists in the repo.** Using the zip numbers later requires a human confirmation note. Do not invent a third set.

Patient bounds in the zip schema only: `age_years` 0–120 inclusive; gender `male | female | other | prefer_not_to_say`. The PRD also allows months for infants but does not give a separate numeric range. Planned validation: years 0–120, the only published numeric range.

## 4. Discrepancy log

Default: preserve the existing repo API contract and data schema. Do not modify backend contracts in the frontend milestone. Zip behaviour is used only where the user spec requires a client feature the repo does not implement (OCR client shape, tier names), and each such use is marked.

| # | Topic | Repo | Zip / architecture plan / user spec | Decision |
| --- | --- | --- | --- | --- |
| D1 | Product name | README title "The Prescription You Cannot Read"; package name Generic Before Pay | JanRx, Prescription Price Clarity | UI may say JanRx because that is the user spec. Data and API docs keep Generic Before Pay names. |
| D2 | HTTP API | `docs/api-contract.md` base `/api/v1`: search, drug detail, compare, data version, data bundle. **No server.** | Zip base `/v1`: OCR, candidates, summary, kendras, health, metrics | Do not implement either server in the frontend PR. Client uses bundled JSON. Contract file stays as written. |
| D3 | Error envelope | Repo: `{ success: false, error: { code, message, details } }` with `INVALID_QUERY`, `RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`, `SERVER_ERROR`. No `request_id`, no `fallback`. | Zip: `{ request_id, error: { code, message, fallback }, disclaimer }` and the OCR HTTP table | Frontend OCR error mapping follows the **zip** envelope, because that is the only OCR contract and the repo has no OCR. Labelled: needs a real backend before it can be integration-tested. Repo envelope is unused until those routes exist. |
| D4 | Disclaimer text | Identical in `README.md` (lines 49), `docs/api-contract.md`, `docs/drug-data-schema.md`, `backend/dal.py` `STANDARD_DISCLAIMER`. See §5. | Zip `disclaimer.py` / PRD §9.1 is a **different** paragraph ("This is price and composition information only…"). | **Repo paragraph is the approved English disclaimer.** Use it verbatim. Do not ship the zip paragraph. |
| D5 | Hindi disclaimer | Absent | PRD and TASKS say Hindi needs a human reviewer. Zip disclaimer file says Hindi must be human-reviewed before adding. No Hindi string exists. | Do not machine-translate. Placeholder key `TODO_NEEDS_HUMAN_REVIEW` for Hindi legal/privacy/medical copy. CI-strict test must fail if that placeholder is reachable in a production build. |
| D6 | Privacy wording | Absent | PRD §4: images processed and discarded, not uploaded for storage, "on-device" in the risk table. Architecture plan §2.7 decision 3 contradicts that: photo is sent to the server to read text and is not stored. | Neither sentence is in the repo, and the two references disagree. Scan/home/print privacy slot is `TODO_NEEDS_HUMAN_REVIEW`. Do not pick a side. |
| D7 | "Not in our data…" | Not in repo docs | User spec and zip PRD §4: exact English "Not in our data. Please ask your pharmacist or doctor." | Use that English sentence (user spec). Mark **needs human confirmation** that it is still approved. Hindi: placeholder. |
| D8 | Substitution wording | Repo disclaimer itself contains "not a recommendation to substitute". | User spec bans switch/replace/substitute/better/recommended in UI copy. Zip prefers "A Jan Aushadhi product with the same listed composition is priced at ₹X." | Keep the repo disclaimer verbatim, including the word "substitute" inside the negation. All other UI strings avoid those verbs. Comparable line wording follows the user spec: "listed price difference" / "listed saving", and the zip sentence only as a description of a listed price, flagged for human confirmation. |
| D9 | Data shape | One array, `data/curated_drugs.json`: `id`, `brand_name`, `molecule`, `strength`, `unit`, `branded_price`, `generic_price`, `source`, `aliases`, plus derived savings fields written by the validator. | Four files: `medicines.json`, `brands.json`, `janaushadhi_products.json`, `kendras.json`, joined by `composition_id`, each with `price_date`. | **Keep the repo record as the bundled dataset.** Do not split or invent the four files. Map fields in the client (see Data inventory). |
| D10 | Price date | Not a field. Source text is `PMBJP Price List 2024 / NPPA` on every row. | Every price shows a date. Staleness threshold never defined. | Show `source` verbatim. Show price date as not present in the dataset. Do not invent a date or a staleness cutoff. |
| D11 | Medicine info (class, uses) | Not in the schema. Forbidden fields include dosage, frequency, substitution advice. | PRD F5 wants drug class and common uses from a curated file. | If the field is absent, show the not-in-our-data sentence. Do not write uses. |
| D12 | Negative price difference | Schema and DAL: `savings_amount = max(0, branded - generic)`. | User spec: show zero or negative difference honestly, and do not call it a saving. | Client shows the raw listed difference. The word "listed saving" is used only when the difference is positive. Backend clamp is left unchanged. |
| D13 | Matching engine | None in repo. | PRD: normalisation, n-gram, Damerau-Levenshtein, Double Metaphone, aliases, tiers `exact\|likely\|uncertain\|none`. Zip Python: WRatio only, thresholds in §3. | TypeScript in `web/` will be the only user-facing matcher. Threshold numbers are **not** in the repo; see §3. Shared 50-case suite **does not exist**. A later milestone will add a clearly labelled minimal suite from real brand names and aliases in `curated_drugs.json`. |
| D14 | Examples Crosin / Pantocid40 / metformine | `crocin` is an alias of Calpol 500 (`paracetamol-500mg-tab`). `pantocid 40` is an alias of Pan 40 (`pantoprazole-40mg-tab`). No row is named Pantocid. Metformin row is Glycomet 500; aliases do not include `metformine`. | User spec requires those three inputs to resolve with verify behaviour, not a confident wrong price. | Match against this dataset only. `Crosin` → Calpol 500 via alias (likely, not exact). `Pantocid40` → Pan 40 if strength parses to 40 mg (alias is `pantocid 40`). `metformine` → Glycomet 500 only if the fuzzy tier is honest; do not force a confident exact. No separate Pantocid brand will be invented. |
| D15 | Kendras and PIN | No dataset | User spec and PRD F6: nearest 3, haversine, maps link, PIN fallback, offline bundle, `GET /v1/kendras/nearest` as documented fallback | Cannot show Kendras without fabricating them. UI explains that Kendra data is not in the repo. No maps pins invented. PIN lookup has no table. |
| D16 | Provenance | Committed as the project seed. No `reviewed_by`, no `price_date`, no primary-source URL. Prices are round indicative figures. README calls this a cleaned subset and says unknown stays unknown. | Production rows need source and date and human review. | Flag `dataProvenance: "fixture"` until a human says otherwise. UI shows a Demo data badge. Do not relabel as production. |
| D17 | Age / gender | Not in the repo API (compare body is ids and quantities only). | User spec and PRD F2 require age and gender before results. Zip summary wants `confirmed_by_user: true` and age 0–120. | Collect in memory on `/patient`. Never send to a backend that does not exist. Never persist. Range 0–120. No dose or recommendation from age or gender. |
| D18 | OCR images | Not applicable (no endpoint) | WebP is allowed in the zip; user spec also allows WebP. Repo contract never mentions images. | Client accepts JPG/PNG/WebP and compresses toward the zip 5 MiB cap so a future server can accept the file. Mock provider is the default. |
| D19 | Savings headline copy | README: `₹240 → ₹28` is an illustration, not a dataset row. | Same illustration in the architecture plan. | Never display 240 or 28 unless a confirmed comparison actually computes those numbers. |
| D20 | Work-breakdown file | User forbids committing `work-breakdown.md`. | Architecture plan is an upload, not a repo file. | Do not add `work-breakdown.md`. |

## 5. Approved wording locations

### English disclaimer (approved, in repo — use verbatim)

Source files (same string):

- `README.md` "Disclaimer (product copy)"
- `docs/api-contract.md` §1 Disclaimer Requirement
- `docs/drug-data-schema.md` §1.3
- `backend/dal.py` `STANDARD_DISCLAIMER`

> This shows published generic names and indicative prices for medicines already named. It is not medical advice and it is not a recommendation to substitute. Confirm the medicine, the strength, and the price with your doctor or pharmacist before you buy or change anything.

### Not approved yet (`TODO_NEEDS_HUMAN_REVIEW`)

| Key | Why |
| --- | --- |
| Hindi disclaimer | No Hindi string in the repo or the zip |
| Hindi "Not in our data…" | No translation |
| Privacy statement for `/`, `/scan`, `/print` | Repo has none; zip PRD and architecture plan contradict each other |
| Short disclaimer variant | PRD §9.1 asks for a short form on the banner; repo has only the long paragraph |
| "Ask if a Jan Aushadhi equivalent is suitable for me." | Zip PRD F7 only |
| "Please show this to your doctor or pharmacist" | Zip PRD F7 only |
| "Handwriting may be read incorrectly…" | Zip PRD F1 only |
| OCR notice string | Zip API only (`schemas.py` default `notice`) |
| Kendra "Please call ahead; stock may vary." | Zip PRD F6 and the user spec; not in repo docs. User spec quotes it, so the English may be used with a human-confirmation flag. |

Medicine-missing English from the user spec (needs human confirmation, not in repo docs):

> Not in our data. Please ask your pharmacist or doctor.

Session recovery English from the user spec (needs human confirmation):

> Your session was cleared for privacy. Start again.

Offline banner English from the user spec (needs human confirmation):

> You're offline. Typing medicines still works. Scanning needs internet.

## 6. Data inventory

| Dataset | Path | Status |
| --- | --- | --- |
| Curated drug seed | `data/curated_drugs.json` | Present. 20 records. Schema in `docs/drug-data-schema.md`. Provenance **fixture** (D16). |
| SQLite cache | `data/drugs.db` | Created at runtime by `init_db`. Gitignored. Not a source of truth. |
| medicines / brands / janaushadhi / kendras | — | Not in repo (D9, D15). |
| PIN → lat/lng | — | Not in repo. |
| Misspelling suite | — | Not in repo (D13). |
| Zip test fixtures | `janrx/backend/tests/fixtures/{brands,janaushadhi_products,kendras}.json` | Tiny fakes inside the zip (`b_alpha` style). **Do not bundle.** |

### Repo record shape (source of truth)

Required: `id`, `brand_name`, `molecule`, `strength`, `unit`, `branded_price` (INR, ≥ 0, 2 dp), `generic_price`, `source`. Optional: `aliases[]`. Validator also writes `savings_amount` and `savings_percentage`. Forbidden: dosage, frequency, duration, course, substitution advice, recommendation.

Normalisation already implemented in `scripts/validate_and_normalize.py`: trim, strength `500mg` → `500 mg`, `+` spaced, SHA-256 of canonical JSON. The script **rewrites** `curated_drugs.json` on success. Frontend build must not surprise-rewrite that file.

### Field mapping the client will use (no new facts)

| Display need | Repo field | Gap |
| --- | --- | --- |
| Brand | `brand_name` | — |
| Composition | `molecule` | Single string. Combinations already use `+` (example `500 mg + 125 mg`). Order-insensitive compare splits on `+`. |
| Strength | `strength` | String, already spaced. Parser must also read user input (`Pantocid40`, `40mg`, `500/125`). |
| Form / unit | `unit` (example `strip of 10 tablets`) | Pack count and form are embedded in prose, not separate columns. Parse `strip of N tablets\|capsules` when the pattern is unambiguous; otherwise `missing_data` / `unit_mismatch`, never a guessed per-unit price. |
| Pack price | `branded_price`, `generic_price` | Both are pack prices for `unit`. |
| Per-unit price | derived | Only when pack count parses. |
| Source | `source` | Present on all 20 rows: `PMBJP Price List 2024 / NPPA`. |
| Price date | — | Not in data (D10). |
| Jan Aushadhi product name | — | Not in data. Do not invent a product name. Say a listed generic price from the row's source, identified by molecule and strength. |
| Uses / class | — | Absent → not-in-our-data sentence (D11). |
| Kendra | — | Absent (D15). |

### Catalogue (ids only)

`paracetamol-500mg-tab` Calpol 500; `paracetamol-650mg-tab` Dolo 650; `metformin-500mg-tab` Glycomet 500; `metformin-1000mg-sr-tab` Glycomet SR 1000; `atorvastatin-10mg-tab` Atorva 10; `atorvastatin-20mg-tab` Atorva 20; `amlodipine-5mg-tab` Amlong 5; `telmisartan-40mg-tab` Telma 40; `azithromycin-500mg-tab` Azithral 500; `amoxicillin-clav-625mg-tab` Augmentin 625 Duo; `pantoprazole-40mg-tab` Pan 40; `pantoprazole-domperidone-cap` Pan-D; `omeprazole-20mg-cap` Omez 20; `rosuvastatin-10mg-tab` Rozavel 10; `montelukast-levocetirizine-tab` Montair-LC; `cetirizine-10mg-tab` Cetzine 10; `ibuprofen-400mg-tab` Brufen 400; `losartan-50mg-tab` Losar 50; `metoprolol-50mg-tab` Betaloc 50; `ciprofloxacin-500mg-tab` Ciplox 500.

Alias `crocin` is on Calpol 500, not on its own row. Alias `pantocid 40` is on Pan 40.

## 7. Statements required before Phase 1

- **OCR response shape:** not implemented in this repo. The only written shape is the zip success body and error envelope in §3. Frontend `OcrProvider` will target that shape. `GemmaBackendProvider` will call `POST /v1/ocr` and fail into typing when the route is missing.
- **Error envelopes:** repo contract §2 of `docs/api-contract.md` (`success: false`) for the unimplemented `/api/v1` routes; zip envelope in §3 for OCR. They differ (D3).
- **Dataset schema:** `docs/drug-data-schema.md` and `data/curated_drugs.json` (20 fixture rows).
- **Approved disclaimer:** repo string in §5. Hindi and privacy: not approved.
- **Upload limits:** not implemented here. Zip defaults: 5 MiB, 25e6 pixels, 20s timeout, 10/min. Client compression target will use the 5 MiB figure so a future server with those defaults can accept the body.

## 8. Phase 0 verification

| Check | Result |
| --- | --- |
| git status / log / tree | Recorded in §1 |
| Docs read | Repo README, api contract, drug schema, DAL, database, validator. Zip PRD, API, TASKS, AGENTS, OCR router, config, errors, disclaimer, prescription matcher, schemas. Architecture plan. |
| Backend tests | No tests, pytest not installed. Baseline 0. |
| Feature code | None this milestone |
| `work-breakdown.md` | Not created |

## Milestone log

### Phase 0 — inspection

- Built: this document only.
- Tests: no frontend tests yet. Backend pytest: not installed, 0 tests in repo.
- Blockers carried forward: no HTTP API, no OCR route, no Kendra/PIN data, no price dates, no medicine-info fields, no approved Hindi, no approved privacy copy, no numeric match thresholds in the repo, no shared misspelling suite, fixture provenance on all 20 drugs.
