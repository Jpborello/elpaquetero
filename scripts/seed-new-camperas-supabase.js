const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Nzg0MDcsImV4cCI6MjEwMTQ1NDQwN30.A9sRFYI36UvOmjw3fsFGlteutTLsaPRXPszacwysbQk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newCamperas = [
  {
    id: 'p-0040-new',
    name: 'Campera Combinada con Piel Hombre',
    category: 'Hombres',
    subcategory: 'Camperas',
    wholesale_price: 25000,
    price: 25000,
    stock: 50,
    sales_count: 15,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-COMBINADA-CON-PIEL-HOMBRE.webp',
    description: 'Campera de hombre combinada con piel térmica de excelente calidad.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-0004-new',
    name: 'Campera Combinada con Piel Dama',
    category: 'Mujeres',
    subcategory: 'Camperas',
    wholesale_price: 23000,
    price: 23000,
    stock: 50,
    sales_count: 20,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-COMBINADA-C-PIEL-DAMA.webp',
    description: 'Campera para dama combinada con interior en piel super abrigada.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-0003-new',
    name: 'Campera con Piel Combinada Dama',
    category: 'Mujeres',
    subcategory: 'Camperas',
    wholesale_price: 22000,
    price: 22000,
    stock: 50,
    sales_count: 8,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-CON-PIEL-COMB-DAMA.webp',
    description: 'Campera abrigada de dama con revestimiento térmico en piel.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-0068-new',
    name: 'Campera Importada Hombre Reversible',
    category: 'Hombres',
    subcategory: 'Camperas',
    wholesale_price: 34000,
    price: 34000,
    stock: 50,
    sales_count: 32,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-IMPORTADA-HOMBRE-REVERSIBLE.webp',
    description: 'Campera de hombre importada doble faz reversible premium.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-0064-new',
    name: 'Campera Inflable con Piel Hombre',
    category: 'Hombres',
    subcategory: 'Camperas',
    wholesale_price: 25000,
    price: 25000,
    stock: 50,
    sales_count: 28,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-INFLABLE-CON-PIEL-HOMBRE.webp',
    description: 'Campera inflable térmica para hombre forrada en piel.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-0116-new',
    name: 'Campera Inflable Lisa Niños',
    category: 'Infantil',
    subcategory: 'Indumentaria Infantil',
    wholesale_price: 15000,
    price: 15000,
    stock: 50,
    sales_count: 12,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-INFLABLE-LISA-NINOS.webp',
    description: 'Campera inflable lisa para niños y niñas super liviana y abrigada.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-0115-new',
    name: 'Campera Inflable Niños',
    category: 'Infantil',
    subcategory: 'Indumentaria Infantil',
    wholesale_price: 15000,
    price: 15000,
    stock: 50,
    sales_count: 25,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-INFLABLE-NINOS.webp',
    description: 'Campera inflable infantil de alto abrigo para invierno.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-0005-new',
    name: 'Campera Lisa con Piel Dama',
    category: 'Mujeres',
    subcategory: 'Camperas',
    wholesale_price: 27000,
    price: 27000,
    stock: 50,
    sales_count: 10,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-LISA-CON-PIEL-DAMA.webp',
    description: 'Campera lisa de dama con abrigo interior de piel.',
    is_offer: true,
    is_top_seller: false
  },
  {
    id: 'p-0008-new',
    name: 'Campera Puffer Dama',
    category: 'Mujeres',
    subcategory: 'Camperas',
    wholesale_price: 22000,
    price: 22000,
    stock: 50,
    sales_count: 19,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/CAMPERA-PUFFER-DAMA.webp',
    description: 'Campera estilo puffer acolchada para dama.',
    is_offer: true,
    is_top_seller: true
  }
];

async function seed() {
  console.log('🔐 Autenticando como Administrador en Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'elpaqueteroadm@gmail.com',
    password: 'Elpaquetero2026@'
  });

  if (authError) {
    console.warn('⚠️ No se pudo autenticar usuario admin:', authError.message);
  } else {
    console.log('✓ Autenticado correctamente como Admin!');
  }

  console.log('🚀 Upserting 9 nuevas camperas a Supabase DB...');
  const { data, error } = await supabase.from('products').upsert(newCamperas);
  if (error) {
    console.error('❌ Error guardando en Supabase:', error.message);
  } else {
    console.log('✅ ¡Las 9 camperas fueron guardadas/actualizadas exitosamente en la base de datos de Supabase!');
  }
}

seed();
