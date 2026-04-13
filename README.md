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

The node exposes a **Knowledge** resource with five operations:

| Operation | Description |
|-----------|-------------|
| **Search** | Answer natural language questions with sourced, researched content |
| **Query** | Filter entities by attributes using structured dot-notation syntax |
| **Search Entities** | Find entities by name with fuzzy matching, optionally filtered by type |
| **Get Entity** | Get the full profile of an entity by its UUID, with optional field selection |
| **Get Entity Fields** | Discover which properties, relationships, and observations are available for an entity |

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

**Parameters:**
- `Name` (required) — entity name to search for
- `Entity Types` (optional) — filter by one or more types: Company, Person, GPE, Country, Organization, and more
- `Limit` (optional, default 20) — max results, up to 100

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

### Get Entity Fields

Discover which properties, relationships, and numerical observations are available for a specific entity before querying it. Run this first, then use the results to fill in the **Get Entity** optional fields.

**Input:** Entity UUID `"c6772802-bdbc-4778-91e9-cd3d27d008d5"`

**Output:**
```json
{
  "properties": ["name", "aliases", "legal_name", "employee_count", "founding_date", "headquarters_address"],
  "relationships": {
    "outgoing": ["IS_REGISTERED_IN", "HAS_HEADQUARTERS_IN", "OPERATES_IN_INDUSTRY"],
    "incoming": ["IS_CEO_OF", "IS_CFO_OF", "IS_BOARD_MEMBER_OF", "IS_SUBSIDIARY_OF"]
  },
  "numerical_observations": {
    "FinancialMetric": [
      { "id": "1d3eae40-0ba8-5baf-9907-6a4823b067bb", "name": "Cash and Cash Equivalents", "unit": "USD" }
    ]
  }
}
```

### Get Entity

Get the full profile of an entity by its UUID. By default returns a standard set of properties. Use the optional **Additional Fields** to select exactly which properties, relationships, and numerical observations to include — run **Get Entity Fields** first to discover what's available.

**Parameters:**
- `Entity ID` (required) — UUID from Search Entities, Search, or Query results
- `Additional Fields > Properties` — list of property names to return (e.g. `name`, `employee_count`, `founding_date`)
- `Additional Fields > Relationships` — relationships to include, each with direction (Outgoing/Incoming), type name, and optional limit/offset
- `Additional Fields > Numerical Observations` — JSON object mapping observation type to UUID array (e.g. `{"FinancialMetric": ["uuid1"]}`)

**Input:** Entity UUID `"c6772802-bdbc-4778-91e9-cd3d27d008d5"` with properties `["name", "employee_count"]` and incoming relationship `IS_CEO_OF`

**Output:**
```json
{
  "id": "c6772802-bdbc-4778-91e9-cd3d27d008d5",
  "name": "Apple Inc",
  "entity_type": "Company",
  "properties": {
    "name": { "value": "APPLE INC", "sources": [{ "name": "SEC", "date": "2026-02-26" }] },
    "employee_count": { "value": 164000, "sources": [{ "name": "Macrotrends", "date": "2026-03-01" }] }
  },
  "relationships": {
    "incoming": {
      "IS_CEO_OF": [{ "id": "...", "name": "Tim Cook", "entity_type": "Person" }]
    }
  },
  "numerical_observations": []
}
```

## Resources

- [Cala Documentation](https://docs.cala.ai)
- [Cala Console](https://console.cala.ai)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
