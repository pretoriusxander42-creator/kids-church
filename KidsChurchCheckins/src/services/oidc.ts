import { Issuer, type Client, generators } from 'openid-client';

type ProviderKey = 'google' | 'microsoft';

const providerConfig: Record<
  ProviderKey,
  {
    envClientId: string;
    envClientSecret: string;
    envRedirectUri: string;
    issuerUrl: string;
  }
> = {
  google: {
    envClientId: process.env.GOOGLE_CLIENT_ID || '',
    envClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    envRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    issuerUrl: 'https://accounts.google.com'
  },
  microsoft: {
    envClientId: process.env.MS_CLIENT_ID || '',
    envClientSecret: process.env.MS_CLIENT_SECRET || '',
    envRedirectUri: process.env.MS_REDIRECT_URI || '',
    issuerUrl: 'https://login.microsoftonline.com/common/v2.0'
  }
};

const clientCache: Partial<Record<ProviderKey, Client>> = {};
const issuerCache: Partial<Record<ProviderKey, ReturnType<typeof Issuer.discover>>> = {};

export function assertProvider(provider: any): asserts provider is ProviderKey {
  if (provider !== 'google' && provider !== 'microsoft') {
    throw new Error('unsupported provider');
  }
  const cfg = providerConfig[provider];
  if (!cfg.envClientId || !cfg.envClientSecret || !cfg.envRedirectUri) {
    throw new Error(`OAuth for ${provider} is not configured in environment variables`);
  }
}

/**
 * Create or return cached openid-client Client instance for provider.
 * Caller can call client.userinfo(accessToken) to validate access tokens and get userinfo.
 */
export async function getClient(provider: ProviderKey) {
  if (clientCache[provider]) return clientCache[provider]!;
  const issuer = await Issuer.discover(providerConfig[provider].issuerUrl);
  issuerCache[provider] = issuer;
  const client = new issuer.Client({
    client_id: providerConfig[provider].envClientId,
    client_secret: providerConfig[provider].envClientSecret,
    redirect_uris: [providerConfig[provider].envRedirectUri],
    response_types: ['code']
  });
  clientCache[provider] = client;
  return client;
}