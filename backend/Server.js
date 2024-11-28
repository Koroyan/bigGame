const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tableRoutes = require('./routes/tables');
const transactionRoutes = require('./routes/transactions');
const transactionTrc20Routes = require('./routes/transactionstrc20');
const gameRoutes = require('./routes/game');
const rouletteRoutes = require('./routes/roulette');
const User = require('./models/User');
const Table = require('./models/Table');
const cors = require('cors');
const os = require('os');
const { checkTransactionStatus } = require('./utild/trc20trxUtils');


dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://192.168.0.79:3000', // Replace with your frontend's URL if needed
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

const server = http.createServer(app);

// Socket.IO with CORS settings
const io = socketIo(server, {
    cors: {
        origin: 'http://192.168.0.79:3000', // Replace with your frontend's URL if needed
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
});

// Define your routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transactionstrc20', transactionTrc20Routes);
app.use('/api/game', gameRoutes);
app.use('/api/roulette', rouletteRoutes);

app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);  // Log the error to the console
  res.status(500).send('Something went wrong!'); // Send a generic error message to the client
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 50000 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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


// Check for pending transactions and update game balance if confirmed
const checkPendingTransactions = async () => {
  const users = await User.find({ 'transactions.status': 'pending' });

  for (const user of users) {
    console.log(user.email);
    for (const transaction of user.transactions) {
      if (transaction.status === 'pending') {
        try {
          // Check the status of the transaction on the TRON network
          const status = await checkTransactionStatus(transaction.txHash);

          console.log(status)
          if (status === 'SUCCESS') {
            // Add deposit amount to user's game balance after confirmation

            if(transaction.type==='deposit'){
            user.gameBalance += transaction.amount;
            user.balance-=transaction.amount
            }else{
              user.gameBalance -= transaction.amount;
              user.balance+=transaction.amount
            }

            // Update the transaction status to 'confirmed'
            transaction.status = 'confirmed';
            await user.save();
          } else if(status === 'FAILED') {
            // Mark transaction as failed if not successful
            transaction.status = 'failed';
            await user.save();
          }else{}
        } catch (err) {
          console.error('Error checking transaction:', err);
        }
      }
    }
  }
  
  console.log('Pending transactions checked and updated.');
};

// Run checkPendingTransactions every 10 seconds
setInterval(async () => {
  try {
    await checkPendingTransactions();
    console.log('Checked pending transactions');
  } catch (error) {
    console.error('Error during pending transaction check:', error);
  }
}, 10000); // 10000 milliseconds = 10 seconds
