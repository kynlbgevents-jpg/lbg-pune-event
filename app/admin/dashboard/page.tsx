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
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        g.fullName.toLowerCase().includes(search) ||
        g.email.toLowerCase().includes(search) ||
        g.mobile.includes(search);

      // Attendance
      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'attended' && g.attended) ||
        (attendanceFilter === 'not_attended' && !g.attended);

      // Diet
      const matchesDiet =
        dietFilter === 'all' || g.dietaryPref === dietFilter;

      // Alcohol
      const matchesAlcohol =
        alcoholFilter === 'all' || g.alcoholPref === alcoholFilter;

      return matchesSearch && matchesAttendance && matchesDiet && matchesAlcohol;
    });
  }, [guests, searchTerm, attendanceFilter, dietFilter, alcoholFilter]);

  // CSV Export
  const exportToCSV = () => {
    if (filteredGuests.length === 0) {
      alert('No guests to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Full Name',
      'Official Email',
      'Mobile Number',
      'Emergency Contact Name',
      'Emergency Contact Mobile',
      'Dietary Preference',
      'Alcohol Preference',
      'Travel Mode',
      'Attended',
      'Entry Time (UTC)',
      'Registered At (UTC)',
    ];

    const rows = filteredGuests.map((g) => [
      `"${g.id}"`,
      `"${g.fullName.replace(/"/g, '""')}"`,
      `"${g.email.replace(/"/g, '""')}"`,
      `"${g.mobile}"`,
      `"${g.emergencyName.replace(/"/g, '""')}"`,
      `"${g.emergencyMobile}"`,
      `"${g.dietaryPref === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}"`,
      `"${g.alcoholPref === 'drinking' ? 'Drinking' : 'Not Drinking'}"`,
      `"${g.travelMode || 'N/A'}"`,
      `"${g.attended ? 'Yes' : 'No'}"`,
      `"${g.entryTime || 'N/A'}"`,
      `"${g.registeredAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kyndryl_YearEnd_Guests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button onClick={fetchGuests} className="btn-secondary" title="Refresh guest list">
            🔄 Refresh
          </button>
          <button onClick={exportToCSV} className="btn-secondary" title="Download CSV">
            📥 Export CSV
          </button>
          <button onClick={handleLogout} className="btn-dark">
            Sign Out
          </button>
        </div>
      </div>

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
            placeholder="🔍 Search by name, email, or mobile..."
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
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>ATTENDEE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>CONTACT</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>EMERGENCY CONTACT</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>PREFERENCES</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>TRAVEL MODE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-60)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-50)' }}>
                  Loading encrypted guest data...
                </td>
              </tr>
            ) : filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-50)' }}>
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
                    <div style={{ fontWeight: 600, color: 'var(--kyndryl-black)' }}>{g.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-60)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      Pass: {g.id}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{g.email}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--gray-60)' }}>{g.mobile}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{g.emergencyName}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--gray-60)' }}>{g.emergencyMobile}</div>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
