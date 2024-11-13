import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ChatGame.css'; // Correct path to your CSS file

// Define 18 emojis, with only a few having a prize.
const emojiChoices = [
  { emoji: '😊', prize: '10 USDT', chance: 0.05 },  // Happy - Small prize
  { emoji: '😎', prize: '50 USDT', chance: 0.02 },  // Cool - Medium prize
  { emoji: '😍', prize: '100 USDT', chance: 0.01 },  // Love - Big prize
  { emoji: '😢', prize: 'No Prize', chance: 0.4 },  // Sad - Lose
  { emoji: '😡', prize: 'No Prize', chance: 0.1 },  // Angry - Lose
  { emoji: '😱', prize: 'No Prize', chance: 0.1 },  // Shocked - Lose
  { emoji: '😜', prize: '10 USDT', chance: 0.05 },  // Winking - Small prize
  { emoji: '🥳', prize: '50 USDT', chance: 0.02 },  // Party - Medium prize
  { emoji: '💀', prize: 'No Prize', chance: 0.1 },  // Skull - Lose
  { emoji: '🎉', prize: '500 USDT (Jackpot)', chance: 0.01 },  // Jackpot!
  { emoji: '😋', prize: 'No Prize', chance: 0.3 },  // Yummy - Lose
  { emoji: '😆', prize: 'No Prize', chance: 0.2 },  // Laughing - Lose
  { emoji: '🤔', prize: 'No Prize', chance: 0.3 },  // Thinking - Lose
  { emoji: '🥺', prize: '10 USDT', chance: 0.05 },  // Pleading - Small prize
  { emoji: '🤩', prize: '100 USDT', chance: 0.01 },  // Star-struck - Big prize
  { emoji: '🤗', prize: '50 USDT', chance: 0.02 },  // Hugging - Medium prize
  { emoji: '😎', prize: 'No Prize', chance: 0.3 },  // Cool - Lose
  { emoji: '👻', prize: 'No Prize', chance: 0.3 },  // Ghost - Lose
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
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [balance, setBalance] = useState(100); // Initial balance is 100 USDT
  const chatBoxRef = useRef(null);

  // Marketing Messages to keep users engaged
  const marketingMessages = [
    "🎉 You’re so close to a big win! Try sending more emojis! 💥",
    "🚀 Keep going! Your next emoji could be the jackpot! 🎯",
    "🌟 Keep chatting, and who knows, you might just get a surprise! 💰",
    "💸 Try sending a few more emojis, maybe this time you’ll win big! 🎉",
    "🔥 Don’t stop now! You’re getting closer to a prize! 🌟",
    "🎯 You’re on fire! Let’s see if your next emoji hits the jackpot! 💥",
    "💎 Every message brings you closer to a reward! Keep it up! 💸",
    "⚡ Stay with me and you could get rewarded! 💰💰",
    "🤑 The more you chat, the bigger your chances to win. Let's go! 🚀",
    "💪 Your luck is about to change. Keep chatting! 💥",
    "🛍️ The prize could be yours! Keep sending emojis to try your luck! 🎉",
    "🎁 Chat a bit more and you might just get rewarded! 🎉",
    "✨ Let's see if we can make you a winner today! Send more emojis! 🚀",
    "👑 You’re just a few steps away from a BIG reward! Keep going! 🎯",
    "💬 Send more emojis to unlock surprises! 🎉",
    "🔮 I have a feeling your next emoji will win big! Let’s go! 💸",
    "🎉 Every message is a step closer to your reward. Don’t stop now! 🚀",
    "💎 You're a star! Keep chatting for a chance at a bigger prize! ✨",
    "🔥 I love your energy! Keep chatting and maybe I’ll reward you soon! 💥"
  ];

  // Function to get a random marketing message
  const getRandomMarketingMessage = () => {
    return marketingMessages[Math.floor(Math.random() * marketingMessages.length)];
  };

  // Send emoji and determine prize
  const sendEmojiAndDeterminePrize = (emoji) => {
    if (isSending) return; // Prevent sending if already in progress

    setIsSending(true);

    // Deduct 5 USDT for each game play
    setBalance((prevBalance) => prevBalance - 5);

    // Add the user's emoji message to the chat
    const userMessage = { sender: 'user', message: emoji };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Determine the prize based on the emoji
    setTimeout(() => {
      const prize = getPrize(emoji);

      // Update balance if user wins a prize
      let prizeAmount = 0;
      if (prize !== 'No Prize') {
        // If prize is a string (e.g., '500 USDT (Jackpot)'), parse the number
        prizeAmount = parseFloat(prize.split(' ')[0]);
        setBalance((prevBalance) => prevBalance + prizeAmount); // Update balance
      }

      // Generate bot's response based on the prize
      let botResponse;
      let marketingMessage = getRandomMarketingMessage();
      if (prize === 'No Prize') {
        botResponse = `Oops, you lost this time! 😞`;
      } else {
        botResponse = `🎉 Congratulations! You won: ${prize}! 🎉`;
      }

      // Add bot response and marketing message to chat after a short delay
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', message: botResponse },
        { sender: 'bot', message: marketingMessage },
      ]);

      setIsSending(false);
    }, 1500); // Simulate delay for typing effect
  };

  // Auto-scroll the chat box to the bottom when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-game-container">
      {/* Balance Display */}
      <div className="balance-display">
        <strong>Balance: </strong>{balance.toFixed(2)} USDT
      </div>

      {/* Updated Header */}
      <h2>Chat with Me, and If I Like It, I’ll Reward You! 💸</h2>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <div className="emoji-grid">
        {/* Buttons to send different emojis based on mood */}
        {emojiChoices.map((choice, index) => (
          <button
            key={index}
            onClick={() => sendEmojiAndDeterminePrize(choice.emoji)}
            disabled={isSending}
            className={`emoji-button ${choice.prize !== 'No Prize' ? 'prize' : ''}`}
            title={choice.prize !== 'No Prize' ? `Prize: ${choice.prize}` : 'No Prize'}
          >
            {choice.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatGame;
