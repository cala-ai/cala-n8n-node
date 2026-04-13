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
    response = { content: 'ok' } as Record<string, unknown>,
    itemCount = 1,
    continueOnFail = false,
  } = {}): IExecuteFunctions & { helpers: { httpRequestWithAuthentication: jest.Mock } } => {
    const httpRequestWithAuthentication = jest.fn(async () => response);

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
      getNode: jest.fn(() => ({ name: 'Cala' })),
      continueOnFail: jest.fn(() => continueOnFail),
      helpers: { httpRequestWithAuthentication },
    } as unknown as IExecuteFunctions & { helpers: { httpRequestWithAuthentication: jest.Mock } };
  };

  describe('Knowledge › Search', () => {
    it('calls POST /v1/knowledge/search with correct body', async () => {
      const context = makeContext({
        operation: 'search',
        params: { query: 'What is Cala?' },
      });

      const result = await node.execute.call(context);

      expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'calaApi',
        {
          method: 'POST',
          url: 'https://api.cala.ai/v1/knowledge/search',
          body: { input: 'What is Cala?' },
          json: true,
        },
      );
      expect(result).toEqual([[{ json: { content: 'ok' }, pairedItem: { item: 0 } }]]);
    });

    it('processes multiple items', async () => {
      const queries = ['Query 1', 'Query 2', 'Query 3'];
      const httpRequestWithAuthentication = jest.fn()
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
        getNode: jest.fn(() => ({ name: 'Cala' })),
        continueOnFail: jest.fn(() => false),
        helpers: { httpRequestWithAuthentication },
      } as unknown as IExecuteFunctions;

      const result = await node.execute.call(context);

      expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0].json).toEqual({ answer: 'Answer 1' });
      expect(result[0][1].json).toEqual({ answer: 'Answer 2' });
      expect(result[0][2].json).toEqual({ answer: 'Answer 3' });
    });

    it('propagates HTTP errors when continueOnFail is false', async () => {
      const httpRequestWithAuthentication = jest.fn().mockRejectedValue({ message: 'API Error: 500' });

      const context = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string) => {
          if (name === 'resource') return 'knowledge';
          if (name === 'operation') return 'search';
          if (name === 'query') return 'test';
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getNode: jest.fn(() => ({ name: 'Cala' })),
        continueOnFail: jest.fn(() => false),
        helpers: { httpRequestWithAuthentication },
      } as unknown as IExecuteFunctions;

      await expect(node.execute.call(context)).rejects.toThrow();
    });

    it('returns error item when continueOnFail is true', async () => {
      const httpRequestWithAuthentication = jest.fn().mockRejectedValue(new Error('API Error: 500'));

      const context = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string) => {
          if (name === 'resource') return 'knowledge';
          if (name === 'operation') return 'search';
          if (name === 'query') return 'test';
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getNode: jest.fn(() => ({ name: 'Cala' })),
        continueOnFail: jest.fn(() => true),
        helpers: { httpRequestWithAuthentication },
      } as unknown as IExecuteFunctions;

      const result = await node.execute.call(context);

      expect(result[0][0].json).toEqual({ error: 'API Error: 500' });
      expect(result[0][0].pairedItem).toEqual({ item: 0 });
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

      expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'calaApi',
        {
          method: 'POST',
          url: 'https://api.cala.ai/v1/knowledge/query',
          body: { input: 'startups.location=Spain.funding>10M' },
          json: true,
        },
      );
    });
  });

  describe('Knowledge › Search Entities', () => {
    it('calls GET /v1/entities with name and limit', async () => {
      const context = makeContext({
        operation: 'searchEntities',
        params: { name: 'OpenAI', limit: 5, entity_types: [] },
        response: { entities: [] },
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'calaApi',
        {
          method: 'GET',
          url: 'https://api.cala.ai/v1/entities',
          qs: { name: 'OpenAI', limit: 5 },
          json: true,
        },
      );
    });

    it('includes entity_types in qs when provided', async () => {
      const context = makeContext({
        operation: 'searchEntities',
        params: { name: 'Apple', limit: 20, entity_types: ['Company', 'Organization'] },
        response: { entities: [] },
      });

      await node.execute.call(context);

      expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'calaApi',
        {
          method: 'GET',
          url: 'https://api.cala.ai/v1/entities',
          qs: { name: 'Apple', limit: 20, entity_types: ['Company', 'Organization'] },
          json: true,
        },
      );
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

      expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'calaApi',
        {
          method: 'GET',
          url: 'https://api.cala.ai/v1/knowledge/entities/42',
          json: true,
        },
      );
    });
  });
});
