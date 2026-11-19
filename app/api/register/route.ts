import { NextRequest, NextResponse } from 'next/server';
import { encrypt, hashEmail, generatePassCode } from '@/lib/crypto';
import { getServiceClient } from '@/lib/supabase';

const KYNDRYL_DOMAIN = '@kyndryl.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      emergencyName,
      emergencyMobile,
      dietaryPref,
      alcoholPref,
      travelMode,
    } = body;

    // --- Validation ---
    if (!fullName || !mobile || !email || !emergencyName || !emergencyMobile || !dietaryPref || !alcoholPref) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith(KYNDRYL_DOMAIN)) {
      return NextResponse.json({ error: 'Only @kyndryl.com email addresses are accepted.' }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Invalid mobile number.' }, { status: 400 });
    }

    if (!['veg', 'non_veg'].includes(dietaryPref)) {
      return NextResponse.json({ error: 'Invalid dietary preference.' }, { status: 400 });
    }

    if (!['drinking', 'not_drinking'].includes(alcoholPref)) {
      return NextResponse.json({ error: 'Invalid alcohol preference.' }, { status: 400 });
    }

    if (alcoholPref === 'drinking' && !travelMode) {
      return NextResponse.json({ error: 'Travel mode is required when drinking.' }, { status: 400 });
    }

    // Block self-drive + drinking combination
    if (alcoholPref === 'drinking' && travelMode === 'self_drive') {
      return NextResponse.json({ error: 'Self Drive with Drinking is not permitted.' }, { status: 400 });
    }

    // Get server-side Supabase client
    const supabaseAdmin = getServiceClient();

    // --- Duplicate check via blind index ---
    const emailHash = hashEmail(email);

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('email_hash', emailHash)
      .maybeSingle();

    if (existingError) {
      console.error('Supabase check existing error:', existingError);
      return NextResponse.json(
        { error: `Database error: ${existingError.message}. Make sure table "registrations" exists.` },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          error: 'DUPLICATE',
          message: 'You have already registered with this Kyndryl email! You can view your pass using your pass code.',
          id: existing.id,
        },
        { status: 409 }
      );
    }

    // --- Encrypt PII ---
    const encryptedData = {
      full_name_enc: encrypt(fullName.trim()),
      mobile_enc: encrypt(mobile.trim()),
      email_enc: encrypt(email.toLowerCase().trim()),
      emergency_name_enc: encrypt(emergencyName.trim()),
      emergency_mobile_enc: encrypt(emergencyMobile.trim()),
    };

    // --- Insert to Supabase with 6-character alphanumeric pass code ---
    let record = null;
    let lastError: any = null;
    let attempts = 0;

    while (!record && attempts < 3) {
      attempts++;
      const passCode = generatePassCode(6);

      const { data, error: insertError } = await supabaseAdmin
        .from('registrations')
        .insert({
          id: passCode,
          ...encryptedData,
          email_hash: emailHash,
          dietary_pref: dietaryPref,
          alcohol_pref: alcoholPref,
          travel_mode: alcoholPref === 'drinking' ? travelMode : null,
        })
        .select('id')
        .single();

      if (!insertError && data) {
        record = data;
        break;
      }
      lastError = insertError;
    }

    if (!record) {
      console.error('Supabase insert failed:', lastError);
      return NextResponse.json(
        { error: `Database save failed: ${lastError?.message || 'Could not save record'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error occurred during registration.' },
      { status: 500 }
    );
  }
}
