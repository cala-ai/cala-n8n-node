import { CalaApi } from './CalaApi.credentials';

describe('CalaApi Credentials', () => {
  let credentials: CalaApi;

  beforeEach(() => {
    credentials = new CalaApi();
  });

  it('should have correct name', () => {
    expect(credentials.name).toBe('calaApi');
  });

  it('should have correct display name', () => {
    expect(credentials.displayName).toBe('Cala API');
  });

  it('should have documentation URL', () => {
    expect(credentials.documentationUrl).toBe('https://docs.cala.ai');
  });

  it('should have API key property', () => {
    const apiKeyProp = credentials.properties.find(p => p.name === 'apiKey');
    expect(apiKeyProp).toBeDefined();
    expect(apiKeyProp?.type).toBe('string');
    expect(apiKeyProp?.required).toBe(true);
    expect(apiKeyProp?.typeOptions?.password).toBe(true);
  });

  it('should only have API key property', () => {
    expect(credentials.properties).toHaveLength(1);
    expect(credentials.properties[0].name).toBe('apiKey');
  });

  it('should have authenticate config with X-API-KEY header', () => {
    expect(credentials.authenticate).toBeDefined();
    expect(credentials.authenticate.type).toBe('generic');
    expect(credentials.authenticate.properties.headers).toEqual({
      'X-API-KEY': '={{$credentials.apiKey}}',
    });
  });

  it('should have test request config', () => {
    expect(credentials.test).toBeDefined();
    expect(credentials.test.request.baseURL).toBe('https://api.cala.ai');
    expect(credentials.test.request.url).toBe('/v1/knowledge/search');
    expect(credentials.test.request.method).toBe('POST');
  });
});
