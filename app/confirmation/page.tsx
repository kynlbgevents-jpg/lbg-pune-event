'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Kyndryl Colleague';

  return (
    <div style={{ maxWidth: '640px', margin: '48px auto', padding: '0 20px', textAlign: 'center' }}>
      <div
        className="card"
        style={{
          padding: '44px 32px',
          borderTop: '5px solid var(--kyndryl-red)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-green-bg)',
            color: 'var(--success-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 20px',
          }}
        >
          ✓
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--kyndryl-red)',
          }}
        >
          Registration Confirmed
        </span>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginTop: '8px',
            color: 'var(--kyndryl-black)',
          }}
        >
          You're on the list, {name}!
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--gray-60)',
            lineHeight: 1.6,
            marginTop: '12px',
            maxWidth: '520px',
            margin: '12px auto 0',
          }}
        >
          Thank you for confirming your attendance for the Kyndryl Year End Celebrations 2026. Your
          registration has been encrypted and recorded securely.
        </p>

        <div
          style={{
            margin: '28px 0',
            padding: '20px',
            backgroundColor: 'var(--gray-10)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-20)',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 600,
              marginBottom: '8px',
              color: 'var(--gray-90)',
            }}
          >
            📧 Your Entry Pass has been dispatched:
          </h3>
          <ul
            style={{
              fontSize: '13.5px',
              color: 'var(--gray-70)',
              paddingLeft: '20px',
              lineHeight: 1.6,
            }}
          >
            <li>Check your official <strong>@kyndryl.com</strong> inbox for the confirmation email.</li>
            <li>The email contains your personal <strong>QR Entry Pass</strong>.</li>
            <li>Take a screenshot or keep the email readily accessible on your mobile phone.</li>
            <li>Show the QR code at the registration desk upon arrival.</li>
          </ul>
        </div>

        <div
          className="alert-warning"
          style={{
            textAlign: 'left',
            marginBottom: '28px',
            fontSize: '13px',
          }}
        >
          <strong>Safety Note:</strong> If you indicated that you will consume alcohol, please ensure
          you have arranged a safe ride home. Drink and drive is strictly prohibited.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/rules" className="btn-secondary">
            Review Event Rules &amp; Guidelines
          </Link>
          <Link href="/" className="btn-dark">
            Register Another Colleague
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
