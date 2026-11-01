import { Check } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <span className="toast-icone"><Check size={18} /></span>
      <div>
        <strong>{toast.titulo}</strong>
        <small>{toast.mensagem}</small>
      </div>
    </div>
  );
}