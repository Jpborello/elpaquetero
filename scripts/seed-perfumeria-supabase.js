const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

const categoriesToUpsert = [
  {
    id: 'Perfumería',
    name: 'Perfumería',
    subcategories: ['Perfumes y Cremas']
  },
  {
    id: 'Perfumeria',
    name: 'Perfumería',
    subcategories: ['Perfumes y Cremas']
  },
  {
    id: 'Blanquería',
    name: 'Blanquería',
    subcategories: ['Sabanas']
  }
];

async function seed() {
  console.log('Upserting categorías en Supabase via Service Role REST API...');
  const catRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(categoriesToUpsert)
  });

  if (!catRes.ok) {
    console.error('Error insertando categorías:', await catRes.text());
  } else {
    console.log('✓ Categorías insertadas/actualizadas en Supabase.');
  }
}

seed().catch(console.error);
