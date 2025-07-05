import { ethers } from 'ethers';

// Your deployed contract address
export const CONTRACT_ADDRESS = '0x3DE93A310c4626Da956eA074846EA587cB10e27f';

// Your questions IPFS hash - can be overridden by environment variable
export const QUESTIONS_IPFS_HASH = import.meta.env.VITE_QUESTIONS_IPFS_HASH || 'bafkreign6k76liptbhl3vhzyapl2pccb5lw73cix3rdvxymdghoxzagh7u';

// Contract ABI (simplified for main functions)
export const CONTRACT_ABI = [
  "function startGame(uint256[10] memory questionIds) external",
  "function submitAnswer(uint256 answerIndex, uint256 correctAnswerIndex) external",
  "function getGameState(address player) external view returns (uint256[10] memory questionIds, uint256[10] memory playerAnswers, bool[10] memory correctAnswers, uint8 currentQuestion, uint8 correctCount, bool isActive, bool carmenCaught, uint256 startTime, uint256 endTime)",
  "function getCurrentQuestion(address player) external view returns (uint256 questionId, uint8 questionIndex)",
  "function getPlayerStats(address player) external view returns (uint256 gamesPlayed, uint256 wins, uint256 winRate)",
  "function getGlobalStats() external view returns (uint256 totalGames, uint256 totalWins, uint256 globalWinRate)",
  "function hasActiveGame(address player) external view returns (bool)",
  "event GameStarted(address indexed player, uint256 gameId, uint256[10] questionIds, uint256 timestamp)",
  "event AnswerSubmitted(address indexed player, uint256 gameId, uint256 questionIndex, uint256 answer, bool correct, uint256 timestamp)",
  "event GameCompleted(address indexed player, uint256 gameId, bool carmenCaught, uint256 score, uint256 timestamp)",
  "event CarmenEscaped(address indexed player, uint256 gameId, uint256 finalScore, uint256 timestamp)"
];

// Base Sepolia network config
export const BASE_SEPOLIA = {
  chainId: '0x14a34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// Configuration for IPFS - controlled by environment variable
export const IPFS_CONFIG = {
  // For Vercel: Use remote IPFS gateways
  USE_LOCAL_NODE: import.meta.env.VITE_USE_LOCAL_IPFS === 'true',
  LOCAL_GATEWAY: import.meta.env.VITE_LOCAL_IPFS_GATEWAY || 'http://localhost:8080',
  PUBLIC_GATEWAYS: [
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://dweb.link',
    'https://gateway.pinata.cloud'  // Added Pinata gateway
  ]
};

// Fetch questions from IPFS with environment-controlled local/remote option
export async function fetchQuestions() {
  const gateways = [];
  
  // Add local gateway first if enabled via environment variable
  if (IPFS_CONFIG.USE_LOCAL_NODE) {
    gateways.push(IPFS_CONFIG.LOCAL_GATEWAY);
    console.log('🏠 Local IPFS node enabled via VITE_USE_LOCAL_IPFS - trying local gateway first');
  } else {
    console.log('🌐 Using public IPFS gateways only (VITE_USE_LOCAL_IPFS not set to true)');
  }
  
  // Add public gateways
  gateways.push(...IPFS_CONFIG.PUBLIC_GATEWAYS);
  
  // Try each gateway in order
  for (const gateway of gateways) {
    try {
      console.log(`🔍 Trying IPFS gateway: ${gateway}`);
      const response = await fetch(`${gateway}/ipfs/${QUESTIONS_IPFS_HASH}`, {
        // Add timeout for faster fallback
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Successfully loaded questions from: ${gateway}`);
        return data;
      }
      
      console.log(`❌ Failed to load from: ${gateway} (Status: ${response.status})`);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.log(`⏰ Timeout from gateway: ${gateway}`);
      } else {
        console.log(`❌ Error with gateway ${gateway}:`, error.message);
      }
    }
  }
  
  throw new Error(`Failed to fetch questions from all IPFS gateways. Config: ${JSON.stringify(IPFS_CONFIG)}`);
}

// Connect to wallet and switch to Base Sepolia
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('Web3 wallet is not installed');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Try to switch to Base Sepolia
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA.chainId }],
      });
    } catch (switchError) {
      // If Base Sepolia is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA],
        });
      } else {
        throw switchError;
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

// Get contract instance
export function getContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Helper function to randomly select 10 questions from 30
export function selectRandomQuestions(totalQuestions = 30, count = 10) {
  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const selected = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    selected.push(questions[randomIndex]);
    questions.splice(randomIndex, 1);
  }
  
  return selected;
}