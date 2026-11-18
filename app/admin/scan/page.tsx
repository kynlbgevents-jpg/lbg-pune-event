'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanResult {
  status: 'CHECKED_IN' | 'ALREADY_CHECKED_IN' | 'NOT_FOUND' | 'ERROR';
  message: string;
  entryTime?: string;
  guest?: {
    id: string;
    fullName: string;
    email: string;
    dietaryPref: string;
    alcoholPref: string;
    travelMode?: string | null;
  };
}

export default function AdminScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [manualId, setManualId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScan = useRef(false);

  // Check-in API call
  const performCheckIn = async (qrText: string) => {
    if (isHandlingScan.current || processing) return;
    isHandlingScan.current = true;
    setProcessing(true);
    setScannerError('');

    try {
      let targetId = qrText.trim();

      // Check if QR code is JSON format { "id": "..." }
      if (targetId.startsWith('{')) {
        try {
          const parsed = JSON.parse(targetId);
          if (parsed.id) targetId = parsed.id;
        } catch {
          // Keep original targetId
        }
      }

      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId }),
      });

      if (res.status === 401) {
        router.push('/admin');
        return;
      }

      const data = await res.json();

      if (res.status === 404) {
        setLastResult({
          status: 'NOT_FOUND',
          message: 'Unrecognized pass. No registration found for this QR code.',
        });
      } else if (!res.ok) {
        setLastResult({
          status: 'ERROR',
          message: data.error || 'Server error while checking in.',
        });
      } else {
        setLastResult({
          status: data.status,
          message: data.message,
          entryTime: data.entryTime,
          guest: data.guest,
        });
      }
    } catch (err) {
      console.error(err);
      setLastResult({
        status: 'ERROR',
        message: 'Network error communicating with check-in service.',
      });
    } finally {
      setProcessing(false);
      // Brief pause to prevent rapid re-scans of the same code
      setTimeout(() => {
        isHandlingScan.current = false;
      }, 2500);
    }
  };

  const startScanner = async () => {
    setScannerError('');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          performCheckIn(decodedText);
        },
        () => {
          // Ignore ongoing scanning frame parse failures
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setScannerError(
        'Unable to access camera. Please ensure camera permissions are granted or enter the ID manually.'
      );
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Failed to stop camera:', err);
      }
      setScanning(false);
    }
  };

  useEffect(() => {
    // Attempt camera start on mount
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    performCheckIn(manualId.trim());
    setManualId('');
  };

  return (
    <div style={{ maxWidth: '680px', margin: '32px auto', padding: '0 20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--kyndryl-red)',
            }}
          >
            Gate Verification
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--kyndryl-black)' }}>
            Entry QR Scanner
          </h1>
        </div>

        <Link href="/admin/dashboard" className="btn-secondary" style={{ fontSize: '13px' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Verification Result Notification */}
      {lastResult && (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            borderLeft:
              lastResult.status === 'CHECKED_IN'
                ? '6px solid var(--success-green)'
                : lastResult.status === 'ALREADY_CHECKED_IN'
                ? '6px solid var(--warning-amber)'
                : '6px solid var(--error-red)',
            backgroundColor:
              lastResult.status === 'CHECKED_IN'
                ? 'var(--success-green-bg)'
                : lastResult.status === 'ALREADY_CHECKED_IN'
                ? 'var(--warning-amber-bg)'
                : 'var(--error-red-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>
              {lastResult.status === 'CHECKED_IN'
                ? '✅'
                : lastResult.status === 'ALREADY_CHECKED_IN'
                ? '⚠️'
                : '❌'}
            </span>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {lastResult.status === 'CHECKED_IN'
                  ? 'ENTRY APPROVED: Checked In!'
                  : lastResult.status === 'ALREADY_CHECKED_IN'
                  ? 'ALREADY CHECKED IN'
                  : 'ENTRY REJECTED'}
              </h3>
              <p style={{ fontSize: '13.5px', marginTop: '2px' }}>{lastResult.message}</p>
            </div>
          </div>

          {lastResult.guest && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                fontSize: '13.5px',
              }}
            >
              <div>
                <strong>Attendee:</strong> {lastResult.guest.fullName}
              </div>
              <div>
                <strong>Email:</strong> {lastResult.guest.email}
              </div>
              <div>
                <strong>Diet:</strong>{' '}
                {lastResult.guest.dietaryPref === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian'}
              </div>
              <div>
                <strong>Alcohol:</strong>{' '}
                {lastResult.guest.alcoholPref === 'drinking' ? '🍹 Drinking' : '🥤 Not Drinking'}
              </div>
              {lastResult.entryTime && (
                <div style={{ gridColumn: '1 / -1', fontSize: '12.5px', opacity: 0.85 }}>
                  Recorded entry timestamp:{' '}
                  {new Date(lastResult.entryTime).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Camera Scanner Viewport */}
      <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <div
          id="qr-reader"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        />

        {scannerError && (
          <div className="alert-warning" style={{ marginTop: '16px', fontSize: '13px' }}>
            {scannerError}
          </div>
        )}

        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          {scanning ? (
            <button onClick={stopScanner} className="btn-secondary" style={{ fontSize: '13px' }}>
              ⏸ Pause Camera
            </button>
          ) : (
            <button onClick={startScanner} className="btn-primary" style={{ fontSize: '13px' }}>
              ▶️ Resume Camera
            </button>
          )}
        </div>
      </div>

      {/* Manual Check-in Fallback */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          Manual Entry Pass Fallback
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--gray-60)', marginBottom: '16px' }}>
          If the guest's screen is dimmed or unreadable by camera, enter their 6-character pass code below:
        </p>

        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. K9X2P4"
            value={manualId}
            onChange={(e) => setManualId(e.target.value.toUpperCase())}
            style={{ flex: 1, letterSpacing: '2px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
          />
          <button
            type="submit"
            className="btn-dark"
            disabled={!manualId.trim() || processing}
            style={{ whiteSpace: 'nowrap' }}
          >
            {processing ? 'Checking...' : 'Check In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
