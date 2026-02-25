/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID: string
  readonly VITE_AZURE_TENANT_ID: string
  readonly VITE_AZURE_SUBDOMAIN: string
  readonly VITE_AZURE_REDIRECT_URI?: string
  readonly VITE_AZURE_POST_LOGOUT_REDIRECT_URI?: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_STRIPE_API_URL?: string
  readonly VITE_USE_MOCK_AUTH?: string
  readonly VITE_BYPASS_AZURE_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
