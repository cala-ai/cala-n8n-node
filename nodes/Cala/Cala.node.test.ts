import type { IExecuteFunctions } from 'n8n-workflow';
import { Cala } from './Cala.node';

describe('Cala Node', () => {
  let node: Cala;

  beforeEach(() => {
    node = new Cala();
  });

  const makeContext = ({
    resource = 'knowledge',
    operation = 'search',
    params = {} as Record<string, unknown>,
    apiKey = 'test-key',
    response = { content: 'ok' } as Record<string, unknown>,
    itemCount = 1,
  } = {}): IExecuteFunctions & { helpers: { httpRequest: jest.Mock } } => {
    const httpRequest = jest.fn(async () => response);

    return {
      getInputData: jest.fn(() =>
        Array.from({ length: itemCount }, (_, i) => ({ json: { index: i } })),
      ),
      getNodeParameter: jest.fn((name: string, index?: number) => {
        if (name === 'resource') return resource;
        if (name === 'operation') return operation;
        if (name in params) return params[name];
        throw new Error(`Unexpected parameter: ${name}`);
      }),
      getCredentials: jest.fn(async () => ({ apiKey })),
      getNode: jest.fn(() => ({ name: 'Cala' })),
      helpers: { httpRequest },
    } as unknown as IExecuteFunctions & { helpers: { httpRequest: jest.Mock } };
  };

  describe('Knowledge › Search', () => {
    it('calls POST /v1/knowledge/search with correct body and headers', async () => {
      const context = makeContext({
        operation: 'search',
        params: { query: 'What is Cala?' },
      });

      const result = await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.cala.ai/v1/knowledge/search',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'test-key' },
        body: { input: 'What is Cala?' },
        json: true,
      });
      expect(result).toEqual([[{ json: { content: 'ok' }, pairedItem: { item: 0 } }]]);
    });

    it('omits X-API-KEY header when apiKey is empty', async () => {
      const context = makeContext({
        operation: 'search',
        params: { query: 'test' },
        apiKey: '',
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('processes multiple items', async () => {
      const queries = ['Query 1', 'Query 2', 'Query 3'];
      const httpRequest = jest.fn()
        .mockResolvedValueOnce({ answer: 'Answer 1' })
        .mockResolvedValueOnce({ answer: 'Answer 2' })
        .mockResolvedValueOnce({ answer: 'Answer 3' });

      const context = {
        getInputData: jest.fn(() => queries.map(q => ({ json: { q } }))),
        getNodeParameter: jest.fn((name: string, index: number) => {
          if (name === 'resource') return 'knowledge';
          if (name === 'operation') return 'search';
          if (name === 'query') return queries[index];
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ apiKey: 'key' })),
        getNode: jest.fn(() => ({ name: 'Cala' })),
        helpers: { httpRequest },
      } as unknown as IExecuteFunctions;

      const result = await node.execute.call(context);

      expect(httpRequest).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0].json).toEqual({ answer: 'Answer 1' });
      expect(result[0][1].json).toEqual({ answer: 'Answer 2' });
      expect(result[0][2].json).toEqual({ answer: 'Answer 3' });
    });

    it('propagates HTTP errors', async () => {
      const httpRequest = jest.fn().mockRejectedValue(new Error('API Error: 500'));

      const context = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string) => {
          if (name === 'resource') return 'knowledge';
          if (name === 'operation') return 'search';
          if (name === 'query') return 'test';
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ apiKey: 'key' })),
        getNode: jest.fn(() => ({ name: 'Cala' })),
        helpers: { httpRequest },
      } as unknown as IExecuteFunctions;

      await expect(node.execute.call(context)).rejects.toThrow('API Error: 500');
    });
  });

  describe('Knowledge › Query', () => {
    it('calls POST /v1/knowledge/query with correct body', async () => {
      const context = makeContext({
        operation: 'query',
        params: { query: 'startups.location=Spain.funding>10M' },
        response: { results: [] },
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.cala.ai/v1/knowledge/query',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'test-key' },
        body: { input: 'startups.location=Spain.funding>10M' },
        json: true,
      });
    });
  });

  describe('Knowledge › Search Entities', () => {
    it('calls GET /v1/knowledge/entities with name and limit', async () => {
      const context = makeContext({
        operation: 'searchEntities',
        params: { name: 'OpenAI', limit: 5 },
        response: { entities: [] },
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.cala.ai/v1/knowledge/entities',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'test-key' },
        qs: { name: 'OpenAI', limit: 5 },
        json: true,
      });
    });
  });

  describe('Knowledge › Get Entity', () => {
    it('calls GET /v1/knowledge/entities/:id', async () => {
      const context = makeContext({
        operation: 'getEntity',
        params: { entityId: 42 },
        response: { id: 42, name: 'OpenAI' },
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.cala.ai/v1/knowledge/entities/42',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'test-key' },
        json: true,
      });
    });
  });
});
