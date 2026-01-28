## Fix 502 Bad Gateway - Remover Autenticação do Dashboard Traefik

### Causa do Erro
O Traefik está configurado com autenticação básica (--api.dashboard=true) que está bloqueando TODAS as requisições externas, incluindo https://ajuda.28pro.com.br/ e /api/*

### Solução
Remover a autenticação do dashboard para permitir acesso público.

### Instruções para o Portainer
No painel do Portainer, vá em **Stacks** → **28proajuda** → **Traefik** → Configure:

1. Procure pelo arquivo de configuração:
   - **traefik-dashboard-auth** (pode estar em /data/traefik/)
   - Procure por **HTTP Middlewares**
   - Procure por **Entrypoints** (não deve ter "dashboard" configurado)

2. Remova a autenticação do dashboard:
   - Na seção **Dashboard Settings**
   - Procure por **Authentication** (basic/insecure)
   - Desative a autenticação para o dashboard ficar público

### Verificação
Após aplicar essa mudança, tente:
1. https://ajuda.28pro.com.br/ - Deve carregar o frontend
2. https://ajuda.28pro.com.br/api/health - Deve retornar {"status":"ok"}
3. Execute: `docker exec 28proajuda-api node scraper.js` - Para povoar o banco

---

### Por que isso corrige
A autenticação do dashboard estava exigindo credenciais que não foram fornecidos. Ao remover, o Traefik permite acesso público a todos os serviços.
