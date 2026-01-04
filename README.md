# Home Essentials - Checklist de Casa Nova

Aplicativo React para organizar a casa nova por comodo, com login Google, colaboracao e lista compartilhavel.

## Stack
- React + TypeScript + Vite
- TailwindCSS + Radix UI
- Firebase Auth (Google)
- Firestore (homes, rooms, items, shares)
- TanStack Query

## Como rodar
1) Instale dependencias:
```bash
npm install
```

2) Configure o Firebase:
- Crie um projeto no Firebase
- Ative Authentication > Google
- Crie um banco Firestore (modo producao)
- Copie as credenciais web para o `.env`

3) Crie o arquivo `.env` baseado em `.env.example`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4) Rode localmente:
```bash
npm run dev
```

## Estrutura do projeto
```
src/
  components/
  constants/
  hooks/
  pages/
  routes/
  services/
  state/
  types/
  utils/
```

## Modelo de dados (Firestore)
- homes: { ownerId, name, members[], pendingInvites[], palette, createdAt }
- rooms: { homeId, name, order, createdAt }
- items: { homeId, roomId, name, necessityLevel, done, createdAt, updatedAt }
- users: { uid, email, emailLower, displayName, photoURL, createdAt }
- shares: { homeId, createdBy, mode, roomsIncluded[], createdAt }
- shares/{shareId}/rooms: snapshot dos comodos
- shares/{shareId}/items: snapshot dos itens

## Convites e membros
- O dono convida pelo email.
- Se o usuario ja existe, adiciona diretamente em `members`.
- Se nao existe, o email fica em `pendingInvites`.
- Ao logar, o app verifica `pendingInvites` e vincula automaticamente.

## Share link (publico)
- Gera um documento em `shares` e copia os comodos/itens selecionados para subcolecoes.
- A pagina publica busca apenas esses snapshots, mantendo o resto protegido.

## Regras do Firestore
O arquivo `firestore.rules` esta na raiz. Aplique com:
```bash
firebase deploy --only firestore:rules
```

## Deploy (Vercel)
1) Importe o projeto no Vercel
2) Configure as mesmas variaveis do `.env`
3) Deploy

## Seeds opcionais
Na tela de onboarding e possivel criar comodos e itens de exemplo.
