// Simple background music that definitely works
  const startSimpleBackgroundMusic = () => {
    if (!musicEnabled) return;
    
    console.log('🎵 Starting simple background music...');
    
    // Simple repeating melody - detective theme
    const notes = [
      { freq: 392, duration: 600 }, // G
      { freq: 440, duration: 600 }, // A  
      { freq: 523, duration: 600 }, // C
      { freq: 587, duration: 800 }, // D
      { freq: 523, duration: 400 }, // C
      { freq: 440, duration: 400 }, // A
      { freq: 392, duration: 800 }, // G
    ];
    
    let noteIndex = 0;
    
    const playNextNote = () => {
      if (!musicEnabled) return;
      
      const note = notes[noteIndex];
      
      // Play the note
      playMusicNote(note.freq, note.duration / 1000);
      
      // Move to next note
      noteIndex = (noteIndex + 1) % notes.length;
      
      // Schedule next note (with small gap)
      musicIntervalRef.current = setTimeout(playNextNote, note.duration + 200);
    };
    
    // Start playing
    playNextNote();
  };

  const playMusicNote = async (frequency, duration) => {
    if (!musicEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle'; // Softer than square wave
      
      // Gentle volume for background music
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration - 0.01);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
    } catch (error) {
      console.log('Music note error:', error);
    }
  };

  const stopBackgroundMusic = () => {
    console.log('🔇 Stopping background music...');
    
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
    
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Context already closed
      }
      audioContextRef.current = null;
    }
  };import React, { useState, useEffect, useRef } from 'react';
import { 
  connectWallet, 
  getContract, 
  fetchQuestions, 
  selectRandomQuestions,
  CONTRACT_ADDRESS 
} from '../contracts/CarmenGame';

