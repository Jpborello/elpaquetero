const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

async function setup() {
  console.log('Creando/verificando tabla settings en Supabase...');
  const res = await fetch(`${supabaseUrl}/rest/v1/settings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify([
      { id: 'transfer_alias1', value: 'el.paquetero.godoy' },
      { id: 'transfer_alias2', value: 'elpaqueterogodoy' },
      { id: 'transfer_holder', value: 'María Leandra Bernardi' },
      { id: 'transfer_cuit', value: '27-30938323-6' }
    ])
  });

  if (!res.ok) {
    console.log('Respuesta de settings:', await res.text());
  } else {
    console.log('✓ Tabla settings creada/actualizada con exito en Supabase!');
  }
}

setup().catch(console.error);
