import { PrivyProvider } from '@privy-io/react-auth';

// Base Sepolia chain configuration
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  testnet: true,
};

const PrivyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    loginMethods: ['email', 'wallet', 'google', 'discord'],
    appearance: {
      theme: 'dark',
      accentColor: '#676FFF',
      logo: '/carmen.png',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
    // Add supported chains configuration
    defaultChain: baseSepolia,
    supportedChains: [baseSepolia],
  },
};

export function CustomPrivyProvider({ children }) {
  return (
    <PrivyProvider {...PrivyConfig}>
      {children}
    </PrivyProvider>
  );
} 