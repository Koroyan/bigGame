const cron = require('node-cron');
const mongoose = require('mongoose');
const Game = require('./models/Game'); // Import the Table model
require('dotenv').config();

// Helper function to create a new game
const createGame = async (name, cost, interval, prize, isNewYearGame = false) => {
  try {
    const now = new Date();
    const nextPrizeTime = new Date(Math.ceil(now.getTime() / (interval * 1000)) * interval * 1000); // Round to the next multiple of the interval

    const newGame = new Game({
      name,
      cost,
      interval,
      prize,
      nextPrizeTime,
      players: [],
      winners: [],
      status: 'active', // Game is active initially
    });

    await newGame.save();
    console.log(`Created new game: ${name} with cost ${cost} USDT, prize ${prize} USDT, next draw time ${nextPrizeTime}`);
  } catch (error) {
    console.error('Error creating game:', error);
  }
};

// Helper function to mark expired games and create new ones
const checkAndCreateNewGameIfExpired = async () => {
  try {
    const now = new Date();
    const games = await Game.find({ status: 'active' });

    for (const game of games) {
      if (now >= game.nextPrizeTime) {
        // Mark the old game as expired
        game.status = 'expired';
        await game.save();

        // Create a new game with the same properties
        await createGame(game.name, game.cost, game.interval, game.prize);
        console.log(`Game ${game.name} expired and new game created.`);
      }
    }
  } catch (error) {
    console.error('Error checking and creating new games:', error);
  }
};

// Function to create special "New Year" game
const createNewYearGame = async () => {
  try {
    const now = new Date();
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1); // New Year is January 1st next year
    const newYearPrize = 1000000; // Example prize for New Year

    await createGame('New Year Special', 100, 86400 * 365, newYearPrize, true); // Set the interval to one year (365 days)
    console.log('New Year Special game created!');
  } catch (error) {
    console.error('Error creating New Year game:', error);
  }
};

// Function to add all games at the specified intervals (1, 2, 3, 5, 8, 13, 21 minutes and days)
const addGamesAtIntervals = async () => {
  try {
    const intervalsInMinutes = [1, 2, 3, 5, 8, 13, 21]; // Intervals for minutes
    const intervalsInDays = [1, 2, 3, 5, 8, 13, 21]; // Intervals for days
    const prizeAmounts = [100, 500, 1000, 5000, 10000, 50000]; // Example prize amounts

    // Create games for different minute intervals
    for (let i = 0; i < intervalsInMinutes.length; i++) {
      await createGame(`Every ${intervalsInMinutes[i]} Minute`, 1, intervalsInMinutes[i] * 60, prizeAmounts[i % prizeAmounts.length]);
    }

    // Create games for different day intervals
    for (let i = 0; i < intervalsInDays.length; i++) {
      await createGame(`Every ${intervalsInDays[i]} Day`, 5, intervalsInDays[i] * 86400, prizeAmounts[i % prizeAmounts.length]);
    }

    console.log('Games added at specified intervals.');
  } catch (error) {
    console.error('Error adding games at intervals:', error);
  }
};

// // Cron job to create games every 20 minutes
// const startCronJobForGameCreation = () => {
//   cron.schedule('*/20 * * * *', async () => {
//     console.log('Creating new games...');
//     await addGamesAtIntervals(); // Add all games at intervals
//     await createNewYearGame(); // Add the special New Year game
//     console.log('New games created!');
//   });
// };

// Cron job to check for expired games and replace them with new ones
const startCronJobForGameExpirationCheck = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for expired games...');
    await checkAndCreateNewGameIfExpired(); // Check for expired games and create new ones
    console.log('Expired games checked and replaced!');
  });
};

// Connect to MongoDB and start the cron jobs
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Start cron jobs
    startCronJobForGameCreation();
    startCronJobForGameExpirationCheck();
    console.log('Cron jobs started...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
 addGamesAtIntervals(); // Add all games at intervals
 createNewYearGame();

start(); // Start the application
