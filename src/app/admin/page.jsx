'use client';

import { useState, useEffect } from 'react';
import { dataStore } from '@/lib/dataStore';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabsNav from '@/components/admin/AdminTabsNav';
import MetricsTab from '@/components/admin/MetricsTab';
import StockTab from '@/components/admin/StockTab';
import PricesTab from '@/components/admin/PricesTab';
import ImagesTab from '@/components/admin/ImagesTab';
import OrdersTab from '@/components/admin/OrdersTab';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics', 'stock', 'prices', 'images', 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchFilter, setSearchFilter] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  
  // Mercado Pago Transfers State
  const [mpTransfers, setMpTransfers] = useState([]);
  const [mpConfigured, setMpConfigured] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);

  const fetchMpTransfers = async () => {
    setMpLoading(true);
    try {
      const res = await fetch('/api/mercadopago/transfers');
      const data = await res.json();
      if (data.success) {
        setMpTransfers(data.transfers || []);
        setMpConfigured(data.configured || false);
      }
    } catch (e) {
      console.error('Error fetching MP transfers:', e);
    } finally {
      setMpLoading(false);
    }
  };

  useEffect(() => {
    const updateState = () => {
      setProducts(dataStore.getProducts());
      setOrders(dataStore.orders);
      setMetrics(dataStore.getMetrics());
    };

    updateState();
    fetchMpTransfers();
    const unsubscribe = dataStore.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const handleStockUpdate = (id, newStock) => {
    dataStore.updateStock(id, newStock);
    showNotification('Stock actualizado correctamente');
  };

  const handlePriceUpdate = (id, price, wholesalePrice) => {
    dataStore.updatePrice(id, price, wholesalePrice);
    showNotification('Precios actualizados correctamente');
  };

  const handleImageUpdate = (id, newImageUrl) => {
    dataStore.updateProduct(id, { image_url: newImageUrl });
    showNotification('Imagen de producto actualizada');
  };

  const showNotification = (msg) => {
    setEditSuccessMsg(msg);
    setTimeout(() => setEditSuccessMsg(''), 3000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="admin-layout">
      {/* Header Admin */}
      <AdminHeader />

      {/* Notification toast */}
      {editSuccessMsg && (
        <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: 700 }}>
          ✓ {editSuccessMsg}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <AdminTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Contents */}
      {activeTab === 'metrics' && (
        <MetricsTab metrics={metrics} />
      )}

      {activeTab === 'stock' && (
        <StockTab 
          products={filteredProducts}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onUpdateStock={handleStockUpdate}
        />
      )}

      {activeTab === 'prices' && (
        <PricesTab 
          products={filteredProducts}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onUpdatePrice={handlePriceUpdate}
        />
      )}

      {activeTab === 'images' && (
        <ImagesTab 
          products={filteredProducts}
          onUpdateImage={handleImageUpdate}
        />
      )}

      {activeTab === 'orders' && (
        <OrdersTab 
          orders={orders}
          mpTransfers={mpTransfers}
          mpConfigured={mpConfigured}
          mpLoading={mpLoading}
          onFetchMpTransfers={fetchMpTransfers}
        />
      )}
    </div>
  );
}
