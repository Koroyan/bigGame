import React, { useState } from 'react';
import '../../styles/RouletteGame.css'; // Custom styles
import { Wheel } from 'react-custom-roulette';

const RouletteGame = () => {
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

  // Initial balance (set to 100 USDT for demo purposes)
  const [balance, setBalance] = useState(100);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [prizeText, setPrizeText] = useState('');
  const cost = 5; // Cost per spin in USDT

  // Handle spin click
  const handleSpinClick = () => {
    // Check if the user has enough balance to spin
    if (balance < cost) {
      alert('💥 You don\'t have enough balance to spin! 💥');
      return;
    }

    // Deduct cost from balance and spin
    setBalance(balance - cost);

    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  // Handle when spinning stops
  const handleStopSpinning = () => {
    setMustSpin(false);
    const prize = data[prizeNumber].option;

    // Update balance based on result
    if (prize === 'Bomb') {
      setPrizeText('💥 Boom! You hit a Bomb! Try Again! 💥');
    } else {
      const prizeAmount = data[prizeNumber].prizeAmount;
      setBalance(balance + prizeAmount);
      setPrizeText(`🎉 Congratulations! You won: ${prizeAmount} USDT 🎉`);
    }
  };

  return (
    <div className="roulette-container">
      <h1 className="roulette-title">🎉 Spin & Win Big! 🎉</h1>

      {/* Display balance */}
      <div className="balance-container">
        <span>Balance: {balance} USDT</span>
      </div>

      {/* Display the cost of a spin */}
      <div className="cost-info">
        <p>Cost per spin: {cost} USDT</p>
      </div>

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

      {/* Spin Button */}
      <button onClick={handleSpinClick} className="spin-button">Spin the Wheel</button>

      {/* Display the result after the wheel stops */}
      <div className="prize-text">{prizeText}</div>
    </div>
  );
};

export default RouletteGame;
