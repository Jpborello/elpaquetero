-- Habilitar visibilidad pública y políticas de acceso para el Bucket 'Productos' en Supabase Storage

-- 0. Hacer el Bucket 'Productos' público para servir imágenes CDN sin bloqueos
UPDATE storage.buckets SET public = true WHERE id = 'Productos' OR id = 'productos';

-- 1. Política de Lectura Pública (Permite a cualquier cliente ver las fotos del catálogo)
CREATE POLICY "Public Access Select Productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'Productos');

-- 2. Política de Subida Pública (Permite al script subir imágenes WebP a las carpetas)
CREATE POLICY "Public Access Insert Productos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Productos');

-- 3. Política de Actualización Pública
CREATE POLICY "Public Access Update Productos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'Productos')
WITH CHECK (bucket_id = 'Productos');
