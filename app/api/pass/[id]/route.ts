import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing pass ID.' }, { status: 400 });
    }

    const cleanId = id.trim().toUpperCase();

    const { data: record, error } = await supabase
      .from('registrations')
      .select('id, full_name_enc, dietary_pref, alcohol_pref, travel_mode, attended, entry_time')
      .eq('id', cleanId)
      .maybeSingle();

    if (error || !record) {
      return NextResponse.json({ error: 'Pass not found.' }, { status: 404 });
    }

    let fullName = 'Kyndryl Colleague';
    try {
      if (record.full_name_enc) {
        fullName = decrypt(record.full_name_enc);
      }
    } catch {
      fullName = 'Kyndryl Colleague';
    }

    return NextResponse.json({
      id: record.id,
      fullName,
      dietaryPref: record.dietary_pref,
      alcoholPref: record.alcohol_pref,
      travelMode: record.travel_mode,
      attended: record.attended,
      entryTime: record.entry_time,
    });
  } catch (err) {
    console.error('Pass fetch error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
