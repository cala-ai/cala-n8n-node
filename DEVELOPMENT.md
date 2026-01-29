# Development

## Requirements

- Node.js >= 22
- pnpm >= 10

## Project Structure

```text
cala-n8n/
├── credentials/
│   └── CalaApi.credentials.ts   # API credentials definition
├── nodes/
│   └── Cala/
│       ├── Cala.node.ts         # Main node logic
│       └── cala.svg             # Node icon
├── dist/                        # Compiled output
├── Makefile                     # Development commands
├── package.json
├── tsconfig.json
└── gulpfile.js
```

## Quick Start

```bash
make start    # Build + start n8n at http://localhost:5678
make stop     # Stop n8n
```

## Commands

| Command | Description |
| ------- | ----------- |
| `make install` | Install dependencies |
| `make build` | Build the project |
| `make dev` | Development mode (watch) |
| `make start` | Start n8n locally |
| `make stop` | Stop n8n |
| `make publish` | Publish to npm |
| `make verify` | Run n8n linter |
| `make clean` | Remove build artifacts |
