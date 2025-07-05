# 🕵️‍♀️ Carmen Sandiego - Web3 Detective Game

> A blockchain-based Carmen Sandiego game built on Base with data indexing powered by The Graph

## 🎮 Game Overview

Welcome to the Web3 version of the classic Carmen Sandiego detective game! Players must answer 10 geography and culture questions correctly to catch the elusive Carmen Sandiego. With 30 questions in rotation, each game presents a unique challenge.

**Can you catch Carmen?** You need to get ALL 10 questions right - **one wrong answer and she escapes immediately!** 🏃‍♀️💨

## 🎯 Live Demo

- **Game**: [Play Carmen Sandiego Web3](your-deployed-frontend-url)
- **Smart Contract**: [View on BaseScan](https://sepolia.basescan.org/address/0x3DE93A310c4626Da956eA074846EA587cB10e27f#code)
- **Contract Address**: `0x3DE93A310c4626Da956eA074846EA587cB10e27f`

## 🏗 Architecture

- **Blockchain**: Base Sepolia Testnet (Ethereum L2)
- **Smart Contract**: Solidity game logic with anti-cheat mechanisms
- **Data Storage**: IPFS for questions dataset (configurable local/remote)
- **Indexing**: The Graph Protocol for game statistics and leaderboards
- **Frontend**: React + Vite with Web3 integration (ethers.js)

## 🚀 Features

### Game Mechanics
- **30 Question Pool**: Rotating set of geography and culture questions
- **Perfect Score Required**: All 10 questions must be correct to win
- **Instant Game Over**: One wrong answer = Carmen escapes immediately!
- **One Game Per Player**: Complete your current game before starting a new one
- **Anti-Cheat**: Immutable answers, validated question selection

### Technical Features
- **Configurable IPFS**: Use local IPFS node or public gateways
- **Environment-based Config**: Easy switching between dev/prod modes
- **Automatic Fallbacks**: Local IPFS → Public gateways
- **Real-time Updates**: Instant game state synchronization
- **Responsive Design**: Works on desktop and mobile

### Statistics & Analytics (Ready for The Graph)
- Individual player statistics (games played, win rate)
- Global leaderboards
- Game completion analytics
- Real-time progress tracking

## 📋 Project Structure

```
carmen-sandiego-web3/
├── contracts/
│   ├── CarmenSandiegoGame.sol     # Main game contract
│   └── scripts/
│       └── deploy.js              # Deployment script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CarmenGame.jsx     # Main game component
│   │   ├── contracts/
│   │   │   └── CarmenGame.js      # Contract interface & IPFS config
│   │   └── data/
│   │       └── questions.js       # Local questions fallback
│   ├── .env                       # Environment configuration
│   └── package.json
├── data/
│   └── questions.json             # IPFS questions dataset
├── .env                           # Contract deployment config
├── hardhat.config.js              # Hardhat configuration
└── README.md
```

## 🛠 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Base network configured in wallet

### 1. Clone Repository
```bash
git clone https://github.com/your-username/carmen-sandiego-web3
cd carmen-sandiego-web3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy Smart Contract
```bash
# Configure environment variables
cp .env.example .env

# Deploy to Base testnet
npm run deploy:testnet

# Deploy to Base mainnet
npm run deploy:mainnet
```

### 4. Upload Questions to IPFS
```bash
# Upload questions dataset
npm run upload-questions
```

### 5. Deploy Subgraph
```bash
cd subgraph
npm install
npm run build
npm run deploy
```

### 6. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Smart Contract Functions

### Player Functions
- `startGame(uint256[10] questionIds)` - Start new game with selected questions
- `submitAnswer(uint256 answerIndex, uint256 correctAnswerIndex)` - Submit answer
- `getGameState(address player)` - Get current game progress
- `getCurrentQuestion(address player)` - Get active question details

### Statistics Functions
- `getPlayerStats(address player)` - Individual player statistics
- `getGlobalStats()` - Global game statistics
- `hasActiveGame(address player)` - Check if player has active game

## 📊 Events (The Graph)

```solidity
event GameStarted(address indexed player, uint256 gameId, uint256[10] questionIds, uint256 timestamp);
event AnswerSubmitted(address indexed player, uint256 gameId, uint256 questionIndex, uint256 answer, bool correct, uint256 timestamp);
event GameCompleted(address indexed player, uint256 gameId, bool carmenCaught, uint256 score, uint256 timestamp);
event CarmenEscaped(address indexed player, uint256 gameId, uint256 finalScore, uint256 timestamp);
```

## 🗃 Questions Dataset

The game features 30 carefully crafted questions covering:
- **Geography**: Famous landmarks, cities, countries
- **Culture**: Historical events, local customs, famous locations
- **Difficulty Levels**: Easy, Medium, Hard
- **Global Coverage**: Europe, Asia, Americas, Africa, Australia

### Sample Question Structure
```json
{
  "id": 1,
  "question": "Carmen was spotted near a famous tower that leans at 3.97 degrees. Which city?",
  "options": ["Paris", "Pisa", "London", "Rome"],
  "correctAnswer": 1,
  "difficulty": "easy",
  "region": "Europe"
}
```

## 🏆 Game Rules

1. **Start Game**: Connect wallet and click "Start New Game"
2. **Answer Questions**: 10 randomly selected questions from 30 total
3. **Perfect Score Required**: Get ALL 10 questions correct to catch Carmen
4. **Instant Elimination**: Any wrong answer = Carmen escapes immediately! 🚨
5. **One Game at a Time**: Complete your current game before starting a new one
6. **Blockchain Verified**: All answers are recorded on Base blockchain

## 🎮 How to Play

1. **Connect Wallet**: Make sure you're on Base Sepolia testnet
2. **Start Game**: Click "Start New Game" - 10 questions are randomly selected
3. **Answer Carefully**: Each question has 4 options (A, B, C, D)
4. **No Mistakes Allowed**: One wrong answer and Carmen escapes!
5. **Catch Carmen**: Answer all 10 correctly to win! 🎉

## ⚙️ IPFS Configuration

The app supports both local and remote IPFS:

**For Local Development** (faster):
```bash
# Start local IPFS node
ipfs daemon

# Set environment variable
VITE_USE_LOCAL_IPFS=true
```

**For Production/Demo**:
```bash
VITE_USE_LOCAL_IPFS=false
```

The app automatically falls back to public gateways if local IPFS fails.

## 📈 Statistics Tracked

- **Individual**: Games played, games won, win rate percentage
- **Global**: Total games, total wins, global win rate
- **Analytics**: Question difficulty analysis, popular wrong answers
- **Leaderboards**: Top players by win rate and total wins

## 🔗 Contract Addresses

### Base Sepolia Testnet ✅ (Currently Deployed)
- **Contract**: `0x3DE93A310c4626Da956eA074846EA587cB10e27f`
- **Explorer**: [View on BaseScan](https://sepolia.basescan.org/address/0x3DE93A310c4626Da956eA074846EA587cB10e27f#code)
- **Network**: Base Sepolia (Chain ID: 84532)

### Base Mainnet 🚧 (Coming Soon)
- **Contract**: `TBD`
- **Subgraph**: `TBD`

## 🎨 Frontend Features

- **Wallet Connection**: MetaMask, Rabby, WalletConnect support
- **Auto Network Detection**: Switches to Base Sepolia automatically
- **Game Interface**: Clean, intuitive question-answer flow
- **Progress Tracking**: Real-time game state updates
- **Dramatic Results**: Celebration for wins, dramatic "escape" for losses
- **Responsive Design**: Mobile and desktop optimized
- **IPFS Integration**: Configurable local/remote data loading

## 🧪 Testing

```bash
# Test the deployed contract directly on BaseScan
# Visit: https://sepolia.basescan.org/address/0x3DE93A310c4626Da956eA074846EA587cB10e27f#writeContract

# Test frontend locally
cd frontend
npm run dev

# Compile contracts
npx hardhat compile
```

## 🚀 Deployment

### Environment Variables
```bash
# Contract deployment (.env in root)
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key

# Frontend configuration (frontend/.env)
VITE_USE_LOCAL_IPFS=false
VITE_QUESTIONS_IPFS_HASH=your_ipfs_hash
```

### Deploy to Base Sepolia
```bash
# Deploy contract
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy frontend
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Hackathon Project

This project demonstrates:
- **Smart Contract Game Mechanics**: Complex game logic on Base blockchain
- **IPFS Integration**: Decentralized data storage with local/remote fallbacks
- **Web3 UX**: Seamless wallet integration and transaction handling
- **Event-Driven Architecture**: Ready for The Graph Protocol indexing
- **Modern Frontend**: React + Vite with real-time blockchain interaction

### Technical Achievements
✅ **Deployed on Base Sepolia**: Live smart contract with verified code  
✅ **IPFS Data Storage**: Questions stored on decentralized network  
✅ **Anti-Cheat Mechanisms**: Blockchain-enforced game rules  
✅ **Configurable Architecture**: Easy dev/prod environment switching  
✅ **Responsive Web3 Game**: Full gameplay experience in browser  

## 🔮 Future Enhancements

- **The Graph Subgraph**: Index all game events for leaderboards
- **Multiplayer Mode**: Compete against other detectives
- **NFT Rewards**: Collectible badges for catching Carmen
- **Difficulty Levels**: Easy, medium, hard game modes
- **Time Challenges**: Speed rounds with time limits
- **Regional Themes**: Focus on specific geographic regions
- **Carmen AI**: Dynamic question generation using LLMs

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/carmen-sandiego-web3/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/carmen-sandiego-web3/issues)
- **Discord**: [Project Discord](https://discord.gg/your-server)

---

**Happy Hunting, Detective!** 🕵️‍♀️

*Can you catch Carmen Sandiego on the blockchain?*# ethglobal_cannes_2025_carmensandiego
