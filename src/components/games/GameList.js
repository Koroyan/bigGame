import React, { useState, useEffect } from "react";
import "../../styles/GameList.css"; // Custom CSS
import BottomNav from '../bottomnav/BottomNav'; // Import BottomNav
import { fetchUser, fetchBalance } from "../utils/transactionUtils"; // Import common methods
import { faHeadset } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GameList = () => {
  const [games] = useState([
    {
      _id: "1",
      name: "New Year Big Prize",
      prize: "1,000,000 USDT",
      description: "🎉 Become a Millionaire this New Year! Win the BIGGEST prize of the year! 🎉",
      isSpecial: true,
      image: "/images/new-year-big-prize.jpg",
      link: "/newyearbigprize",
    },
    {
      _id: "2",
      name: "Roulette",
      prize: "500,000 USDT",
      description: "🎰 Spin the wheel of fortune and win massive prizes! 🎰",
      isSpecial: false,
      image: "/images/roulette-logo.png",
      link: "/roulettewheel",
    },
    {
      _id: "3",
      name: "Chat Game",
      prize: "200,000 USDT",
      description: "💬 Talk to us in chat and win amazing prizes! 💬",
      isSpecial: false,
      image: "/images/chat-logo.png",
      link: "/chatgame",
    },
  ]);

  const [balance, setBalance] = useState(0);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  const isLoggedIn = async () => {
    try {
      const userResponse = await fetchUser();
      setIsLoggedInState(userResponse.success);
    } catch (err) {
      console.error("Error checking login status:", err);
    }
  };

  const getBalance = async () => {
    try {
      const userResponse = await fetchUser();
      if (userResponse.success) {
        const balanceResponse = await fetchBalance(userResponse.data.walletAddress);
        setBalance(balanceResponse.success ? balanceResponse.data : 0);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const handleLogout = async () => {
    try {
      // Call API to invalidate session (if required)
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  
      // Clear client-side session data
      localStorage.removeItem("authToken");
      sessionStorage.clear();
  
      // Reset state and redirect
      setIsLoggedInState(false);
      setBalance(0);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  const handleClick = () => {
    // Navigate to the customer support page
    window.location.href = '/customer-support'; // Update the path as needed
  };

  useEffect(() => {
    isLoggedIn();
    getBalance();
  }, []);

  return (
    <div className="game-list-container">
      {/* Header */}
      <div className="header">
        <div className="balance-display">
          <h4>{balance} USDT</h4>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h2 className="game-list-title">🔥🔥 Play & Win Big! 🔥🔥</h2>
      <p className="game-list-description">
        Choose your favorite game and join now for a chance to win life-changing prizes! 🏆
      </p>

      <div className="game-list">
        {games.map((game) => (
          <div key={game._id} className={`game-card ${game.isSpecial ? "special-game" : ""}`}>
            <h3 className="game-card-title">{game.name}</h3>
            <p className="game-card-prize">Prize: {game.prize}</p>
            <p className="game-card-description">{game.description}</p>
            <a href={isLoggedInState ? game.link : "/login"} className="game-card-btn">
              {isLoggedInState ? "Join Now" : "Log In to Play"}
            </a>
            {game.isSpecial && <div className="special-message">🎉 **Become a Millionaire** this New Year! 🎉</div>}
          </div>
        ))}
      </div>

      {/* Customer Support Button */}
      {/* <div className="customer-support-btn" onClick={handleClick} title="Customer Support">
      <FontAwesomeIcon icon={faHeadset} className="support-icon" />
    </div> */}



      <BottomNav />
    </div>
  );
};

export default GameList;
