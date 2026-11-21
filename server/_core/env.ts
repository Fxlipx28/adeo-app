export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  /** Si es "false", no se exige identidad verificada (solo para desarrollo/pruebas). */
  requireVerification: process.env.REQUIRE_VERIFICATION !== "false",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
