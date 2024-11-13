import React, { useState, useEffect } from "react";
import "../../styles/CountdownTimer.css"; // Ensure the CSS is imported

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const newYear = new Date("2025-01-01T00:00:00Z"); // New Year's Eve UTC time
    const now = new Date();
    const difference = newYear - now;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [participants, setParticipants] = useState(5000); // Initial number of participants
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate participant growth
  useEffect(() => {
    const participantInterval = setInterval(() => {
      setParticipants(prevParticipants => prevParticipants + Math.floor(Math.random() * 5)); // Add 5 new participants every 3 seconds
    }, 3000);

    return () => clearInterval(participantInterval);
  }, []);

  const progress = ((timeLeft.total / (1000 * 60 * 60 * 24 * 365)) * 100).toFixed(2);

  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes <= 24;
  const isAlmostOver = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  return (
    <div className="countdown-timer">
      {/* Top Join Button */}
      <div className="join-now-container">
        <button
          className={`cta-button ${isButtonHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Join Now & Get Your Lucky Tickets
        </button>
      </div>

      <h2 className="countdown-title">Million Dollar Countdown</h2>
      <p className="countdown-subtitle">Only {timeLeft.days} Days, {timeLeft.hours} Hours Left!</p>

      {/* Grand Prize Section with Animation */}
      <div className="jackpot-prize">
        <h3 className="grand-prize-title">Grand Prize Draw</h3>
        <p className="grand-prize-description">Enter today and get a chance to win:</p>
        <p className={`prize-amount ${participants >= 10000 ? 'flashing' : ''}`}>
          {participants >= 10000 ? '1,000,000 USDT' : '10,000 USDT'}
        </p>
        <p className="prize-delivery-info">
          Prize will be awarded on **New Year's Day, 2025!**
        </p>
      </div>

      {/* Countdown Boxes (Horizontal Layout) */}
      <div className="countdown-wrapper">
        <div className="countdown">
          <div className="countdown-box days">
            <span className={`countdown-number ${isAlmostOver ? 'flashing' : ''}`}>{timeLeft.days}</span>
            <p className="countdown-label">Days</p>
          </div>
          <div className="countdown-box">
            <span className={`countdown-number ${isAlmostOver ? 'flashing' : ''}`}>{timeLeft.hours}</span>
            <p className="countdown-label">Hours</p>
          </div>
          <div className="countdown-box">
            <span className={`countdown-number ${isAlmostOver ? 'flashing' : ''}`}>{timeLeft.minutes}</span>
            <p className="countdown-label">Minutes</p>
          </div>
          <div className="countdown-box seconds">
            <span className={`countdown-number ${isAlmostOver ? 'flashing' : ''}`}>{timeLeft.seconds}</span>
            <p className="countdown-label">Seconds</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">{progress}% of the year gone!</p>

      {/* Dynamic Participant Section */}
      <div className="dynamic-participants">
        <p>{participants} Participants Entered!</p>
      </div>

      {/* Marketing Section */}
      <div className="marketing-banner">
        <h3>Get More Entries: Join Now and Receive Exclusive Bonuses!</h3>
        <button
          className={`cta-button ${isButtonHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Claim Your Bonus and Enter Now!
        </button>
      </div>

      {/* Trust-building Section */}
      <div className="trust-section">
        <h3>Your Participation is Safe and Secure!</h3>
        <p>We use the highest level of security to ensure that all participants have a fair and transparent chance to win. Our prize draw is conducted with complete transparency and in accordance with industry standards.</p>
        <p>Join today and get your chance to win a life-changing prize!</p>
      </div>

      <div className="cta">
        <h3>Don't Miss Your Chance to Win the Jackpot!</h3>
        <button
          className={`cta-button ${isButtonHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          Join Now & Get Your Lucky Tickets
        </button>
      </div>
    </div>
  );
};

export default CountdownTimer;
