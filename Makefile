.PHONY: help dev up down rebuild logs db-shell migrate seed reset deploy vps-setup vps-logs vps-shell

# VPS config — override via env or CLI: make deploy VPS_HOST=1.2.3.4
VPS_HOST  ?= your-vps-ip
VPS_USER  ?= ubuntu
VPS_DIR   ?= ~/link-hub

help: ## Show this help message
	@echo ""
	@echo "  Link Hub — Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  VPS variables (override with: make deploy VPS_HOST=x VPS_USER=y VPS_DIR=z)"
	@echo "  \033[33mVPS_HOST\033[0m  = $(VPS_HOST)"
	@echo "  \033[33mVPS_USER\033[0m  = $(VPS_USER)"
	@echo "  \033[33mVPS_DIR\033[0m   = $(VPS_DIR)"
	@echo ""

# ── Local dev ──────────────────────────────────────────────────────────────────

dev: ## Run app locally with Node.js (needs local postgres)
	npm run dev

# ── Docker (local) ─────────────────────────────────────────────────────────────

up: ## Build and start all containers (first time setup)
	docker compose up -d --build
	@echo "✅ App running at http://localhost:3000"

down: ## Stop all containers
	docker compose down

rebuild: ## Rebuild and restart only the app container (DB data preserved)
	docker compose build app
	docker compose up -d --no-deps app
	@echo "✅ App rebuilt and restarted. DB data preserved."

logs: ## Tail app container logs
	docker compose logs -f app

db-shell: ## Open a psql shell inside the DB container
	docker compose exec db psql -U postgres -d linkhub

migrate: ## Run pending Prisma migrations inside the app container
	docker compose exec app prisma migrate deploy

seed: ## Re-run the database seed (reads ADMIN_EMAIL/ADMIN_PASSWORD from env)
	docker compose exec app node prisma/seed.js

reset: ## ⚠️  DANGER: Stop containers and delete ALL data (volume included)
	@echo "⚠️  WARNING: This will delete ALL data including the database volume!"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	docker compose down -v
	docker compose up -d --build

# ── VPS deploy ─────────────────────────────────────────────────────────────────

vps-setup: ## First-time VPS setup: install Docker, clone repo, start app
	@echo "🚀 Setting up VPS at $(VPS_USER)@$(VPS_HOST)..."
	ssh $(VPS_USER)@$(VPS_HOST) '\
		set -e; \
		if ! command -v docker &>/dev/null; then \
			curl -fsSL https://get.docker.com | sh; \
			sudo usermod -aG docker $$USER; \
			echo "Docker installed. Re-login or use sudo if needed."; \
		fi; \
		mkdir -p $(VPS_DIR); \
	'
	@echo "✅ VPS ready. Now push your code and run: make deploy"

deploy: ## Deploy latest code to VPS (git pull + rebuild app, DB preserved)
	@echo "🚀 Deploying to $(VPS_USER)@$(VPS_HOST):$(VPS_DIR) ..."
	ssh $(VPS_USER)@$(VPS_HOST) 'cd $(VPS_DIR) && git pull && make rebuild'
	@echo "✅ Deploy complete!"

vps-logs: ## Tail app logs on VPS
	ssh $(VPS_USER)@$(VPS_HOST) 'cd $(VPS_DIR) && docker compose logs -f app'

vps-shell: ## Open a shell on the VPS (in the app directory)
	ssh $(VPS_USER)@$(VPS_HOST) -t 'cd $(VPS_DIR) && exec $$SHELL'
