# Development

## Requirements

- Node.js >= 18
- pnpm >= 10

## Project Structure

```text
cala-n8n/
├── credentials/
│   ├── CalaApi.credentials.ts   # API credentials definition
│   └── cala.svg                 # Credential icon
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
| `make test` | Run tests |
| `make start` | Build, link, and start n8n at <http://localhost:5678> |
| `make stop` | Stop n8n |
| `make publish` | Publish to npm |
| `make verify` | Run n8n linter |
| `make clean` | Remove build artifacts |

## Local Testing

### Self-hosted n8n (recommended)

`make start` handles everything: builds the package, registers it via `pnpm link`, and starts n8n:

```bash
make start   # http://localhost:5678
make stop
```

The node appears automatically — no need to install it from the Community Nodes UI.

### n8n Cloud

Local linking is not possible with n8n Cloud. Publish a prerelease to npm and install it via **Settings → Community Nodes**:

```bash
npm version prerelease --preid=beta   # e.g. 0.3.4-beta.0
npm publish --tag beta
```

Then install `n8n-nodes-cala@beta` in the n8n UI.

### Docker

Mount the built output into the container's custom nodes directory:

```bash
make build
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -v $(pwd)/dist:/home/node/.n8n/custom/n8n-nodes-cala/dist \
  -v $(pwd)/package.json:/home/node/.n8n/custom/n8n-nodes-cala/package.json \
  n8nio/n8n
```
