import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

async function getDbCount() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq._config_visit_count`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].name) {
        const val = parseInt(data[0].name, 10);
        if (!isNaN(val)) return val;
      }
    }
  } catch (e) {}
  return 156; // Initial base count
}

async function setDbCount(count) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify([{ id: '_config_visit_count', name: count.toString() }])
    });
  } catch (e) {}
}

export async function GET() {
  const count = await getDbCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const current = await getDbCount();
  const nextCount = current + 1;
  await setDbCount(nextCount);
  return NextResponse.json({ count: nextCount });
}
