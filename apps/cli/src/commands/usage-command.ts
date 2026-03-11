import { ApiClient } from '../auth/api-client.js';
import { AuthTokenService } from '../services/auth-token-service.js';
import { callFunction } from '../utils/functions-client.js';
import type { CommandDefinition } from '../types/command.js';
export const usageCommand: CommandDefinition = {
  name: 'usage',
  description: 'Show your usage statistics and plan information',
  handler: async (_args: string[], _options: Record<string, any>) => {
    const apiClient = new ApiClient();
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Not authenticated. Please run /auth first.');
    }
    const authTokenService = new AuthTokenService(apiClient);
    const idToken = await authTokenService.getAuthTokenOrThrow();
    const usageData = await callFunction<{
      computeSecondsUsed: number;
      computeSecondsLimit: number;
      computeHoursUsed: number;
      computeHoursLimit: number;
      requestsCount: number;
      month: string;
      plan: string;
    }>('getUsageData', {}, idToken);
    return usageData;
  },
};
