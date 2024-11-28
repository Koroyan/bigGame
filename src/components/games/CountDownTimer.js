import React, { useState, useEffect } from "react";
import "../../styles/CountdownTimer.css";
import BottomNav from '../bottomnav/BottomNav'; // Import BottomNav
import { useNavigate } from "react-router-dom";
import { bigGame, getBigGameTickets, getBigGameUserTickets } from "../utils/transactionUtils"; // Import the common withdraw function

const CountdownTimer = () => {
  const navigate = useNavigate();

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
  const [participants, setParticipants] = useState(0); // Initial number of participants
  const [prize, setPrize] = useState(0);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ toAddress: 'TR3EnoaAyoAzSDQpA41KoBn8dEAnYX8TVo', amount: 3 }); // 3 USDT for ticket purchase
  const [error, setError] = useState(''); // Error state for handling form validation
  const [tickets, setTickets] = useState([]);
  const [userTickets, setUserTickets] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const tkts = await getBigGameTickets();
      const userTkts = await getBigGameUserTickets();
      setTickets(tkts.data);
      setUserTickets(userTkts.data.length);
      setParticipants(tkts.data.length);
      setPrize(tkts.data.length * 3);
    };

    fetchUserData();
  }, []);

  const progress = ((timeLeft.total / (1000 * 60 * 60 * 24 * 365)) * 100).toFixed(2);
  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes <= 24;
  const isAlmostOver = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  // Handle withdraw (ticket purchase) submission
  const handleSubmitWithdraw = async e => {
    e.preventDefault();

    if (error || !form.toAddress || !form.amount) return; // Prevent submission if there's an error or empty fields

    const amountToWithdraw = parseFloat(form.amount);
    if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
      alert('Please enter a valid amount to withdraw.');
      return;
    }

    // Use the common withdrawFunds method
    const result = await bigGame();

    if (result.success) {
      setShowModal(false);
      alert('Ticket purchased successfully! txid: ' + result); // Show success message with txid
    } else {
      alert(`Error during ticket purchase: ${result.error.message}\nDetails: ${result.error.details?.details || 'No further details available.'}`);
    }
  };

  const handleBuyTicket = () => {
    setShowModal(true); // Open the modal for buying the ticket
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="countdown-timer">
      {/* Top Join Button */}
      <div className="join-now-container">
        <button
          className={`cta-button ${isButtonHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={handleBuyTicket}
        >
          Buy Ticket & Get Your Lucky Entry (3 USDT)
        </button>
      </div>

      <h2 className="countdown-title">Big Win Countdown</h2>
      <p className="countdown-subtitle">Only {timeLeft.days} Days, {timeLeft.hours} Hours Left!</p>

      {/* Grand Prize Section with Animation */}
      <div className="jackpot-prize">
        <h3 className="grand-prize-title">Grand Prize Draw</h3>
        <p className="grand-prize-description">Enter today and get a chance to win:</p>
        <p className={`prize-amount ${participants >= 2 ? 'flashing' : ''}`}>
          {prize + ' USDT'}
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
        <p>You have entered {userTickets} times!</p>
      </div>

      {/* Marketing Section */}
      <div className="marketing-banner">
        <h3>Get More Entries: Join Now and Receive Exclusive Bonuses!</h3>
        <p>Want to increase your chances of winning? Buy more tickets to boost your odds of a Big Win!</p>
        <p className="about-game">
          **About the Game:** Big Win Countdown is your chance to win a grand prize by purchasing tickets. Each ticket gives you an entry to the draw. The more tickets you buy, the higher your chances of becoming the lucky winner. Join now and don’t miss out on this exciting opportunity!
        </p>
        <button
          className={`cta-button ${isButtonHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={handleBuyTicket}
        >
          Claim Your Bonus and Enter Now!
        </button>
      </div>

      {/* Trust-building Section */}
      <div className="trust-section">
        <h3>Your Participation is Safe and Secure!</h3>
        <p>We use the highest level of security to ensure that all participants have a fair and transparent chance to win. Our prize draw is conducted with complete transparency and in accordance with industry standards.</p>
        <p>We are fully committed to your safety and privacy. All your transactions are processed with the latest encryption protocols, ensuring the highest level of security. Your entry is completely confidential!</p>
        <p>Join today and get your chance to win a life-changing prize! No hidden fees. No shady practices. Just fair play all the way!</p>
      </div>

      {/* Modal for Ticket Purchase */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">🚀 Ready to Win Big?</h2>
            <p className="modal-text">Your chance to win the Big Prize is just one step away!</p>
            <p className="modal-price">Buy your ticket now for just <strong>3 USDT</strong> and enter the race for your big win!</p>
            <p>Don't miss out—hurry! Time is ticking, and the prize is waiting for you!</p>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={handleCloseModal}>
                Close
              </button>
              <button
                className="modal-confirm-btn"
                onClick={handleSubmitWithdraw}
              >
                Confirm & Enter
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav navigate={navigate} />
    </div>
  );
};

export default CountdownTimer;

