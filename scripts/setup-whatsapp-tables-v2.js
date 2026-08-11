const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

async function run() {
  console.log('⚡ Creando/verificando tablas de WhatsApp en Supabase via SQL REST...');

  // Try creating via pg query endpoint or RPC if available, or direct REST table initialization
  const queries = [
    // 1. Create whatsapp_chats table definition SQL
    `CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
        phone TEXT PRIMARY KEY,
        client_name TEXT,
        last_message TEXT,
        unread_count INTEGER DEFAULT 0,
        bot_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        chat_phone TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS public.whatsapp_bot_settings (
        id TEXT PRIMARY KEY,
        openrouter_key TEXT,
        model TEXT DEFAULT 'deepseek/deepseek-chat',
        system_prompt TEXT,
        is_global_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );`
  ];

  // Let's test Supabase Management/SQL API or REST POST
  for (const sql of queries) {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Also verify using Supabase JS client
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from('whatsapp_bot_settings').upsert([
    {
      id: 'main',
      openrouter_key: '',
      model: 'deepseek/deepseek-chat',
      system_prompt: 'Sos el asistente virtual de ventas mayorista de El Paquetero.',
      is_global_enabled: true,
      updated_at: new Date().toISOString()
    }
  ], { onConflict: 'id' }).select();

  console.log('DB Result:', data, 'Error:', error);
}

run().catch(console.error);
