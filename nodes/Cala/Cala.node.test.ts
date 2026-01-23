import type { IExecuteFunctions } from 'n8n-workflow';
import { Cala } from './Cala.node';

describe('Cala Node', () => {
  let node: Cala;

  beforeEach(() => {
    node = new Cala();
  });

  describe('execute', () => {
    const createExecutionContext = ({
      baseUrl = 'https://api.cala.ai/',
      apiKey = 'test-key',
      operation = 'knowledgeSearch',
      query = 'What is Cala?',
      response = { content: 'ok' },
    } = {}): IExecuteFunctions & { helpers: { httpRequest: jest.Mock } } => {
      const httpRequest = jest.fn(async () => response);

      return {
        getInputData: jest.fn(() => [{ json: { input: 'one' } }]),
        getNodeParameter: jest.fn((name: string, _index: number) => {
          if (name === 'operation') {
            return operation;
          }
          if (name === 'query') {
            return query;
          }
          throw new Error(`Unexpected parameter name: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ baseUrl, apiKey })),
        helpers: {
          httpRequest,
        },
      } as unknown as IExecuteFunctions & { helpers: { httpRequest: jest.Mock } };
    };

    it('should call Cala API with normalized base URL', async () => {
      const context = createExecutionContext();
      const result = await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.cala.ai/v1/knowledge/search',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'test-key',
        },
        body: {
          input: 'What is Cala?',
        },
        json: true,
      });
      expect(result).toEqual([[{ json: { content: 'ok' }, pairedItem: { item: 0 } }]]);
    });

    it('should omit API key header when missing', async () => {
      const context = createExecutionContext({ apiKey: '' });
      await node.execute.call(context);

      expect(context.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.cala.ai/v1/knowledge/search',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          input: 'What is Cala?',
        },
        json: true,
      });
    });

    it('should process multiple items', async () => {
      const queries = ['Query 1', 'Query 2', 'Query 3'];
      const httpRequest = jest.fn()
        .mockResolvedValueOnce({ answer: 'Answer 1' })
        .mockResolvedValueOnce({ answer: 'Answer 2' })
        .mockResolvedValueOnce({ answer: 'Answer 3' });

      const context = {
        getInputData: jest.fn(() => queries.map(q => ({ json: { query: q } }))),
        getNodeParameter: jest.fn((name: string, index: number) => {
          if (name === 'operation') return 'knowledgeSearch';
          if (name === 'query') return queries[index];
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ baseUrl: 'https://api.cala.ai', apiKey: 'test-key' })),
        helpers: { httpRequest },
      } as unknown as IExecuteFunctions;

      const result = await node.execute.call(context);

      expect(httpRequest).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0].json).toEqual({ answer: 'Answer 1' });
      expect(result[0][1].json).toEqual({ answer: 'Answer 2' });
      expect(result[0][2].json).toEqual({ answer: 'Answer 3' });
    });

    it('should propagate HTTP errors', async () => {
      const httpRequest = jest.fn().mockRejectedValue(new Error('API Error: 500 Internal Server Error'));

      const context = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string) => {
          if (name === 'operation') return 'knowledgeSearch';
          if (name === 'query') return 'test query';
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ baseUrl: 'https://api.cala.ai', apiKey: 'test-key' })),
        helpers: { httpRequest },
      } as unknown as IExecuteFunctions;

      await expect(node.execute.call(context)).rejects.toThrow('API Error: 500 Internal Server Error');
    });

    it('should return empty array for unsupported operation', async () => {
      const httpRequest = jest.fn();

      const context = {
        getInputData: jest.fn(() => [{ json: {} }]),
        getNodeParameter: jest.fn((name: string) => {
          if (name === 'operation') return 'unsupported';
          throw new Error(`Unexpected parameter: ${name}`);
        }),
        getCredentials: jest.fn(async () => ({ baseUrl: 'https://api.cala.ai', apiKey: 'test-key' })),
        helpers: { httpRequest },
      } as unknown as IExecuteFunctions;

      const result = await node.execute.call(context);

      expect(httpRequest).not.toHaveBeenCalled();
      expect(result).toEqual([[]]);
    });
  });
});
