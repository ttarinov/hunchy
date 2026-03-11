export interface BackendConnectionConfig {
  apiKey: string;
  authEndpoint: string;
  serviceUrl: string;
  project: string;
}
export interface PathsConfig {
  cliAuth: string;
  sessions: string;
  chats: string;
  messages: string;
}
export interface WebsiteConfig {
  url: string;
  authPath: string;
}
export interface AppConfig {
  backend: BackendConnectionConfig;
  paths: PathsConfig;
  website: WebsiteConfig;
}
export interface AuthConfig {
  authToken?: string;
  refreshToken?: string;
  customToken?: string;
  backendConfig?: BackendConnectionConfig;
  config?: AppConfig;
  userId?: string;
  userEmail?: string;
}
