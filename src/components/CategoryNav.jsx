'use client';

export default function CategoryNav({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory 
}) {
  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div id="catalogo" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Nuestras Categorías Mayoristas</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Mostrando productos de alta calidad
        </span>
      </div>

      {/* Main Categories Bar */}
      <div className="category-bar-wrapper">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(cat.id);
              onSelectSubcategory(null);
            }}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategories Bar */}
      {activeCategoryObj && activeCategoryObj.subcategories && (
        <div className="subcategory-bar">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '6px' }}>
            Subcategorías:
          </span>
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`subcat-chip ${selectedSubcategory === null ? 'active' : ''}`}
          >
            Todas
          </button>
          {activeCategoryObj.subcategories.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSubcategory(sub)}
              className={`subcat-chip ${selectedSubcategory === sub ? 'active' : ''}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
