/**
 * Authentication testing utilities to validate Microsoft Entra ID integration
 */

export function logAuthenticationState(accounts: any[], activeAccount: any) {
  console.group('🔍 Authentication State Analysis');

  console.log('📊 Accounts Summary:', {
    totalAccounts: accounts.length,
    hasActiveAccount: !!activeAccount
  });

  if (accounts.length > 0) {
    accounts.forEach((account, index) => {
      console.group(`👤 Account ${index + 1}:`);
      console.log('Basic Info:', {
        localAccountId: account.localAccountId,
        homeAccountId: account.homeAccountId,
        name: account.name,
        username: account.username
      });

      if (account.idTokenClaims) {
        console.log('🎫 ID Token Claims:', account.idTokenClaims);

        // Check for essential claims
        const essentialClaims = {
          oid: account.idTokenClaims.oid,
          sub: account.idTokenClaims.sub,
          name: account.idTokenClaims.name,
          email: account.idTokenClaims.email,
          preferred_username: account.idTokenClaims.preferred_username,
          upn: account.idTokenClaims.upn
        };

        console.log('✅ Essential Claims:', essentialClaims);

        // Validate claim completeness
        const missingClaims: string[] = [];
        if (!essentialClaims.oid && !essentialClaims.sub) {
          missingClaims.push('User ID (oid/sub)');
        }
        if (!essentialClaims.name) {
          missingClaims.push('Display Name');
        }
        if (!essentialClaims.email && !essentialClaims.preferred_username && !essentialClaims.upn) {
          missingClaims.push('Email/Username');
        }

        if (missingClaims.length > 0) {
          console.warn('⚠️ Missing Claims:', missingClaims);
        } else {
          console.log('✅ All essential claims present');
        }
      } else {
        console.warn('⚠️ No ID Token Claims found');
      }

      console.groupEnd();
    });
  } else {
    console.log('⚠️ No accounts found');
  }

  console.groupEnd();
}

export function validateTokenResponse(response: any) {
  console.group('🎫 Token Response Validation');

  if (!response) {
    console.error('❌ No token response received');
    console.groupEnd();
    return false;
  }

  console.log('📋 Token Response:', {
    hasAccessToken: !!response.accessToken,
    hasIdToken: !!response.idToken,
    hasAccount: !!response.account,
    scopes: response.scopes,
    expiresOn: response.expiresOn
  });

  if (response.account) {
    console.log('👤 Account in Response:', {
      name: response.account.name,
      username: response.account.username,
      hasIdTokenClaims: !!response.account.idTokenClaims
    });
  }

  const isValid = !!(response.accessToken || response.idToken) && !!response.account;
  console.log(isValid ? '✅ Token response is valid' : '❌ Token response is invalid');

  console.groupEnd();
  return isValid;
}