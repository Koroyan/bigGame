import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ChatGame.css'; // Correct path to your CSS file
import { fetchUser, fetchBalance, withdrawFunds, spinWheel, charge,reCharge,chat } from '../utils/transactionUtils';
import { useNavigate } from 'react-router-dom';

const emojiChoices = [
  { emoji: '😊', prize: '10 USDT', chance: 0.05 },
  { emoji: '😎', prize: '50 USDT', chance: 0.02 },
  { emoji: '😍', prize: '100 USDT', chance: 0.01 },
  { emoji: '😢', prize: 'No Prize', chance: 0.4 },
  { emoji: '😡', prize: 'No Prize', chance: 0.1 },
  { emoji: '😱', prize: 'No Prize', chance: 0.1 },
  { emoji: '😜', prize: '10 USDT', chance: 0.05 },
  { emoji: '🥳', prize: '50 USDT', chance: 0.02 },
  { emoji: '💀', prize: 'No Prize', chance: 0.1 },
  { emoji: '🎉', prize: '500 USDT (Jackpot)', chance: 0.01 },
  { emoji: '😋', prize: 'No Prize', chance: 0.3 },
  { emoji: '😆', prize: 'No Prize', chance: 0.2 },
  { emoji: '🤔', prize: 'No Prize', chance: 0.3 },
  { emoji: '🥺', prize: '10 USDT', chance: 0.05 },
  { emoji: '🤩', prize: '100 USDT', chance: 0.01 },
  { emoji: '🤗', prize: '50 USDT', chance: 0.02 },
  { emoji: '😎', prize: 'No Prize', chance: 0.3 },
  { emoji: '👻', prize: 'No Prize', chance: 0.3 },
];

// Function to determine prize based on selected emoji and chance
const getPrize = (selectedEmoji) => {
  const randomNumber = Math.random();
  let cumulativeChance = 0;
  let selectedPrize = 'No Prize';

  for (const choice of emojiChoices) {
    cumulativeChance += choice.chance;
    if (randomNumber <= cumulativeChance) {
      selectedPrize = choice.prize;
      break;
    }
  }
  return selectedPrize;
};

const ChatGame = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '5', // Amount of tokens to withdraw (set to 5 since that's the minimum to play)
    toAddress: 'TR3EnoaAyoAzSDQpA41KoBn8dEAnYX8TVo',
  });
  const [showChargeDialog, setShowChargeDialog] = useState(true); // Show charge dialog initially
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false); // Withdraw dialog toggle
  const [chargeAmount, setChargeAmount] = useState(''); // Input value for charge amount
  const [withdrawAmount, setWithdrawAmount] = useState(''); // Input value for withdraw amount
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetchUser();
        if (userResponse.success) {
          const userWalletAddress = userResponse.data.walletAddress;
          setForm((prevState) => ({
            ...prevState,
            toAddress: userWalletAddress,
          }));

          const balanceResponse = userResponse.data.gameBalance;
          setBalance(balanceResponse);
    
        } else {
          setError('Failed to fetch user data');
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching user data: ' + err.message);
        setIsLoggedIn(false);
      }
    };

    fetchUserData();
  }, []);

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


  // Send emoji and determine prize
  const sendEmojiAndDeterminePrize = async (emoji) => {
    if (isSending) return; // Prevent sending if already in progress



    // Check if the user has enough balance
    if (balance < 5) {
      setError("You don't have enough balance to play. Please top up your account!");
      return; // Stop the function if there's not enough balance
    }

    setIsSending(true);

    // Deduct 5 USDT for playing
    setBalance((prevBalance) => prevBalance - 5);
    try {
      // Attempt withdrawal
      const chatResponse = await chat(emoji,5);
      console.log(chatResponse);
      if (!chatResponse.success) {
        throw new Error(chatResponse.error.message || 'Withdrawal failed');
      }
    

      // Add the user's emoji message to the chat
      const userMessage = { sender: 'user', message: emoji };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setBalance((prevBalance) => prevBalance +chatResponse.data.prize);

      setTimeout(() => {

        // Update chat messages with bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', message: chatResponse.data.botMessage },
          { sender: 'bot', message: chatResponse.data.marketingMessage },
        ]);
        setIsSending(false);
      }, 1500); // Simulate delay
    } catch (err) {
      console.error(err);
      setError('Error during withdrawal: ' + err.message);
      setIsSending(false); // Reset sending state
    }
  };

  // Scroll chat to the bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="chat-game-container">
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
      <div className="balance-display">
        <strong>Balance: </strong>{balance} USDT
        <button onClick={() => setShowWithdrawDialog(true)} className="withdraw-dialog-button">Withdraw</button>
      </div>

      <h2>Chat with Me, and If I Like It, I’ll Reward You! 💸</h2>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <div className="emoji-grid">
        {emojiChoices.map((choice, index) => (
          <button
            key={index}
            onClick={() => sendEmojiAndDeterminePrize(choice.emoji)}
            className={`emoji-button ${choice.prize !== 'No Prize' ? 'prize' : ''}`}
            title={choice.prize !== 'No Prize' ? `Prize: ${choice.prize}` : 'No Prize'}
          >
            {choice.emoji}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!isLoggedIn && (
        <div className="login-prompt">
          <button onClick={handleLogin} className="login-button">
            Login to Play
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatGame;
