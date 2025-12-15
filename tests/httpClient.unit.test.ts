import { BASE_PATH_OAUTH_PROD, BASE_PATH_OAUTH_TEST } from '../src/constants';
import { HttpClient } from '../src/utils/httpClient';

describe('HttpClient', () => {
  describe('HttpClient URL normalization', () => {
    let fetchMock: jest.Mock;
    let originalFetch: any;

    const mockJsonResponse = () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' } as any,
      json: async () => ({}),
      text: async () => '',
    });

    beforeAll(() => {
      originalFetch = (global as any).fetch;
      fetchMock = jest.fn();
      (global as any).fetch = fetchMock;
    });

    afterAll(() => {
      (global as any).fetch = originalFetch;
    });

    beforeEach(() => {
      fetchMock.mockReset();
    });

    it('uses normalized base URL with trailing slash and strips leading slash from relative paths', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse());

      const client = new HttpClient({ baseURL: BASE_PATH_OAUTH_TEST });

      await client.get('/validare/FACT1');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe('https://api.anaf.ro/test/FCTEL/rest/validare/FACT1');
    });

    it('normalizes BASE_PATH_OAUTH_PROD for validation endpoint resolution', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse());

      const client = new HttpClient({ baseURL: BASE_PATH_OAUTH_PROD });

      await client.get('/validare/FACT1');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe('https://api.anaf.ro/prod/FCTEL/rest/validare/FACT1');
    });

    it('normalizes per-request base URLs without trailing slash', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse());

      const client = new HttpClient();

      await client.get('validare/FACT1', { baseURL: BASE_PATH_OAUTH_TEST });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe('https://api.anaf.ro/test/FCTEL/rest/validare/FACT1');
    });

    it('leaves absolute URLs unchanged', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse());

      const client = new HttpClient({ baseURL: BASE_PATH_OAUTH_TEST });

      await client.get('https://example.com/path');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe('https://example.com/path');
    });
  });
});
