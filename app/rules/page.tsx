import React from 'react';
import Link from 'next/link';

export default function RulesPage() {
  return (
    <div style={{ maxWidth: '840px', margin: '36px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--kyndryl-red)',
            marginBottom: '16px',
          }}
        >
          ← Back to RSVP Form
        </Link>
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--kyndryl-red)',
          }}
        >
          Event Guidelines &amp; Policies
        </span>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginTop: '6px',
            color: 'var(--kyndryl-black)',
          }}
        >
          Rules, Do's &amp; Don'ts
        </h1>
        <p style={{ marginTop: '8px', color: 'var(--gray-60)', fontSize: '15px' }}>
          Kyndryl Year End Celebrations 2026. Please read carefully before attending.
        </p>
      </div>

      {/* Critical Zero Tolerance Banner */}
      <div
        className="alert-danger"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
          🚨 Zero-Tolerance Drink &amp; Drive Policy
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
          The safety and well-being of all employees and guests is our utmost priority. Under no
          circumstances should anyone consume alcohol and operate a motor vehicle (car, motorcycle, or
          scooter). If you plan to consume alcohol, you must arrange a safe commute in advance (cab,
          carpool with designated sober driver, public transit, or friend/family pickup).
        </p>
      </div>

      {/* Section 1: Entry & Verification */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '14px',
            color: 'var(--kyndryl-black)',
          }}
        >
          1. Entry &amp; Digital QR Pass
        </h3>
        <ul
          style={{
            paddingLeft: '20px',
            lineHeight: 1.8,
            fontSize: '14.5px',
            color: 'var(--gray-70)',
          }}
        >
          <li>
            Every attendee must register individually via their official <strong>@kyndryl.com</strong>{' '}
            email address.
          </li>
          <li>
            Upon registration, a unique <strong>QR Code Entry Pass</strong> is dispatched to your email.
            Please save a screenshot or keep the email ready on your smartphone.
          </li>
          <li>
            The QR code will be scanned at the venue check-in desk to record entry time and verify
            identity.
          </li>
          <li>
            Please carry your official <strong>Kyndryl Employee ID badge</strong> alongside your QR
            pass for physical verification.
          </li>
        </ul>
      </div>

      {/* Section 2: Do's and Don'ts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Do's */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderTop: '4px solid var(--success-green)',
          }}
        >
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--success-green)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ✅ DO'S
          </h3>
          <ul
            style={{
              paddingLeft: '18px',
              lineHeight: 1.7,
              fontSize: '13.5px',
              color: 'var(--gray-80)',
            }}
          >
            <li>Arrive on time to ensure smooth check-in and seating.</li>
            <li>Wear your Kyndryl badge visibly during entry.</li>
            <li>Drink responsibly and know your limits. Hydrate with water throughout the night.</li>
            <li>Treat event staff, venue crew, and colleagues with dignity and mutual respect.</li>
            <li>Look out for your colleagues and report any safety concern to the organising committee.</li>
            <li>Keep emergency contact details handy.</li>
          </ul>
        </div>

        {/* Don'ts */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderTop: '4px solid var(--error-red)',
          }}
        >
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--error-red)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ❌ DON'TS
          </h3>
          <ul
            style={{
              paddingLeft: '18px',
              lineHeight: 1.7,
              fontSize: '13.5px',
              color: 'var(--gray-80)',
            }}
          >
            <li>
              <strong>DO NOT DRINK AND DRIVE.</strong> Violation will lead to strict company disciplinary
              and legal action.
            </li>
            <li>Do not forward or share your personalized QR code with non-registered guests.</li>
            <li>Do not bring outside alcoholic beverages, fireworks, or prohibited substances.</li>
            <li>
              Do not engage in harassment, aggressive behavior, or conduct detrimental to Kyndryl's
              values.
            </li>
            <li>Do not drive colleagues home if you have consumed alcohol.</li>
          </ul>
        </div>
      </div>

      {/* Section 3: Code of Conduct & Support */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'var(--kyndryl-black)',
          }}
        >
          2. Code of Conduct &amp; Support
        </h3>
        <p style={{ fontSize: '14.5px', color: 'var(--gray-70)', lineHeight: 1.6, marginBottom: '14px' }}>
          This event is an official Kyndryl gathering. All corporate codes of business conduct, POSH
          regulations, and mutual respect guidelines remain in full effect throughout the celebration.
        </p>
        <p style={{ fontSize: '14.5px', color: 'var(--gray-70)', lineHeight: 1.6 }}>
          First-aid personnel and security will be on site. If you or a colleague require medical or
          transport assistance at any point during the event, please immediately notify an event
          volunteer or the venue desk.
        </p>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
          <Link href="/" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Proceed to RSVP Form
          </Link>
        </div>
      </div>
    </div>
  );
}
