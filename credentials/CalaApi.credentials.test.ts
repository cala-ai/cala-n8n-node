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

  it('should have base URL property with default value', () => {
    const baseUrlProp = credentials.properties.find(p => p.name === 'baseUrl');
    expect(baseUrlProp).toBeDefined();
    expect(baseUrlProp?.type).toBe('string');
    expect(baseUrlProp?.default).toBe('https://api.cala.ai');
  });
});
