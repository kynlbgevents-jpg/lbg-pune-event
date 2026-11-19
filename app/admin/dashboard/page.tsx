'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Guest {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  emergencyName: string;
  emergencyMobile: string;
  dietaryPref: 'veg' | 'non_veg';
  alcoholPref: 'drinking' | 'not_drinking';
  travelMode: string | null;
  registeredAt: string;
  attended: boolean;
  entryTime: string | null;
}

interface Stats {
  total: number;
  attended: number;
  veg: number;
  nonVeg: number;
  drinking: number;
  notDrinking: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMailMergeGuide, setShowMailMergeGuide] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [alcoholFilter, setAlcoholFilter] = useState<'all' | 'drinking' | 'not_drinking'>('all');

  const fetchGuests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/guests');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch guest list');
        setLoading(false);
        return;
      }
      setGuests(data.guests || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error(err);
      setError('Network error while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      router.push('/admin');
    }
  };

  // Filtered list
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        g.fullName.toLowerCase().includes(search) ||
        g.email.toLowerCase().includes(search) ||
        g.mobile.includes(search) ||
        g.id.toLowerCase().includes(search);

      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'attended' && g.attended) ||
        (attendanceFilter === 'not_attended' && !g.attended);

      const matchesDiet =
        dietFilter === 'all' || g.dietaryPref === dietFilter;

      const matchesAlcohol =
        alcoholFilter === 'all' || g.alcoholPref === alcoholFilter;

      return matchesSearch && matchesAttendance && matchesDiet && matchesAlcohol;
    });
  }, [guests, searchTerm, attendanceFilter, dietFilter, alcoholFilter]);

  // CSV Export optimized for Outlook Mail Merge
  const exportToCSV = () => {
    if (filteredGuests.length === 0) {
      alert('No guests to export.');
      return;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    const headers = [
      'Pass_Code',
      'Full_Name',
      'Official_Email',
      'Digital_Pass_URL',
      'Mobile_Number',
      'Dietary_Preference',
      'Alcohol_Preference',
      'Travel_Mode',
      'Emergency_Contact_Name',
      'Emergency_Contact_Mobile',
      'Attended',
      'Entry_Time',
    ];

    const rows = filteredGuests.map((g) => [
      `"${g.id}"`,
      `"${g.fullName.replace(/"/g, '""')}"`,
      `"${g.email.replace(/"/g, '""')}"`,
      `"${baseUrl}/pass/${g.id}"`,
      `"${g.mobile}"`,
      `"${g.dietaryPref === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}"`,
      `"${g.alcoholPref === 'drinking' ? 'Drinking' : 'Not Drinking'}"`,
      `"${g.travelMode || 'N/A'}"`,
      `"${g.emergencyName.replace(/"/g, '""')}"`,
      `"${g.emergencyMobile}"`,
      `"${g.attended ? 'Yes' : 'No'}"`,
      `"${g.entryTime || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kyndryl_YearEnd_Passes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mailMergeTemplateText = `Subject: 🎉 Your QR Entry Pass: Kyndryl Year End Celebrations 2026

Hi «Full_Name»,

Thank you for confirming your attendance for the Kyndryl Year End Celebrations 2026! We are excited to celebrate with you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR DIGITAL ENTRY PASS
Pass Code: «Pass_Code»
Access your QR Pass: «Digital_Pass_URL»
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Registration Summary:
• Dietary Preference: «Dietary_Preference»
• Alcohol Preference: «Alcohol_Preference»
• Travel Mode: «Travel_Mode»

ENTRY INSTRUCTIONS:
Please open the link above on your phone or keep your 6-character Pass Code («Pass_Code») ready at the venue check-in desk.

ZERO TOLERANCE SAFETY POLICY:
If you are consuming alcohol, driving is strictly prohibited. Please ensure you take safe transport (Cab, Carpool with non-drinking driver, or Pickup).

See you at the celebrations!
Kyndryl Events Team`;

  const copyTemplateToClipboard = () => {
    navigator.clipboard.writeText(mailMergeTemplateText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const travelLabel = (mode: string | null) => {
    switch (mode) {
      case 'self_drive':
        return '🚗 Self Drive';
      case 'carpooling':
        return '👥 Carpool (Sober Driver)';
      case 'public_transport':
        return '🚇 Public Transport';
      case 'cab':
        return '🚕 Cab (Ola/Uber)';
      case 'relative_pickup':
        return '👨‍👩‍👧 Family/Friend Pickup';
      default:
        return '—';
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>
      {/* Top Header / Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
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
            Kyndryl Admin Management
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--kyndryl-black)' }}>
            Celebrations Master Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/scan" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            📷 Open QR Scanner
          </Link>
          <button
            onClick={() => setShowMailMergeGuide(!showMailMergeGuide)}
            className="btn-secondary"
            title="Outlook Mail Merge Template"
          >
            ✉️ Outlook Mail Merge
          </button>
          <button onClick={exportToCSV} className="btn-secondary" title="Download CSV for Outlook / Excel">
            📥 Export CSV
          </button>
          <button onClick={fetchGuests} className="btn-secondary" title="Refresh guest list">
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="btn-dark">
            Sign Out
          </button>
        </div>
      </div>

      {/* Expandable Outlook Mail Merge Guide */}
      {showMailMergeGuide && (
        <div
          className="card"
          style={{
            padding: '28px',
            marginBottom: '28px',
            borderLeft: '5px solid var(--kyndryl-red)',
            backgroundColor: '#FCFCFC',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--kyndryl-black)' }}>
                How to Send Entry Passes via Your Normal Kyndryl Outlook
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-60)', marginTop: '4px' }}>
                Send directly from your official Kyndryl account in Microsoft Word &amp; Outlook without any external email setup.
              </p>
            </div>
            <button
              onClick={() => setShowMailMergeGuide(false)}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray-50)' }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            <div style={{ backgroundColor: 'var(--white)', padding: '18px', borderRadius: '8px', border: '1px solid var(--gray-20)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                Step-by-Step Instructions:
              </h4>
              <ol style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.8, color: 'var(--gray-70)' }}>
                <li>Click <strong>Export CSV</strong> above to download the attendee pass list.</li>
                <li>Open <strong>Microsoft Word</strong> → go to <strong>Mailings</strong> tab.</li>
                <li>Click <strong>Start Mail Merge</strong> → choose <strong>E-mail Messages</strong>.</li>
                <li>Click <strong>Select Recipients</strong> → <strong>Use an Existing List</strong> → select the downloaded CSV file.</li>
                <li>Copy the template on the right into your Word document.</li>
                <li>Click <strong>Finish &amp; Merge</strong> → <strong>Send Email Messages</strong> (select <code>Official_Email</code>).</li>
                <li>Outlook will send all passes directly from your official account!</li>
              </ol>
            </div>

            <div style={{ backgroundColor: 'var(--white)', padding: '18px', borderRadius: '8px', border: '1px solid var(--gray-20)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>
                  Ready-to-Use Email Template:
                </h4>
                <button
                  onClick={copyTemplateToClipboard}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {copiedTemplate ? '✓ Copied!' : '📋 Copy Template'}
                </button>
              </div>
              <textarea
                readOnly
                value={mailMergeTemplateText}
                rows={12}
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.5,
                  backgroundColor: 'var(--gray-10)',
                  color: 'var(--gray-80)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-danger" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Stats Summary Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-50)', fontWeight: 600 }}>TOTAL REGISTRATIONS</div>
            <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '6px', color: 'var(--kyndryl-black)' }}>
              {stats.total}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--success-green)' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-50)', fontWeight: 600 }}>CHECKED IN (ATTENDED)</div>
            <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '6px', color: 'var(--success-green)' }}>
              {stats.attended}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-50)', marginLeft: '6px' }}>
                ({stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-50)', fontWeight: 600 }}>DIETARY PREFERENCE</div>
            <div style={{ fontSize: '15px', marginTop: '8px', lineHeight: 1.6 }}>
              <div>🥦 Veg: <strong>{stats.veg}</strong></div>
              <div>🍗 Non-Veg: <strong>{stats.nonVeg}</strong></div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-50)', fontWeight: 600 }}>ALCOHOL PREFERENCE</div>
            <div style={{ fontSize: '15px', marginTop: '8px', lineHeight: 1.6 }}>
              <div>🍹 Drinking: <strong>{stats.drinking}</strong></div>
              <div>🥤 Not Drinking: <strong>{stats.notDrinking}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <input
            type="text"
            placeholder="🔍 Search by pass code, name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Attendance</option>
            <option value="attended">Checked In Only</option>
            <option value="not_attended">Pending Only</option>
          </select>

          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as any)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Diets</option>
            <option value="veg">Vegetarian</option>
            <option value="non_veg">Non-Vegetarian</option>
          </select>

          <select
            value={alcoholFilter}
            onChange={(e) => setAlcoholFilter(e.target.value as any)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Alcohol Prefs</option>
            <option value="drinking">Drinking</option>
            <option value="not_drinking">Not Drinking</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--gray-50)', marginLeft: 'auto' }}>
          Showing <strong>{filteredGuests.length}</strong> of {guests.length} entries
        </div>
      </div>

      {/* Table of Guests */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--gray-10)', borderBottom: '1px solid var(--gray-20)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>PASS CODE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>ATTENDEE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>CONTACT</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>PREFERENCES</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>TRAVEL MODE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>STATUS</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-50)' }}>
                  Loading encrypted guest data...
                </td>
              </tr>
            ) : filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-50)' }}>
                  No attendees matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredGuests.map((g) => (
                <tr
                  key={g.id}
                  style={{
                    borderBottom: '1px solid var(--gray-20)',
                    backgroundColor: g.attended ? 'var(--white)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--gray-10)',
                        border: '1px solid var(--gray-30)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '14px',
                        letterSpacing: '1px',
                        color: 'var(--kyndryl-black)',
                      }}
                    >
                      {g.id}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--kyndryl-black)' }}>{g.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-50)' }}>
                      Em: {g.emergencyName} ({g.emergencyMobile})
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{g.email}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--gray-60)' }}>{g.mobile}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={`badge ${g.dietaryPref === 'veg' ? 'badge-green' : 'badge-amber'}`}>
                        {g.dietaryPref === 'veg' ? '🥦 Veg' : '🍗 Non-Veg'}
                      </span>
                      <span className={`badge ${g.alcoholPref === 'drinking' ? 'badge-red' : 'badge-gray'}`}>
                        {g.alcoholPref === 'drinking' ? '🍹 Drinking' : '🥤 Not Drinking'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                    {travelLabel(g.travelMode)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {g.attended ? (
                      <div>
                        <span className="badge badge-green">✓ Checked In</span>
                        {g.entryTime && (
                          <div style={{ fontSize: '11.5px', color: 'var(--gray-50)', marginTop: '4px' }}>
                            {new Date(g.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-gray">Pending Entry</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link
                      href={`/pass/${g.id}`}
                      target="_blank"
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--kyndryl-red)',
                        textDecoration: 'underline',
                      }}
                    >
                      View Pass ↗
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
