import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiConfig } from 'wagmi';
import { configureChainsWithPrivy } from '@privy-io/wagmi-connector';
import { baseGoerli, base } from 'viem/chains';

// Configure chains for Privy
const configureChainsConfig = configureChainsWithPrivy([
  baseGoerli, // Base Sepolia/Testnet
  base,       // Base Mainnet
]);

const PrivyAppProvider = ({ children }) => {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "your-privy-app-id"}
      config={{
        // Appearance customization
        appearance: {
          theme: 'dark',
          accentColor: '#667eea',
          logo: '/carmen.png', // Your Carmen image as logo
        },
        // Login methods
        loginMethods: ['email', 'google', 'twitter', 'discord', 'wallet'],
        // Embedded wallet config
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: true, // Reduces signature prompts!
        },
        // Default chain
        defaultChain: baseGoerli,
        // Supported chains
        supportedChains: [baseGoerli, base],
        // Mobile optimizations
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <WagmiConfig config={configureChainsConfig}>
        {children}
      </WagmiConfig>
    </PrivyProvider>
  );
};

export default PrivyAppProvider;