'use client';

import { useMemo, useState } from 'react';
import { PackagePlus, UploadCloud, Loader2, CheckCircle2, X, Plus, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { compressImage } from '@/lib/compressImage';
import { getProductUrlPath } from '@/lib/productSlug';

const EMPTY_FORM = {
  name: '',
  category: '',
  subcategory: '',
  wholesale_price: '',
  price: '',
  description: '',
  stock: '',
  is_offer: false,
  is_new: true
};

export default function NewProductTab({ categories, products, onCreateProduct }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sizes, setSizes] = useState([]);
  const [stockPerSize, setStockPerSize] = useState({});
  const [colors, setColors] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newSizeStock, setNewSizeStock] = useState('20');
  const [newColor, setNewColor] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdProduct, setCreatedProduct] = useState(null);

  const realCategories = useMemo(
    () => (categories || []).filter((c) => c.id !== 'all' && !String(c.id).startsWith('_config_')),
    [categories]
  );

  const subcatsForSelected = useMemo(() => {
    const cat = realCategories.find((c) => c.name === form.category || c.id === form.category);
    return cat?.subcategories || [];
  }, [realCategories, form.category]);

  // Próximo código que asignaría el backend (solo para mostrar de referencia).
  const nextCodePreview = useMemo(() => {
    const maxNumeric = (products || []).reduce((max, p) => {
      const n = parseInt(p.code, 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    return String(maxNumeric + 1).padStart(4, '0');
  }, [products]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddSize = () => {
    const trimmed = newSize.trim();
    if (!trimmed || sizes.includes(trimmed)) return;
    setSizes((prev) => [...prev, trimmed]);
    setStockPerSize((prev) => ({ ...prev, [trimmed]: parseInt(newSizeStock, 10) || 0 }));
    setNewSize('');
    setNewSizeStock('20');
  };

  const handleRemoveSize = (size) => {
    setSizes((prev) => prev.filter((s) => s !== size));
    setStockPerSize((prev) => {
      const next = { ...prev };
      delete next[size];
      return next;
    });
  };

  const handleAddColor = () => {
    const trimmed = newColor.trim();
    if (!trimmed || colors.includes(trimmed)) return;
    setColors((prev) => [...prev, trimmed]);
    setNewColor('');
  };

  const handleRemoveColor = (color) => {
    setColors((prev) => prev.filter((c) => c !== color));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file || !supabase) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadInfo('');

    try {
      const originalKb = Math.round(file.size / 1024);
      const { blob, compressed } = await compressImage(file);
      const finalKb = Math.round(blob.size / 1024);

      const safeName = (form.name || 'nuevo').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'nuevo';
      const filePath = `admin-uploads/nuevo-${safeName}-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage.from('Productos').upload(filePath, blob, {
        upsert: true,
        contentType: 'image/webp'
      });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('Productos').getPublicUrl(filePath);
      setImageUrl(urlData.publicUrl);
      setUploadInfo(compressed ? `Convertida a WebP: ${originalKb} KB → ${finalKb} KB` : `Subida (${finalKb} KB)`);
    } catch (err) {
      setErrorMsg('No se pudo subir la foto: ' + (err.message || 'error desconocido'));
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSizes([]);
    setStockPerSize({});
    setColors([]);
    setNewSize('');
    setNewSizeStock('20');
    setNewColor('');
    setImageUrl('');
    setUploadInfo('');
    setErrorMsg('');
  };

  const totalStock = sizes.length > 0
    ? Object.values(stockPerSize).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : (parseInt(form.stock, 10) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCreatedProduct(null);

    if (!form.name.trim()) return setErrorMsg('Poné el nombre del producto.');
    if (!form.category.trim()) return setErrorMsg('Elegí una categoría.');
    if (!(parseFloat(form.wholesale_price) > 0)) return setErrorMsg('Poné un precio mayorista válido.');
    if (!imageUrl) return setErrorMsg('Subí una foto del producto.');

    setIsSaving(true);
    try {
      const created = await onCreateProduct({
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        wholesale_price: parseFloat(form.wholesale_price) || 0,
        price: parseFloat(form.price) || parseFloat(form.wholesale_price) || 0,
        stock: parseInt(form.stock, 10) || 0,
        description: form.description,
        colors,
        sizes,
        stock_per_size: stockPerSize,
        is_offer: form.is_offer,
        is_new: form.is_new,
        image_url: imageUrl
      });
      setCreatedProduct(created || null);
      resetForm();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackagePlus size={22} style={{ color: '#2563EB' }} /> Crear Producto Nuevo
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Cargá un artículo desde cero: se le asigna un código solo (el próximo sería <strong>{nextCodePreview}</strong>), la foto se convierte a WebP automáticamente y queda publicado en la web al instante.
        </p>
      </div>

      {createdProduct && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <CheckCircle2 size={20} />
          <span>
            ¡Producto <strong>{createdProduct.name}</strong> creado! Código asignado: <strong>{createdProduct.code}</strong>.
          </span>
          {createdProduct.id && !String(createdProduct.id).startsWith('p-temp') && (
            <a href={getProductUrlPath(createdProduct)} target="_blank" rel="noreferrer" style={{ color: '#065F46', textDecoration: 'underline', fontWeight: 800 }}>
              Ver en la web →
            </a>
          )}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Columna 1: datos básicos */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Datos del producto</h3>

          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input type="text" className="form-input" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ej: Campera Inflable Dama" required />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <select className="form-input" value={form.category} onChange={(e) => { setField('category', e.target.value); setField('subcategory', ''); }} required>
              <option value="">Elegir categoría…</option>
              {realCategories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subcategoría</label>
            <select className="form-input" value={form.subcategory} onChange={(e) => setField('subcategory', e.target.value)} disabled={!form.category}>
              <option value="">{form.category ? 'Sin subcategoría' : 'Elegí primero una categoría'}</option>
              {subcatsForSelected.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ¿Falta una categoría o subcategoría? Creala en la pestaña “Categorías & Subcategorías”.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Precio mayorista *</label>
              <input type="number" min="0" className="form-input" value={form.wholesale_price} onChange={(e) => setField('wholesale_price', e.target.value)} placeholder="9500" required />
            </div>
            <div className="form-group">
              <label className="form-label">Precio lista</label>
              <input type="number" min="0" className="form-input" value={form.price} onChange={(e) => setField('price', e.target.value)} placeholder="(igual al mayorista)" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Detalle breve del producto, calidad, rango de talles…" />
          </div>

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_offer} onChange={(e) => setField('is_offer', e.target.checked)} /> En oferta
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_new} onChange={(e) => setField('is_new', e.target.checked)} /> Nuevo ingreso
            </label>
          </div>
        </div>

        {/* Columna 2: foto + talles + colores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Foto */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0' }}>Foto *</h3>
            {imageUrl && (
              <img src={imageUrl} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '12px', border: '1px solid var(--border-color)' }} />
            )}
            <label htmlFor="new-product-image" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '0.85rem', cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? <Loader2 size={15} className="spin" /> : <UploadCloud size={15} />}
              {isUploading ? 'Subiendo y convirtiendo…' : (imageUrl ? 'Cambiar foto' : 'Subir foto')}
            </label>
            <input id="new-product-image" type="file" accept="image/*" onChange={handleFileSelect} disabled={isUploading} style={{ display: 'none' }} />
            {uploadInfo && (
              <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                <CheckCircle2 size={13} /> {uploadInfo}
              </p>
            )}
          </div>

          {/* Talles */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>Talles y stock por talle</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Si no agregás talles se vende como talle único. Stock total: <strong>{totalStock} un.</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {sizes.map((s) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700 }}>
                  {s} · {stockPerSize[s] ?? 0} un.
                  <button type="button" onClick={() => handleRemoveSize(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', padding: 0 }}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Talle (ej: M o 3)" value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }} className="form-input" style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }} />
              <input type="number" placeholder="Stock" value={newSizeStock} onChange={(e) => setNewSizeStock(e.target.value)} className="form-input" style={{ width: '80px', padding: '7px 10px', fontSize: '0.85rem' }} />
              <button type="button" onClick={handleAddSize} className="btn-secondary" style={{ padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Agregar
              </button>
            </div>

            {sizes.length === 0 && (
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Stock (talle único)</label>
                <input type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setField('stock', e.target.value)} placeholder="0" />
              </div>
            )}
          </div>

          {/* Colores */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>Colores</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Si lo dejás vacío, la web usa los colores por defecto de la categoría.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {colors.map((c) => (
                <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700 }}>
                  {c}
                  <button type="button" onClick={() => handleRemoveColor(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', padding: 0 }}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Color (ej: Turquesa)" value={newColor} onChange={(e) => setNewColor(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }} className="form-input" style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }} />
              <button type="button" onClick={handleAddColor} className="btn-secondary" style={{ padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>

          <button type="submit" disabled={isSaving || isUploading} className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800, opacity: (isSaving || isUploading) ? 0.7 : 1 }}>
            {isSaving ? <Loader2 size={17} className="spin" /> : <Save size={17} />}
            {isSaving ? 'Creando producto…' : 'Crear y publicar producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
