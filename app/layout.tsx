import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kyndryl Year End Celebrations 2026 — RSVP & Entry Pass',
  description: 'Official RSVP portal for Kyndryl Year End Celebrations 2026. Register to receive your entry QR pass.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="header-container" style={{ padding: '16px 24px' }}>
          <div
            style={{
              maxWidth: '1080px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span className="kyndryl-logo-text">kyndryl</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1px',
                  color: 'var(--gray-60)',
                  textTransform: 'uppercase',
                }}
              >
                Year End Celebrations
              </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
              <Link href="/" style={{ fontWeight: 500, color: 'var(--gray-80)' }}>
                RSVP Form
              </Link>
              <Link href="/rules" style={{ fontWeight: 500, color: 'var(--gray-80)' }}>
                Rules &amp; Guidelines
              </Link>
              <Link
                href="/admin"
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '6px 12px',
                  border: '1px solid var(--gray-30)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--gray-70)',
                }}
              >
                Admin Portal
              </Link>
            </nav>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer
          style={{
            borderTop: '1px solid var(--gray-20)',
            backgroundColor: 'var(--white)',
            padding: '24px 20px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              maxWidth: '1080px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--gray-50)',
              textAlign: 'center',
            }}
          >
            <p>
              &copy; 2026 Kyndryl Solutions Pvt Ltd. For internal event use only.
            </p>
            <p>
              All participant data is encrypted end-to-end at the application layer. Entry is subject to verification of official credentials and compliance with event safety guidelines.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
