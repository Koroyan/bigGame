import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/MainPage.css'; // Import your main page CSS

const MainPage = () => {
  return (
    <div className="main-page">
      <header className="main-header">
        <h1 className="main-title">Welcome to the Ultimate Game of Chance</h1>
        <p className="main-subtitle">Test your luck, compete with players worldwide, and win big!</p>
      </header>

      <div className="main-content">
        <section className="promo-section">
          <h2 className="promo-title">Big Prizes Await You</h2>
          <p className="promo-description">
            Join tables, challenge opponents, and experience the thrill of winning!
            Get started today and see if you have what it takes to be the ultimate champion.
          </p>
          <Link to="/register" className="main-button">Start Now</Link>
        </section>

        <section className="features-section">
          <h2 className="features-title">Game Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <i className="fas fa-coins"></i>
              <h3>Real-Time Betting</h3>
              <p>Place your bets and play in real-time with players across the globe.</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-trophy"></i>
              <h3>Exclusive Rewards</h3>
              <p>Win exclusive rewards, bonuses, and more every time you play!</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-users"></i>
              <h3>Multiplayer Mode</h3>
              <p>Compete with friends and other players in exciting multiplayer challenges.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="cta-title">Are You Ready to Join?</h2>
          <Link to="/login" className="cta-button">Login to Play</Link>
          <Link to="/register" className="cta-button">Create an Account</Link>
        </section>
      </div>

      <footer className="main-footer">
        <p>© 2024 Game of Chance. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainPage;
