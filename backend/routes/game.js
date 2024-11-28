const express = require('express');
const router = express.Router();
const Game = require('../models/Game'); // Import Table model
const User = require('../models/User'); // Import User model
const BigGame = require('../models/BigGame');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Import crypto module
const { sendTransaction, getUserBalance } = require('../utild/trc20trxUtils');  // Import helper methods


const gameWallet = process.env.GAME_WALLET;
const gamePK = process.env.GAME_WALLET_PRIVATE_KEY;

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Optional chaining for safe access

  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
};

// Deposit function (Transaction processing)
router.post('/deposit', authenticateToken, async (req, res) => {
  const { userEmail, amount, walletAddress } = req.body;

const { id } = req.user; 
  
      // Fetch user data from the database
      const user = await User.findById(id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Check for pending transactions
  const pendingTx = user.transactions.find(tx => tx.status === 'pending');
  if (pendingTx) {
    return res.status(400).send('Transaction pending, please wait.');
  }

  // Process deposit transaction
  try {
    const tx = await sendTransaction(user.privateKey, gameWallet, amount);

    console.log('grigory: ',tx.txid);
    // Create a pending transaction record
    user.transactions.push({
      type:'deposit',
      txHash: tx.txid,
      amount:amount,
      status: 'pending',
    });

    await user.save();

    res.status(200).send('Deposit initiated. Awaiting confirmation...');
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).send('Transaction failed.');
  }
});


router.post('/bigGame', authenticateToken, async (req, res) => {
  const { id } = req.user; // Extract user ID from authenticated token

 
  try{
    // Fetch user data from the database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if user has enough game balance
    const spinCost = 5; // Cost per spin (in USDT)
    if (user.balance < spinCost) {
      return res.status(400).send('Insufficient balance.');
    }


    console.log('pk ',user.privateKey);

    const transactionResult = await sendTransaction(user.privateKey,gameWallet,spinCost);
  
    console.log('res: ',transactionResult.txid);

  const bigGame = new BigGame({
  userId:id,
  transactionId:transactionResult.txid,
  amount:spinCost
  });

  bigGame.save();

  res.status(200).send({
    transactionResult:transactionResult
  });
}  catch (err) {
  console.error(err);
  res.status(500).send('An error occurred while processing the spin.');
}

});

// Route to get all Big Game Tickets
router.get('/getBigGameTickets', authenticateToken, async (req, res) => {
  try {
    const bigGameTickets = await BigGame.find({}); // Await the query
    res.status(200).json(bigGameTickets); // Use res.json for sending JSON directly
  } catch (error) {
    console.error('Error fetching Big Game Tickets:', error);
    res.status(500).json({ message: 'Server error while fetching Big Game Tickets' });
  }
});

// Route to get Big Game Tickets for the authenticated user
router.get('/getBigGameUserTickets', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user; // Extract the user ID from the authenticated token
    const bigGameTickets = await BigGame.find({ userId: id }); // Await the query
    console.log('User Tickets:', bigGameTickets);
    res.status(200).json(bigGameTickets); // Use res.json to send JSON directly
  } catch (error) {
    console.error('Error fetching user-specific Big Game Tickets:', error);
    res.status(500).json({ message: 'Server error while fetching user tickets' });
  }
});







// Spin Logic (User spins only if they have enough game balance)
router.post('/spin', authenticateToken, async (req, res) => {
  const { id } = req.user; // Extract user ID from authenticated token

  try {
    // Fetch user data from the database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check for pending transactions
    const pendingTx = user.transactions.find(tx => tx.status === 'pending');
    if (pendingTx) {
      return res.status(400).send('Transaction pending, please wait.');
    }

    // Check if user has enough game balance
    const spinCost = 5; // Cost per spin (in USDT)
    if (user.gameBalance < spinCost) {
      return res.status(400).send('Insufficient balance.');
    }

    // Deduct the spin cost
    user.gameBalance -= spinCost;

    // Define prizes
    const prizes = [
      { prize: 1, weight: 1 },
      { prize: 1, weight: 1 },  // Two chances to win 1 USDT
      { prize: 2, weight: 1 },  // One chance to win 2 USDT
      { prize: 3, weight: 1 },  // One chance to win 3 USDT
      { prize: 5, weight: 1 },  // One chance to win 5 USDT
      { prize: 8, weight: 1 },  // One chance to win 8 USDT
      { prize: 13, weight: 1 }, // One chance to win 13 USDT
      { prize: 21, weight: 1 }, // One chance to win 21 USDT
      { prize: 34, weight: 1 }, // One chance to win 34 USDT
      { prize: 55, weight: 1 }, // One chance to win 55 USDT
      { prize: 0, weight: 1 },  // One chance to hit "Bomb" (lose)
    ];

    // Calculate total weight for weighted random selection
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);

    // Select a random prize
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    let selectedPrizeIndex = -1;

    for (let i = 0; i < prizes.length; i++) {
      cumulativeWeight += prizes[i].weight;
      if (random < cumulativeWeight) {
        selectedPrizeIndex = i;
        break;
      }
    }

    // Retrieve the selected prize
    const selectedPrize = prizes[selectedPrizeIndex];

    // Update user balance based on prize
    if (selectedPrize.prize > 0) {
      user.gameBalance += selectedPrize.prize; // Add prize amount to balance
    }

    // Save user data
    await user.save();

    // Respond with the result
    const message =
      selectedPrize.prize > 0
        ? `🎉 You won ${selectedPrize.prize} USDT! 🎉`
        : '💥 Boom! You hit a Bomb. Better luck next time!';

    res.status(200).send({
      message,
      newBalance: user.gameBalance,
      prize: selectedPrize.prize,
      prizeIndex: selectedPrizeIndex,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while processing the spin.');
  }
});


// Withdrawal Logic (Move funds from game balance to user balance)
router.post('/withdraw', authenticateToken, async (req, res) => {
  const {amount} = req.body;

  const { id} = req.user; 
  
  // Fetch user data from the database
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  const {walletAddress} = user;

  // Check for pending transactions
  const pendingTx = user.transactions.find(tx => tx.status === 'pending');
  if (pendingTx) {
    return res.status(400).send('Transaction pending, please wait.');
  }

  // Ensure user has enough balance
  if (user.gameBalance < amount) {
    return res.status(400).send('Insufficient balance.');
  }


  try {
    const tx = await sendTransaction(gamePK, walletAddress, amount);
    
    // Create a pending transaction for the withdrawal
    user.transactions.push({
      type:'withdraw',
      txHash: tx.txid,
      amount,amount,
      status: 'pending',
    });

    await user.save();

    res.status(200).send('Withdrawal initiated. Awaiting confirmation...');
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).send('Withdrawal failed.');
  }
});


