import { NextRequest, NextResponse } from 'next/server';
import { validateSessionFromRequest } from '@/lib/session';
import { getServiceClient } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const isAuthed = await validateSessionFromRequest(req);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabaseAdmin = getServiceClient();

    const { data: rows, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Fetch guests error:', error);
      return NextResponse.json({ error: 'Failed to fetch guest list.' }, { status: 500 });
    }

    const guests = (rows || []).map((row) => {
      let fullName = '[Decryption error]';
      let mobile = '[Decryption error]';
      let email = '[Decryption error]';
      let emergencyName = '[Decryption error]';
      let emergencyMobile = '[Decryption error]';

      try {
        if (row.full_name_enc) fullName = decrypt(row.full_name_enc);
      } catch (e) {
        console.error('Error decrypting full_name for id', row.id, e);
      }

      try {
        if (row.mobile_enc) mobile = decrypt(row.mobile_enc);
      } catch (e) {
        console.error('Error decrypting mobile for id', row.id, e);
      }

      try {
        if (row.email_enc) email = decrypt(row.email_enc);
      } catch (e) {
        console.error('Error decrypting email for id', row.id, e);
      }

      try {
        if (row.emergency_name_enc) emergencyName = decrypt(row.emergency_name_enc);
      } catch (e) {
        console.error('Error decrypting emergency_name for id', row.id, e);
      }

      try {
        if (row.emergency_mobile_enc) emergencyMobile = decrypt(row.emergency_mobile_enc);
      } catch (e) {
        console.error('Error decrypting emergency_mobile for id', row.id, e);
      }

      return {
        id: row.id,
        fullName,
        mobile,
        email,
        emergencyName,
        emergencyMobile,
        dietaryPref: row.dietary_pref,
        alcoholPref: row.alcohol_pref,
        travelMode: row.travel_mode,
        registeredAt: row.registered_at,
        attended: row.attended,
        entryTime: row.entry_time,
      };
    });

    const stats = {
      total: guests.length,
      attended: guests.filter((g) => g.attended).length,
      veg: guests.filter((g) => g.dietaryPref === 'veg').length,
      nonVeg: guests.filter((g) => g.dietaryPref === 'non_veg').length,
      drinking: guests.filter((g) => g.alcoholPref === 'drinking').length,
      notDrinking: guests.filter((g) => g.alcoholPref === 'not_drinking').length,
    };

    return NextResponse.json({ guests, stats });
  } catch (err) {
    console.error('Guests API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