const CarmenGame = () => {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameState, setGameState] = useState({
    isActive: false,
    currentQuestion: 0,
    score: 0,
    selectedQuestions: [],
    gameQuestions: [],
    gameOver: false,
    wrongAnswer: false,
    lastAnswerCorrect: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  // Audio refs
  const backgroundMusicRef = useRef(null);
  const successSoundRef = useRef(null);
  const failSoundRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);

  // Load questions and setup audio on component mount
  useEffect(() => {
    loadQuestions();
    setupAudio();
  }, []);

  // Handle music toggle - simplified version
  const toggleMusic = async () => {
    if (!audioLoaded) return;
    
    try {
      if (musicEnabled) {
        // Stop all music
        stopBackgroundMusic();
        setMusicEnabled(false);
        console.log('🔇 All audio disabled');
      } else {
        // Test if audio is allowed
        console.log('🔊 Testing audio...');
        await playBeep(440, 0.2); // Longer test beep
        
        // Start background music after test beep
        setTimeout(() => {
          startSimpleBackgroundMusic();
        }, 300);
        
        setMusicEnabled(true);
        console.log('🔊 Audio enabled - background music starting...');
      }
    } catch (error) {
      console.log('Audio blocked:', error);
      setError('🔊 Click anywhere on the page first, then try the audio button!');
      setTimeout(() => setError(''), 4000);
    }
  };

  const setupAudio = () => {
    try {
      // Skip loading audio files for now - just use Web Audio API beeps
      // You can add files later when you have them
      
      setAudioLoaded(true);
      console.log('Audio system ready - using Web Audio API sounds');
      
      /* 
      // Uncomment this when you add real audio files to frontend/public/audio/
      backgroundMusicRef.current = new Audio('/audio/carmen-theme-8bit.mp3');
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.3;
      
      successSoundRef.current = new Audio('/audio/correct-answer.mp3');
      successSoundRef.current.volume = 0.5;
      
      failSoundRef.current = new Audio('/audio/carmen-escapes.mp3');
      failSoundRef.current.volume = 0.5;
      */
      
    } catch (error) {
      console.log('Audio setup failed:', error);
      setAudioLoaded(true);
    }
  };

  const playSuccessSound = () => {
    if (!musicEnabled) return;
    
    // Play high-pitched success beep (8-bit style)
    playBeep(800, 0.2);
    console.log('🎉 Success beep!');
  };

  const playFailSound = () => {
    if (!musicEnabled) return;
    
    // Play low-pitched fail beep (8-bit style)
    playBeep(200, 0.5);
    console.log('😱 Fail beep!');
  };

  const playBeep = async (frequency, duration) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if it's suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square'; // 8-bit retro sound
      
      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
    } catch (error) {
      console.log('Beep sound error:', error);
      throw error; // Re-throw for error handling in toggleMusic
    }
  };

  // Create simple background music using Web Audio API
  const startBackgroundMusic = async () => {
    try {
      // Stop any existing music
      stopBackgroundMusic();
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Carmen Sandiego inspired melody (simplified) - Detective/Mystery theme
      const melody = [
        { freq: 392, duration: 0.4 }, // G
        { freq: 440, duration: 0.4 }, // A
        { freq: 523, duration: 0.4 }, // C
        { freq: 587, duration: 0.6 }, // D
        { freq: 523, duration: 0.4 }, // C
        { freq: 440, duration: 0.4 }, // A
        { freq: 392, duration: 0.8 }, // G
        { freq: 0, duration: 0.4 },   // Rest
        { freq: 440, duration: 0.4 }, // A
        { freq: 523, duration: 0.4 }, // C
        { freq: 587, duration: 0.4 }, // D
        { freq: 659, duration: 0.6 }, // E
        { freq: 587, duration: 0.4 }, // D
        { freq: 523, duration: 0.4 }, // C
        { freq: 440, duration: 0.8 }, // A
        { freq: 0, duration: 0.8 },   // Rest
      ];

      let loopCount = 0;
      
      const playMelodyLoop = () => {
        if (!musicEnabled || !audioContextRef.current) return;
        
        let currentTime = audioContext.currentTime;
        
        melody.forEach((note, index) => {
          if (!musicEnabled) return;
          
          if (note.freq > 0) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = note.freq;
            oscillator.type = 'square'; // 8-bit style
            
            // Background volume - quieter than sound effects
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, currentTime + 0.01); // Reduced volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration - 0.01);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);
          }
          currentTime += note.duration;
        });
        
        // Schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        backgroundMusicRef.current = setTimeout(() => {
          if (musicEnabled && audioContextRef.current) {
            loopCount++;
            console.log(`🎵 Background music loop ${loopCount}`);
            playMelodyLoop();
          }
        }, totalDuration * 1000);
      };

      console.log('🎵 Starting background music...');
      playMelodyLoop();
      
    } catch (error) {
      console.log('Background music error:', error);
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Context already closed
      }
      audioContextRef.current = null;
    }
    console.log('🔇 Background music stopped');
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await fetchQuestions();
      setQuestions(questionsData.questions);
    } catch (err) {
      setError('Failed to load questions from IPFS');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      const walletData = await connectWallet();
      setWallet(walletData);
      const contractInstance = getContract(walletData.signer);
      setContract(contractInstance);
      
      // Check if player has active game and reset local state if needed
      const hasActive = await contractInstance.hasActiveGame(walletData.address);
      if (hasActive) {
        await loadGameState(contractInstance, walletData.address);
      } else {
        // No active game, make sure local state is clean
        setGameState({
          isActive: false,
          currentQuestion: 0,
          score: 0,
          selectedQuestions: [],
          gameQuestions: [],
          gameOver: false,
          wrongAnswer: false,
          lastAnswerCorrect: null
        });
      }
    } catch (err) {
      setError(err.message.replace(/MetaMask/g, 'wallet'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGameState = async (contractInstance, playerAddress) => {
    try {
      const [questionIds, playerAnswers, correctAnswers, currentQ, correctCount, isActive, carmenCaught] = 
        await contractInstance.getGameState(playerAddress);
      
      if (isActive) {
        const selectedQuestionIds = questionIds.map(id => Number(id));
        const gameQuestions = selectedQuestionIds.map(id => 
          questions.find(q => q.id === id)
        ).filter(Boolean);

        setGameState({
          isActive,
          currentQuestion: Number(currentQ),
          score: Number(correctCount),
          selectedQuestions: selectedQuestionIds,
          gameQuestions,
          carmenCaught,
          gameOver: false,
          wrongAnswer: false,
          lastAnswerCorrect: null
        });
      }
    } catch (err) {
      console.error('Error loading game state:', err);
    }
  };

  const startNewGame = async () => {
    if (!contract || !wallet) return;

    try {
      setLoading(true);
      setError('');
      
      // First check if player has an active game
      const hasActive = await contract.hasActiveGame(wallet.address);
      if (hasActive) {
        setError('You have an active game. Please finish it first or wait for it to be completed.');
        return;
      }
      
      // Reset local state completely before starting
      setGameState({
        isActive: false,
        currentQuestion: 0,
        score: 0,
        selectedQuestions: [],
        gameQuestions: [],
        gameOver: false,
        wrongAnswer: false,
        lastAnswerCorrect: null
      });
      
      // Select 10 random questions
      const selectedIds = selectRandomQuestions();
      const gameQuestions = selectedIds.map(id => 
        questions.find(q => q.id === id)
      ).filter(Boolean);

      // Start game on blockchain
      const tx = await contract.startGame(selectedIds);
      await tx.wait();

      // Set fresh game state
      setGameState({
        isActive: true,
        currentQuestion: 0,
        score: 0,
        selectedQuestions: selectedIds,
        gameQuestions,
        gameOver: false,
        wrongAnswer: false,
        lastAnswerCorrect: null
      });
    } catch (err) {
      setError('Failed to start game: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answerIndex) => {
    if (!contract || !gameState.isActive) return;

    try {
      setLoading(true);
      setError('');

      const currentQ = gameState.gameQuestions[gameState.currentQuestion];
      const correctAnswer = currentQ.correctAnswer;

      // Submit answer to blockchain
      const tx = await contract.submitAnswer(answerIndex, correctAnswer);
      await tx.wait();

      // Update local state
      const isCorrect = answerIndex === correctAnswer;
      const newScore = gameState.score + (isCorrect ? 1 : 0);
      const nextQuestion = gameState.currentQuestion + 1;

      if (!isCorrect) {
        // GAME OVER - Wrong answer! Carmen escapes immediately
        // The smart contract automatically ends the game when you submit a wrong answer
        playFailSound();
        setGameState(prev => ({
          ...prev,
          isActive: false,
          score: newScore,
          carmenCaught: false,
          gameOver: true,
          wrongAnswer: true,
          lastAnswerCorrect: false
        }));
      } else if (nextQuestion >= 10) {
        // Game finished with perfect score - Carmen caught!
        // The smart contract automatically ends the game when you complete all 10 questions
        playSuccessSound();
        setGameState(prev => ({
          ...prev,
          isActive: false,
          score: newScore,
          carmenCaught: true,
          gameOver: true,
          wrongAnswer: false,
          lastAnswerCorrect: true
        }));
      } else {
        // Correct answer - continue to next question
        playSuccessSound();
        setGameState(prev => ({
          ...prev,
          currentQuestion: nextQuestion,
          score: newScore,
          lastAnswerCorrect: true
        }));
      }
    } catch (err) {
      setError('Failed to submit answer: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    try {
      setLoading(true);
      setError('');
      
      // FORCE COMPLETE RESET - Clear everything immediately
      const freshState = {
        isActive: false,
        currentQuestion: 0,
        score: 0,
        selectedQuestions: [],
        gameQuestions: [],
        gameOver: false,
        wrongAnswer: false,
        lastAnswerCorrect: null
      };
      
      setGameState(freshState);
      
      // Force re-render by updating a key
      console.log('🔄 Game state forcefully reset');
      
    } catch (err) {
      console.error('Error resetting game:', err);
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Nuclear reset function
  const forceCompleteReset = () => {
    // Reset everything to initial state
    setGameState({
      isActive: false,
      currentQuestion: 0,
      score: 0,
      selectedQuestions: [],
      gameQuestions: [],
      gameOver: false,
      wrongAnswer: false,
      lastAnswerCorrect: null
    });
    setError('');
    setLoading(false);
    setMusicEnabled(false);
    
    console.log('💥 NUCLEAR RESET - Everything cleared');
  };

  if (loading && questions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading Carmen Sandiego...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
        }
        
        /* Comic book style backgrounds */
        .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 2%),
            radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 1%, transparent 1%);
          background-size: 100px 100px, 50px 50px;
          pointer-events: none;
          z-index: 1;
        }
        
        /* Answer button hover effects */
        .answer-button:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          text-shadow: 1px 1px 0px #000 !important;
          transform: translateY(-3px) scale(1.02) !important;
        }
      `}</style>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          {/* Carmen Image */}
          <div style={styles.carmenImageContainer}>
            <img 
              src="/carmen.png" 
              alt="Carmen Sandiego" 
              style={styles.carmenImage}
              onError={(e) => {
                // Hide image if file doesn't exist
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          <h1 style={styles.title}>🕵️‍♀️ Carmen Sandiego</h1>
          <p style={styles.subtitle}>Web3 Detective Game on Base</p>
          <p style={styles.contractAddress}>Contract: {CONTRACT_ADDRESS}</p>
          
          {/* Music Toggle */}
          {audioLoaded && (
            <div style={styles.musicControls}>
              <button
                onClick={toggleMusic}
                style={{
                  ...styles.musicButton,
                  backgroundColor: musicEnabled ? '#4ade80' : '#f87171'
                }}
                title={musicEnabled ? 'Turn off sound effects' : 'Turn on sound effects'}
              >
                {musicEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF'}
              </button>
              <div style={styles.musicHint}>
                <small>
                  {!musicEnabled ? '🎵 Click to enable sounds!' : '🎶 Sound effects active!'}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Wallet Connection */}
        {!wallet ? (
          <div style={styles.centerContent}>
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              style={{...styles.button, ...styles.primaryButton}}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div style={styles.gameArea}>
            {/* Wallet Info */}
            <div style={styles.walletInfo}>
              <p>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
            </div>

            {/* Game Area */}
            {!gameState.isActive && !gameState.gameOver ? (
              // Start Game
              <div style={styles.centerContent}>
                <h2 style={styles.gameTitle}>Ready to catch Carmen?</h2>
                <p style={styles.instructions}>
                  🚨 <strong>WARNING:</strong> You need to answer ALL 10 questions correctly!<br/>
                  One wrong answer and Carmen escapes! 🏃‍♀️💨
                </p>
                <button
                  onClick={startNewGame}
                  disabled={loading}
                  style={{...styles.button, ...styles.successButton}}
                >
                  {loading ? 'Starting...' : 'Start New Game'}
                </button>
              </div>
            ) : gameState.isActive ? (
              // Active Game
              <div>
                {/* Progress */}
                <div style={styles.progress}>
                  <div style={styles.progressText}>
                    <span>Question {gameState.currentQuestion + 1} of 10</span>
                    <span>Correct: {gameState.score}/{Math.max(1, gameState.currentQuestion + 1)}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${((gameState.currentQuestion + 1) / 10) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Current Question */}
                {gameState.gameQuestions[gameState.currentQuestion] && (
                  <div style={styles.questionCard}>
                    <h3 style={styles.questionText}>
                      {gameState.gameQuestions[gameState.currentQuestion].question}
                    </h3>
                    <div style={styles.answerGrid}>
                      {gameState.gameQuestions[gameState.currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => submitAnswer(index)}
                          disabled={loading}
                          style={styles.answerButton}
                          className="answer-button"
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : gameState.gameOver ? (
              // Game Finished - Updated with better messaging
              <div style={styles.centerContent}>
                {gameState.carmenCaught ? (
                  // Perfect Score - Carmen Caught!
                  <div style={styles.resultContainer}>
                    <div style={styles.successEmoji}>🎉🕵️‍♀️🎉</div>
                    <h2 style={{...styles.gameTitle, color: '#10b981'}}>INCREDIBLE!</h2>
                    <h3 style={{...styles.subtitle, color: '#10b981'}}>Carmen Sandiego has been CAUGHT!</h3>
                    <p style={styles.resultText}>
                      Perfect score: {gameState.score}/10 questions correct!<br/>
                      You're a master detective! 🏆
                    </p>
                    <div style={styles.achievementBadge}>
                      🥇 MASTER DETECTIVE ACHIEVEMENT UNLOCKED! 🥇
                    </div>
                  </div>
                ) : (
                  // Wrong Answer - Carmen Escaped!
                  <div style={styles.resultContainer}>
                    <div style={styles.escapeEmoji}>😱🏃‍♀️💨</div>
                    <h2 style={{...styles.gameTitle, color: '#ef4444'}}>OH NO!</h2>
                    <h3 style={{...styles.subtitle, color: '#ef4444'}}>Carmen Sandiego has ESCAPED!</h3>
                    <p style={styles.resultText}>
                      You got {gameState.score} question{gameState.score !== 1 ? 's' : ''} right, but Carmen needed just one mistake to slip away!<br/>
                      <em>"Better luck next time, detective!" - Carmen</em> 😏
                    </p>
                    <div style={styles.tipBox}>
                      💡 <strong>Detective Tip:</strong> Carmen is cunning - you need a PERFECT score to catch her!
                    </div>
                  </div>
                )}
                <div style={styles.resetButtons}>
                  <button
                    onClick={resetGame}
                    disabled={loading}
                    style={{...styles.button, ...styles.primaryButton, ...styles.playAgainButton}}
                  >
                    {loading ? 'Resetting...' : '🔄 Try Again'}
                  </button>
                  
                  <button
                    onClick={forceCompleteReset}
                    style={{...styles.button, ...styles.resetButton}}
                  >
                    💥 Force Reset
                  </button>
                </div>
                
                {/* Manual refresh option */}
                <div style={styles.refreshHint}>
                  <button 
                    onClick={() => window.location.reload()} 
                    style={styles.linkButton}
                  >
                    🔄 Refresh Page
                  </button>
                  <small> (if buttons don't work)</small>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {loading && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div>Processing transaction...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CSS-in-JS styles with Carmen Sandiego comic theme
const styles = {
  container: {
    minHeight: '100vh',
    background: `
      linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #8b1538 100%),
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 206, 84, 0.2), transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(234, 88, 12, 0.2), transparent 50%)
    `,
    backgroundSize: '100% 100%, 200px 200px, 300px 300px, 250px 250px',
    backgroundRepeat: 'no-repeat, repeat, repeat, repeat',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    position: 'relative',
    zIndex: 2,
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(5px)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    background: 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #8e44ad)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 8s ease infinite',
    padding: '2rem',
    borderRadius: '15px',
    border: '3px solid #fff',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2)',
    position: 'relative'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
    textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
    color: '#ffffff',
    letterSpacing: '1px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  subtitle: {
    fontSize: '1.4rem',
    marginBottom: '0.5rem',
    textShadow: '2px 2px 0px #000',
    fontWeight: '600',
    color: '#ffed4e',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  contractAddress: {
    fontSize: '0.85rem',
    opacity: 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '0.5rem',
    borderRadius: '10px',
    fontFamily: 'Monaco, "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    wordBreak: 'break-all'
  },
  error: {
    backgroundColor: '#dc2626',
    border: '3px solid #b91c1c',
    color: '#ffffff',
    padding: '1.5rem',
    borderRadius: '15px',
    marginBottom: '1rem',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
    fontWeight: 'bold',
    textShadow: '1px 1px 0px #000'
  },
  centerContent: {
    textAlign: 'center'
  },
  button: {
    padding: '1rem 2rem',
    borderRadius: '15px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: '3px solid #fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textShadow: '1px 1px 0px #000',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff'
  },
  successButton: {
    background: 'linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%)',
    color: '#ffffff'
  },
  gameArea: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  walletInfo: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '2px solid #fff',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  gameTitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
    textShadow: '2px 2px 0px #000',
    color: '#ffed4e',
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  instructions: {
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid #ff6b6b',
    textShadow: '1px 1px 0px #000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  progress: {
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontWeight: '600',
    textShadow: '1px 1px 0px #000',
    fontSize: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  progressBar: {
    backgroundColor: '#374151',
    borderRadius: '25px',
    height: '1rem',
    border: '2px solid #fff',
    overflow: 'hidden'
  },
  progressFill: {
    background: 'linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcf7f)',
    height: '1rem',
    borderRadius: '25px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
  },
  questionCard: {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    borderRadius: '20px',
    padding: '2rem',
    border: '3px solid #fff',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    position: 'relative'
  },
  questionText: {
    fontSize: '1.3rem',
    marginBottom: '1.5rem',
    textShadow: '2px 2px 0px #000',
    lineHeight: '1.5',
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  answerGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  answerButton: {
    width: '100%',
    textAlign: 'left',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    color: '#2d3748',
    padding: '1.2rem',
    borderRadius: '15px',
    border: '3px solid #fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    fontWeight: '500',
    textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: '1.4'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    padding: '3rem',
    textShadow: '2px 2px 0px #000'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    borderRadius: '20px',
    textAlign: 'center',
    border: '3px solid #fff',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textShadow: '1px 1px 0px #000'
  },
  resultContainer: {
    padding: '2rem',
    textAlign: 'center',
    maxWidth: '600px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)'
  },
  successEmoji: {
    fontSize: '5rem',
    marginBottom: '1rem',
    filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.5))'
  },
  escapeEmoji: {
    fontSize: '5rem',
    marginBottom: '1rem',
    filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.5))'
  },
  resultText: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    lineHeight: '1.8',
    textShadow: '1px 1px 0px #000'
  },
  achievementBadge: {
    background: 'linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%)',
    color: '#ffffff',
    padding: '1.5rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    fontWeight: 'bold',
    border: '3px solid #fff',
    textShadow: '2px 2px 0px #000',
    boxShadow: '0 0 20px rgba(86, 171, 47, 0.5)',
    animation: 'pulse 2s infinite'
  },
  tipBox: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: '3px solid #ffd93d',
    color: '#ffffff',
    padding: '1.5rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    fontStyle: 'italic',
    textShadow: '1px 1px 0px #000',
    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
  },
  playAgainButton: {
    fontSize: '1.2rem',
    padding: '1.5rem 2.5rem'
  },
  refreshHint: {
    marginTop: '1rem',
    opacity: 0.8
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 'inherit',
    marginLeft: '0.5rem'
  },
  musicButton: {
    background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
    color: '#2d3748',
    border: '2px solid #fff',
    padding: '0.8rem 1.5rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  },
  resetButton: {
    background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a52 100%)',
    color: '#ffffff',
    fontSize: '0.9rem',
    padding: '0.8rem 1.5rem',
    marginLeft: '1rem'
  },
  resetButtons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  musicControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '1rem'
  },
  musicHint: {
    marginTop: '0.5rem',
    opacity: 0.8,
    textAlign: 'center'
  },
  carmenImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  carmenImage: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.5))',
    borderRadius: '15px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  loadingCarmenImage: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '1rem',
    filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))',
    borderRadius: '10px'
  }
};

export default CarmenGame;