// Emoji choices with probabilities
const emojiChoices = [
  { emoji: "😊", prize: 10, chance: 0.05 },
  { emoji: "😎", prize: 50, chance: 0.02 },
  { emoji: "😍", prize: 100, chance: 0.01 },
  { emoji: "😢", prize: 0, chance: 0.4 },
  { emoji: "😡", prize: 0, chance: 0.1 },
  { emoji: "😱", prize: 0, chance: 0.1 },
  { emoji: "😜", prize: 10, chance: 0.05 },
  { emoji: "🥳", prize: 50, chance: 0.02 },
  { emoji: "💀", prize: 0, chance: 0.1 },
  { emoji: "🎉", prize: 500, chance: 0.01 },
];

// Helper to calculate prize based on chance
const determinePrize = () => {
  const random = Math.random();
  let cumulativeChance = 0;
  for (const choice of emojiChoices) {
    cumulativeChance += choice.chance;
    if (random <= cumulativeChance) {
      return choice.prize;
    }
  }
  return 0;
};

const marketingMessages = [
  "🎉 You’re so close to a big win! Try again! 💥",
  "🚀 Keep going! Your next emoji could be the jackpot! 🎯",
  "🌟 Keep playing, surprises await! 💰",
  "🔥 The jackpot is heating up! Will you be the next winner? 💎",
  "💼 Fortune favors the bold! Play now to claim your prize! 🤑",
  "🎊 Another emoji, another chance to win big! 🎰",
  "✨ Don’t give up! Big wins are just around the corner! 🏆",
  "🌠 A shooting star might just land on your prize! Make your wish! 💫",
  "💥 The more you play, the closer you get to glory! 🎯",
  "🎁 Unlock the next level of rewards! Spin again! 🌀",
  "🤑 A fortune awaits the fearless—keep going! 💼",
  "💎 Diamonds aren’t found on the first try! Keep digging! 💠",
  "🎰 One spin is all it takes for your big moment! 🌟",
  "✨ Every play is a step closer to greatness! 🏅",
  "🔥 The jackpot is calling your name! Will you answer? 📞",
  "🌟 The wheel spins, and so does your luck! Take a chance! 🎡",
  "🎉 Big surprises often come when you least expect them! Try now! 🎊",
  "🚀 Launch into a streak of luck—give it another shot! 🌌",
  "💰 A golden opportunity awaits—don’t miss it! 🏆",
  "🎯 Your perfect emoji is just a spin away! Take your shot! 🎮"
];


const getRandomMarketingMessage = () =>
  marketingMessages[Math.floor(Math.random() * marketingMessages.length)];

// Route to handle emoji submissions
router.post("/play",authenticateToken, async (req, res) => {
  const {emoji, cost } = req.body;
  const { id } = req.user; 

  if (!id || !emoji || cost !== 5) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.gameBalance < cost) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Deduct cost
    user.gameBalance -= cost;

    // Determine prize
    const prize = determinePrize();
    if (prize > 0) {
      user.gameBalance += prize;
    }

    await user.save();

    const botMessage =
      prize > 0
        ? `🎉 Congratulations! You won: ${prize} USDT! 🎉`
        : "Oops, you lost this time! 😞";
    const marketingMessage = getRandomMarketingMessage();

    return res.json({
      success: true,
      prize,
      botMessage,
      marketingMessage,
      newBalance: user.gameBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Export router to be used in the main server
module.exports = router;
