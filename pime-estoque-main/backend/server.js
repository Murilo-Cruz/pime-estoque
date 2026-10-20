import 'dotenv/config';
import app from './src/app.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definido no .env');
  process.exit(1);
}

app.listen(process.env.PORT, () =>
  console.log(`API rodando em http://localhost:${process.env.PORT}`)
);