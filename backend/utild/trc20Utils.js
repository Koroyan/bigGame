const {TronWeb} = require('tronweb');
const { decrypt } = require('./cryptoUtils');
const User = require('../models/User');

// TronWeb Setup
const tronWebInstance = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io', // Replace with mainnet in production
});

const USDT_CONTRACT_ADDRESS = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs'; // Replace with your USDT address

// Helper: Get contract instance
const getUSDTContract = async () => {
  try {
    const contract = await tronWebInstance.contract().at(USDT_CONTRACT_ADDRESS);
    return contract;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw new Error('Contract initialization failed');
  }
};

// Helper: Get user's wallet balance
const getUserBalance = async (walletAddress, privateKey) => {
  try {
    console.log('Private Key:', privateKey);
    tronWebInstance.setPrivateKey(privateKey);

    const contract = await getUSDTContract();
    if (!contract) {
      throw new Error('Contract instance is undefined');
    }

    const balanceInSun = await contract.methods.balanceOf(walletAddress).call();
    return tronWebInstance.toDecimal(balanceInSun) / 1e6; // Convert to USDT
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Unable to fetch user balance');
  }
};

// Helper: Transfer USDT
const sendTransaction = async (fromPrivateKey, toAddress, amount) => {
  try {
    const pk = decrypt(fromPrivateKey);
    tronWebInstance.setPrivateKey(pk);

    const contract = await getUSDTContract();
    if (!contract) {
      throw new Error('Contract instance is undefined');
    }

    const transaction = await contract.methods.transfer(toAddress, tronWebInstance.toSun(amount)).send();
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

    if (!transactionInfo || !transactionInfo.receipt) {
      return 'PENDING'; // No receipt yet, transaction is pending
    }

    const { result } = transactionInfo.receipt;

    if (result === 'SUCCESS') {
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
