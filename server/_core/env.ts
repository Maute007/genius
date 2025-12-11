export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Claude API Configuration
  claudeApiKey: process.env.CLAUDE_API_KEY ?? "",
  claudeModel: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022",
  claudeApiVersion: process.env.CLAUDE_API_VERSION ?? "2023-06-01",
};
