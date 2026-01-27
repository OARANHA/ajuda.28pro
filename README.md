# 28ProAjuda - Knowledge Base IA

Sistema completo RAG para suporte 28Pro ERP Cloud.

## Stack
- Backend: Node.js + Express + Groq
- DB: PostgreSQL (FTS + GIN)
- Frontend: React + SSE
- Deploy: Docker + Traefik + Portainer

## Deploy
1. `docker-compose up -d`
2. `docker-compose exec api node scraper.js`
3. Acesse https://ajuda.28pro.com.br

[![Deploy](https://img.shields.io/badge/Deploy-Portainer-brightgreen)](https://portainer.your-vps)