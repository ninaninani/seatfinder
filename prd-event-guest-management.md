# Product Requirements Document (PRD)

**Feature:** Event Guest Management Web App (MVP)  
**File:** `/tasks/prd-event-guest-management.md`

---

## 1. Introduction / Overview

A subscription-based web application that lets event organizers create/manage events, handle guest lists efficiently, and streamline guest self check-ins via QR codes.

This platform solves two main problems:

1. Helps event organizers (weddings, corporate, private parties) manage guest data and on-site check-ins.
2. Provides a scalable subscription model to monetize event management.

---

## 2. Goals

- Enable secure user authentication with email verification (OTP).
- Provide tools for event creation, editing, and deletion.
- Support guest list management via CSV upload and manual entry.
- Generate unique QR codes for each guest to enable fast self check-in.
- Offer subscription plans with clear feature/limit differentiation, including a **free plan**.
- Ensure smooth payment processing for plan upgrades.
- Integrate with a mailing service for OTP/email verification.
- Capture internal developer analytics/metrics (not exposed to end users).

---

## 3. User Stories

### Authentication

- As a user, I want to sign up using my email and verify my account so that I can securely access the platform.
- As a user, I want to log in with email + OTP so that I don’t need to remember a password.

### Event Management

- As a user, I want to create, edit, and delete events so that I can manage different occasions.
- As a free plan user, I want to be limited to a single event with 20 guests so I can evaluate the platform.
- As a paid user, I want higher limits depending on my subscription plan.

### Guest List Management

- As a user, I want to download a CSV template with required guest fields so that I can structure my guest list properly.
- As a user, I want to upload a CSV file of my guests so that I can save time on data entry.
- As a user, I want to add/edit/remove guests manually so that I can update my guest list on the fly.

### Check-in with QR Codes

- As an organizer, I want each guest to have a unique QR code so that check-in is fast and secure.
- As a guest, I want to check myself in by scanning my QR code at the entrance so that the process is simple and contactless.

### Subscriptions & Payments

- As a free user, I want to try the platform with limited capacity so that I can test it before upgrading.
- As a paying user, I want to upgrade to a higher plan seamlessly so that I can host larger events.

---

## 4. Functional Requirements

### Authentication

1. The system must allow users to register with email and OTP/email verification.
2. The system must prevent login until the email is verified.

### Event Management

3. The system must allow users to create, edit, and delete events.
4. The system must enforce plan restrictions (Plan I = 1 event, Plan II = 1 event, Plan III = unlimited).

### Guest List Management

5. The system must provide a downloadable CSV template with required fields: `full_name, email, phone, seat_number, rsvp_status`.
6. The system must allow users to upload guest lists via CSV.
7. The system must validate uploaded CSV data (e.g., required fields present, valid email format, no duplicate identifying keys such as email or phone).
8. The system must allow manual addition, editing, and removal of guests.
9. The system should support bulk actions (e.g., bulk delete or bulk status update).

### QR Code & Check-in

10. The system must generate a unique QR code per guest.
11. The system must allow scanning of a QR code to mark a guest as checked in.
12. The system must allow **guests to check themselves in** by scanning their QR code.
13. Upon scanning, the system must display guest details (name, seat, RSVP status) and the current check-in state; scanning a second time should surface a clear indicator (e.g., “already checked in” with timestamp).

### Subscription & Payments

14. The system must implement 3 subscription plans with limits and pricing:

- **Plan I (Free):** 1 event, max 20 guests
- **Plan II (IDR 700,000):** 1 event, max 1000 guests
- **Plan III (IDR 1,500,000):** Multiple events, unlimited guests

15. The system must restrict actions beyond the user’s plan limits (e.g., blocking additional guest adds or event creation).
16. The system must allow users to upgrade/downgrade plans.
17. The system must integrate with **Midtrans** (individual account):

- **Immediate methods available:** Virtual Accounts (per-txn fee), GoPay, QRIS.
- **Future methods (require activation):** Credit/debit cards, OTC (Indomaret/Alfamart), cardless credit (Akulaku/Kredivo), additional e-wallets.
- No setup or maintenance fees; only pay per successful transaction.

### Mailing Service

18. The system must send OTP/email verification via **Mailgun**.
19. The system should allow later migration to Postmark or other providers if higher deliverability is needed.

### Authorization & Access

20. The system must restrict admin functions to the event owner.
21. The system must allow creation of time-limited, event-bound public check-in pages for **self check-in** by guests.

---

## 5. Non-Goals (Out of Scope)

- Seat map visualization.
- Advanced analytics and reporting for organizers.
- Custom branding/white-labeling.
- SMS notifications.
- Social logins (Google/Facebook).
- Email analytics (delivery/open/click tracking) in MVP.

---

## 6. Design Considerations

- Clean, minimal UI similar to pleasefindyourseat.com.
- Mobile-friendly, especially the self check-in page.
- Event dashboard should clearly show guest counts, check-in progress, and subscription status.
- Clear error messages and validations for CSV upload.

---

## 7. Technical Considerations

- **Stack:** Next.js (App Router), TypeScript; **Mongoose** for MongoDB; **Jest** for testing.
- **Hosting:**
  - **App (frontend + API routes):** Vercel (use **Node runtime** for any route that touches MongoDB).
  - **Database:** DigitalOcean Managed MongoDB (same region you’ll pin your Vercel serverless region to, if applicable).
  - **(Optional) Worker:** A small DigitalOcean Droplet for long-running jobs (e.g., heavy CSV processing) if needed.
- **Networking:**
  - Use TLS to DO Mongo initially; optionally adopt **Vercel Managed Egress IPs** and IP-allowlist those in DO for tighter security.
  - Avoid the **Edge Runtime** for DB access; keep DB operations in Node runtime route handlers.
- **CSV handling:** Stream parse on the server to avoid memory spikes; validate per-row; report aggregated errors back to the user.
- **QR codes:** Use a reliable library (e.g., `qrcode` for Node or `qrcode.react` for client-only render).
- **Payments:** Midtrans API for VA, GoPay, QRIS at launch.
- **Mail:** Mailgun for OTP/verification (webhooks for bounces/complaints).
- **Error tracking & logging:** Sentry (errors); structured logs (JSON) with request IDs.
- **Security:** Enforce email verification before access; rate-limit OTP requests and login attempts; validate all inputs; store secrets in environment variables.

---

## 8. Success Metrics (Product)

- Successful onboarding of first 50 event organizers.
- ≥80% of users can upload CSV guest lists without support requests.
- <2% failed QR scans during live check-ins.
- Smooth subscription upgrades with <5% payment failures.

---

## 9. Developer Metrics (Internal Only)

- **Auth:** signups/day, verification success rate, login success vs attempts.
- **Events/Guests:** events created (by plan), avg guests/event, CSV upload success/fail (with top validation error reasons), frequency of manual edits.
- **Check-in:** scans/event, invalid scans, check-in completion %.
- **Payments:** plan upgrades/downgrades, payment success/failure by method, revenue/month.
- **System health:** API p95/p99 latency for check-in & upload endpoints, error rates; email send success/fail; queue/worker latency if used.

---

## 10. Open Questions

1. Should the Free plan be **time-limited** (e.g., 30 days) or unlimited with the 1 event / 20 guest cap?
2. Do we want quota warning thresholds (e.g., notify at 80% and 100% of guest/event limits)?
3. Do we need a simple “export check-ins to CSV” action in MVP or save it for later?
