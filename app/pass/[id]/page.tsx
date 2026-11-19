'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';


interface PassData {
  id: string;
  fullName: string;
  dietaryPref: string;
  alcoholPref: string;
  travelMode: string | null;
  attended: boolean;
  entryTime: string | null;
}

function PassContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pass, setPass] = useState<PassData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const res = await fetch(`/api/pass/${id}`);
        if (!res.ok) {
          setError('Pass not found or invalid identifier.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPass(data);

        // Generate QR code (contains { "id": data.id })
        const url = await QRCode.toDataURL(JSON.stringify({ id: data.id }), {
          width: 280,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'H',
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error(err);
        setError('Failed to load digital pass.');
      } finally {
        setLoading(false);
      }
    };

    fetchPass();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <p style={{ color: 'var(--gray-60)', fontSize: '15px' }}>Loading your digital pass...</p>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '36px 24px', borderTop: '4px solid var(--error-red)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--error-red)', marginBottom: '8px' }}>
            Pass Not Found
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--gray-60)', marginBottom: '20px' }}>
            {error || 'Unable to locate registration with this pass code.'}
          </p>
          <Link href="/" className="btn-primary" style={{ fontSize: '14px' }}>
            Go to RSVP Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '36px auto', padding: '0 20px' }}>
      {/* Kyndryl Digital Pass Card */}
      <div
        className="card"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid var(--gray-30)',
          backgroundColor: 'var(--white)',
        }}
      >
        {/* Pass Header */}
        <div
          style={{
            backgroundColor: 'var(--kyndryl-black)',
            padding: '24px 28px',
            color: 'var(--white)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kyndryl-logo-text" style={{ fontSize: '24px' }}>kyndryl</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1px',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Entry Pass
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', color: 'var(--white)' }}>
            Year End Celebrations 2026
          </h1>
        </div>

        {/* Guest Details */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px dashed var(--gray-30)' }}>
          <div style={{ fontSize: '11px', color: 'var(--gray-50)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Guest Name
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--kyndryl-black)', marginTop: '2px' }}>
            {pass.fullName}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span className={`badge ${pass.dietaryPref === 'veg' ? 'badge-green' : 'badge-amber'}`}>
              {pass.dietaryPref === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian'}
            </span>
            <span className={`badge ${pass.alcoholPref === 'drinking' ? 'badge-red' : 'badge-gray'}`}>
              {pass.alcoholPref === 'drinking' ? '🍹 Drinking' : '🥤 Not Drinking'}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        <div style={{ padding: '24px 28px', textAlign: 'center', backgroundColor: '#FAFAFA' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--gray-50)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Scan at Entry Desk
          </div>

          {qrDataUrl && (
            <div
              style={{
                display: 'inline-block',
                padding: '12px',
                backgroundColor: 'var(--white)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--gray-20)',
              }}
            >
              <img src={qrDataUrl} alt="Entry Pass QR" width={220} height={220} style={{ display: 'block' }} />
            </div>
          )}

          {/* 6-character pass code badge */}
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: 'var(--white)',
                border: '1.5px solid var(--kyndryl-black)',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '4px',
                color: 'var(--kyndryl-black)',
              }}
            >
              {pass.id}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--gray-50)', marginTop: '6px' }}>
              Pass Code
            </div>
          </div>
        </div>

        {/* Status / Instructions Footer */}
        <div style={{ padding: '16px 28px 24px', textAlign: 'center', fontSize: '12.5px', color: 'var(--gray-60)' }}>
          {pass.attended ? (
            <div style={{ color: 'var(--success-green)', fontWeight: 600 }}>
              ✓ Entry Recorded at {new Date(pass.entryTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : (
            <p>Please keep this screen open or save a screenshot to present at entry.</p>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              🖨️ Print / Save PDF
            </button>
            <Link
              href="/rules"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              View Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DigitalPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
          <p style={{ color: 'var(--gray-60)', fontSize: '15px' }}>Loading your digital pass...</p>
        </div>
      }
    >
      <PassContent params={params} />
    </Suspense>
  );
}
