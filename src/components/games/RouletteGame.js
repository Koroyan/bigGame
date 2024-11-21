import React, { useState, useEffect } from 'react';
import '../../styles/RouletteGame.css'; // Custom styles
import { Wheel } from 'react-custom-roulette';
import {fetchUser, fetchBalance, withdrawFunds } from '../utils/transactionUtils'; // Import common methods
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const RouletteGame = () => {
  const navigate = useNavigate(); // Create navigate function

  // Define the data for the roulette wheel with prizes and bomb
  const data = [
    { option: '1 USDT', style: { backgroundColor: '#4CAF50', textColor: 'white' }, prizeAmount: 1 },
    { option: '2 USDT', style: { backgroundColor: '#FFEB3B', textColor: 'black' }, prizeAmount: 2 },
    { option: '3 USDT', style: { backgroundColor: '#FF9800', textColor: 'black' }, prizeAmount: 3 },
    { option: '5 USDT', style: { backgroundColor: '#FF5722', textColor: 'white' }, prizeAmount: 5 },
    { option: '8 USDT', style: { backgroundColor: '#9C27B0', textColor: 'white' }, prizeAmount: 8 },
    { option: '13 USDT', style: { backgroundColor: '#673AB7', textColor: 'white' }, prizeAmount: 13 },
    { option: '21 USDT', style: { backgroundColor: '#3F51B5', textColor: 'white' }, prizeAmount: 21 },
    { option: 'Bomb', style: { backgroundColor: '#f44336', textColor: 'white', fontWeight: 'bold' }, prizeAmount: 0 },
  ];

  const [balance, setBalance] = useState(0); // Initial balance (set to 100 USDT for demo purposes)
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [prizeText, setPrizeText] = useState('');
  const cost = 5; // Cost per spin in USDT
  const [error, setError] = useState(''); // Error message for withdrawal
  const [form, setForm] = useState({
    amount: '1', // Amount of tokens to withdraw
    toAddress: 'TR3EnoaAyoAzSDQpA41KoBn8dEAnYX8TVo' // Wallet address for withdrawal (Binance or external)
  });

  // State to track if a 403 error occurred
  const [isForbidden, setIsForbidden] = useState(false);



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user details (wallet address) using the fetchUser function
        const userResponse = await fetchUser();
  
        // Check if the response is successful
        if (userResponse.success) {
          const userWalletAddress = userResponse.data.walletAddress; // Assuming `walletAddress` is part of the response
  
          // Fetch user balance
          const balanceResponse = await fetchBalance(userWalletAddress);
  
          // Check if the balance fetch is successful
          if (balanceResponse.success) {
            setBalance(balanceResponse.data); // Assuming the balance is stored in `data` of the response
          } else {
            alert('Failed to fetch balance: ' + balanceResponse.error.message);
          }
        } else {
          alert('Failed to fetch user data: ' + userResponse.error.message);
        }
      } catch (err) {
        console.error(err);
        alert('Error fetching user data: ' + err.message);
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleSpinClick = async () => {
    if (balance < cost) {
      alert('💥 You don\'t have enough balance to spin! 💥');
      return;
    }

    setBalance(balance - cost);

    const result = await withdrawFunds(form.toAddress, form.amount);
    if (!result.success) {
      if (result.error.statusCode === 403) {
        setIsForbidden(true); // If 403 error, show the button to go to login
        setError('Access forbidden. Please log in again.');
      } else {
        alert(`💥 Withdrawal failed: ${result.error.message} 💥`);
        setError(result.error.message);
      }
      return;
    }

    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    const prize = data[prizeNumber].option;

    if (prize === 'Bomb') {
      setPrizeText('💥 Boom! You hit a Bomb! Try Again! 💥');
    } else {
      const prizeAmount = data[prizeNumber].prizeAmount;
      setBalance(balance + prizeAmount);
      setPrizeText(`🎉 Congratulations! You won: ${prizeAmount} USDT 🎉`);
    }
  };

  // Navigate to login page when the user clicks the button
  const handleGoToLogin = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="roulette-container">
      <h1 className="roulette-title">🎉 Spin & Win Big! 🎉</h1>
      <div className="balance-container">
        <span>Balance: {balance} USDT</span>
      </div>
      <div className="cost-info">
        <p>Cost per spin: {cost} USDT</p>
      </div>

      {/* Error message (if any) */}
      {error && <div className="error-message">{error}</div>}

      {/* If a 403 error occurs, show the login button */}
      {isForbidden && (
        <div className="error-message">
          <button onClick={handleGoToLogin} className="login-button">
            Go to Login
          </button>
        </div>
      )}

      <div className="wheel-container">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          backgroundColors={['#3e3e3e', '#df3428']}
          textColors={['#ffffff']}
          onStopSpinning={handleStopSpinning}
        />
      </div>
      <button onClick={handleSpinClick} className="spin-button">Spin the Wheel</button>
      <div className="prize-text">{prizeText}</div>
    </div>
  );
};

export default RouletteGame;
