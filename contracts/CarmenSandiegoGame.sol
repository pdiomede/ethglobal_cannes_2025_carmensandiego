// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CarmenSandiegoGame {
    // Events for The Graph indexing
    event GameStarted(address indexed player, uint256 gameId, uint256[10] questionIds, uint256 timestamp);
    event AnswerSubmitted(address indexed player, uint256 gameId, uint256 questionIndex, uint256 answer, bool correct, uint256 timestamp);
    event GameCompleted(address indexed player, uint256 gameId, bool carmenCaught, uint256 score, uint256 timestamp);
    event CarmenEscaped(address indexed player, uint256 gameId, uint256 finalScore, uint256 timestamp);

    struct Game {
        uint256[10] questionIds;        // The 10 selected questions for this game
        uint256[10] playerAnswers;      // Player's answers (0 = not answered yet)
        bool[10] correctAnswers;        // Track which answers are correct
        uint8 currentQuestion;          // Current question index (0-9)
        uint8 correctCount;             // Number of correct answers
        bool isActive;                  // Game is in progress
        bool carmenCaught;              // Player won by getting all 10 correct
        uint256 startTime;              // When game started
        uint256 endTime;                // When game ended
    }

    // State variables
    string public questionsIPFSHash;           // IPFS hash for questions JSON
    uint256 public constant TOTAL_QUESTIONS = 30;     // Total questions available
    uint256 public constant QUESTIONS_PER_GAME = 10;  // Questions per game
    uint256 public gameCounter;                 // Global game counter
    uint256 public totalGamesPlayed;           // Statistics
    uint256 public totalCarmenCaught;          // Statistics
    
    // Mappings
    mapping(address => Game) public playerGames;
    mapping(address => uint256) public playerGameCount;
    mapping(address => uint256) public playerWins;
    mapping(uint256 => address) public gameIdToPlayer;

    // Modifiers
    modifier gameActive(address player) {
        require(playerGames[player].isActive, "No active game");
        _;
    }

    modifier gameNotActive(address player) {
        require(!playerGames[player].isActive, "Game already active");
        _;
    }

    modifier validQuestionIds(uint256[10] memory questionIds) {
        for (uint i = 0; i < QUESTIONS_PER_GAME; i++) {
            require(questionIds[i] >= 1 && questionIds[i] <= TOTAL_QUESTIONS, "Invalid question ID");
            // Check for duplicates
            for (uint j = i + 1; j < QUESTIONS_PER_GAME; j++) {
                require(questionIds[i] != questionIds[j], "Duplicate question ID");
            }
        }
        _;
    }

    constructor(string memory _questionsIPFSHash) {
        questionsIPFSHash = _questionsIPFSHash;
    }

    /**
     * @dev Start a new game with selected question IDs
     * @param questionIds Array of 10 unique question IDs (1-30)
     */
    function startGame(uint256[10] memory questionIds) 
        external 
        gameNotActive(msg.sender)
        validQuestionIds(questionIds)
    {
        gameCounter++;
        
        Game storage game = playerGames[msg.sender];
        game.questionIds = questionIds;
        game.currentQuestion = 0;
        game.correctCount = 0;
        game.isActive = true;
        game.carmenCaught = false;
        game.startTime = block.timestamp;
        game.endTime = 0;
        
        // Reset arrays
        for (uint i = 0; i < QUESTIONS_PER_GAME; i++) {
            game.playerAnswers[i] = 0;
            game.correctAnswers[i] = false;
        }
        
        gameIdToPlayer[gameCounter] = msg.sender;
        playerGameCount[msg.sender]++;
        totalGamesPlayed++;
        
        emit GameStarted(msg.sender, gameCounter, questionIds, block.timestamp);
    }

    /**
     * @dev Submit answer for current question
     * @param answerIndex The selected answer (0-3)
     * @param correctAnswerIndex The correct answer index from IPFS data
     */
    function submitAnswer(uint256 answerIndex, uint256 correctAnswerIndex) 
        external 
        gameActive(msg.sender) 
    {
        require(answerIndex <= 3, "Invalid answer index");
        require(correctAnswerIndex <= 3, "Invalid correct answer index");
        
        Game storage game = playerGames[msg.sender];
        require(game.currentQuestion < QUESTIONS_PER_GAME, "All questions answered");
        require(game.playerAnswers[game.currentQuestion] == 0, "Question already answered");
        
        uint256 currentQ = game.currentQuestion;
        game.playerAnswers[currentQ] = answerIndex + 1; // Store as 1-4 instead of 0-3
        
        bool isCorrect = (answerIndex == correctAnswerIndex);
        game.correctAnswers[currentQ] = isCorrect;
        
        if (isCorrect) {
            game.correctCount++;
        }
        
        emit AnswerSubmitted(
            msg.sender, 
            gameCounter, 
            currentQ, 
            answerIndex, 
            isCorrect, 
            block.timestamp
        );
        
        game.currentQuestion++;
        
        // Check if game is complete
        if (game.currentQuestion == QUESTIONS_PER_GAME) {
            _endGame(msg.sender);
        }
    }

    /**
     * @dev Internal function to end the game
     */
    function _endGame(address player) internal {
        Game storage game = playerGames[player];
        game.isActive = false;
        game.endTime = block.timestamp;
        
        // Carmen is caught only if ALL 10 questions are correct
        if (game.correctCount == QUESTIONS_PER_GAME) {
            game.carmenCaught = true;
            playerWins[player]++;
            totalCarmenCaught++;
            
            emit GameCompleted(player, gameCounter, true, game.correctCount, block.timestamp);
        } else {
            emit CarmenEscaped(player, gameCounter, game.correctCount, block.timestamp);
        }
    }

    /**
     * @dev Get current game state for a player
     */
    function getGameState(address player) external view returns (
        uint256[10] memory questionIds,
        uint256[10] memory playerAnswers,
        bool[10] memory correctAnswers,
        uint8 currentQuestion,
        uint8 correctCount,
        bool isActive,
        bool carmenCaught,
        uint256 startTime,
        uint256 endTime
    ) {
        Game storage game = playerGames[player];
        return (
            game.questionIds,
            game.playerAnswers,
            game.correctAnswers,
            game.currentQuestion,
            game.correctCount,
            game.isActive,
            game.carmenCaught,
            game.startTime,
            game.endTime
        );
    }

    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 gamesPlayed,
        uint256 wins,
        uint256 winRate // in basis points (10000 = 100%)
    ) {
        uint256 games = playerGameCount[player];
        uint256 playerWinCount = playerWins[player];
        uint256 rate = games > 0 ? (playerWinCount * 10000) / games : 0;
        
        return (games, playerWinCount, rate);
    }

    /**
     * @dev Get global game statistics
     */
    function getGlobalStats() external view returns (
        uint256 totalGames,
        uint256 totalWins,
        uint256 globalWinRate // in basis points
    ) {
        uint256 rate = totalGamesPlayed > 0 ? (totalCarmenCaught * 10000) / totalGamesPlayed : 0;
        return (totalGamesPlayed, totalCarmenCaught, rate);
    }

    /**
     * @dev Update IPFS hash for questions (only contract owner)
     */
    function updateQuestionsHash(string memory newHash) external {
        // In a full implementation, add onlyOwner modifier
        questionsIPFSHash = newHash;
    }

    /**
     * @dev Get the current question for active game
     */
    function getCurrentQuestion(address player) external view gameActive(player) returns (
        uint256 questionId,
        uint8 questionIndex
    ) {
        Game storage game = playerGames[player];
        require(game.currentQuestion < QUESTIONS_PER_GAME, "All questions answered");
        
        return (
            game.questionIds[game.currentQuestion],
            game.currentQuestion
        );
    }

    /**
     * @dev Check if player has an active game
     */
    function hasActiveGame(address player) external view returns (bool) {
        return playerGames[player].isActive;
    }
}