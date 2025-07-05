import {
  GameStarted,
  AnswerSubmitted,
  GameCompleted,
  CarmenEscaped
} from "../generated/CarmenSandiegoGame/CarmenSandiegoGame"
import {
  Game,
  Player,
  Answer,
  GlobalStats,
  DailyStats,
  QuestionStats,
  LeaderboardEntry
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts"

// Constants
const GLOBAL_STATS_ID = "global"
const ZERO_BI = BigInt.fromI32(0)
const ONE_BI = BigInt.fromI32(1)
const ZERO_BD = BigDecimal.fromString("0")
const HUNDRED_BD = BigDecimal.fromString("100")

export function handleGameStarted(event: GameStarted): void {
  // Get or create player
  let player = getOrCreatePlayer(event.params.player)
  
  // Create new game
  let game = new Game(event.params.gameId.toString())
  game.gameId = event.params.gameId
  game.player = player.id
  game.questionIds = event.params.questionIds
  game.status = "ACTIVE"
  game.score = ZERO_BI
  game.carmenCaught = false
  game.startTime = event.params.timestamp
  game.totalAnswers = ZERO_BI
  game.correctAnswers = ZERO_BI
  game.wrongAnswers = ZERO_BI
  game.save()
  
  // Update player stats
  player.gamesPlayed = player.gamesPlayed.plus(ONE_BI)
  player.lastGameAt = event.params.timestamp
  if (player.firstGameAt.equals(ZERO_BI)) {
    player.firstGameAt = event.params.timestamp
  }
  player.save()
  
  // Update global stats
  updateGlobalStats(event.params.timestamp)
  
  // Update daily stats
  updateDailyStats(event.params.timestamp, true, false, false)
}

export function handleAnswerSubmitted(event: AnswerSubmitted): void {
  // Load game
  let game = Game.load(event.params.gameId.toString())
  if (!game) {
    return
  }
  
  // Create answer entity
  let answerId = event.params.gameId.toString() + "-" + event.params.questionIndex.toString()
  let answer = new Answer(answerId)
  answer.game = game.id
  answer.questionIndex = event.params.questionIndex
  answer.questionId = game.questionIds[event.params.questionIndex.toI32()]
  answer.playerAnswer = event.params.answer
  answer.isCorrect = event.params.correct
  answer.timestamp = event.params.timestamp
  answer.timeFromStart = event.params.timestamp.minus(game.startTime)
  answer.save()
  
  // Update game stats
  game.totalAnswers = game.totalAnswers.plus(ONE_BI)
  if (event.params.correct) {
    game.correctAnswers = game.correctAnswers.plus(ONE_BI)
    game.score = game.score.plus(ONE_BI)
  } else {
    game.wrongAnswers = game.wrongAnswers.plus(ONE_BI)
  }
  game.save()
  
  // Update question stats
  updateQuestionStats(answer.questionId, event.params.correct, answer.timeFromStart)
}

export function handleGameCompleted(event: GameCompleted): void {
  // Load game
  let game = Game.load(event.params.gameId.toString())
  if (!game) {
    return
  }
  
  // Update game
  game.status = "COMPLETED_WIN"
  game.carmenCaught = true
  game.endTime = event.params.timestamp
  game.duration = event.params.timestamp.minus(game.startTime)
  game.save()
  
  // Update player stats
  let player = Player.load(game.player)
  if (player) {
    player.gamesWon = player.gamesWon.plus(ONE_BI)
    player.totalScore = player.totalScore.plus(game.score)
    player.currentWinStreak = player.currentWinStreak.plus(ONE_BI)
    
    // Update best score
    if (game.score.gt(player.bestScore)) {
      player.bestScore = game.score
    }
    
    // Update longest win streak
    if (player.currentWinStreak.gt(player.longestWinStreak)) {
      player.longestWinStreak = player.currentWinStreak
    }
    
    // Calculate win rate
    if (player.gamesPlayed.gt(ZERO_BI)) {
      player.winRate = player.gamesWon.toBigDecimal()
        .div(player.gamesPlayed.toBigDecimal())
        .times(HUNDRED_BD)
    }
    
    // Calculate average score
    if (player.gamesPlayed.gt(ZERO_BI)) {
      player.averageScore = player.totalScore.toBigDecimal()
        .div(player.gamesPlayed.toBigDecimal())
    }
    
    player.save()
  }
  
  // Update global stats
  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  if (globalStats) {
    globalStats.totalCarmenCaught = globalStats.totalCarmenCaught.plus(ONE_BI)
    globalStats.save()
  }
  
  // Update daily stats
  updateDailyStats(event.params.timestamp, false, true, false)
}

export function handleCarmenEscaped(event: CarmenEscaped): void {
  // Load game
  let game = Game.load(event.params.gameId.toString())
  if (!game) {
    return
  }
  
  // Update game
  game.status = "COMPLETED_LOSS"
  game.carmenCaught = false
  game.endTime = event.params.timestamp
  game.duration = event.params.timestamp.minus(game.startTime)
  game.save()
  
  // Update player stats
  let player = Player.load(game.player)
  if (player) {
    player.gamesLost = player.gamesLost.plus(ONE_BI)
    player.totalScore = player.totalScore.plus(game.score)
    player.currentWinStreak = ZERO_BI // Reset win streak
    
    // Calculate win rate
    if (player.gamesPlayed.gt(ZERO_BI)) {
      player.winRate = player.gamesWon.toBigDecimal()
        .div(player.gamesPlayed.toBigDecimal())
        .times(HUNDRED_BD)
    }
    
    // Calculate average score
    if (player.gamesPlayed.gt(ZERO_BI)) {
      player.averageScore = player.totalScore.toBigDecimal()
        .div(player.gamesPlayed.toBigDecimal())
    }
    
    player.save()
  }
  
  // Update global stats
  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  if (globalStats) {
    globalStats.totalCarmenEscaped = globalStats.totalCarmenEscaped.plus(ONE_BI)
    globalStats.save()
  }
  
  // Update daily stats
  updateDailyStats(event.params.timestamp, false, false, true)
}

// Helper functions
function getOrCreatePlayer(address: Bytes): Player {
  let player = Player.load(address.toHex())
  
  if (!player) {
    player = new Player(address.toHex())
    player.address = address
    player.gamesPlayed = ZERO_BI
    player.gamesWon = ZERO_BI
    player.gamesLost = ZERO_BI
    player.winRate = ZERO_BD
    player.totalScore = ZERO_BI
    player.averageScore = ZERO_BD
    player.bestScore = ZERO_BI
    player.longestWinStreak = ZERO_BI
    player.currentWinStreak = ZERO_BI
    player.firstGameAt = ZERO_BI
    player.lastGameAt = ZERO_BI
    player.save()
  }
  
  return player
}

function updateGlobalStats(timestamp: BigInt): void {
  let globalStats = GlobalStats.load(GLOBAL_STATS_ID)
  
  if (!globalStats) {
    globalStats = new GlobalStats(GLOBAL_STATS_ID)
    globalStats.totalGames = ZERO_BI
    globalStats.totalPlayers = ZERO_BI
    globalStats.totalCarmenCaught = ZERO_BI
    globalStats.totalCarmenEscaped = ZERO_BI
    globalStats.globalWinRate = ZERO_BD
  }
  
  globalStats.totalGames = globalStats.totalGames.plus(ONE_BI)
  globalStats.lastUpdated = timestamp
  
  // Calculate global win rate
  if (globalStats.totalGames.gt(ZERO_BI)) {
    globalStats.globalWinRate = globalStats.totalCarmenCaught.toBigDecimal()
      .div(globalStats.totalGames.toBigDecimal())
      .times(HUNDRED_BD)
  }
  
  globalStats.save()
}

function updateDailyStats(timestamp: BigInt, newGame: boolean, gameWon: boolean, gameLost: boolean): void {
  // Convert timestamp to date string (YYYY-MM-DD)
  let day = timestamp.toI32() / 86400
  let dayId = day.toString()
  
  let dailyStats = DailyStats.load(dayId)
  if (!dailyStats) {
    dailyStats = new DailyStats(dayId)
    dailyStats.date = dayId
    dailyStats.gamesPlayed = ZERO_BI
    dailyStats.gamesWon = ZERO_BI
    dailyStats.gamesLost = ZERO_BI
    dailyStats.uniquePlayers = ZERO_BI
    dailyStats.totalScore = ZERO_BI
    dailyStats.averageScore = ZERO_BD
  }
  
  if (newGame) {
    dailyStats.gamesPlayed = dailyStats.gamesPlayed.plus(ONE_BI)
  }
  
  if (gameWon) {
    dailyStats.gamesWon = dailyStats.gamesWon.plus(ONE_BI)
  }
  
  if (gameLost) {
    dailyStats.gamesLost = dailyStats.gamesLost.plus(ONE_BI)
  }
  
  dailyStats.save()
}

function updateQuestionStats(questionId: BigInt, correct: boolean, answerTime: BigInt): void {
  let questionStats = QuestionStats.load(questionId.toString())
  
  if (!questionStats) {
    questionStats = new QuestionStats(questionId.toString())
    questionStats.questionId = questionId
    questionStats.timesAsked = ZERO_BI
    questionStats.timesAnsweredCorrectly = ZERO_BI
    questionStats.timesAnsweredWrong = ZERO_BI
    questionStats.correctRate = ZERO_BD
    questionStats.averageAnswerTime = ZERO_BD
  }
  
  questionStats.timesAsked = questionStats.timesAsked.plus(ONE_BI)
  
  if (correct) {
    questionStats.timesAnsweredCorrectly = questionStats.timesAnsweredCorrectly.plus(ONE_BI)
  } else {
    questionStats.timesAnsweredWrong = questionStats.timesAnsweredWrong.plus(ONE_BI)
  }
  
  // Calculate correct rate
  if (questionStats.timesAsked.gt(ZERO_BI)) {
    questionStats.correctRate = questionStats.timesAnsweredCorrectly.toBigDecimal()
      .div(questionStats.timesAsked.toBigDecimal())
      .times(HUNDRED_BD)
  }
  
  questionStats.save()
} 