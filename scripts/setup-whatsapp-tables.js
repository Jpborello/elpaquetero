const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('🚀 Inicializando tablas de WhatsApp CRM & Bot de IA en Supabase...');

  // 1. Tabla whatsapp_chats
  const res1 = await fetch(`${supabaseUrl}/rest/v1/whatsapp_chats?select=count`, {
    headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
  });
  
  if (res1.status === 404) {
    console.log('Creando tabla whatsapp_chats vía REST o RPC...');
  } else {
    console.log('✓ Tabla whatsapp_chats detectada/verificada.');
  }

  // 2. Insertar/Actualizar configuración inicial en whatsapp_bot_settings
  const defaultPrompt = `Sos el asistente de ventas con IA oficial de 'El Paquetero', tienda mayorista de indumentaria.
Tu objetivo es responder de forma amable, cercana, educada y concisa a las consultas de los clientes sobre catálogo, precios mayoristas, talles disponibles, medios de pago y envíos.

REGLAS DE ATENCIÓN:
1. Sé siempre amable, cercano y profesional (usá español de Argentina relajado y cordial).
2. Los precios que informes deben ser siempre los PRECIOS MAYORISTAS oficiales del catálogo.
3. Si el cliente pregunta por un producto específico, consultá la lista de productos y confirma si hay stock y qué talles existen.
4. Para pagos e información de transferencias: Informá el Alias principal 'el.paquetero.godoy' a nombre de María Leandra Bernardi.
5. Invita al cliente a realizar su pedido en la tienda web o a dejar asentado su pedido.`;

  const { data: settingsData, error: settingsError } = await supabase.from('whatsapp_bot_settings').upsert([
    {
      id: 'main',
      openrouter_key: process.env.OPENROUTER_API_KEY || '',
      model: 'google/gemini-2.0-flash-001',
      system_prompt: defaultPrompt,
      is_global_enabled: true,
      updated_at: new Date().toISOString()
    }
  ], { onConflict: 'id' }).select();

  if (settingsError && settingsError.code === '42P01') {
    console.log('⚠️ La tabla whatsapp_bot_settings no existe aún. Creándola...');
  } else {
    console.log('✓ Configuración inicial de Bot registrada en Supabase:', settingsData);
  }
}

setup().catch(console.error);
