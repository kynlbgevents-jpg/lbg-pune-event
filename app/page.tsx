'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RSVPPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [dietaryPref, setDietaryPref] = useState<'veg' | 'non_veg' | ''>('');
  const [alcoholPref, setAlcoholPref] = useState<'drinking' | 'not_drinking' | ''>('');
  const [travelMode, setTravelMode] = useState('');

  // Checkboxes
  const [agreedRules, setAgreedRules] = useState(false);
  const [agreedLiability, setAgreedLiability] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateMessage, setDuplicateMessage] = useState('');

  // Validation
  const isDrinking = alcoholPref === 'drinking';
  const isSelfDrive = travelMode === 'self_drive';
  const hasDrinkAndDriveConflict = isDrinking && isSelfDrive;

  const isEmailKyndryl = email.trim().toLowerCase().endsWith('@kyndryl.com');
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile.trim());
  const isEmergencyMobileValid = /^[6-9]\d{9}$/.test(emergencyMobile.trim());

  const isFormComplete =
    fullName.trim() !== '' &&
    isMobileValid &&
    isEmailKyndryl &&
    emergencyName.trim() !== '' &&
    isEmergencyMobileValid &&
    dietaryPref !== '' &&
    alcoholPref !== '' &&
    (!isDrinking || (travelMode !== '' && !hasDrinkAndDriveConflict)) &&
    agreedRules &&
    agreedLiability;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setDuplicateMessage('');

    if (hasDrinkAndDriveConflict) {
      setErrorMessage(
        'Zero Tolerance Violation: You cannot select Self Drive if you are drinking. Please adjust your travel mode or alcohol preference.'
      );
      return;
    }

    if (!isEmailKyndryl) {
      setErrorMessage('Registration is restricted to official @kyndryl.com email addresses.');
      return;
    }

    if (!isFormComplete) {
      setErrorMessage('Please fill out all required fields and accept both confirmations.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          email,
          emergencyName,
          emergencyMobile,
          dietaryPref,
          alcoholPref,
          travelMode: isDrinking ? travelMode : null,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.error === 'DUPLICATE') {
        const passLink = data.id ? ` Your Pass Code is ${data.id}.` : '';
        setDuplicateMessage(
          (data.message || 'You have already registered with this Kyndryl email!') + passLink
        );
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit registration. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success -> Redirect to confirmation page with name and pass id
      router.push(
        `/confirmation?name=${encodeURIComponent(fullName.trim())}&id=${encodeURIComponent(data.id || '')}`
      );
    } catch (err) {
      console.error(err);
      setErrorMessage('A network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '36px auto', padding: '0 20px' }}>
      {/* Event Header Banner */}
      <div
        className="card"
        style={{
          borderTop: '5px solid var(--kyndryl-red)',
          padding: '28px 32px',
          marginBottom: '24px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--kyndryl-red)',
          }}
        >
          Internal Event RSVP
        </span>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginTop: '6px',
            color: 'var(--kyndryl-black)',
          }}
        >
          Kyndryl Year End Celebrations 2026
        </h1>
        <p style={{ marginTop: '8px', color: 'var(--gray-60)', fontSize: '15px', lineHeight: 1.5 }}>
          Join us for an evening of celebration, milestones, and camaraderie. Please fill out the form
          below to confirm your attendance. Once submitted, your personalised digital QR entry pass
          will be generated and emailed to your Kyndryl address.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--gray-20)',
            fontSize: '13.5px',
            color: 'var(--gray-70)',
          }}
        >
          <div>
            <strong>📅 Date:</strong> To be Announced
          </div>
          <div>
            <strong>📍 Venue:</strong> To be Announced
          </div>
          <div>
            <strong>🔒 Privacy:</strong> AES-256 Encrypted PII
          </div>
        </div>
      </div>

      {duplicateMessage && (
        <div className="alert-warning" style={{ marginBottom: '20px' }}>
          <strong>Notice:</strong> {duplicateMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert-danger" style={{ marginBottom: '20px' }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '20px',
            borderBottom: '1px solid var(--gray-20)',
            paddingBottom: '10px',
          }}
        >
          1. Attendee Information
        </h2>

        {/* Full Name */}
        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            type="text"
            required
            placeholder="e.g. Priya Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Official Email */}
        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="email">Official Kyndryl Email ID *</label>
          <input
            id="email"
            type="email"
            required
            placeholder="firstname.lastname@kyndryl.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={email.length > 0 && !isEmailKyndryl ? 'error' : ''}
          />
          {email.length > 0 && !isEmailKyndryl ? (
            <p style={{ color: 'var(--error-red)', fontSize: '12px', marginTop: '4px' }}>
              Must end with @kyndryl.com
            </p>
          ) : (
            <p className="hint-text">Your entry QR code will be dispatched to this email.</p>
          )}
        </div>

        {/* Mobile Number */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="mobile">Mobile Number (India) *</label>
          <input
            id="mobile"
            type="tel"
            maxLength={10}
            required
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            className={mobile.length > 0 && !isMobileValid ? 'error' : ''}
          />
          {mobile.length > 0 && !isMobileValid && (
            <p style={{ color: 'var(--error-red)', fontSize: '12px', marginTop: '4px' }}>
              Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.
            </p>
          )}
        </div>

        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '20px',
            borderBottom: '1px solid var(--gray-20)',
            paddingBottom: '10px',
          }}
        >
          2. Emergency Contact
        </h2>

        {/* Emergency Contact Name */}
        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="emergencyName">Emergency Contact Person Name *</label>
          <input
            id="emergencyName"
            type="text"
            required
            placeholder="e.g. Rahul Sharma (Spouse / Parent / Friend)"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </div>

        {/* Emergency Contact Mobile */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="emergencyMobile">Emergency Contact Mobile Number *</label>
          <input
            id="emergencyMobile"
            type="tel"
            maxLength={10}
            required
            placeholder="10-digit mobile number"
            value={emergencyMobile}
            onChange={(e) => setEmergencyMobile(e.target.value.replace(/\D/g, ''))}
            className={emergencyMobile.length > 0 && !isEmergencyMobileValid ? 'error' : ''}
          />
          {emergencyMobile.length > 0 && !isEmergencyMobileValid && (
            <p style={{ color: 'var(--error-red)', fontSize: '12px', marginTop: '4px' }}>
              Please enter a valid 10-digit mobile number.
            </p>
          )}
        </div>

        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '20px',
            borderBottom: '1px solid var(--gray-20)',
            paddingBottom: '10px',
          }}
        >
          3. Preferences &amp; Safe Commute
        </h2>

        {/* Dietary Preference */}
        <div style={{ marginBottom: '20px' }}>
          <label>Dietary Preference *</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 400,
                border: '1.5px solid var(--gray-20)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                backgroundColor: dietaryPref === 'veg' ? 'var(--gray-10)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="dietaryPref"
                value="veg"
                checked={dietaryPref === 'veg'}
                onChange={() => setDietaryPref('veg')}
              />
              <span>🥦 Vegetarian</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 400,
                border: '1.5px solid var(--gray-20)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                backgroundColor: dietaryPref === 'non_veg' ? 'var(--gray-10)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="dietaryPref"
                value="non_veg"
                checked={dietaryPref === 'non_veg'}
                onChange={() => setDietaryPref('non_veg')}
              />
              <span>🍗 Non-Vegetarian</span>
            </label>
          </div>
        </div>

        {/* Alcohol Preference */}
        <div style={{ marginBottom: '20px' }}>
          <label>Alcohol Preference *</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 400,
                border: '1.5px solid var(--gray-20)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                backgroundColor: alcoholPref === 'not_drinking' ? 'var(--gray-10)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="alcoholPref"
                value="not_drinking"
                checked={alcoholPref === 'not_drinking'}
                onChange={() => {
                  setAlcoholPref('not_drinking');
                  setTravelMode('');
                }}
              />
              <span>🥤 Not Drinking (Non-Alcoholic)</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 400,
                border: '1.5px solid var(--gray-20)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                backgroundColor: alcoholPref === 'drinking' ? 'var(--kyndryl-red-light)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="alcoholPref"
                value="drinking"
                checked={alcoholPref === 'drinking'}
                onChange={() => setAlcoholPref('drinking')}
              />
              <span>🍹 Drinking</span>
            </label>
          </div>
        </div>

        {/* Conditional Travel Mode (Appears if Drinking is selected) */}
        {isDrinking && (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: 'var(--gray-10)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-20)',
            }}
          >
            <label htmlFor="travelMode" style={{ fontSize: '14px', marginBottom: '8px' }}>
              How do you plan to travel to/from the event? *
            </label>
            <select
              id="travelMode"
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
              required
            >
              <option value="">-- Select Travel Mode --</option>
              <option value="self_drive">🚗 Self Drive</option>
              <option value="carpooling">👥 Car Pooling with Non-Drinking Driver</option>
              <option value="public_transport">🚇 Public Transport (Metro / Bus)</option>
              <option value="cab">🚕 Cab Service (Uber / Ola / Rapido)</option>
              <option value="relative_pickup">👨‍👩‍👧 Relative / Friend Pickup</option>
            </select>

            {/* CRITICAL SAFETY GUARD: Big Warning if Self Drive is selected when drinking */}
            {hasDrinkAndDriveConflict && (
              <div
                className="alert-danger"
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🚨</span>
                  <strong style={{ fontSize: '15px' }}>ZERO TOLERANCE: DRINK &amp; DRIVE IS PROHIBITED</strong>
                </div>
                <p style={{ fontSize: '13.5px', marginTop: '4px' }}>
                  You have indicated that you will be drinking alcohol at the celebration. Under no
                  circumstances is <strong>Self Driving</strong> permitted. Kyndryl strictly enforces a
                  zero-tolerance policy against driving under the influence.
                </p>
                <p style={{ fontWeight: 600, marginTop: '4px' }}>
                  👉 Please change your travel mode to a safe alternative (Cab, Carpool with non-drinking
                  driver, or Pickup), OR switch your alcohol preference to "Not Drinking". Submission is
                  blocked until corrected.
                </p>
              </div>
            )}
          </div>
        )}

        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '20px',
            borderBottom: '1px solid var(--gray-20)',
            paddingBottom: '10px',
          }}
        >
          4. Confirmations &amp; Policy Acceptance
        </h2>

        {/* Confirmation Checkbox 1: Rules & Accuracy */}
        <div style={{ marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <input
            id="agreedRules"
            type="checkbox"
            checked={agreedRules}
            onChange={(e) => setAgreedRules(e.target.checked)}
            style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer' }}
          />
          <label
            htmlFor="agreedRules"
            style={{ fontWeight: 400, fontSize: '13.5px', lineHeight: 1.5, cursor: 'pointer' }}
          >
            I confirm that all information provided above is accurate and complete. I understand that
            inaccurate information may result in denial of entry. I have read and agree to fully abide by
            all{' '}
            <Link
              href="/rules"
              target="_blank"
              style={{ color: 'var(--kyndryl-red)', textDecoration: 'underline', fontWeight: 600 }}
            >
              Rules, Do's &amp; Don'ts
            </Link>{' '}
            applicable to this event.
          </label>
        </div>

        {/* Confirmation Checkbox 2: Liability Waiver */}
        <div style={{ marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <input
            id="agreedLiability"
            type="checkbox"
            checked={agreedLiability}
            onChange={(e) => setAgreedLiability(e.target.checked)}
            style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer' }}
          />
          <label
            htmlFor="agreedLiability"
            style={{ fontWeight: 400, fontSize: '13.5px', lineHeight: 1.5, cursor: 'pointer' }}
          >
            I acknowledge and agree that I, and anyone accompanying or representing me, shall{' '}
            <strong>not</strong> hold <strong>Kyndryl Solutions Pvt Ltd</strong>, its employees,
            officers, contractors, or event partners liable or responsible for any incident, accident,
            injury, property loss, or harm arising due to my own negligence, violation of event rules,
            drink &amp; drive behaviour, or any other conduct contrary to the guidelines communicated for
            this event.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', fontSize: '16px', padding: '16px' }}
          disabled={!isFormComplete || submitting || hasDrinkAndDriveConflict}
        >
          {submitting
            ? 'Submitting & Encrypting...'
            : hasDrinkAndDriveConflict
            ? '⚠️ Please resolve Drink & Drive selection to submit'
            : 'Confirm RSVP & Generate Entry Pass'}
        </button>

        {!isFormComplete && !hasDrinkAndDriveConflict && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '12.5px',
              color: 'var(--gray-50)',
              marginTop: '12px',
            }}
          >
            Please complete all required fields and check both confirmation boxes to proceed.
          </p>
        )}
      </form>
    </div>
  );
}
