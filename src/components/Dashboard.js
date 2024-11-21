import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css'; // Custom CSS for styling

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Your Dashboard 🎉</h1>
        <p className="dashboard-subtitle">Your one-stop destination to play, track, and win!</p>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-cards">
          {/* Mini Games Card */}
          <div className="card game-card animate__animated animate__fadeIn animate__delay-1s">
            <h2 className="card-title">🎰 Mini Games</h2>
            <p className="card-description">
              Play a variety of mini-games and win instant rewards. Simple and fun!
            </p>
            <Link to="/games" className="cta-button">Start Playing</Link>
          </div>

          {/* Jackpot Card */}
          <div className="card jackpot-card animate__animated animate__fadeIn animate__delay-2s">
            <h2 className="card-title">🎉 New Year Big Win Jackpot</h2>
            <p className="card-description">
              Spin the wheel for a chance to win life-changing prizes this New Year!
            </p>
            <Link to="/jackpot" className="cta-button">Play Jackpot</Link>
          </div>

          {/* Account Settings Card */}
          <div className="card account-card animate__animated animate__fadeIn animate__delay-3s">
            <h2 className="card-title">⚙️ Account Settings</h2>
            <p className="card-description">
              Update your profile, manage notifications, and more.
            </p>
            <Link to="/settings" className="cta-button">Go to Settings</Link>
          </div>
        </div>
      </section>

      <footer className="dashboard-footer">
        <p>© 2024 Game of Chance. All rights reserved. Play responsibly.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
