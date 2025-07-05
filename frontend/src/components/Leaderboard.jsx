import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Your subgraph endpoint URL (replace with your actual deployed subgraph URL)
  const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/your-username/carmen-sandiego-web3';

  const fetchLeaderboard = async (timeframe = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query GetLeaderboard($first: Int!) {
          players(
            first: $first
            orderBy: winRate
            orderDirection: desc
            where: { gamesPlayed_gte: 3 }
          ) {
            id
            address
            gamesPlayed
            gamesWon
            gamesLost
            winRate
            bestScore
            longestWinStreak
            currentWinStreak
            averageScore
            totalScore
            firstGameAt
            lastGameAt
          }
          globalStats(id: "global") {
            totalGames
            totalPlayers
            totalCarmenCaught
            totalCarmenEscaped
            globalWinRate
          }
        }
      `;

      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { first: 50 }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setLeaderboard(data.data.players || []);
      console.log('Global Stats:', data.data.globalStats);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedTimeframe);
  }, [selectedTimeframe]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatWinRate = (winRate) => {
    return parseFloat(winRate).toFixed(1);
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getStreakColor = (streak) => {
    if (streak >= 10) return '#10b981'; // Green
    if (streak >= 5) return '#f59e0b';  // Yellow
    if (streak >= 3) return '#3b82f6';  // Blue
    return '#6b7280'; // Gray
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Unable to Load Leaderboard</h2>
          <p style={styles.errorText}>
            {error.includes('fetch') 
              ? 'Subgraph not yet deployed. Deploy the subgraph first to see leaderboard data.'
              : `Error: ${error}`
            }
          </p>
          <button 
            onClick={() => fetchLeaderboard(selectedTimeframe)}
            style={styles.retryButton}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Detective Leaderboard</h1>
        <p style={styles.subtitle}>Top Carmen Sandiego Detectives</p>
      </div>

      {/* Timeframe Filter */}
      <div style={styles.filterContainer}>
        <button 
          style={{
            ...styles.filterButton, 
            ...(selectedTimeframe === 'all' ? styles.filterButtonActive : {})
          }}
          onClick={() => setSelectedTimeframe('all')}
        >
          All Time
        </button>
        <button 
          style={{
            ...styles.filterButton, 
            ...(selectedTimeframe === 'week' ? styles.filterButtonActive : {})
          }}
          onClick={() => setSelectedTimeframe('week')}
        >
          This Week
        </button>
        <button 
          style={{
            ...styles.filterButton, 
            ...(selectedTimeframe === 'month' ? styles.filterButtonActive : {})
          }}
          onClick={() => setSelectedTimeframe('month')}
        >
          This Month
        </button>
      </div>

      {/* Leaderboard */}
      <div style={styles.leaderboardContainer}>
        {leaderboard.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>
              No players found. Be the first to play and appear on the leaderboard!
            </p>
          </div>
        ) : (
          leaderboard.map((player, index) => (
            <div key={player.id} style={styles.playerCard}>
              <div style={styles.playerRank}>
                <span style={styles.rankNumber}>{getRankEmoji(index)}</span>
              </div>
              
              <div style={styles.playerInfo}>
                <div style={styles.playerAddress}>
                  {formatAddress(player.address)}
                </div>
                <div style={styles.playerStats}>
                  <span style={styles.stat}>
                    Win Rate: <strong>{formatWinRate(player.winRate)}%</strong>
                  </span>
                  <span style={styles.stat}>
                    Games: <strong>{player.gamesPlayed}</strong>
                  </span>
                  <span style={styles.stat}>
                    Wins: <strong>{player.gamesWon}</strong>
                  </span>
                </div>
              </div>

              <div style={styles.playerMetrics}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Best Score</span>
                  <span style={styles.metricValue}>{player.bestScore}/10</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Avg Score</span>
                  <span style={styles.metricValue}>
                    {parseFloat(player.averageScore).toFixed(1)}
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Win Streak</span>
                  <span 
                    style={{
                      ...styles.metricValue,
                      color: getStreakColor(parseInt(player.currentWinStreak))
                    }}
                  >
                    {player.currentWinStreak} 🔥
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Data updated in real-time via The Graph Protocol
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#6b7280',
    marginBottom: '2rem'
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  filterButton: {
    padding: '0.75rem 1.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '25px',
    background: 'white',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '1rem',
    fontWeight: '500'
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  leaderboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s'
  },
  playerRank: {
    marginRight: '1rem',
    minWidth: '60px'
  },
  rankNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  playerInfo: {
    flex: 1,
    marginRight: '1rem'
  },
  playerAddress: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  playerStats: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  stat: {
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  playerMetrics: {
    display: 'flex',
    gap: '1rem'
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px'
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.25rem'
  },
  metricValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1.1rem'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '1rem'
  },
  errorText: {
    color: '#7f1d1d',
    marginBottom: '1.5rem',
    lineHeight: '1.6'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  emptyStateText: {
    fontSize: '1.1rem',
    lineHeight: '1.6'
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
    padding: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#6b7280'
  }
};

export default Leaderboard; 