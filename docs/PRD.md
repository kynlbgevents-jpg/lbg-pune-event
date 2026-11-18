# PRD: Kyndryl Year End Celebrations — RSVP & Attendance App

> **Version:** 1.1 | **Date:** November 2026 | **Status:** Ready for Development

---

## 1. Overview

A lightweight internal web application for managing RSVPs to Kyndryl's Year End Celebration event. Shared via Microsoft Teams and other internal channels, it collects guest registrations, enforces safety acknowledgements (drink-drive policy), generates QR code entry passes, and provides an admin portal for attendance management on the event day.

---

## 2. Goals & Non-Goals

### Goals
- Collect structured RSVP data from `@kyndryl.com` employees with safety-first guardrails
- Send email confirmation with a unique QR code entry pass via Gmail
- Allow on-site admins to scan QR codes and log attendance in real time
- Provide a filterable/exportable master guest list to admins

### Non-Goals
- Payment collection
- SSO / corporate identity login
- Real-time seating or table management
- Mobile native app
- Automatic registration cutoff / capacity locking

---

## 3. User Personas

| Persona | Description |
|---|---|
| **Guest (Employee)** | Fills in RSVP form via shared Teams link, receives QR code via email |
| **On-site Admin** | Scans QR at event entry gate on the day, marks attendance |
| **Event Manager** | Manages guest list from admin portal, exports data to CSV |

---

## 4. Tech Stack & Hosting

| Concern | Choice | Rationale |
|---|---|---|
| **Frontend + Backend** | Next.js 14 (App Router) | Vercel-native, SSR + API routes in one project |
| **Database** | Supabase (PostgreSQL) | Free tier generous enough for <150 users; managed, no ops overhead |
| **Email** | Nodemailer + Gmail OAuth2 | Personal Gmail created for event; free, no domain setup needed; Gmail daily limit 500 — well within 150 guests |
| **QR Code** | `qrcode` npm package | Server-side generation, embedded as base64 in email |
| **Hosting** | Vercel | Zero-config Next.js deploy, free tier sufficient |
| **Admin Auth** | Single env-var password, HTTP-only cookie session | Simple, secure, no user table required |

---

## 5. Kyndryl Brand Guidelines

### Colours

| Token | Hex | Usage |
|---|---|---|
| **Kyndryl Red** | `#FF0000` | Primary CTA buttons, accents, logo |
| **Black** | `#000000` | Primary text, dark backgrounds |
| **White** | `#FFFFFF` | Light backgrounds, contrast text |
| **Light Grey** | `#F4F4F4` | Card/surface backgrounds |
| **Mid Grey** | `#8D8D8D` | Secondary / helper text |
| **Warning Amber** | `#F1C21B` | Warning banners (drink-drive alert) |
| **Error Red** | `#DA1E28` | Error states (distinct from brand red) |

> [!NOTE]
> Kyndryl Red (`#FF0000`) is used as the primary brand colour for logo, main CTAs, and key highlights. The app overall uses a clean white/black/grey base with Red as the accent, consistent with kyndryl.com visual identity.

### Typography

| Typeface | Use |
|---|---|
| **IBM Plex Sans** | Primary UI font — body, labels, inputs, navigation |
| **IBM Plex Serif** | Display headings, hero text |
| **IBM Plex Mono** | QR code reference IDs, timestamps in admin UI |

**Google Fonts import string:**
```
https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@400;600&display=swap
```

### Logo
- Use the Kyndryl wordmark in **red on white** backgrounds or **white on dark** backgrounds
- Minimum clear space: equal to the cap-height of the "K" on all sides
- Do not stretch, recolour (outside approved palette), or add effects
- **For this app:** Use the red wordmark SVG in the header on white background

---

## 6. Information Architecture

```
/ ..................... RSVP Form (public)
/rules ............... Rules, Do's & Don'ts (public, read-only)
/confirmation ........ Post-submit success page (public)
/admin ............... Admin login
/admin/dashboard ..... Master guest list with filters & CSV export
/admin/scan .......... QR code scanner + manual check-in
```

