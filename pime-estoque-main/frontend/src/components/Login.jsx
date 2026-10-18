import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package2,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    // A autenticação ainda não está conectada à API. Este retorno é apenas visual.
    window.setTimeout(() => {
      setLoading(false);
      setMessage('A tela está pronta, mas o login ainda precisa ser conectado à API.');
    }, 600);
  }

  function showDemoMessage(text) {
    setMessage(text);
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-top" aria-hidden="true" />
      <div className="login-glow login-glow-bottom" aria-hidden="true" />
      <div className="login-glow login-glow-center" aria-hidden="true" />

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="login-brand-icon"><Package2 size={27} strokeWidth={1.8} /></div>
          <div className="login-brand-name">MG <span>Manager</span></div>
          <p>GESTÃO INTELIGENTE DE ESTOQUE</p>
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">ACESSO AO SISTEMA</span>
          
          <p>Entre com suas credenciais para continuar.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">E-mail</label>
            <div className="login-input-wrap">
              <Mail className="login-input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                placeholder="voce@empresa.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-label-row">
              <label htmlFor="login-password">Senha</label>
              <button
                className="login-text-button"
                type="button"
                onClick={() => showDemoMessage('A recuperação de senha será disponibilizada quando a API estiver integrada.')}
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="login-input-wrap">
              <LockKeyhole className="login-input-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="login-password-toggle"
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Lembrar de mim</span>
            </label>
            <span className="login-secure-label"><ShieldCheck size={15} /> Ambiente seguro</span>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="login-spinner" size={19} /> : <span>Entrar no sistema</span>}
            {!loading && <ArrowRight size={19} className="login-submit-arrow" />}
            {loading && <span>Verificando...</span>}
          </button>

          <div className="login-divider"><span>ou</span></div>

          <a href="/registrar" className="login-register-button">
            Criar conta
          </a>

          {message && (
            <div className="login-feedback" role="status">
              <CheckCircle2 size={17} /> <span>{message}</span>
            </div>
          )}
        </form>

        <footer className="login-footer">
          <ShieldCheck size={15} />
          <span>Seus dados merecem segurança.</span>
        </footer>
      </section>
      <p className="login-copyright">© {new Date().getFullYear()} MG Manager · Sistema de gestão de estoque</p>
    </main>
  );
}