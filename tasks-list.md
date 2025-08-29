## Relevant Files

- `jest.config.ts` - Jest configuration for Next.js with TypeScript support and coverage thresholds.
- `jest.setup.js` - Jest setup file with testing-library configuration and Next.js mocks.
- `src/lib/test-utils.tsx` - Custom test utilities with render function and mock data factories.
- `src/lib/env.ts` - Environment configuration with Zod validation and helper functions.
- `src/lib/env.test.ts` - Unit tests for environment variable validation.
- `.env.example` - Complete environment variable template with documentation.
- `src/app/page.test.tsx` - Unit tests for the home page component.
- `src/app/layout.test.tsx` - Unit tests for the root layout component.
- `app/layout.tsx` - Root layout for Next.js App Router, global styles and providers.
- `app/page.tsx` - Landing page with plan info and CTA to sign up.
- `app/(auth)/signup/page.tsx` - Signup page (email input) to request OTP.
- `app/(auth)/verify/page.tsx` - OTP verification page to complete account verification.
- `app/dashboard/page.tsx` - Organizer dashboard showing events, plan, check-in stats.
- `app/events/[eventId]/page.tsx` - Event detail page: overview, quotas, quick actions.
- `app/events/[eventId]/guests/page.tsx` - Guest management UI: list, search, manual CRUD.
- `app/events/[eventId]/upload/page.tsx` - CSV upload UI with validation results.
- `app/checkin/[eventId]/page.tsx` - Public self check-in page (scan QR or enter code).
- `app/api/auth/request-otp/route.ts` - API route to create OTP and send via Mailgun.
- `app/api/auth/verify-otp/route.ts` - API route to verify OTP and mark email verified.
- `app/api/events/route.ts` - CRUD: create/list events for the current user.
- `app/api/events/[eventId]/route.ts` - CRUD: get/update/delete a specific event.
- `app/api/guests/route.ts` - Create/list guests (manual add) for an event.
- `app/api/guests/[guestId]/route.ts` - Update/delete a specific guest.
- `app/api/upload/csv/route.ts` - CSV upload/validation pipeline endpoint.
- `app/api/checkin/scan/route.ts` - QR scan handler: validate token, mark check-in, return details.
- `app/api/qrcode/[guestId]/route.ts` - QR code generation endpoint (PNG/SVG).
- `app/api/billing/plans/route.ts` - Expose plans/limits for UI.
- `app/api/billing/subscribe/route.ts` - Create payment (Midtrans) transaction.
- `app/api/billing/webhook/route.ts` - Midtrans webhook to update subscription status.
- `app/api/metrics/ingest/route.ts` - Internal metrics collector (server-side only).
- `src/lib/db/mongoose.ts` - Mongoose client connection helper for server runtime.
- `src/lib/db/models/User.ts` - User schema/model with email verification and timestamps.
- `src/lib/db/models/Event.ts` - Event schema/model with owner reference, guest counts, and activity status.
- `src/lib/db/models/Guest.ts` - Guest schema/model with check-in status, RSVP status, and unique tokens.
- `src/lib/db/models/Subscription.ts` - Subscription schema/model storing plan type, status, and transaction references.
- `lib/auth/otp.ts` - Generate/store/validate OTPs (short-lived tokens).
- `lib/auth/session.ts` - Minimal session handling (signed cookies/JWT) post-verify.
- `lib/mail/mailgun.ts` - Mailgun client and send helpers.
- `lib/payments/midtrans.ts` - Midtrans client helpers (create transaction, verify signature).
- `lib/payments/plans.ts` - Plan definitions & limit helpers (Plan I/II/III) - stored in database.
- `lib/rate-limit.ts` - Basic rate limiting util (IP/email/route) to prevent OTP abuse.
- `lib/csv/template.ts` - CSV template builder/generator.
- `lib/csv/parse.ts` - Streaming CSV parser & validator with typed errors.
- `lib/qrcode.ts` - QR code generation utility for guests.
- `lib/validators.ts` - Zod/Yup schemas for request bodies and CSV rows.
- `lib/metrics.ts` - Client for sending internal metrics (server-side only).
- `lib/logger.ts` - Structured logging helper (e.g., pino-lite/winston).
- `middleware.ts` - Route protection for dashboard/API routes (requires verified email).
- `types/index.d.ts` - Shared TypeScript types (Event, Guest, Subscription, CheckIn).
- `jest.config.ts` - Jest configuration for Next.js/TS setup.
- `__tests__/lib/csv/parse.test.ts` - Unit tests for CSV parsing/validation.
- `__tests__/lib/auth/otp.test.ts` - Unit tests for OTP generation/verification.
- `__tests__/lib/payments/midtrans.test.ts` - Unit tests for Midtrans signature handling.
- `__tests__/app/api/checkin/scan.test.ts` - API test for check-in flow.
- `__tests__/lib/qrcode.test.ts` - Unit tests for QR generation.
- `__tests__/lib/payments/plans.test.ts` - Unit tests for plan limits enforcement.
- `.env.example` - Sample environment variables for local/dev.
- `docs/CSV-template.csv` - Example CSV template shipped with the app.
- `docs/RUNBOOK.md` - Operational notes (webhooks, env, common issues).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Project Setup & Tooling
  - [x] 1.1 Create Next.js (App Router) project with TypeScript; add ESLint/Prettier configs.
  - [x] 1.2 Add Jest + testing-library setup for unit/API route tests.
  - [x] 1.3 Configure environment variable management and `.env.example`.

