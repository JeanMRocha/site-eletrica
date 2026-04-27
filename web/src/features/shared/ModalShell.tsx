import type { ReactNode } from 'react';
import '../../lib/styles/modal.css';

type ModalShellProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  className?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function ModalShell({ open, title, subtitle, className = '', onClose, children, footer }: ModalShellProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        aria-label={title}
        className={`modal-shell ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Edição guiada</p>
            <h2>{title}</h2>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer ? <div className="modal-footer">{footer}</div> : null}
      </section>
    </div>
  );
}
