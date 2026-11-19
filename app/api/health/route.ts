import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { encrypt, decrypt, hashEmail } from '@/lib/crypto';


export async function GET() {
  const diagnostics: Record<string, any> = {
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ENCRYPTION_SECRET: !!process.env.ENCRYPTION_SECRET,
      BLIND_INDEX_SECRET: !!process.env.BLIND_INDEX_SECRET,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    },
    cryptoTest: false,
    databaseConnection: false,
    registrationsTableExists: false,
    errors: [] as string[],
  };

  // Test crypto
  try {
    const sample = 'Kyndryl Test';
    const encrypted = encrypt(sample);
    const decrypted = decrypt(encrypted);
    diagnostics.cryptoTest = sample === decrypted;
    hashEmail('test@kyndryl.com');
  } catch (err: any) {
    diagnostics.errors.push(`Crypto error: ${err?.message}`);
  }

  // Test Supabase & Table
  try {
    const supabase = getServiceClient();
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      diagnostics.errors.push(`Database query error: ${error.message}`);
    } else {
      diagnostics.databaseConnection = true;
      diagnostics.registrationsTableExists = true;
      diagnostics.totalRegistrations = count ?? 0;
    }
  } catch (err: any) {
    diagnostics.errors.push(`Database connection error: ${err?.message}`);
  }

  const isHealthy =
    diagnostics.cryptoTest &&
    diagnostics.databaseConnection &&
    diagnostics.registrationsTableExists &&
    diagnostics.errors.length === 0;

  return NextResponse.json(
    { status: isHealthy ? 'OK' : 'CONFIGURATION_ERROR', ...diagnostics },
    { status: isHealthy ? 200 : 500 }
  );
}
