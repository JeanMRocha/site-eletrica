import { useState, useMemo } from 'react';
import { materialCatalog } from '../../domain/material-catalog';
import './catalogo.css';

export function CatalogoMateriaisFeature() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    return Array.from(new Set(materialCatalog.map(m => m.category))).sort();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    return materialCatalog.filter(item => {
      const matchesSearch = query === '' || 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <section className="catalog-page page-transition">
      <article className="panel catalog-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Catálogo global</p>
            <h1>Materiais e Insumos</h1>
          </div>
          <div className="row">
             <span className="muted size-sm">{filteredItems.length} itens</span>
          </div>
        </div>

        <div className="catalog-toolbar row">
          <label className="search-field flex-grow">
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               placeholder="Pesquisar material..." 
               type="search"
             />
          </label>
          <label className="filter-field">
            <select value={category} onChange={e => setCategory(e.target.value)}>
               <option value="all">Todas as Categorias</option>
               {categories.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
            </select>
          </label>
        </div>

        <div className="table-wrap scroll-thin">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Item</th>
                <th>Unidade</th>
                <th style={{ textAlign: 'right' }}>Preço Base</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="center muted" style={{ padding: '40px' }}>
                    Nenhum item encontrado no catálogo.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td><span className="badge info">{item.category}</span></td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.unit}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
