# 🚀 FrutaÇaí — Instruções de Deploy e Configuração

## Arquivos modificados nesta revisão

| Arquivo | O que foi corrigido |
|---|---|
| `pix.php` | Token via `getenv()`, recálculo de valor no backend, validação de divergência |
| `webhook.php` | Assinatura inválida → HTTP 401 (antes só logava), validação de valor e paymentId, `str_starts_with()` substituído por `strncmp()` (PHP 7.4) |
| `checar-pix.php` | Token via `getenv()`, fallback usa JSON de sessão (não input do cliente) |
| `app.js` | Envia `itens` ao pix.php (não apenas o total), `_esc()` escapa apóstrofos, `renderCats()` usa `addEventListener` |
| `firestore.rules` | Regras de segurança completas para todas as coleções |
| `.env.example` | Documentação das variáveis de ambiente |

---

## 1. Configurar as variáveis de ambiente

### Opção A — Hostinger hPanel (recomendado)
1. Acesse hPanel → **Avançado** → **Variáveis de Ambiente PHP**
2. Adicione as duas variáveis:
   - `MERCADO_PAGO_ACCESS_TOKEN` = `APP_USR-6961027898004677-...` (seu token real)
   - `MERCADO_PAGO_WEBHOOK_SECRET` = (veja passo 2 abaixo)

### Opção B — .htaccess (fallback se hPanel não tiver o menu)
Adicione no início do `.htaccess`, **antes** das regras de Rewrite:
```apache
SetEnv MERCADO_PAGO_ACCESS_TOKEN APP_USR-SEUTOKEN
SetEnv MERCADO_PAGO_WEBHOOK_SECRET SEUSECRET
```
⚠️ Com `.htaccess`, qualquer pessoa com acesso ao servidor lê o token. Use a Opção A sempre que possível.

---

## 2. Obter e configurar o Webhook Secret

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Menu **Webhooks** → selecione seu webhook
3. Copie o campo **"Segredo de Assinatura"** (hash hex de 64 caracteres)
4. Configure como variável de ambiente `MERCADO_PAGO_WEBHOOK_SECRET`

Se você ainda não tem um webhook configurado:
1. Webhooks → **Criar webhook**
2. URL: `https://frutacai.online/cardapio/webhook.php`
3. Eventos: marque `payment` (apenas)
4. Salve e copie o secret gerado

---

## 3. Configurar o webhook no Mercado Pago

URL exata que deve ser cadastrada:
```
https://frutacai.online/cardapio/webhook.php
```

Eventos necessários: ✅ `payment`

---

## 4. Aplicar as regras do Firestore

### Opção A — Firebase CLI (recomendado)
```bash
firebase login
firebase use frutacai-f3423
firebase deploy --only firestore:rules
```

### Opção B — Console do Firebase
1. Acesse https://console.firebase.google.com/project/frutacai-f3423/firestore/rules
2. Clique em **Editar regras**
3. Cole o conteúdo de `firestore.rules`
4. Clique em **Publicar**

---

## 5. Atualizar a tabela de preços no backend

Quando você adicionar ou alterar preços de produtos pelo painel admin, você **também precisa atualizar** o array `$PRECOS` no arquivo `pix.php`.

Isso é necessário porque o backend recalcula o valor do pedido usando essa tabela. Se um produto não estiver na tabela, o Pix será rejeitado.

**Localização no arquivo:** `pix.php`, linhas com o comentário `// Tabela de preços confiável`.

Exemplo de como adicionar um produto novo de ID 100:
```php
100 => 29.90,  // Açaí Especial 1L
```

---

## 6. Testar o fluxo Pix completo

### Teste em sandbox (recomendado antes de produção)
1. No painel MP Developers, troque para **"Modo teste"**
2. Use o token de teste (`TEST-...`) na variável de ambiente temporariamente
3. Use os dados de pagador de teste fornecidos pelo MP
4. Faça um pedido e verifique:
   - [ ] QR Code gerado sem erros
   - [ ] Webhook chamado (veja `pagamentos/webhook_log.txt`)
   - [ ] Arquivo `pagamentos/PEDIDOID.json` criado
   - [ ] Frontend detecta pagamento via polling
   - [ ] Pedido aparece no painel com `pixPago: true`

