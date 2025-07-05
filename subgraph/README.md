# Carmen Sandiego Subgraph

A comprehensive subgraph for indexing the Carmen Sandiego Web3 Detective Game on Base Sepolia.

## 📊 What This Subgraph Tracks

- **Games**: All game sessions, outcomes, and statistics
- **Players**: Individual player profiles and performance metrics
- **Answers**: Detailed answer history and timing data
- **Questions**: Question difficulty analysis and success rates
- **Leaderboards**: Top players by win rate and performance
- **Daily Stats**: Day-by-day game activity and trends
- **Global Stats**: Overall game statistics and metrics

## 🏗 Setup Instructions

### 1. Install Dependencies

```bash
cd subgraph
npm install
```

### 2. Install Graph CLI (globally)

```bash
npm install -g @graphprotocol/graph-cli
```

### 3. Generate TypeScript Types

```bash
npm run codegen
```

### 4. Build the Subgraph

```bash
npm run build
```

## 🚀 Deployment Options

### Option 1: Deploy to The Graph Studio (Recommended)

1. **Create a subgraph in The Graph Studio**:
   - Go to [thegraph.com/studio](https://thegraph.com/studio)
   - Connect your wallet
   - Create a new subgraph named "carmen-sandiego-web3"

2. **Authenticate with Studio**:
   ```bash
   graph auth --studio YOUR_DEPLOY_KEY
   ```

3. **Deploy to Studio**:
   ```bash
   npm run deploy
   ```

### Option 2: Deploy to Hosted Service (Legacy)

1. **Create subgraph on hosted service**:
   ```bash
   graph create --node https://api.thegraph.com/deploy/ your-github-username/carmen-sandiego-web3
   ```

2. **Deploy**:
   ```bash
   graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ your-github-username/carmen-sandiego-web3
   ```

### Option 3: Local Development

1. **Start local Graph Node** (requires Docker):
   ```bash
   # Clone graph-node repository
   git clone https://github.com/graphprotocol/graph-node.git
   cd graph-node/docker
   
   # Update ethereum network in docker-compose.yml to point to Base Sepolia
   # Then start the services
   docker-compose up
   ```

2. **Create and deploy locally**:
   ```bash
   npm run create-local
   npm run deploy-local
   ```

## 📈 Example Queries

### Get Top Players by Win Rate

```graphql
{
  players(
    first: 10
    orderBy: winRate
    orderDirection: desc
    where: { gamesPlayed_gte: 5 }
  ) {
    id
    address
    gamesPlayed
    gamesWon
    winRate
    bestScore
    longestWinStreak
  }
}
```

### Get Recent Games

```graphql
{
  games(
    first: 20
    orderBy: startTime
    orderDirection: desc
  ) {
    id
    player {
      id
      address
    }
    status
    score
    carmenCaught
    startTime
    endTime
    duration
  }
}
```

### Get Global Statistics

```graphql
{
  globalStats(id: "global") {
    totalGames
    totalPlayers
    totalCarmenCaught
    totalCarmenEscaped
    globalWinRate
    lastUpdated
  }
}
```

### Get Question Difficulty Analysis

```graphql
{
  questionStats(
    orderBy: correctRate
    orderDirection: asc
    first: 10
  ) {
    questionId
    timesAsked
    timesAnsweredCorrectly
    correctRate
    averageAnswerTime
  }
}
```

### Get Daily Activity

```graphql
{
  dailyStats(
    orderBy: date
    orderDirection: desc
    first: 7
  ) {
    date
    gamesPlayed
    gamesWon
    gamesLost
    uniquePlayers
    averageScore
  }
}
```

### Get Player Game History

```graphql
{
  player(id: "0x...") {
    id
    address
    gamesPlayed
    winRate
    games(
      first: 10
      orderBy: startTime
      orderDirection: desc
    ) {
      id
      status
      score
      carmenCaught
      startTime
      answers {
        questionIndex
        questionId
        isCorrect
        timeFromStart
      }
    }
  }
}
```

## 📊 Available Entities

### Player
- Individual player statistics and performance
- Game history and win streaks
- Score averages and personal bests

### Game
- Complete game sessions with outcomes
- Question selection and timing
- Links to all answers submitted

### Answer
- Individual answer submissions
- Response times and correctness
- Question-specific data

### GlobalStats
- Overall game statistics
- Total players and games
- Global win rates

### DailyStats
- Day-by-day activity metrics
- Player engagement tracking
- Performance trends

### QuestionStats
- Question difficulty analysis
- Success rates per question
- Average response times

### LeaderboardEntry
- Ranked player performance
- Filterable by different metrics
- Real-time ranking updates

## 🔧 Configuration

### Update Contract Address

Edit `subgraph.yaml` to update the contract address:

```yaml
source:
  address: "0x4e7D8B73a95818cE1C2954eaC231e46B508E981A"
  startBlock: 18500000  # Update to your deployment block
```

### Update Network

To deploy on a different network, update the `network` field in `subgraph.yaml`:

```yaml
network: base-sepolia  # or mainnet, polygon, etc.
```

## 🚀 Frontend Integration

### Install GraphQL Client

```bash
npm install @apollo/client graphql
```

### Example React Hook

```typescript
import { useQuery, gql } from '@apollo/client';

const GET_LEADERBOARD = gql`
  query GetLeaderboard($first: Int!) {
    players(
      first: $first
      orderBy: winRate
      orderDirection: desc
      where: { gamesPlayed_gte: 5 }
    ) {
      id
      address
      gamesPlayed
      gamesWon
      winRate
      bestScore
    }
  }
`;

export function useLeaderboard(limit = 10) {
  const { loading, error, data } = useQuery(GET_LEADERBOARD, {
    variables: { first: limit },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  return {
    loading,
    error,
    players: data?.players || [],
  };
}
```

## 📝 Development Notes

- The subgraph tracks all events from the Carmen Sandiego smart contract
- Player addresses are used as unique identifiers
- Game outcomes are immediately reflected in player statistics
- Question statistics help identify which questions are most challenging
- Daily statistics provide insights into player engagement patterns

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed with `npm install`
2. **Codegen Errors**: Ensure the ABI file exists in `abis/CarmenSandiegoGame.json`
3. **Network Issues**: Verify the contract address and network in `subgraph.yaml`
4. **Deployment Issues**: Check your authentication and subgraph name

### Useful Commands

```bash
# Generate types
npm run codegen

# Build subgraph
npm run build

# Deploy to studio
npm run deploy

# View logs (for local deployment)
docker-compose logs graph-node
```

## 📄 License

This subgraph is part of the Carmen Sandiego Web3 project and is licensed under MIT. 