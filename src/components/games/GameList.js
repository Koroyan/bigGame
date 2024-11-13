import React, { useState, useEffect } from "react";
import "../../styles/GameList.css"; // Custom styles

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

  const isLoggedIn = () => {
    return true; //localStorage.getItem("token") !== null;
  };

  // State for controlling the visibility of the dialog
  const [isDialogVisible, setIsDialogVisible] = useState(true);

  useEffect(() => {
    // Hide the dialog after 5 seconds
    const timer = setTimeout(() => {
      setIsDialogVisible(false);
    }, 7000);

    // Cleanup on component unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="game-list-container">
      {/* Display the custom dialog if the state is true */}
      {isDialogVisible && (
        <div className="custom-alert">
          <p>
            💖 Tes Vonca? Grigor@ qez shata sirum im hamov axjik 💖
          </p>
        </div>
      )}

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

              {isLoggedIn() ? (
                // Dynamic link for each game based on the `link` property
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
    </div>
  );
};

export default GameList;