### Checklist de validação manual
Após um pagamento real, verifique no `webhook_log.txt`:
```
APROVADO_VALIDADO | gravou=XX | pedidoId=XXXXX | valor=XX.XX
```
Se aparecer `assinatura_invalida` ou `valor_divergente`, verifique as variáveis de ambiente.

---

## 7. Segurança do Firebase — próximo passo recomendado

O sistema atual usa **autenticação anônima** para o painel admin. Isso significa que as regras do Firestore não conseguem distinguir o admin de um cliente comum.

Para proteção completa, migre o login do painel para **Firebase Auth com email/senha**:

1. No Firebase Console → **Authentication** → **Sign-in method** → Ative **E-mail/senha**
2. Crie um usuário admin: Authentication → Usuários → Adicionar usuário
3. No `auth.js`, substitua o login por hash SHA-256 pelo fluxo:
   ```javascript
   import { signInWithEmailAndPassword } from "firebase/auth";
   signInWithEmailAndPassword(auth, email, senha);
   ```
4. Nas regras do Firestore, substitua `isAuthenticated()` por `isAdmin()` nas operações de escrita

Até que essa migração seja feita, as regras atuais já protegem contra leituras/escritas **sem autenticação**.

---

## 8. Checklist de produção

### PHP / Mercado Pago
- [ ] `MERCADO_PAGO_ACCESS_TOKEN` configurada no servidor (não no código)
- [ ] `MERCADO_PAGO_WEBHOOK_SECRET` configurada no servidor
- [ ] Webhook cadastrado no painel MP com URL correta
- [ ] Pasta `pagamentos/` existe com permissão de escrita (`chmod 755`)
- [ ] Tabela `$PRECOS` no `pix.php` sincronizada com os produtos do cardápio
- [ ] PHP 7.4+ (Hostinger padrão: OK)

### Firebase / Firestore
- [ ] Regras de segurança do `firestore.rules` aplicadas no console
- [ ] Firebase Storage ativado (para upload de imagens de produtos)
- [ ] VAPID Key atualizada se mudar de projeto Firebase

### Frontend
- [ ] `firebase-config.js` com credenciais do projeto correto
- [ ] `FIREBASE_CONFIG` **não** está no `.gitignore` sendo ignorado (ou está e você fez deploy manual)
- [ ] Service Worker instalado (PWA funcional)

### Segurança geral
- [ ] `.htaccess` bloqueando acesso à pasta `/pagamentos/`
- [ ] Token de produção MP **nunca** aparece em código versionado
- [ ] Logs em `pagamentos/*.txt` não são acessíveis via URL (`.htaccess` já bloqueia)

---

## 9. Sobre o fluxo quando o cliente fecha a página

Com as correções aplicadas, o fluxo funciona assim:

```
Cliente paga Pix
      ↓
Mercado Pago chama webhook.php automaticamente (backend)
      ↓
webhook.php valida assinatura + valor + pedidoId
      ↓
Grava arquivo pagamentos/PEDIDOID.json
      ↓
checar-pix.php (polling do frontend) detecta o arquivo
      ↓ (ou se o cliente já fechou a página:)
      ↓
Arquivo fica gravado por até 35 minutos
Próxima vez que o cliente abrir "Meu Pedido", o status é consultado
```

**O pedido não depende do cliente manter a página aberta.** O webhook é o mecanismo primário de confirmação.

Se você quiser que o pedido seja salvo no Firebase **pelo backend** (sem depender do frontend), seria necessário integrar o Firebase Admin SDK no PHP — o que requer Node.js ou a SDK PHP do Firebase. A arquitetura atual (arquivo JSON + polling) é funcional e resolve o problema.
