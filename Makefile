.PHONY: help up down restart build rebuild logs logs-db ps shell db-shell \
        db-migrate db-studio db-reset dev deploy

# ─── Màu ──────────────────────────────────────────────────────────────────────
BOLD   := \033[1m
RESET  := \033[0m
GREEN  := \033[32m
CYAN   := \033[36m
YELLOW := \033[33m
GRAY   := \033[90m

# Đọc WEB_PORT từ .env (fallback 3000)
PORT := $(shell grep -E '^WEB_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '"' | head -1 || echo 3000)

# ─── Help ─────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  $(BOLD)Link Hub$(RESET)"
	@echo ""
	@echo "  $(BOLD)$(YELLOW)── Production (VPS) ──────────────────────────$(RESET)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make up"           "Build image + start toàn bộ stack"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make down"         "Stop + xoá containers (data giữ nguyên)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make deploy"       "Pull code mới + rebuild + restart app"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make restart"      "Restart app (không rebuild)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make build"        "Build image (có cache)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make rebuild"      "Build image sạch (no-cache)"
	@echo ""
	@echo "  $(BOLD)$(YELLOW)── Logs & Debug ──────────────────────────────$(RESET)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make logs"         "Logs app realtime"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make logs-db"      "Logs postgres"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make ps"           "Trạng thái containers"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make shell"        "Shell vào app container"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make db-shell"     "psql vào postgres"
	@echo ""
	@echo "  $(BOLD)$(YELLOW)── Database ──────────────────────────────────$(RESET)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make db-migrate"   "Tạo migration: make db-migrate name=xxx"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make db-studio"    "Prisma Studio (UI xem data)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make db-reset"     "⚠️  Xoá sạch DB + chạy lại migrate"
	@echo ""
	@echo "  $(BOLD)$(YELLOW)── Local Dev ─────────────────────────────────$(RESET)"
	@printf "  $(CYAN)%-22s$(RESET) %s\n" "make dev"          "Chạy Next.js dev server (hot-reload)"
	@echo ""
	@echo "  $(GRAY)App đang chạy tại port: $(PORT)$(RESET)"
	@echo ""

# ─── Production ───────────────────────────────────────────────────────────────

up:
	@[ -f .env ] || { echo "$(BOLD)❌  File .env không tồn tại!$(RESET)"; echo "   Chạy: cp .env.example .env  rồi điền giá trị thật"; exit 1; }
	docker compose up -d --build
	@echo ""
	@echo "  $(GREEN)$(BOLD)✅ Stack đã chạy$(RESET)"
	@echo "  $(GRAY)Dashboard : http://localhost:$(PORT)$(RESET)"
	@echo "  $(GRAY)Admin     : http://localhost:$(PORT)/admin$(RESET)"
	@echo ""
	@echo "  $(GRAY)Xem logs  : make logs$(RESET)"
	@echo ""

down:
	docker compose down

deploy:
	@echo "$(CYAN)📦 Pulling latest code...$(RESET)"
	git pull
	@echo "$(CYAN)🔨 Rebuilding image...$(RESET)"
	docker compose build --no-cache app
	@echo "$(CYAN)🔄 Restarting app...$(RESET)"
	docker compose up -d --no-deps app
	@echo ""
	@echo "  $(GREEN)$(BOLD)✅ Deploy xong$(RESET)"
	@echo "  $(GRAY)Xem logs: make logs$(RESET)"
	@echo ""

restart:
	docker compose restart app

build:
	docker compose build app

rebuild:
	docker compose build --no-cache app

# ─── Logs & Debug ─────────────────────────────────────────────────────────────

logs:
	docker compose logs -f app

logs-db:
	docker compose logs -f db

ps:
	docker compose ps

shell:
	docker compose exec app sh

db-shell:
	docker compose exec db psql -U postgres -d linkhub

# ─── Database ─────────────────────────────────────────────────────────────────

db-migrate:
ifndef name
	@echo "$(BOLD)❌  Cần tên migration: make db-migrate name=ten_migration$(RESET)"
	@exit 1
endif
	npx prisma migrate dev --name $(name)

db-studio:
	npx prisma studio

db-reset:
	@printf "$(BOLD)⚠️  Xoá sạch toàn bộ data DB? [y/N] $(RESET)"; \
	read confirm; \
	[ "$$confirm" = "y" ] && npx prisma migrate reset || echo "Huỷ."

# ─── Local Dev ────────────────────────────────────────────────────────────────

dev:
	@[ -f .env.local ] || { echo "$(BOLD)❌  File .env.local không tồn tại!$(RESET)"; echo "   Chạy: cp .env.example .env.local  rồi đổi DATABASE_URL sang localhost:5432"; exit 1; }
	npm run dev
