#!/bin/bash
# ════════════════════════════════════════════════════════════
# deploy.sh — Backup + Atualiza cache + Upload via FTPS
#
# USO:
#   ./deploy.sh                  → só atualiza versão do cache
#   ./deploy.sh --backup         → faz backup local antes de tudo
#   ./deploy.sh --ftp            → atualiza cache + envia via FTP
#   ./deploy.sh --backup --ftp   → backup + atualiza cache + envia via FTP
#   ./deploy.sh --restaurar      → lista backups disponíveis para restaurar
#
# COMO CONFIGURAR O FTPS:
#   Edite as variáveis FTP_* abaixo com os dados da Hostinger
#
# REQUISITOS:
#   - bash, sed, date, zip (já vêm no Linux/Mac)
#   - lftp  (só para envio FTP — instale com: sudo apt install lftp)
# ════════════════════════════════════════════════════════════

set -e

# ── Configurações FTP (edite aqui) ──────────────────────────
FTP_HOST="ftp.frutacai.online"
FTP_USER="seu_usuario_ftp"
FTP_PASS="sua_senha_ftp"
FTP_DIR="/public_html/cardapio"
# ────────────────────────────────────────────────────────────

# ── Pasta de backups ────────────────────────────────────────
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
# ────────────────────────────────────────────────────────────

# Arquivos que entram no backup e no deploy
ARQUIVOS=(
  "service-worker.js"
  "index.html"
  "app.js"
  "firebase.js"
  "auth.js"
  "styles.css"
  "products-data.js"
  "pix.php"
  "checar-pix.php"
  "webhook.php"
  ".gitignore"
  "storage.rules"
  "precos.php"
  "firebase-service.php"
  "criar-pedido.php"
  ".htaccess"
)

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NOVA_VERSAO="frutacai-v$(date +%Y%m%d-%H%M)"

# ════════════════════════════════════════════════════════════
# OPÇÃO --restaurar  → lista backups e pergunta qual restaurar
# ════════════════════════════════════════════════════════════
if [[ "$1" == "--restaurar" ]]; then
  echo ""
  echo "📦 Backups disponíveis:"
  echo ""
  ls -1t "$BACKUP_DIR"/*.zip 2>/dev/null | nl -w2 -s') ' || echo "   Nenhum backup encontrado em $BACKUP_DIR"
  echo ""
  read -p "   Digite o número do backup para restaurar (ou ENTER para cancelar): " NUM
  if [[ -z "$NUM" ]]; then
    echo "   Cancelado."
    exit 0
  fi
  ARQUIVO_BACKUP=$(ls -1t "$BACKUP_DIR"/*.zip 2>/dev/null | sed -n "${NUM}p")
  if [[ -z "$ARQUIVO_BACKUP" ]]; then
    echo "❌ Número inválido."
    exit 1
  fi
  echo ""
  echo "⚠️  Isso vai sobrescrever os arquivos atuais com o backup:"
  echo "   $ARQUIVO_BACKUP"
  read -p "   Confirmar? (s/N): " CONF
  if [[ "$CONF" != "s" && "$CONF" != "S" ]]; then
    echo "   Cancelado."
    exit 0
  fi
  # Faz backup do estado atual antes de restaurar
  ZIP_ATUAL="$BACKUP_DIR/antes-restauracao-$TIMESTAMP.zip"
  zip -j "$ZIP_ATUAL" "${ARQUIVOS[@]}" 2>/dev/null && echo "   💾 Backup do estado atual salvo em: $ZIP_ATUAL"
  # Restaura
  unzip -o "$ARQUIVO_BACKUP" -d . > /dev/null
  echo ""
  echo "✅ Restaurado com sucesso!"
  echo "   Se quiser desfazer, rode: ./deploy.sh --restaurar"
  exit 0
fi

# ════════════════════════════════════════════════════════════
# FLUXO NORMAL
# ════════════════════════════════════════════════════════════
echo ""
echo "🚀 Deploy — versão: $NOVA_VERSAO"
echo ""

# ── 1. Backup (opcional) ────────────────────────────────────
if [[ "$1" == "--backup" || "$2" == "--backup" ]]; then
  ZIP_BACKUP="$BACKUP_DIR/backup-$TIMESTAMP.zip"
  echo "💾 Fazendo backup..."

  # Só inclui arquivos que existem
  EXISTENTES=()
  for f in "${ARQUIVOS[@]}"; do
    [[ -f "$f" ]] && EXISTENTES+=("$f")
  done

  zip -j "$ZIP_BACKUP" "${EXISTENTES[@]}" > /dev/null
  echo "   ✅ Backup salvo em: $ZIP_BACKUP"

  # Mantém apenas os 10 backups mais recentes (apaga os mais antigos)
  NUM_BACKUPS=$(ls -1 "$BACKUP_DIR"/*.zip 2>/dev/null | wc -l)
  if [[ "$NUM_BACKUPS" -gt 10 ]]; then
    ls -1t "$BACKUP_DIR"/*.zip | tail -n +11 | xargs rm -f
    echo "   🗑️  Backups antigos removidos (mantidos os 10 mais recentes)"
  fi
  echo ""
fi

# ── 2. Atualiza versão do cache ─────────────────────────────
VERSAO_ATUAL=$(grep "const CACHE_NAME" service-worker.js | grep -o "'frutacai-v[^']*'" | tr -d "'")
echo "   📝 service-worker.js: $VERSAO_ATUAL → $NOVA_VERSAO"
sed -i "s|const CACHE_NAME = '$VERSAO_ATUAL'|const CACHE_NAME = '$NOVA_VERSAO'|g" service-worker.js

echo "   📝 index.html: atualizando referência do cache..."
sed -i "s|if (name !== '$VERSAO_ATUAL')|if (name !== '$NOVA_VERSAO')|g" index.html

echo ""
echo "✅ Versão do cache atualizada!"
echo ""

# ── 3. Envio via FTP (opcional) ─────────────────────────────
if [[ "$1" == "--ftp" || "$2" == "--ftp" ]]; then
  echo "📤 Enviando arquivos via FTPS para $FTP_HOST..."
  echo ""

  if ! command -v lftp &> /dev/null; then
    echo "❌ lftp não encontrado. Instale com: sudo apt install lftp"
    echo "   Ou envie manualmente os arquivos para o servidor."
    exit 1
  fi

  # Monta lista de comandos put para o lftp
  CMDS="set ftp:ssl-allow yes; set ftp:ssl-force yes; set ssl:verify-certificate yes; open ftps://$FTP_USER:$FTP_PASS@$FTP_HOST; lcd $(pwd); cd $FTP_DIR;"
  for f in "${ARQUIVOS[@]}"; do
    [[ -f "$f" ]] && CMDS="$CMDS put $f;"
  done
  CMDS="$CMDS bye"

  lftp -c "$CMDS"

  echo ""
  echo "✅ Upload concluído!"
  echo "   Os clientes receberão a nova versão na próxima visita."
else
  echo "ℹ️  Para enviar via FTPS rode:  ./deploy.sh --ftp"
  echo ""
  echo "   Arquivos para subir manualmente no servidor:"
  for f in "${ARQUIVOS[@]}"; do
    [[ -f "$f" ]] && echo "     • $f"
  done
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Versão deployada : $NOVA_VERSAO"
echo "  Backups em       : $BACKUP_DIR/"
echo "  Para restaurar   : ./deploy.sh --restaurar"
echo "════════════════════════════════════════════════════════"
echo ""
