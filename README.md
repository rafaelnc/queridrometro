# Queridômetro

Sistema de votação por emojis no estilo Queridômetro do BBB. Desenvolvido com Next.js e armazenamento em arquivo JSON (sem dependências nativas).

## Funcionalidades

- **Login / Cadastro**: usuários podem se cadastrar e fazer login.
- **Votação**: cada usuário vê a lista de participantes, escolhe um e vota com um emoji. **Limite: 1 voto por participante por dia**; a cada novo dia pode votar em todos novamente.
- **Resumo do dia**: tela com autoscroll mostrando cada participante com foto e, ao lado, os emojis com a quantidade de votos recebidos naquele dia.
- **Perfil**: editar nome, foto e senha.
- **Admin (usuário master)**: cadastrar, editar e remover participantes (somente o usuário administrador).

## Tecnologias

- **Next.js 14** (App Router)
- **Armazenamento em JSON** – dados em `data/db.json` (sem Python, sem compilação nativa)
- **Tailwind CSS**
- **bcryptjs** para hash de senhas
- Sessão via cookie assinado

## Rodando localmente

```bash
# Instalar dependências
npm install

# (Opcional) Criar pasta e arquivo de dados. O app cria e o admin na primeira execução.
npm run db:init

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

**Usuário master padrão** (criado automaticamente se não existir):

- Email: `admin@queridometro.com`
- Senha: `admin123`

Altere a senha após o primeiro login.

## Deploy no Railway

1. Crie um novo projeto no [Railway](https://railway.app).
2. Conecte o repositório Git ou faça deploy via CLI.
3. Variáveis recomendadas:
   - `SESSION_SECRET`: uma string aleatória longa para assinar os cookies (obrigatório em produção).
   - `DATABASE_PATH`: opcional; ex.: `/data/db.json` para persistir os dados em um volume.
4. O build usa `npm run build` e o start usa `npm run start`.

Para persistir os dados entre deploys, use um **Volume** no Railway e defina `DATABASE_PATH` para um caminho dentro do volume (ex.: `/data/db.json`).

## Estrutura

- `src/app/` – páginas e API routes
- `src/lib/` – banco (db.ts), auth, constantes (emojis)
- `scripts/init-db.js` – script para criar pasta e arquivo de dados (opcional)
- `data/` – pasta do arquivo `db.json` (criada automaticamente)

## Rotas

| Rota       | Descrição                          |
|-----------|-------------------------------------|
| `/login`  | Login e cadastro                    |
| `/votar`  | Lista de participantes e votação     |
| `/resumo` | Queridômetro do dia (autoscroll)   |
| `/perfil` | Editar perfil e senha              |
| `/admin`  | CRUD de participantes (só master)  |
