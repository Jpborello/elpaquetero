-- Esquema de la tabla 'orders' en Supabase para registrar los pedidos y comprobantes de pago

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_dni TEXT,
  client_locality TEXT,
  delivery_method TEXT,
  receipt_url TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb,
  raffle_tickets JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS y políticas de acceso libre para lectura e inserción de pedidos
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);
