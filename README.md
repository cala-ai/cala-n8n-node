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

The node exposes a **Knowledge** resource with four operations:

| Operation | Description |
|-----------|-------------|
| **Search** | Answer natural language questions with sourced, researched content |
| **Query** | Filter entities by attributes using structured dot-notation syntax |
| **Search Entities** | Find entities by name with fuzzy matching |
| **Get Entity** | Get the full profile of an entity by its numeric ID |

### Search

Ask a natural language question and get back a researched answer with sources.

**Input:** `"How many students were enrolled at MIT in 2024?"`

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
      "content": "In 2024, the Massachusetts Institute of Technology enrolled approximately 11,800 students.",
      "origins": [
        {
          "source": { "name": "MIT", "url": "https://mit.edu" },
          "document": { "name": "MIT Facts", "url": "https://mit.edu/about" }
        }
      ]
    }
  ],
  "entities": [
    { "id": 1, "name": "MIT", "entity_type": "ORGANIZATION" }
  ]
}
```

### Query

Filter entities by attributes using dot-notation syntax.

**Input:** `"startups.location=Spain.funding>10M.funding<=50M"`

### Search Entities

Find entities by name (supports fuzzy matching). Returns a list of matches with IDs.

**Input:** `"OpenAI"` → returns entity IDs you can pass to **Get Entity**.

### Get Entity

Get the full profile of an entity by its numeric ID (from Search or Search Entities results).

## Resources

- [Cala Documentation](https://docs.cala.ai)
- [Cala Console](https://console.cala.ai)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