---

## 7. Feature Requirements

### 7.1 RSVP Form (`/`)

#### Page Header
- Kyndryl wordmark (red SVG) + "Year End Celebrations 2026" title
- Event date/time/venue shown as a banner _(placeholder until confirmed)_

#### Form Fields

| # | Field | Type | Validation |
|---|---|---|---|
| 1 | Full Name | Text | Required, min 2 chars |
| 2 | Mobile Number | Tel | Required, 10-digit India format (`^[6-9]\d{9}$`) |
| 3 | Official Email ID | Email | Required, **must end in `@kyndryl.com`** |
| 4 | Emergency Contact Name | Text | Required |
| 5 | Emergency Contact Number | Tel | Required, 10-digit |
| 6 | I confirm I will attend | Checkbox/Toggle | Required to proceed |
| 7 | Dietary Preference | Radio | 🥦 Veg / 🍗 Non-Veg (required) |
| 8 | Alcohol Preference | Radio | 🍹 Drinking / 🥤 Not Drinking (required) |
| 9 | Mode of Travel | Select | **Conditional** — shown only when "Drinking" is selected |

#### Travel Mode Options (shown when Alcohol = Drinking)

1. 🚗 Car Pooling with a Non-Drinking Driver
2. 🚌 Public Transport
3. 🚖 Cab Service (Ola / Uber / Rapido)
4. 👨‍👩‍👧 Relative / Friend Pickup
5. 🚗 Self Drive ⚠️ ← triggers warning

#### Self-Drive + Drinking — Warning State

When "Drinking" AND "Self Drive" are both selected:

> **Full-width red/amber alert block:**
>
> 🚨 **DRINK & DRIVE IS ILLEGAL, DANGEROUS, AND STRICTLY PROHIBITED**
>
> You have selected that you will be **Drinking** and that you plan to **Self Drive**. This combination is not permitted. India's Motor Vehicles Act mandates zero tolerance for drink driving.
>
> **Please go back and correct either your alcohol preference or your mode of travel.**
>
> Kyndryl Solutions Pvt Ltd will not accept any responsibility for incidents arising from drink-driving.

- **Submit button is disabled** while this combination is active
- Alert uses `role="alert"` for screen reader accessibility

#### Confirmation Checkboxes (both mandatory to enable Submit)

**Checkbox 1 — Accuracy & Rules:**
> ☐ I confirm that all information provided above is accurate and complete. I understand that inaccurate information may result in denial of entry. I have read and agree to fully abide by all [Rules, Do's & Don'ts](/rules) applicable to this event.

**Checkbox 2 — Liability Waiver:**
> ☐ I acknowledge and agree that I, and anyone accompanying or representing me, shall **not** hold Kyndryl Solutions Pvt Ltd, its employees, officers, contractors, or event partners liable or responsible for any incident, accident, injury, property loss, or harm arising due to my own negligence, violation of event rules, drink & drive behaviour, or any other conduct contrary to the guidelines communicated for this event.

#### Submit Behaviour
- **On success:** Store record → trigger Gmail confirmation email → redirect to `/confirmation`
- **Duplicate email:** If same `@kyndryl.com` email is submitted again → show inline message: *"You have already registered. Please check your inbox for your QR pass. For changes, contact the event team."*
- **Non-Kyndryl email:** Inline validation error: *"Please use your official @kyndryl.com email address."*

---

### 7.2 Rules Page (`/rules`)

Static page with the following sections _(content to be provided by organiser before go-live)_:

- Event details (date, time, venue, dress code)
- Code of Conduct
- Do's ✅
- Don'ts ❌
- Zero-Tolerance Drink & Drive Policy
- Alcohol Disclaimer
- Emergency contacts on the day
- Organiser contact for queries

---

### 7.3 Confirmation Page (`/confirmation`)

Simple success screen shown after RSVP submission:
- ✅ "You're on the list!" message
- Personalised with the guest's name
- Reminder: *"Your QR Code entry pass has been sent to your registered email. Please carry it on your phone or as a screenshot on the day."*
- Link back to `/rules`

