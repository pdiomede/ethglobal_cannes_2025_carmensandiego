import { usePrivy } from '@privy-io/react-auth';

export default function Auth() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Don't render anything until Privy is ready
  if (!ready) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={styles.signInContainer}>
        <h2 style={styles.welcomeTitle}>🕵️‍♀️ Welcome, Detective!</h2>
        <p style={styles.welcomeText}>
          Sign in to start your adventure and track your progress on the blockchain
        </p>
        <button
          onClick={login}
          style={styles.signInButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          }}
        >
          🚀 SIGN IN TO CATCH CARMEN
        </button>
        <div style={styles.signInHint}>
          <small style={styles.hintText}>
            Connect with email, wallet, Google, or Discord
          </small>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.authenticatedContainer}>
      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>
            {user?.email?.address?.[0]?.toUpperCase() || user?.wallet?.address?.slice(0, 2)}
          </span>
        </div>
        <div style={styles.userDetails}>
          <p style={styles.userEmail}>
            {user?.email?.address || `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
          </p>
          <p style={styles.statusText}>✅ Authenticated Detective</p>
        </div>
      </div>
      <button
        onClick={logout}
        style={styles.logoutButton}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#dc2626';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ef4444';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

// CSS-in-JS styles matching Carmen Sandiego theme
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '15px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    marginBottom: '2rem'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#ffffff',
    fontSize: '1rem',
    textShadow: '1px 1px 0px #000',
    margin: 0
  },
  signInContainer: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    marginBottom: '2rem',
    backgroundImage: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '1rem',
    color: '#ffed4e',
    textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  welcomeText: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#ffffff',
    textShadow: '1px 1px 0px #000',
    lineHeight: '1.6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  signInButton: {
    fontSize: '1.3rem',
    fontWeight: '700',
    padding: '1.2rem 2.5rem',
    backgroundColor: '#667eea',
    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: '3px solid #fff',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textShadow: '2px 2px 0px #000',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    marginBottom: '1rem'
  },
  signInHint: {
    marginTop: '1rem'
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    textShadow: '1px 1px 0px #000',
    fontStyle: 'italic'
  },
  authenticatedContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '15px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    marginBottom: '2rem',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  avatar: {
    width: '50px',
    height: '50px',
    backgroundColor: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textShadow: '1px 1px 0px #000'
  },
  userDetails: {
    textAlign: 'left'
  },
  userEmail: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '1.1rem',
    textShadow: '1px 1px 0px #000',
    margin: '0 0 0.25rem 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  statusText: {
    color: '#4ade80',
    fontSize: '0.9rem',
    textShadow: '1px 1px 0px #000',
    margin: 0,
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: '2px solid #fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    fontWeight: '600',
    textShadow: '1px 1px 0px #000',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }
}; 