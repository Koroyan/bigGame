const {TronWeb} = require('tronweb');
const { decrypt } = require('./cryptoUtils');
const User = require('../models/User');

// TronWeb Setup
const tronWebInstance = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io', // Replace with mainnet in production
});

// Helper: Get user's wallet balance
const getUserBalance = async (walletAddress) => {
  try {
    const balanceInSun = await tronWebInstance.trx.getBalance(walletAddress);
    return tronWebInstance.toDecimal(balanceInSun) / 1e6; // Convert to TRX
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Unable to fetch balance');
  }
};

// Helper: Transfer TRX
const sendTransaction = async (fromPrivateKey, toAddress, amount) => {
  try {
    const pk = decrypt(fromPrivateKey);
    tronWebInstance.setPrivateKey(pk);

    const transaction = await tronWebInstance.trx.sendTransaction(
      toAddress,
      tronWebInstance.toSun(amount)
    );
    return transaction; // Returns transaction details
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Transaction failed');
  }
};

// Helper: Check Transaction Status
const checkTransactionStatus = async (txHash) => {
  try {
    const transactionInfo = await tronWebInstance.trx.getTransactionInfo(txHash);
    console.log("grres: ",transactionInfo);

    if (!transactionInfo || !transactionInfo.receipt) {
      return 'PENDING'; // No receipt yet, transaction is pending
    }

    const { id } = transactionInfo;
    if (id) {
      return 'SUCCESS';
    } else {
      return 'FAILED';
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return 'ERROR'; // Return error status if something goes wrong
  }
};

module.exports = {
  sendTransaction,
  getUserBalance,
  checkTransactionStatus,
};