- [ ] 2.0 Data Modeling (MongoDB/Mongoose)
  - [x] 2.1 Implement `User`, `Event`, `Guest`, `Plan`, and `Subscription` schemas/models.
  - [x] 2.2 Add indexes for common queries (event by owner, guests by event, email unique).
  - [x] 2.3 Provide seed scripts or fixtures for local testing (optional).

- [ ] 3.0 Authentication & Email Verification (OTP via Mailgun)
  - [ ] 3.1 Implement `request-otp` API: rate-limit by IP/email; generate/store OTP; send with Mailgun.
  - [ ] 3.2 Implement `verify-otp` API: validate OTP, mark email as verified, create session (cookie/JWT).
  - [ ] 3.3 Build `signup` and `verify` pages and flows; handle error states and retries.
  - [ ] 3.4 Protect dashboard/API routes to require verified session.

- [ ] 4.0 Events Module (Create/Edit/Delete + Plan Enforcement)
  - [ ] 4.1 Implement events API routes for CRUD.
  - [ ] 4.2 Enforce plan constraints on create (Plan I/II: max 1 event; Plan III: unlimited).
  - [ ] 4.3 Event detail UI with counts (guests, check-ins) and quick links.

- [ ] 5.0 Guests Module (Manual CRUD)
  - [ ] 5.1 Implement guest API routes for create/list/update/delete.
  - [ ] 5.2 Enforce guest count per plan (Plan I: 20, Plan II: 1000, Plan III: unlimited).
  - [ ] 5.3 Guest management UI: table with search/filter and inline edits.

- [ ] 6.0 CSV Template & Upload Pipeline (Validation + Error Reporting)
  - [ ] 6.1 Build downloadable CSV template (`full_name,email,phone,seat_number,rsvp_status`).
  - [ ] 6.2 Implement streaming CSV parser & validator; surface row-level errors.
  - [ ] 6.3 Batch insert valid rows; report rejected rows with reasons; do not exceed plan limits.
  - [ ] 6.4 Upload UI with progress, summary, and download of error report.

- [ ] 7.0 QR Code Generation & Self Check-in Flow
  - [ ] 7.1 Generate unique token/URL per guest and QR code image.
  - [ ] 7.2 Implement public check-in page and `checkin/scan` API: mark checked-in, return details.
  - [ ] 7.3 Handle re-scan: show “already checked in” with timestamp; prevent double counting.

- [ ] 8.0 Subscription Plans & Limits (Plan I/II/III)
  - [ ] 8.1 Implement plan definitions and helper to check quotas (events/guests).
  - [ ] 8.2 UI: show current plan, usage, and upgrade CTA.
  - [ ] 8.3 Guard rails on API routes to block actions exceeding plan limits.

- [ ] 9.0 Payments Integration (Midtrans: VA, GoPay, QRIS)
  - [ ] 9.1 Implement `subscribe` API to create Midtrans transactions for plan purchases/upgrades.
  - [ ] 9.2 Implement `billing/webhook` to verify signature and update subscription status.
  - [ ] 9.3 UI for plan selection and payment flow; handle pending/success/failure states.
  - [ ] 9.4 Store invoice/transaction reference for audit; reconcile statuses.

- [ ] 10.0 Developer Analytics (Internal-only metrics)
  - [ ] 10.1 Define minimal metrics schema and ingest endpoint (server-only).
  - [ ] 10.2 Emit metrics from critical flows: signup, CSV upload, check-in, payment.
  - [ ] 10.3 Simple internal dashboard or log queries to validate signals (optional).

- [ ] 11.0 Error Handling, Logging, and Rate Limiting
  - [ ] 11.1 Centralized error formatter and consistent API responses.
  - [ ] 11.2 Per-route rate limits (OTP requests, login, upload, scan).
  - [ ] 11.3 Add structured logs (requestId, userId, eventId) to critical paths.

- [ ] 12.0 Frontend UI/UX (Dashboard, Guests, Check-in Page)
  - [ ] 12.1 Build dashboard overview (events list, plan usage, recent activity).
  - [ ] 12.2 Build event and guest management screens with accessible forms and tables.
  - [ ] 12.3 Build public self check-in page optimized for mobile and poor connectivity.

- [ ] 13.0 Testing (Jest): Unit, API Route, and Basic E2E happy paths
  - [ ] 13.1 Unit tests for libs: CSV parser, OTP, QR code, plans/limits, Midtrans signature.
  - [ ] 13.2 API tests for key endpoints: auth, events, guests, check-in, billing webhook.
  - [ ] 13.3 (Optional) Lightweight E2E: signup → create event → upload guests → check-in flow.

- [ ] 14.0 Deployment & Config (Vercel app, DO Managed MongoDB, secrets)
  - [ ] 14.1 Create DO Managed MongoDB and connection string; set Vercel env vars.
  - [ ] 14.2 Configure Mailgun keys, domain, and webhooks.
  - [ ] 14.3 Configure Midtrans server/client keys and webhook secret.
  - [ ] 14.4 Configure Vercel build settings (Node runtime for DB routes) and region preference.
  - [ ] 14.5 Set up preview/prod environments and secret management.

- [ ] 15.0 Documentation & Admin Ops (Runbooks, Env/Secrets, CSV Template spec)
  - [ ] 15.1 Document environment variables in `.env.example` and `docs/RUNBOOK.md`.
  - [ ] 15.2 Document CSV template columns and validation rules; ship `docs/CSV-template.csv`.
  - [ ] 15.3 Document webhook verification and retry handling (Midtrans, Mailgun).
