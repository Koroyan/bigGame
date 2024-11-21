import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ChatGame.css'; // Correct path to your CSS file
import { getAuthConfig, fetchBalance, withdrawFunds, fetchUser } from '../utils/transactionUtils'; // Import common methods
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

          const balanceResponse = await fetchBalance();
          if (balanceResponse.success) {
            setBalance(balanceResponse.data);
          } else {
            setError('Failed to fetch balance');
          }
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

  // Function to get a random marketing message
  const getRandomMarketingMessage = () => {
    const marketingMessages = [
      "🎉 You’re so close to a big win! Try sending more emojis! 💥",
      "🚀 Keep going! Your next emoji could be the jackpot! 🎯",
      "🌟 Keep chatting, and who knows, you might just get a surprise! 💰",
    ];
    return marketingMessages[Math.floor(Math.random() * marketingMessages.length)];
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
    try {
      // Attempt withdrawal
      const withdrawResponse = await withdrawFunds(form.toAddress, form.amount);
      if (!withdrawResponse.success) {
        throw new Error(withdrawResponse.error.message || 'Withdrawal failed');
      }

      // Deduct 5 USDT for playing
      setBalance((prevBalance) => prevBalance - 5);

      // Add the user's emoji message to the chat
      const userMessage = { sender: 'user', message: emoji };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setTimeout(() => {
        const prize = getPrize(emoji);
        let prizeAmount = 0;
        if (prize !== 'No Prize') {
          prizeAmount = parseFloat(prize.split(' ')[0]);
          setBalance((prevBalance) => prevBalance + prizeAmount); // Update balance with the prize
        }

        // Prepare bot's response
        let botResponse;
        let marketingMessage = getRandomMarketingMessage();
        if (prize === 'No Prize') {
          botResponse = `Oops, you lost this time! 😞`;
        } else {
          botResponse = `🎉 Congratulations! You won: ${prize}! 🎉`;
        }

        // Update chat messages with bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', message: botResponse },
          { sender: 'bot', message: marketingMessage },
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
      <div className="balance-display">
        <strong>Balance: </strong>{balance} USDT
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
