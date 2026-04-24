import { materialCatalog } from '../../domain/material-catalog';
import './catalogo.css';

export function CatalogoMateriaisFeature() {
  return (
    <section className="catalog-page">
      <article className="panel catalog-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Catálogo global</p>
            <h1>Materiais</h1>
          </div>
        </div>

        <table className="catalog-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Item</th>
              <th>Unidade</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {materialCatalog.map((item) => (
              <tr key={item.id}>
                <td>{item.category}</td>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
