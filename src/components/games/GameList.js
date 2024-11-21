import React, { useState, useEffect } from "react";
import "../../styles/GameList.css"; // Custom CSS
import BottomNav from '../bottomnav/BottomNav'; // Import BottomNav
import { fetchUser, fetchBalance } from "../utils/transactionUtils"; // Import common methods


const GameList = () => {
  const [games] = useState([
    {
      _id: "1",
      name: "New Year Big Prize",
      prize: "1,000,000 USDT",
      description: "🎉 Become a Millionaire this New Year! Win the BIGGEST prize of the year! 🎉",
      isSpecial: true,
      image: "/images/new-year-big-prize.jpg", // Example image path
      link: "/newyearbigprize", // Dynamic link for this game
    },
    {
      _id: "2",
      name: "Roulette",
      prize: "500,000 USDT",
      description: "🎰 Spin the wheel of fortune and win massive prizes! 🎰",
      isSpecial: false,
      image: "/images/roulette-logo.png", // Example image path
      link: "/roulettewheel", // Dynamic link for this game
    },
    {
      _id: "3",
      name: "Chat Game",
      prize: "200,000 USDT",
      description: "💬 Talk to us in chat and win amazing prizes! 💬",
      isSpecial: false,
      image: "/images/chat-logo.png", // Example image path
      link: "/chatgame", // Dynamic link for this game
    },
  ]);
  
  const [balance, setBalance] = useState(0); // State to store balance
  const [isLoggedInState, setIsLoggedInState] = useState(false); // State to track login status

  // Check if the user is logged in
  const isLoggedIn = async () => {
    try {
      const userResponse = await fetchUser(); // Fetch user details
      if (userResponse.success) {
        setIsLoggedInState(true);
      } else {
        setIsLoggedInState(false);
      }
    } catch (err) {
      console.error("Error checking login status:", err);
      setIsLoggedInState(false);
    }
  };

  // Fetch user balance when the component mounts
  const getBalance = async () => {
    try {
      const userResponse = await fetchUser();
      if (userResponse.success) {
        const userWalletAddress = userResponse.data.walletAddress; // Assuming `walletAddress` is part of the response
        const balanceResponse = await fetchBalance(userWalletAddress);
        if (balanceResponse.success) {
          setBalance(balanceResponse.data); // Set the balance state
        } else {
          alert('Failed to fetch balance');
        }
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  // Use useEffect to call these functions when the component mounts
  useEffect(() => {
    isLoggedIn();
    getBalance();
  }, []);

  return (
    <div className="game-list-container">
      {/* Header with Balance/Charge & Withdrawal Button */}
      <div className="header-right">
        <div className="balance-display">
          <h4>{balance} USDT</h4> {/* Display balance */}
        </div>
      </div>

      <h2 className="game-list-title">🔥🔥 Play & Win Big! 🔥🔥</h2>
      <p className="game-list-description">
        Choose your favorite game and join now for a chance to win life-changing prizes! 🏆
      </p>

      <div className="game-list">
        {games.length === 0 ? (
          <p className="loading-text">Loading games...</p>
        ) : (
          games.map((game) => (
            <div
              key={game._id}
              className={`game-card ${game.isSpecial ? "special-game" : ""}`}
            >
              <h3 className="game-card-title">{game.name}</h3>
              <p className="game-card-prize">Prize: {game.prize}</p>
              <p className="game-card-description">{game.description}</p>

              {isLoggedInState ? (
                <a href={game.link} className="game-card-btn">Join Now</a>
              ) : (
                <a href="/login" className="game-card-btn">Log In to Play</a>
              )}

              {game.isSpecial && (
                <div className="special-message">
                  🎉 **Become a Millionaire** this New Year! 🎉
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default GameList;


