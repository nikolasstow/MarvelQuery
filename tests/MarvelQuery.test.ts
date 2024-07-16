import MarvelQuery, { Endpoint, ParamsType, createQuery } from "src";

describe('MarvelQuery', () => {
  beforeAll(() => {
    // Initialize MarvelQuery with mock keys
    MarvelQuery.init({
      publicKey: 'mockPublicKey',
      privateKey: 'mockPrivateKey',
    });
  });

  it('should create an instance with API key and secret', () => {
    const endpoint: Endpoint = ['characters'];
    const params: ParamsType<typeof endpoint> = { name: 'Spider-Man' };
    const query = createQuery(endpoint, params);
    expect(query).toBeInstanceOf(MarvelQuery);
  });

  it('should build a valid URL', () => {
    const endpoint: Endpoint = ['characters'];
    const params: ParamsType<typeof endpoint> = { name: 'Spider-Man' };
    const query = createQuery(endpoint, params);
    const url = query.buildURL();
    expect(url).toContain('apikey=mockPublicKey');
  });

  // Add more tests for other methods and functionalities
});