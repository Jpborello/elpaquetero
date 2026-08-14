import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function startOfDayIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function startOfWeekIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

async function countVisits(sinceIso) {
  const url = sinceIso
    ? `${supabaseUrl}/rest/v1/page_visits?select=id&created_at=gte.${encodeURIComponent(sinceIso)}`
    : `${supabaseUrl}/rest/v1/page_visits?select=id`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Prefer': 'count=exact',
      'Range': '0-0'
    },
    cache: 'no-store'
  });

  if (!res.ok) return 0;
  const contentRange = res.headers.get('content-range'); // format: "0-0/N"
  const total = contentRange ? parseInt(contentRange.split('/')[1], 10) : 0;
  return isNaN(total) ? 0 : total;
}

async function getVisitCounts() {
  const [total, today, week, month] = await Promise.all([
    countVisits(null),
    countVisits(startOfDayIso()),
    countVisits(startOfWeekIso()),
    countVisits(startOfMonthIso())
  ]);
  return { total, today, week, month };
}

async function insertVisit() {
  await fetch(`${supabaseUrl}/rest/v1/page_visits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
}

export async function GET() {
  const counts = await getVisitCounts();
  return NextResponse.json(counts);
}

export async function POST() {
  await insertVisit();
  const counts = await getVisitCounts();
  return NextResponse.json(counts);
}
