# Kyndryl Year End Celebrations 2026 — Setup & Deployment Guide

## 1. Quick Start (Local Development)

```bash
cd /Users/siddharthkarkhanis/Code/celebrations-management

# Install dependencies (already installed)
npm install

# Copy environment template
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the RSVP application.

---

## 2. Setting Up Supabase Database

1. Create a free project on [Supabase](https://supabase.com).
2. In the Supabase Dashboard, go to **SQL Editor** → **New Query**.
3. Copy and run the SQL migration script from:
   `supabase/schema.sql`
4. Copy your project URL, `anon` public key, and `service_role` secret key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

---

## 3. Generating Encryption Keys

Run this command in your terminal twice to generate two secure 32-byte (256-bit) hex keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set them in `.env.local` (and in Vercel environment variables):
```env
ENCRYPTION_SECRET=<key-1>
BLIND_INDEX_SECRET=<key-2>
```

> **Warning:** Do not lose or change these keys after registrations begin. The database only stores ciphertext and cannot be decrypted without `ENCRYPTION_SECRET`.

---

## 4. Admin Portal Access

Set your desired admin password:
```env
ADMIN_PASSWORD=your_secure_password_here
```

Access the admin dashboard at:
- **Admin Login:** `/admin`
- **Dashboard & CSV Export:** `/admin/dashboard`
- **QR Code Camera Scanner:** `/admin/scan`

---

## 5. Sending Entry Passes via Official Kyndryl Outlook (Mail Merge)

To ensure passes are sent exclusively from your official corporate account (no external email addresses or Gmail APIs):

1. Go to the Admin Dashboard (`/admin/dashboard`) and click **"Export CSV"**.
2. Open **Microsoft Word** → click the **Mailings** tab.
3. Click **Start Mail Merge** → select **E-mail Messages**.
4. Click **Select Recipients** → **Use an Existing List...** → choose the exported CSV.
5. In the Admin Dashboard, click **"✉️ Outlook Mail Merge"** and copy the ready-made template. Paste it into your Word document.
6. Click **Finish & Merge** → **Send Email Messages** → select `Official_Email` as the "To" field.
7. Word sends all passes directly through your active **desktop Outlook app** using your official `@kyndryl.com` account!

---

## 6. Vercel Deployment

1. Push this repository to GitHub or run `vercel deploy` directly.
2. In Vercel Project Settings, add all environment variables listed in `.env.example`.
3. Deploy! Vercel automatically configures SSL/HTTPS.
