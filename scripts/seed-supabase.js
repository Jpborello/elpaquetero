const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_PRODUCTS = [
  {
    id: 'p-1',
    name: 'Campera de AFA Selección Oficial',
    category: 'Camperas',
    subcategory: 'Deportivas',
    price: 35000,
    wholesale_price: 29900,
    stock: 85,
    sales_count: 340,
    image_url: '/elpaquetero_imagenes/Camperas/campera de Afa.jpg',
    description: 'Campera oficial de la Selección Argentina con tecnología frizada.',
    is_offer: true,
    is_top_seller: true
  },
  {
    id: 'p-2',
    name: 'Buzo The North Face Hooded',
    category: 'Buzos',
    subcategory: 'Urbano',
    price: 22000,
    wholesale_price: 18500,
    stock: 45,
    sales_count: 210,
    image_url: '/elpaquetero_imagenes/Buzos/buzo the north Face N.jpg',
    description: 'Buzo frizado canguro marca The North Face con capucha.',
    is_offer: false,
    is_top_seller: false
  },
  {
    id: 'p-9',
    name: 'Gorra Urbana Curva Varios Colores',
    category: 'Gorras',
    subcategory: 'Accesorios',
    price: 7500,
    wholesale_price: 5500,
    stock: 130,
    sales_count: 410,
    image_url: '/elpaquetero_imagenes/Gorras.jpg',
    description: 'Gorra gabardina de algodón con hebilla metálica de ajuste trasera.',
    is_offer: true,
    is_top_seller: true
  }
];

async function seed() {
  console.log('Seeding Supabase database...');
  const { data, error } = await supabase.from('products').upsert(INITIAL_PRODUCTS);
  if (error) {
    console.error('Error seeding products:', error.message);
  } else {
    console.log('Products seeded successfully to Supabase!');
  }
}

seed();
