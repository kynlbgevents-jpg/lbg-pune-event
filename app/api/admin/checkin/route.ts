import { NextRequest, NextResponse } from 'next/server';
import { validateSessionFromRequest } from '@/lib/session';
import { getServiceClient } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await validateSessionFromRequest(req);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing QR identifier.' }, { status: 400 });
    }

    const supabaseAdmin = getServiceClient();

    const cleanId = id.trim().toUpperCase();

    // Check if registration exists
    const { data: record, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', cleanId)
      .maybeSingle();

    if (error || !record) {
      return NextResponse.json(
        { status: 'NOT_FOUND', message: 'No registration found for this QR code.' },
        { status: 404 }
      );
    }

    // Decrypt details for display to admin
    let fullName = 'Guest';
    let email = '';
    try {
      if (record.full_name_enc) fullName = decrypt(record.full_name_enc);
    } catch {
      fullName = '[Encrypted]';
    }
    try {
      if (record.email_enc) email = decrypt(record.email_enc);
    } catch {
      email = '';
    }

    const guestInfo = {
      id: record.id,
      fullName,
      email,
      dietaryPref: record.dietary_pref,
      alcoholPref: record.alcohol_pref,
      travelMode: record.travel_mode,
    };

    // If already attended
    if (record.attended) {
      return NextResponse.json({
        status: 'ALREADY_CHECKED_IN',
        message: 'This guest has already checked in!',
        entryTime: record.entry_time,
        guest: guestInfo,
      });
    }

    // Mark attended
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({ attended: true, entry_time: now })
      .eq('id', record.id);

    if (updateError) {
      console.error('Update checkin error:', updateError);
      return NextResponse.json({ error: 'Failed to update attendance status.' }, { status: 500 });
    }

    return NextResponse.json({
      status: 'CHECKED_IN',
      message: 'Attendance successfully marked!',
      entryTime: now,
      guest: guestInfo,
    });
  } catch (err) {
    console.error('Checkin API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
