const { createClient } = require('@supabase/supabase-js');
let ws;
try { ws = require('ws'); } catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  ...(ws ? { realtime: { transport: ws } } : {})
});

async function run() {
  const email = 'elpaqueteroadm@gmail.com';
  const password = 'Elpaquetero2026@';

  console.log(`🔐 Creando/Iniciando usuario Admin en Supabase Auth: ${email}...`);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInData && signInData.session) {
    console.log('✓ Usuario Admin ya existe y se autenticó correctamente en Supabase Auth!');
    return;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'admin', name: 'Administrador El Paquetero' }
    }
  });

  if (signUpError) {
    console.warn('Respuesta Supabase Auth SignUp:', signUpError.message);
  } else {
    console.log('🎉 Usuario Administrador registrado en Supabase Auth con éxito!');
  }
}

run();
