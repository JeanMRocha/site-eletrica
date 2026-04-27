import { useEffect, useState } from 'react';
import { listKnowledge, type KnowledgeEntry } from '../../domain/knowledge';

export function KnowledgeFeature() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listKnowledge().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const categories: Record<KnowledgeEntry['category'], { label: string; icon: string; color: string }> = {
    landmark: { label: 'Marco Arquitetônico', icon: '🏛️', color: 'var(--accent)' },
    constraint: { label: 'Restrição Técnica', icon: '⚖️', color: 'var(--danger)' },
    skill: { label: 'Habilidade Técnica', icon: '🛠️', color: 'var(--warning)' }
  };

  return (
    <section className="knowledge-page page-transition">
      <header className="page-header">
        <div className="title-block">
          <p className="eyebrow">Projeto Inteligente</p>
          <h1>Memória Orientada a Modelos (MOM)</h1>
        </div>
        <div className="header-actions">
          <button className="button primary">Nova Memória</button>
        </div>
      </header>

      {loading ? (
        <div className="panel center">Carregando inteligência...</div>
      ) : entries.length === 0 ? (
        <div className="panel center muted">
          <p>Nenhuma memória encontrada no repositório.</p>
          <p className="size-xs">Comece codificando sua primeira norma ou decisão técnica em .mom/</p>
        </div>
      ) : (
        <div className="knowledge-grid">
          {entries.map(entry => (
            <article key={entry.id} className="knowledge-card glass-panel">
              <header className="card-header">
                <span className="category-tag" style={{ color: categories[entry.category].color }}>
                  {categories[entry.category].icon} {categories[entry.category].label}
                </span>
                <span className="status-tag">{entry.status}</span>
              </header>
              <h2>{entry.title}</h2>
              <p>{entry.content}</p>
              <footer className="card-footer">
                <div className="tag-list">
                  {entry.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <time>{new Date(entry.createdAt).toLocaleDateString()}</time>
              </footer>
            </article>
          ))}
        </div>
      )}

      <aside className="knowledge-sidebar">
        <div className="panel info">
          <h3>Sobre o MOM</h3>
          <p>O MOM (Memory Oriented Machine) é o sistema de memória persistente do projeto. Ele armazena decisões críticas e normas técnicas diretamente no repositório.</p>
          <ul className="size-xs muted">
            <li><strong>Constraints</strong>: Regras da NBR 5410.</li>
            <li><strong>Landmarks</strong>: Decisões de design de software.</li>
            <li><strong>Skills</strong>: Como realizar cálculos técnicos.</li>
          </ul>
        </div>
      </aside>

      <style>{`
        .knowledge-page {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--s-lg);
          padding: var(--s-lg);
          height: 100%;
          overflow: hidden;
        }
        .knowledge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--s-md);
          overflow-y: auto;
          padding-right: var(--s-md);
        }
        .knowledge-card {
          display: flex;
          flex-direction: column;
          gap: var(--s-md);
          padding: var(--s-md);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .category-tag {
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-tag {
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: var(--r-pill);
          color: var(--text-muted);
        }
        .knowledge-card h2 {
          font-size: 1.1rem;
          margin: 0;
        }
        .knowledge-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          flex: 1;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--line);
          padding-top: var(--s-md);
        }
        .tag-list {
          display: flex;
          gap: 8px;
        }
        .tag {
          font-size: 0.7rem;
          color: var(--accent);
        }
        time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .knowledge-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--s-md);
        }
      `}</style>
    </section>
  );
}
