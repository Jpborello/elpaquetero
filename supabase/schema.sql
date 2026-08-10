-- ============================================================================
-- ESQUEMA SQL PARA SUPABASE — EL PAQUETERO E-COMMERCE MAYORISTA
-- ============================================================================

-- 1. Tabla de Clientes Mayoristas
CREATE TABLE IF NOT EXISTS public.wholesale_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    dni TEXT,
    phone TEXT UNIQUE NOT NULL,
    locality TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subcategories JSONB DEFAULT '[]'::jsonb
);

-- 3. Tabla de Productos & Catálogo
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price NUMERIC NOT NULL,
    wholesale_price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_offer BOOLEAN DEFAULT false,
    is_top_seller BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Órdenes y Pedidos Mayoristas
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_dni TEXT,
    client_locality TEXT,
    delivery_method TEXT,
    receipt_url TEXT,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'completado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Arqueo de Caja & Movimientos
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC NOT NULL,
    concept TEXT NOT NULL,
    period_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Políticas de Seguridad (RLS - Row Level Security)
ALTER TABLE public.wholesale_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Público de Lectura e Inserción
CREATE POLICY "Public products read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public categories read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public orders insert access" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public orders read access" ON public.orders FOR SELECT USING (true);
