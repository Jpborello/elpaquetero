-- Habilitar permisos de consulta, inserción, actualización y eliminación pública para la tabla 'products' en Supabase

CREATE POLICY "Allow public select on products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on products"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on products"
ON public.products FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on products"
ON public.products FOR DELETE
USING (true);