---

### 7.4 Email Confirmation (Gmail API via Nodemailer)

**Configuration:**
- Sent from: personal Gmail account created for this event (e.g. `kyndryl.yearend2026@gmail.com`)
- Gmail OAuth2 credentials stored as Vercel environment variables
- Library: `nodemailer` with `googleapis` for token refresh

**Email Contents:**
- From: `"Kyndryl Year End 2026" <kyndryl.yearend2026@gmail.com>`
- Subject: `🎉 You're registered! Your QR Entry Pass — Kyndryl Year End Celebrations`
- Body (HTML):
  - Kyndryl logo header (red wordmark)
  - Personalised greeting: *"Hi [Name],"*
  - Event details summary (date, time, venue)
  - Registration summary table (diet, drink pref, travel mode)
  - **QR Code image embedded inline** (base64 PNG)
  - Instructions: *"Show this QR code at the entry gate."*
  - Reminder to read rules — link to `/rules`
  - Footer: organiser contact

**QR Code Data Structure:**
```json
{ "id": "K9X2P4" }
```
The QR code contains **only the 6-character alphanumeric pass code** — zero PII. The code is looked up server-side against the database on scan. If intercepted or screenshot-shared, the QR code reveals nothing about the guest.

---

### 7.5 Admin Login (`/admin`)

- Simple form: single password field
- Password stored in `ADMIN_PASSWORD` Vercel env variable
- On success: sets HTTP-only session cookie (8 hour TTL)
- All `/admin/*` routes check for valid session server-side; redirect to `/admin` if missing

---

### 7.6 Admin Dashboard (`/admin/dashboard`)

#### Stats Cards (top row)
| Card | Value |
|---|---|
| Total Registered | Count of all registrations |
| Total Attended | Count where `attended = true` |
| Veg | Count |
| Non-Veg | Count |
| Drinking | Count |
| Not Drinking | Count |

#### Guest List Table

| Column | Notes |
|---|---|
| Full Name | |
| Official Email | |
| Mobile | |
| Emergency Contact | Name + Number |
| Dietary Preference | Veg / Non-Veg |
| Alcohol Preference | Drinking / Not Drinking |
| Travel Mode | Blank if Not Drinking |
| Registered At | Date + Time (IST) |
| Attended | ✅ Yes / ❌ No |
| Entry Time | Timestamp when QR scanned (IST), blank if not attended |

#### Filters (all combinable)
- 🔍 Search by name or email
- Dietary Preference: All / Veg / Non-Veg
- Alcohol Preference: All / Drinking / Not Drinking
- Attendance: All / Attended / Not Yet Attended

#### Export
- **"Export CSV"** button — downloads current filtered list as `.csv`
- Columns: same as table above

---

### 7.7 QR Code Scanner (`/admin/scan`)

**Primary: Camera Scan**
- Uses browser `getUserMedia` + a lightweight QR scan library (e.g. `html5-qrcode` or `@zxing/browser`)
- Scan result decoded → validated against Supabase

**On Scan Result:**

| State | UI |
|---|---|
| ✅ Valid, not yet checked in | Green card: Guest name, email, diet, drink pref. **"Mark Attendance ✓"** button |
| ⚠️ Valid, already checked in | Amber card: *"Already checked in at [Time]"* |
| ❌ Invalid / unrecognised | Red card: *"Invalid QR Code — Not in guest list"* |

**On "Mark Attendance":**
- Sets `attended = true` and `entry_time = now()` in Supabase
- Shows confirmation flash: *"✅ [Name] checked in at [HH:MM]"*
- Ready to scan next guest

**Manual Fallback:**
- Text input to search by name or email
- Shows guest card → same Mark Attendance flow

---

## 8. Database Schema (Supabase / PostgreSQL)

