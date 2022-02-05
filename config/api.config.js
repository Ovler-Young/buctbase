/**
 * This file contains the configuration for the API endpoints and tokens we use.
 *
 * - If you are a OneDrive International user, you would not have to change anything here.
 * - If you are not the admin of your OneDrive for Business account, you may need to define your own clientId/clientSecret,
 *   check documentation for more details.
 * - If you are using a E5 Subscription OneDrive for Business account, the direct links of your files are not the same here.
 *   In which case you would need to change directLinkRegex.
 */
module.exports = {
  // The clientId and clientSecret are used to authenticate the user with Microsoft Graph API using OAuth. You would
  // not need to change anything here if you can authenticate with your personal Microsoft account with OneDrive International.
  clientId: process.env.NEXT_PUBLIC_USER_CLIENT_ID || "d87bcc39-1750-4ca0-ad54-f8d0efbb2735",
  obfuscatedClientSecret: process.env.NEXT_PUBLIC_OBFUSCATED_CLIENT_SECRAT || "U2FsdGVkX1830zo3/pFDqaBCVBb37iLw3WnBDWGF9GIB2f4apzv0roemp8Y+iIxI3Ih5ecyukqELQEGzZlYiWg==",

  // The redirectUri is the URL that the user will be redirected to after they have authenticated with Microsoft Graph API.
  // Likewise, you would not need to change redirectUri if you are using your personal Microsoft account with OneDrive International.
  redirectUri: "http://localhost/od-cf",

  // These are the URLs of the OneDrive API endpoints. You would not need to change anything here if you are using OneDrive International
  // or E5 Subscription OneDrive for Business. You may need to change these if you are using OneDrive 世纪互联.
  authApi: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  driveApi: "https://graph.microsoft.com/v1.0/sites/hz4z.sharepoint.com,b6d230f6-81ed-40ba-9bff-8bc0f789a57b,b531b603-96be-4a1e-859e-e7d5bfd23284/drive",

  // The scope we require are listed here, in most cases you would not need to change this as well.
  scope: 'user.read files.read.all offline_access',

  // The directLinkRegex is used to match the direct link of the file from the response of the API. We originally use this to prevent
  // unauthorised use of the proxied download feature - but that is disabled for now. So you can safely ignore this settings.
  directLinkRegex: ".*hz4z.sharepoint.com.*"
}
