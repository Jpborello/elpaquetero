const supabaseUrl = 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaXBldWphZmp3aHFqb2Jjanp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg3ODQwNywiZXhwIjoyMTAxNDU0NDA3fQ.joDHBlItgWPcdRMeSAnoRs4c7R-UKmshwQwrcP5dPgk';

const perfumeriaCategory = {
  id: 'Perfumeria',
  name: 'Perfumería',
  subcategories: ['Perfumes y Cremas']
};

const calcRetail = (wholesale) => Math.round(wholesale * 1.40);

const perfumeriaProducts = [
  {
    id: 'p-4001',
    name: 'Mascarilla Karseell',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 10000,
    price: calcRetail(10000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/4001_MASCARILLA_KARSEELL.webp',
    description: 'Mascarilla capilar nutritiva Karseell para tratamiento intensivo.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-4002',
    name: 'Matizadora Karseell',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 10000,
    price: calcRetail(10000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/4002_MATIZADORA_KARSEELL.webp',
    description: 'Crema matizadora capilar Karseell profesional.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5000',
    name: 'Perfume Eclaire 30 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 7500,
    price: calcRetail(7500),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5000_PERFUME_ECLAIRE_30_ML.webp',
    description: 'Perfume Eclaire de 30 ml con fragancia duradera.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5001',
    name: 'Perfume Odyssey Artisto 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 21000,
    price: calcRetail(21000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5001_PERFUME_ODYSSEY_ARTISTO_100_ML.webp',
    description: 'Perfume de lujo Odyssey Artisto 100 ml.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-5002',
    name: 'Perfume Odyssey Mega 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 21000,
    price: calcRetail(21000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5002_PERFUME_ODYSSEY_MEGA_100_ML.webp',
    description: 'Fragancia intensa Perfume Odyssey Mega 100 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5003',
    name: 'Perfume Broken Love 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 9000,
    price: calcRetail(9000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5003_PERFUME_BROKEN_LOVE_100_ML.webp',
    description: 'Perfume Broken Love de 100 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5004',
    name: 'Perfume Give Me Berry On Top 75 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 21000,
    price: calcRetail(21000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5004_PERFUME_GIVE_ME_BERRY_ON_TOP_75ML.webp',
    description: 'Fragancia frutal Give Me Berry On Top 75 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5005',
    name: 'Perfume Give Me Vanilla Freak 75 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 21000,
    price: calcRetail(21000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5005_PERFUME_GIVE_ME_VANILLA_FREAK_75ML.webp',
    description: 'Fragancia dulzona Give Me Vanilla Freak 75 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5006',
    name: 'Perfume Yara Candy 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 21000,
    price: calcRetail(21000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5006_PERFUME_YARA_CANDY_100ML.webp',
    description: 'Perfume árabe Yara Candy de 100 ml.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-5007',
    name: 'Perfume Yara 50 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 9000,
    price: calcRetail(9000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5007_PERFUME_YARA_50ML.webp',
    description: 'Perfume árabe Yara de 50 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5008',
    name: 'Perfume Odyssey Dubai Chocolat',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 28000,
    price: calcRetail(28000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5008_PERFUME_ODYSSEY_DUBAI_CHOCOLAT.webp',
    description: 'Exclusiva fragancia Odyssey Dubai Chocolat.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5009',
    name: 'Perfume Fame And Fortune 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 28000,
    price: calcRetail(28000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5009_PERFUME_FAME_AND_FORTUNE_100ML.webp',
    description: 'Perfume elegante Fame And Fortune 100 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5010',
    name: 'Perfume Yara 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 28000,
    price: calcRetail(28000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5010_PERFUME_YARA_100ML.webp',
    description: 'Perfume clásico Yara 100 ml.',
    is_offer: false,
    is_top_seller: true
  },
  {
    id: 'p-5011',
    name: 'Perfume Hawas Pink 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 28000,
    price: calcRetail(28000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5011_PERFUME_HAWAS_PINK_100ML.webp',
    description: 'Perfume Hawas Pink 100 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5012',
    name: 'Perfume Lintordiet 105 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 28000,
    price: calcRetail(28000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5012_PERFUME_LINTORDIET_105ML.webp',
    description: 'Perfume Lintordiet 105 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5013',
    name: 'Perfume Bonita 100 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 25000,
    price: calcRetail(25000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5013_PERFUME_BONITA_100ML.webp',
    description: 'Perfume Bonita 100 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5014',
    name: 'Perfume Ameerat Al Arab 30 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 18500,
    price: calcRetail(18500),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5014_PERFUME_AMEERAT_AL_ARAB_30ML.webp',
    description: 'Perfume oriental Ameerat Al Arab 30 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5015',
    name: 'Perfume Lady Milion 80 ml',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 25000,
    price: calcRetail(25000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5015_PERFUME_LADY_MILION_80ML.webp',
    description: 'Perfume sofisticado Lady Milion 80 ml.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-5016',
    name: 'Perfume Eclaiire',
    category: 'Perfumería',
    subcategory: 'Perfumes y Cremas',
    wholesale_price: 25000,
    price: calcRetail(25000),
    stock: 50,
    sales_count: 0,
    image_url: 'https://pgipeujafjwhqjobcjzw.supabase.co/storage/v1/object/public/Productos/Perfumeria/5016_PERFUME_ECLAIIRE.webp',
    description: 'Perfume Eclaiire de alta fijación.',
    is_offer: false,
    is_top_seller: false
  }
];

async function seed() {
  console.log('Upserting categoría Perfumería via Service Role REST API...');
  const catRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify([perfumeriaCategory])
  });

  if (!catRes.ok) {
    console.error('Error insertando categoría:', await catRes.text());
  } else {
    console.log('✓ Categoría Perfumería insertada en Supabase.');
  }

  console.log('Upserting 19 productos de Perfumería via Service Role REST API con precios actualizados...');
  const prodRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(perfumeriaProducts)
  });

  if (!prodRes.ok) {
    console.error('Error insertando productos:', await prodRes.text());
  } else {
    console.log('✓ ¡19 Productos de Perfumería insertados y actualizados con éxito en Supabase!');
  }
}

seed().catch(console.error);