```sql
CREATE TABLE registrations (
  -- 6-character alphanumeric pass code (e.g. "K9X2P4")
  id                   TEXT PRIMARY KEY,

  -- PII fields: AES-256-GCM encrypted at application layer before insert
  -- Format stored: "iv:authTag:ciphertext" (all base64, colon-delimited)
  full_name_enc        TEXT NOT NULL,       -- encrypted
  mobile_enc           TEXT NOT NULL,       -- encrypted
  emergency_name_enc   TEXT NOT NULL,       -- encrypted
  emergency_mobile_enc TEXT NOT NULL,       -- encrypted
  email_enc            TEXT NOT NULL,       -- encrypted

  -- Blind index for email lookups (duplicate detection + QR scan)
  -- HMAC-SHA256(email.toLowerCase(), BLIND_INDEX_SECRET)
  -- Allows searching without storing plaintext or reversible hash
  email_hash           TEXT NOT NULL UNIQUE,

  -- Non-sensitive fields stored in plaintext
  dietary_pref         TEXT NOT NULL CHECK (dietary_pref IN ('veg', 'non_veg')),
  alcohol_pref         TEXT NOT NULL CHECK (alcohol_pref IN ('drinking', 'not_drinking')),
  travel_mode          TEXT,
  registered_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended             BOOLEAN NOT NULL DEFAULT false,
  entry_time           TIMESTAMPTZ
);
```

**Supabase RLS Policy:**
- Public (anon key): `INSERT` only — guests can submit, cannot read list
- Service role key: Full access — used only by server-side API routes
- Even with full DB access, all PII columns are unreadable ciphertext without the `ENCRYPTION_SECRET` env var

---

## 9. Environment Variables (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_FROM_ADDRESS=kyndryl.yearend2026@gmail.com

# PII Encryption — 32-byte (256-bit) random hex string, generated once at setup
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_SECRET=

# Blind index secret — separate key for HMAC email hashing
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BLIND_INDEX_SECRET=
```

> [!CAUTION]
> `ENCRYPTION_SECRET` and `BLIND_INDEX_SECRET` must be generated **once** and **never changed** after the first record is inserted. Changing them makes all existing encrypted records permanently unreadable. Store backups of these two values securely (e.g., in a password manager) before the event.

---

## 10. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Load time | < 2s on 4G |
| Expected guests | ≤ 150 (well within all free tier limits) |
| Email delivery | Within 2 minutes of submission |
| Mobile responsive | Yes — primary device is mobile |
| Accessibility | WCAG 2.1 AA basics (labels, roles, contrast) |
| Registration form | Always open — no auto-cutoff |
| Data retention | Organiser to manually archive/delete from Supabase post-event |

---

## 11. PII Encryption Strategy

> [!IMPORTANT]
> The following fields are classified as Personal Identifiable Information (PII) and must never be stored in plaintext: **Full Name, Mobile Number, Official Email, Emergency Contact Name, Emergency Contact Number**.

### Encryption Method: AES-256-GCM (Application Layer)

All PII is encrypted **inside the Next.js API route** before the record is ever sent to Supabase. The database only ever stores ciphertext.

```
Plaintext PII → [Next.js API Route]
                 ↓ AES-256-GCM encrypt (key from env var)
                 ↓ Store as "iv:authTag:ciphertext" string
               [Supabase DB] ← only sees encrypted blobs
