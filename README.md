# n8n-nodes-cala

This is an n8n community node for [Cala AI](https://cala.ai) - a platform that transforms internet information into structured, trustworthy context for AI agents.

## Installation

### n8n Cloud (Verified Nodes)

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-cala`
4. Click **Install**

### Self-hosted n8n

```bash
npm install n8n-nodes-cala
```

## Credentials

You need a Cala API key to use this node:

1. Sign up at [console.cala.ai](https://console.cala.ai)
2. Create an API key
3. In n8n, create new credentials of type **Cala API**
4. Enter your API key

## Operations

### Knowledge

| Operation | Description |
|-----------|-------------|
| **Search** | Search verified knowledge using natural language queries |

### Example

**Input:** "How many students were enrolled at MIT in 2024?"

**Output:**
```json
{
  "content": "In 2024, MIT had approximately 11,800 students enrolled, including 4,600 undergraduate and 7,200 graduate students.",
  "explainability": [
    {
      "content": "MIT enrollment data shows total student population across undergraduate and graduate programs",
      "references": ["a1b2c3d4-5678-90ab-cdef-123456789abc"]
    }
  ],
  "context": [
    {
      "id": "a1b2c3d4-5678-90ab-cdef-123456789abc",
      "content": "In 2024, the Massachusetts Institute of Technology enrolled approximately 11,800 students: 4,600 undergraduates and 7,200 graduate students.",
      "origins": [
        {
          "source": { "name": "MIT", "url": "https://mit.edu" },
          "document": { "name": "MIT Facts", "url": "https://mit.edu/about" }
        }
      ]
    }
  ],
  "entities": [
    { "id": 1, "name": "MIT", "entity_type": "ORGANIZATION" },
    { "id": 2, "name": "Massachusetts Institute of Technology", "entity_type": "ORGANIZATION" }
  ]
}
```

## Resources

- [Cala Documentation](https://docs.cala.ai)
- [Cala Console](https://console.cala.ai)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Development

### Requirements

- Node.js >= 22
- pnpm >= 10

### Project Structure

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

### Quick Start

```bash
make start    # Build + start n8n at http://localhost:5678
make stop     # Stop n8n
```

### Commands

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

## License

MIT
