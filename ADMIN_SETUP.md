# Configuração obrigatória do admin Firebase

Esta versão corrigida removeu o login frágil por hash no JavaScript e passou o painel para **Firebase Auth com e-mail/senha + autorização por UID**.

## 1. Criar usuário admin

No Firebase Console:

1. Abra **Authentication**.
2. Ative o provedor **Email/Password**.
3. Crie um usuário para o painel, por exemplo:
   - E-mail: `admin@sualoja.com`
   - Senha: uma senha forte.
4. Copie o **UID** desse usuário.

## 2. Liberar o UID como admin no Firestore

No Firebase Console:

1. Abra **Firestore Database**.
2. Crie a coleção `admins`.
3. Dentro dela, crie um documento com o ID exatamente igual ao UID copiado.
4. Você pode colocar estes campos apenas para identificação:

```json
{
  "email": "admin@sualoja.com",
  "role": "admin",
  "createdAt": "2026-05-06"
}
```

## 3. Publicar as regras

Publique o arquivo `firestore.rules` incluído neste pacote.

Sem publicar as regras novas, o banco continua vulnerável. Sem criar o documento `admins/{UID}`, o login vai autenticar, mas o painel não terá permissão de administrador.

## 4. Login no painel

A tela do painel agora pede:

- e-mail do admin;
- senha do Firebase Auth.

A antiga função pública `window._resetarSenha()` foi removida.
