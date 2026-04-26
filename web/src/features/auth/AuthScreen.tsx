import { useState } from 'react';
import { findUserByEmail, registerUser, createSessionFromUser, type UserProfile } from '../../domain/auth';
import { notify } from '../../lib/events';
import './auth.css';

type AuthScreenProps = {
  onLoginSuccess: () => void;
};

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      notify({ type: 'warning', title: 'E-mail inválido', message: 'Por favor, insira um e-mail válido.' });
      return;
    }

    setLoading(true);
    // Simulação de delay de rede
    setTimeout(() => {
      const found = findUserByEmail(email);
      setUser(found);
      setStep('password');
      setLoading(false);
    }, 600);
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 4) {
      notify({ type: 'warning', title: 'Senha curta', message: 'A senha deve ter pelo menos 4 caracteres.' });
      return;
    }

    if (user) {
      // Login
      if (user.passwordHash === password) {
        createSessionFromUser(user);
        notify({ type: 'success', title: 'Bem-vindo de volta!', message: 'Login realizado com sucesso.' });
        onLoginSuccess();
      } else {
        notify({ type: 'error', title: 'Erro de acesso', message: 'Senha incorreta.' });
      }
    } else {
      // Registro
      const newUser = registerUser(email, password);
      createSessionFromUser(newUser);
      notify({ type: 'success', title: 'Conta criada!', message: 'Seu cadastro foi realizado e você já pode acessar.' });
      onLoginSuccess();
    }
  }

  return (
    <main className="auth-shell page-transition">
      <section className="auth-card glass-panel">
        <div className="auth-brand">
          <div className="logo-circ">ZF</div>
          <p className="eyebrow">Plataforma Engenharia</p>
        </div>

        <div className="auth-copy">
          <h1>{step === 'email' ? 'Acessar Terminal' : user ? 'Confirmar Identidade' : 'Criar Nova Conta'}</h1>
          <p className="muted">
            {step === 'email' 
              ? 'Insira seu e-mail para identificação no sistema.' 
              : user 
                ? `Olá, reconhecemos seu acesso (${email}). Digite sua senha.`
                : 'Não encontramos sua conta. Crie uma senha para começar.'}
          </p>
        </div>

        {step === 'email' ? (
          <form className="auth-form stack" onSubmit={handleEmailNext}>
            <label className="stack tight">
              <span>E-mail Corporativo</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="exemplo@empresa.com"
                autoFocus
                required
              />
            </label>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form className="auth-form stack" onSubmit={handleFinalSubmit}>
            <label className="stack tight">
              <span>{user ? 'Senha de Acesso' : 'Defina sua Senha'}</span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                autoFocus
                required
              />
            </label>
            <div className="row spread">
              <button className="text-btn size-xs" type="button" onClick={() => setStep('email')}>
                Voltar
              </button>
              <button className="button" type="submit">
                {user ? 'Entrar' : 'Cadastrar e Entrar'}
              </button>
            </div>
          </form>
        )}
      </section>
      
      <footer className="auth-footer center">
        <p className="muted size-xs">Consolidação Elétrica Profissional &copy; 2026</p>
      </footer>
    </main>
  );
}
