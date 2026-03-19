.PHONY: help dev up down rebuild logs db-shell migrate seed reset

help: ## Show this help message
	@echo ""
	@echo "  Link Hub - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

dev: ## Run app locally with Node.js (needs local postgres)
	npm run dev

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
