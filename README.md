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

**Input:** `"startups.location=Spain.funding>10M"`

**Output:**
```json
{
  "results": [
    {
      "startup": "SeQura",
      "sector": "Fintech / BNPL",
      "hq": "Barcelona",
      "funding_round": "Series D (Nov 2024)",
      "amount": "~€410M (incl. debt)"
    },
    {
      "startup": "TravelPerk",
      "sector": "Business Travel SaaS",
      "hq": "Barcelona",
      "funding_round": "Series D (Nov 2024)"
    }
  ],
  "entities": [
    { "id": "df8ea521-f2b1-47f7-9b46-419e179d914b", "name": "SeQura", "entity_type": "Organization" },
    { "id": "2f0da3c2-4d1d-41f5-b433-82df365c27de", "name": "TravelPerk", "entity_type": "Organization" }
  ]
}
```

### Search Entities

Find entities by name (supports fuzzy matching). Returns a list of matches with IDs.

**Input:** `"OpenAI"` with limit `3`

**Output:**
```json
{
  "entities": [
    { "id": "e5bb591a-d308-4aa5-9672-96046d366cde", "name": "OpenAI", "entity_type": "Organization" },
    { "id": "7eacce50-c89f-44a8-b8e4-a41f543683f2", "name": "OpenAI Codex", "entity_type": "Product" },
    { "id": "e849412b-dcee-4df1-9461-a7cbdb9c32c7", "name": "OpenAI, Inc.", "entity_type": "Organization" }
  ]
}
```

### Get Entity

Get the full profile of an entity by its ID (from Search or Search Entities results).

**Input:** `"932ba22a-5310-4b21-bbb7-6b91741c8bb3"`

**Output:**
```json
{
  "properties": {
    "name": {
      "value": "Hydnum Steel",
      "sources": [{ "name": "Cala AI", "document": "", "date": "2026-03-05" }]
    },
    "registered_address": {
      "value": "Calle Serrano North 45, Madrid, Spain",
      "sources": [{ "name": "CB Insights", "document": "https://www.cbinsights.com/company/hydnum-steel", "date": "2026-03-02" }]
    }
  },
  "id": { "value": "932ba22a-5310-4b21-bbb7-6b91741c8bb3", "sources": [] },
  "relationships": { "outgoing": {}, "incoming": {} },
  "numerical_observations": []
}
```

## Resources

- [Cala Documentation](https://docs.cala.ai)
- [Cala Console](https://console.cala.ai)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
