import React, { useState, useEffect } from 'react';
import '../../styles/RouletteGame.css'; // Custom styles
import { Wheel } from 'react-custom-roulette';
import { fetchUser, spinWheel, charge,reCharge } from '../utils/transactionUtils';
import { useNavigate } from 'react-router-dom';

const RouletteGame = () => {
  const navigate = useNavigate();
  const data = [
    { option: '1 USDT', style: { backgroundColor: '#4CAF50', textColor: 'white' }, prizeAmount: 1 },
    { option: '1 USDT', style: { backgroundColor: '#4CAF50', textColor: 'white' }, prizeAmount: 1 },
    { option: '2 USDT', style: { backgroundColor: '#FFEB3B', textColor: 'black' }, prizeAmount: 2 },
    { option: '3 USDT', style: { backgroundColor: '#FFA500', textColor: 'black' }, prizeAmount: 3 },
    { option: '5 USDT', style: { backgroundColor: '#FF6347', textColor: 'white' }, prizeAmount: 5 },
    { option: '8 USDT', style: { backgroundColor: '#4682B4', textColor: 'white' }, prizeAmount: 8 },
    { option: '13 USDT', style: { backgroundColor: '#8A2BE2', textColor: 'white' }, prizeAmount: 13 },
    { option: '21 USDT', style: { backgroundColor: '#20B2AA', textColor: 'black' }, prizeAmount: 21 },
    { option: '34 USDT', style: { backgroundColor: '#FF1493', textColor: 'white' }, prizeAmount: 34 },
    { option: '55 USDT', style: { backgroundColor: '#00008B', textColor: 'white' }, prizeAmount: 55 },
    { option: 'Bomb', style: { backgroundColor: '#f44336', textColor: 'white', fontWeight: 'bold' }, prizeAmount: 0 },
  ];

  const [balance, setBalance] = useState(0);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [prizeText, setPrizeText] = useState('');
  const [showChargeDialog, setShowChargeDialog] = useState(true); // Show charge dialog initially
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false); // Withdraw dialog toggle
  const [chargeAmount, setChargeAmount] = useState(''); // Input value for charge amount
  const [withdrawAmount, setWithdrawAmount] = useState(''); // Input value for withdraw amount
  const [error, setError] = useState('');
  const cost = 5; // Cost per spin in USDT

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetchUser();
        if (userResponse.success) {
          const userWalletAddress = userResponse.data.walletAddress;
          const balanceResponse = userResponse.data.gameBalance;
          setBalance(balanceResponse);
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
    setError('');
    try {
      if(balance<cost){
        setError("Insuficient Balance");
        return;
      }
      const spinResponse = await spinWheel(cost);
      setBalance(balance - cost);
      if (spinResponse.success) {
        const newPrizeIndex = spinResponse.data.prizeIndex;
        setPrizeNumber(newPrizeIndex);
        setMustSpin(true);
      } else {
        if (spinResponse.error.statusCode === 403) {
          setError('Please login');
        } else {
          setError(spinResponse.error.message);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStopSpinning = () => {
    const prize = data[prizeNumber].option;
    if (prize === 'Bomb') {
      setPrizeText('💥 Boom! You hit a Bomb! Try Again! 💥');
    } else {
      const prizeAmount = data[prizeNumber].prizeAmount;
      setBalance(balance + prizeAmount);
      setPrizeText(`🎉 Congratulations! You won: ${prizeAmount} USDT 🎉`);
    }
    setMustSpin(false);
  };

  const handleCharge = async () => {
    const amount = parseFloat(chargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      const res = await charge(amount);
      alert(res.message || 'Balance charged successfully!');
      setShowChargeDialog(false); // Hide the dialog
    } catch (err) {
      alert('Error charging balance: ' + err.message);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      const res = await reCharge(amount);
      if (res.success) {
        alert('Withdrawal successful!');
        setBalance(balance - amount); // Update balance locally
        setShowWithdrawDialog(false); // Hide the dialog
      } else {
        alert('Withdrawal failed: ' + res.error.message);
      }
    } catch (err) {
      alert('Error during withdrawal: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowChargeDialog(false);
    setShowWithdrawDialog(false);
  };

  return (
    <div className="roulette-container">
      {/* Charge Dialog */}
      {showChargeDialog && (
        <div className="modal">
          <div className="modal-content">
            <h3>Charge Your Balance</h3>
            <p>Enter the amount to charge:</p>
            <input
              type="number"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              placeholder="Amount (USDT)"
              className="charge-input"
            />
            <div className="modal-buttons">
              <button onClick={handleCharge} className="charge-button">Charge</button>
              <button onClick={handleCancel} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Dialog */}
      {showWithdrawDialog && (
        <div className="modal">
          <div className="modal-content">
            <h3>Withdraw Funds</h3>
            <p>Enter the amount to withdraw:</p>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount (USDT)"
              className="withdraw-input"
            />
            <div className="modal-buttons">
              <button onClick={handleWithdraw} className="withdraw-button">Withdraw</button>
              <button onClick={handleCancel} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="roulette-title">🎉 Spin & Win Big! 🎉</h1>
      <div className="balance-container">
        <span>Balance: {balance} USDT</span>
        <button onClick={() => setShowWithdrawDialog(true)} className="withdraw-dialog-button">Withdraw</button>
      </div>
      <div className="cost-info">
        <p>Cost per spin: {cost} USDT</p>
      </div>
      {error && <div className="error-message">{error}</div>}
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
      <button
        onClick={handleSpinClick}
        className="spin-button"
        disabled={mustSpin || showChargeDialog || showWithdrawDialog} // Disable when spinning or dialog is open
      >
        Spin the Wheel
      </button>
      <div className="prize-text">{prizeText}</div>
    </div>
  );
};

export default RouletteGame;
