import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgipeujafjwhqjobcjzw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, id, updates, productsList } = body;

    if (action === 'updateProduct') {
      if (!id || !updates) {
        return NextResponse.json({ error: 'Faltan parámetros id o updates' }, { status: 400 });
      }

      const { code, ...dbFields } = updates;

      const { data, error } = await supabaseAdmin
        .from('products')
        .update(dbFields)
        .eq('id', id)
        .select();

      if (error) {
        console.error('API Admin Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'deleteProduct') {
      if (!id) {
        return NextResponse.json({ error: 'Falta el id del producto' }, { status: 400 });
      }

      // Traemos la fila primero para poder borrar también su foto del storage
      // si era una subida nuestra (admin-uploads dentro del bucket Productos).
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id, image_url')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('API Admin Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const imgUrl = existing?.image_url || '';
      if (imgUrl.includes('/Productos/admin-uploads/')) {
        try {
          const storagePath = decodeURIComponent(imgUrl.split('/Productos/')[1] || '');
          if (storagePath) {
            await supabaseAdmin.storage.from('Productos').remove([storagePath]);
          }
        } catch (e) {
          console.warn('No se pudo borrar la foto del storage:', e);
        }
      }

      return NextResponse.json({ success: true, id });
    }

    if (action === 'createProduct') {
      const { product } = body;
      if (!product || !product.name) {
        return NextResponse.json({ error: 'Faltan datos del producto (al menos el nombre)' }, { status: 400 });
      }

      // Código correlativo automático: toma el número más alto ya usado en la
      // base y asigna el siguiente con 4 dígitos, saltando los que ya existan
      // (mismo criterio que la carga masiva). Si el admin mandó un código a
      // mano se respeta, salvo que ya esté en uso.
      const { data: existingRows, error: fetchErr } = await supabaseAdmin
        .from('products')
        .select('id, code');
      if (fetchErr) {
        console.error('API Admin Create fetch codes error:', fetchErr);
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      const usedCodes = new Set((existingRows || []).map((r) => (r.code || '').trim()).filter(Boolean));
      const usedIds = new Set((existingRows || []).map((r) => r.id));

      let code = (product.code || '').toString().trim();
      if (!code || usedCodes.has(code)) {
        let next = (existingRows || []).reduce((max, r) => {
          const n = parseInt(r.code, 10);
          return Number.isFinite(n) && n > max ? n : max;
        }, 0) + 1;
        let candidate = String(next).padStart(4, '0');
        while (usedCodes.has(candidate)) {
          next += 1;
          candidate = String(next).padStart(4, '0');
        }
        code = candidate;
      }

      let id = (product.id || `p-${code}`).toString().trim();
      if (usedIds.has(id)) id = `p-${code}-${Date.now()}`;

      const sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
      const stockPerSize = product.stock_per_size && typeof product.stock_per_size === 'object' ? product.stock_per_size : {};
      const cleanStockPerSize = {};
      sizes.forEach((s) => { cleanStockPerSize[s] = Number(stockPerSize[s]) || 0; });

      const totalFromSizes = Object.values(cleanStockPerSize).reduce((sum, n) => sum + (Number(n) || 0), 0);
      const stock = sizes.length > 0 ? totalFromSizes : (Number(product.stock) || 0);

      const wholesale_price = Number(product.wholesale_price) || 0;
      const price = Number(product.price) || wholesale_price;

      const row = {
        id,
        code,
        name: (product.name || '').trim(),
        category: (product.category || 'General').trim(),
        subcategory: (product.subcategory || '').trim() || null,
        price,
        wholesale_price,
        stock,
        sales_count: 0,
        image_url: (product.image_url || '').trim() || '/elpaquetero_imagenes/Logo 2.jpeg',
        description: (product.description || '').trim() || null,
        colors: Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : null,
        sizes: sizes.length > 0 ? sizes : null,
        stock_per_size: sizes.length > 0 ? cleanStockPerSize : null,
        is_offer: Boolean(product.is_offer),
        is_new: Boolean(product.is_new),
        is_top_seller: false,
        is_featured: false,
        is_active: true
      };

      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(row)
        .select();

      if (error) {
        console.error('API Admin Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'upsertProducts') {
      if (!Array.isArray(productsList) || productsList.length === 0) {
        return NextResponse.json({ error: 'Lista de productos vacía' }, { status: 400 });
      }

      const cleanedList = productsList.map(({ sizes, stock_per_size, code, ...dbFields }) => dbFields);

      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(cleanedList, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('API Admin Upsert Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err) {
    console.error('API Admin Products Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
