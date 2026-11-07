import { Check, TriangleAlert } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast ${toast.erro ? 'toast-erro' : ''}`} role={toast.erro ? 'alert' : 'status'}>
      <span className="toast-icone">{toast.erro ? <TriangleAlert size={18} /> : <Check size={18} />}</span>
      <div>
        <strong>{toast.titulo}</strong>
        <small>{toast.mensagem}</small>
      </div>
    </div>
  );
}