```

**Algorithm:** `AES-256-GCM`
- Provides both **confidentiality** (encryption) and **integrity** (authentication tag)
- Each record gets a unique random IV (Initialisation Vector) — same plaintext encrypts differently every time
- Node.js `crypto` module built-in — zero extra dependencies

**Stored format per field:**
```
base64(iv) : base64(authTag) : base64(ciphertext)
```
Example column value: `9f3a...==:ab12...==:7c4d...==`

### Searchable Email — Blind Index (HMAC-SHA256)

Because email must be searchable (duplicate check on submit, QR scan lookup), a **deterministic blind index** is stored alongside the encrypted email:

```
email_hash = HMAC-SHA256(email.toLowerCase(), BLIND_INDEX_SECRET)
```

- Uses a **separate secret key** from the encryption key
- One-way — cannot reverse the hash to get the email
- Allows exact-match lookups (`WHERE email_hash = ?`) without touching plaintext
- Duplicate detection: hash the submitted email → check if hash exists in DB
- QR scan: 6-character pass code lookup (not email) — no hash needed for this flow

### Where Decryption Happens

| Location | Encrypted? | Notes |
|---|---|---|
| Supabase DB | ✅ Always encrypted | Ciphertext blobs only |
| Vercel API routes (server) | Decrypts on read | Only when needed for email/admin display |
| Admin dashboard (browser) | Receives plaintext | Decrypted server-side, sent over HTTPS |
| QR code payload | N/A | Contains 6-character pass code only — no PII |
| Email (Gmail) | Plaintext | Email itself is the delivery of decrypted data to the guest |
| CSV export | Plaintext | Downloaded over HTTPS; admin responsibility thereafter |

### Key Management Rules
- `ENCRYPTION_SECRET` and `BLIND_INDEX_SECRET` live **only** in Vercel Environment Variables
- Never committed to git, never logged, never exposed in API responses
- Both keys are **static for the lifetime of the event** — do not rotate after first use
- Store offline backup of both keys before go-live

---

## 12. General Security

- Non-`@kyndryl.com` emails rejected at both client and server level
- Supabase anon key allows `INSERT` only (RLS enforced)
- Admin routes server-side protected with HTTP-only session cookie
- QR payload is 6-character alphanumeric pass code only — not sequential, not guessable, contains zero PII
- All connections HTTPS (Vercel enforces)
- Gmail OAuth2 tokens stored only as server-side env vars
- Encrypted fields cannot be read even by someone with direct Supabase DB access without the `ENCRYPTION_SECRET`

---

## 12. Remaining Open Items

> [!IMPORTANT]
> These need to be resolved before go-live — they don't block development but affect content:

| # | Item | Status |
|---|---|---|
| 1 | **Event date, time & venue** | ⏳ To Be Confirmed |
| 2 | **Rules / Do's & Don'ts content** | ⏳ To Be Provided by Organiser |
| 3 | **Gmail account credentials** | ⏳ Gmail account to be created; OAuth2 consent screen to be configured |
| 4 | **Admin password** | ⏳ Organiser to decide and set in Vercel env |

---

## 13. Milestones

| # | Milestone | Deliverable |
|---|---|---|
| M1 | Foundation | Next.js scaffolded, Supabase connected, schema live, env vars configured |
| M2 | RSVP Form | Form with all fields, `@kyndryl.com` validation, self-drive warning, confirmations |
| M3 | Email + QR | Gmail OAuth2 setup, Nodemailer integration, QR code embedded in HTML email |
| M4 | Admin Portal | Login, dashboard with stats/filters/export, QR scanner, manual check-in |
| M5 | Brand & Polish | IBM Plex fonts, Kyndryl Red theme, Kyndryl logo, mobile responsiveness, error states |
| M6 | Deploy | Vercel production deploy, domain configured, end-to-end smoke test |

**Estimated build time:** 2–3 days (single developer)

---

## 14. Verification Checklist

- [ ] Only `@kyndryl.com` emails accepted (client + server validated)
- [ ] All form fields save correctly to Supabase
- [ ] Duplicate email submission handled gracefully
- [ ] Self Drive + Drinking disables submit with prominent warning
- [ ] Gmail sends email within 2 mins of submission
- [ ] Email contains correct guest data and a scannable QR code
- [ ] Admin login works with env-var password; session expires after 8h
- [ ] Dashboard stats are accurate
- [ ] Filters and CSV export work correctly
- [ ] QR scan correctly marks attendance with IST timestamp
- [ ] Already-checked-in QR shows amber warning (no double mark)
- [ ] Invalid QR shows red error
- [ ] Manual check-in by email/name works
- [ ] All pages mobile-responsive on iOS Safari & Android Chrome
- [ ] IBM Plex fonts load correctly, Kyndryl Red used for CTAs, logo visible in header
