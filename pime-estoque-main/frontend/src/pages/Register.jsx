import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package2,
  ShieldCheck,
  LoaderCircle,
  ArrowLeft,
  UserRound,
} from 'lucide-react';
import { api } from '../services/api';
import './Login.css';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text }
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    if (password.length < 8 || password.length > 72) {
      setFeedback({ type: 'error', text: 'A senha deve ter de 8 a 72 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);

    try {
      await api('/auth/register', {
        metodo: 'POST',
        corpo: { nome, email, senha: password },
      });
      setFeedback({ type: 'success', text: 'Conta criada! Você já pode entrar.' });
    } catch (erro) {
      setFeedback({
        type: 'error',
        text: erro.status ? erro.message : 'Não foi possível conectar ao servidor.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-top" aria-hidden="true" />
      <div className="login-glow login-glow-bottom" aria-hidden="true" />
      <div className="login-glow login-glow-center" aria-hidden="true" />

      <section className="login-card" aria-labelledby="register-title">
        <div className="login-brand">
          <div className="login-brand-icon"><Package2 size={27} strokeWidth={1.8} /></div>
          <div className="login-brand-name">MG <span>Manager</span></div>
          <p>GESTÃO INTELIGENTE DE ESTOQUE</p>
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">CRIAR CONTA</span>
          <h1 id="register-title">Registre-se</h1>
          <p>Preencha os dados abaixo para criar seu acesso.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="register-nome">Nome</label>
            <div className="login-input-wrap">
              <UserRound className="login-input-icon" size={18} />
              <input
                id="register-nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="register-email">E-mail</label>
            <div className="login-input-wrap">
              <Mail className="login-input-icon" size={18} />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={150}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="register-password">Senha</label>
            <div className="login-input-wrap">
              <LockKeyhole className="login-input-icon" size={18} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
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

          <div className="login-field">
            <label htmlFor="register-confirm">Confirmar senha</label>
            <div className="login-input-wrap">
              <LockKeyhole className="login-input-icon" size={18} />
              <input
                id="register-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button
                className="login-password-toggle"
                type="button"
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowConfirm((current) => !current)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="login-spinner" size={19} /> : <span>Criar conta</span>}
            {!loading && <ArrowRight size={19} className="login-submit-arrow" />}
            {loading && <span>Criando conta...</span>}
          </button>

          {feedback && (
            <div
              className={`login-feedback ${feedback.type === 'error' ? 'login-feedback-error' : ''}`}
              role={feedback.type === 'error' ? 'alert' : 'status'}
            >
              {feedback.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
              <span>{feedback.text}</span>
            </div>
          )}

          <Link to="/login" className="login-register-button">
            <ArrowLeft size={17} /> Voltar para o login
          </Link>
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