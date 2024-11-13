const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tableRoutes = require('./routes/tables');
const transactionRoutes = require('./routes/transactions');
const gameRoutes = require('./routes/game');
const rouletteRoutes = require('./routes/roulette');
const User = require('./models/User');
const Table = require('./models/Table');
const cors = require('cors');
const os = require('os');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's URL if needed
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

const server = http.createServer(app);

// Socket.IO with CORS settings
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Replace with your frontend's URL if needed
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Define your routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/roulette', rouletteRoutes);

app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);  // Log the error to the console
  res.status(500).send('Something went wrong!'); // Send a generic error message to the client
});


mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 50000 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
// Automatically select a winner and notify all clients


const automaticWinnerSelection = async () => {
    const tables = await Table.find(); // Fetch all tables

    for (const table of tables) {
        if (new Date() > table.expiresAt && table.players.length > 0) {
            const randomIndex = crypto.randomInt(0, table.players.length);
            const winnerId = table.players[randomIndex];

            // Update the table with the winner
            table.winners.push(winnerId);
            await table.save();

            // Notify all clients about the winner
            io.emit('winnerSelected', { tableId: table._id, winnerId });
        }
    }
};

const game = async () => {
  const tables = await Table.find(); 
  for (const table of tables) {
    // Check if the table has expired, has players, and no winners yet
    if (new Date() > table.expiresAt && table.players.length > 0 && table.winners.length === 0) {
      console.log(table._id);
      io.emit('hiiiii');

      const randomIndex = crypto.randomInt(0, table.players.length); // Select a random winner
      const winnerId = table.players[randomIndex];
      // Generate a random number between 0 and 99 for a 1% chance
      if (Math.floor(Math.random() * 100) > 0) {
        io.emit('winnerSelected', {
          tableId: table._id,
          players: table.players,
          winnerId: winnerId,
          isGameFinished: false // Game is not finished
        });
      } else {
        io.emit('winnerSelected', {
          tableId: table._id,
          players: table.players,
          winnerId: winnerId,
          isGameFinished: true // Game is finished
        });
         // Update the table with the winner
         table.winners.push(winnerId);
         await table.save();
      }
    }
  }
};


// Schedule the winner selection to run every minute
 setInterval(game, 1000);

// Function to get the local machine's IP address
const getLocalIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '127.0.0.1'; // Default to localhost if no network interfaces are found

  // Loop through network interfaces to find the first non-internal network IP
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (!iface.internal && iface.family === 'IPv4') {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress !== '127.0.0.1') break; // Stop once we find a valid IP
  }

  return ipAddress;
};

// Print the address and port
const ipAddress = getLocalIpAddress();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on  ${ipAddress}:${PORT}`);
});
