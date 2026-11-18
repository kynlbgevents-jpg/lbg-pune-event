'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check the password.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unable to reach server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '80px auto', padding: '0 20px' }}>
      <div
        className="card"
        style={{
          padding: '36px 32px',
          borderTop: '5px solid var(--kyndryl-black)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--kyndryl-red)',
            }}
          >
            Restricted Access
          </span>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--kyndryl-black)',
            }}
          >
            Event Admin Portal
          </h1>
          <p style={{ marginTop: '6px', fontSize: '13.5px', color: 'var(--gray-60)' }}>
            Enter the shared event administration password to access guest management and attendance scanner.
          </p>
        </div>

        {error && (
          <div className="alert-danger" style={{ marginBottom: '20px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '22px' }}>
            <label htmlFor="password">Admin Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-dark"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            disabled={loading || !password}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal →'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--gray-20)',
            textAlign: 'center',
            fontSize: '12.5px',
          }}
        >
          <Link href="/" style={{ color: 'var(--gray-60)' }}>
            ← Back to RSVP Form
          </Link>
        </div>
      </div>
    </div>
  );
}
