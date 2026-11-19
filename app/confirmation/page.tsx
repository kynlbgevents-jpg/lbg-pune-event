'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Kyndryl Colleague';
  const id = searchParams.get('id') || '';
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (id) {
      QRCode.toDataURL(JSON.stringify({ id }), {
        width: 220,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      }).then(setQrUrl).catch(console.error);
    }
  }, [id]);

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <div
        className="card"
        style={{
          padding: '40px 32px',
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
            margin: '0 auto 16px',
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
            marginTop: '8px',
            maxWidth: '520px',
            margin: '8px auto 0',
          }}
        >
          Thank you for confirming your attendance for the Kyndryl Year End Celebrations 2026.
        </p>

        {/* Digital QR Pass Box */}
        {id && (
          <div
            style={{
              margin: '24px 0',
              padding: '24px',
              backgroundColor: 'var(--gray-10)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-20)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray-60)', marginBottom: '12px' }}>
              Your Entry Pass Code &amp; QR
            </div>

            {qrUrl && (
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px',
                  backgroundColor: 'var(--white)',
                  borderRadius: '10px',
                  border: '1px solid var(--gray-20)',
                }}
              >
                <img src={qrUrl} alt="Your QR Pass" width={180} height={180} style={{ display: 'block' }} />
              </div>
            )}

            <div style={{ marginTop: '14px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  backgroundColor: 'var(--white)',
                  border: '1.5px solid var(--kyndryl-black)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: 'var(--kyndryl-black)',
                }}
              >
                {id}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--gray-60)', marginTop: '12px' }}>
              📸 <strong>Tip:</strong> Take a screenshot now, or bookmark your pass link:
            </p>

            <div style={{ marginTop: '10px' }}>
              <Link
                href={`/pass/${id}`}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
                target="_blank"
              >
                🔗 Open Digital Pass Page →
              </Link>
            </div>
          </div>
        )}

        <div
          className="alert-warning"
          style={{
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '13px',
          }}
        >
          <strong>Safety Reminder:</strong> If you plan to consume alcohol, please arrange safe travel
          (Cab, Carpooling with sober driver, or Pickup). Drink and drive is strictly prohibited.
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
