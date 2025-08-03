interface ImportMetaEnv {
  readonly VITE_CANISTER_ID_PETID_BACKEND: string;
  readonly VITE_CANISTER_ID_PETID_FRONTEND: string;
  readonly VITE_CANISTER_ID_INTERNET_IDENTITY: string;
  readonly VITE_DFX_NETWORK: string;
  readonly VITE_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}