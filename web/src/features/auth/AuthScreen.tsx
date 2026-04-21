import type { Session } from '../../domain/workspace';
import './auth.css';

type AuthScreenProps = {
  draft: Session;
  onChange: (next: Session) => void;
  onSubmit: () => void;
};

export function AuthScreen({ draft, onChange, onSubmit }: AuthScreenProps) {
  return (
    <main className="auth-shell auth-feature">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Login simulado</p>
          <h1>Dimensionamento elétrico por consolidação.</h1>
          <p>Entre para acompanhar o projeto em abas, sem expor telas de cadastro como navegação principal.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label>
            Nome
            <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} />
          </label>
          <label>
            Imagem
            <input value={draft.image} onChange={(event) => onChange({ ...draft, image: event.target.value })} />
          </label>
          <button className="button" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
