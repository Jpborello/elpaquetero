-- Tabla para guardar Categorías y Subcategorías en Supabase

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) y dar acceso público de lectura y escritura
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de categorias" 
  ON categories FOR SELECT USING (true);

CREATE POLICY "Permitir insercion/actualizacion publica de categorias" 
  ON categories FOR ALL USING (true);
