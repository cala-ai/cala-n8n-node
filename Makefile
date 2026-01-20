.PHONY: install build dev test start stop publish verify clean help

help:
	@echo "Commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make build    - Build the project"
	@echo "  make dev      - Development mode (watch)"
	@echo "  make test     - Run tests"
	@echo "  make start    - Start n8n locally"
	@echo "  make stop     - Stop n8n"
	@echo "  make publish  - Publish to npm"
	@echo "  make verify   - Run n8n linter"
	@echo "  make clean    - Remove build artifacts"

install:
	pnpm install

build:
	@pnpm install
	pnpm run build

dev:
	@pnpm install
	@pnpm run build
	pnpm run dev

test:
	@pnpm install
	pnpm test

start:
	@pnpm install
	@pnpm run build
	@command -v n8n >/dev/null || npm install -g n8n
	@pnpm link --global 2>/dev/null || true
	@mkdir -p ~/.n8n/nodes
	@test -f ~/.n8n/nodes/package.json || echo '{"name":"n8n-custom-nodes","version":"1.0.0"}' > ~/.n8n/nodes/package.json
	@cd ~/.n8n/nodes && pnpm link --global n8n-nodes-cala 2>/dev/null || true
	@echo "Starting n8n at http://localhost:5678"
	@n8n start

stop:
	@pkill -f "n8n start" 2>/dev/null || echo "n8n not running"

publish:
	@pnpm install
	@pnpm run build
	@npx @n8n/scan-community-package n8n-nodes-cala
	pnpm publish --access public

verify:
	@pnpm install
	@pnpm run build
	npx @n8n/scan-community-package n8n-nodes-cala

clean:
	rm -rf dist node_modules
