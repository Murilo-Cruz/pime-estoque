# pime-estoque
Sistema de controle de estoque e pedidos de venda - PIME VI

## Como rodar

1. **Banco**: importe `DB_PIME.sql` no MariaDB (cria o schema `db_estoque_pime`).
2. **Backend** (`/backend`):
   - copie `.env.example` para `.env` e preencha `DB_USER`, `DB_PASSWORD` e `JWT_SECRET`;
   - `npm install` e `npm run dev` (sobe em `http://localhost:3333`; teste em `/health`).
3. **Frontend** (`/frontend`):
   - `npm install` e `npm run dev` (sobe em `http://localhost:9999`, o mesmo valor de `FRONT_URL`);
   - se a API estiver em outro endereço, defina `VITE_API_URL` em `frontend/.env`.
4. Abra `/registrar`, crie um usuário e comece a cadastrar:
   clientes e fornecedores -> produtos -> entradas de estoque -> pedidos de venda.

## Fluxo de dados
- **Produto**: nasce com saldo 0 e custo médio 0.
- **Entrada**: soma ao saldo e recalcula o custo médio ponderado.
- **Pedido**: nasce "em preparação"; ao **finalizar** confere o saldo, baixa o estoque e congela o custo.
- **Financeiro / Dashboard**: calculados só a partir dos pedidos finalizados e das entradas.
