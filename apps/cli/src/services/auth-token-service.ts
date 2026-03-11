import { ApiClient } from '../auth/api-client.js';
import { AuthError } from '../utils/errors.js';
export class AuthTokenService {
  private apiClient: ApiClient;
  constructor(apiClient?: ApiClient) {
    this.apiClient = apiClient || new ApiClient();
  }
  async getAuthTokenOrThrow(): Promise<string> {
    const idToken = await this.apiClient.getAuthToken();
    if (!idToken) {
      throw new AuthError('Authentication token not available');
    }
    return idToken;
  }
  getApiClient(): ApiClient {
    return this.apiClient;
  }
}
