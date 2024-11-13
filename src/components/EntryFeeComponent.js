import React, { useState } from 'react';
import '../styles/EntryFeeComponent.css'; // For custom styles

const EntryFeeComponent = ({ onSubmit, startingFee = 3 }) => {
  // State to hold the user's entry fee and error message
  const [entryFee, setEntryFee] = useState(startingFee);
  const [error, setError] = useState('');

  // Handle changes to the input
  const handleFeeChange = (event) => {
    const value = event.target.value;
    if (value === '' || !isNaN(value)) {
      setEntryFee(value);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // Basic validation
    if (parseFloat(entryFee) <= 0 || isNaN(entryFee)) {
      setError('Please enter a valid entry fee.');
      return;
    }

    // Trigger the payment process (simulated for now)
    onSubmit(entryFee);
  };

  return (
    <div className="entry-fee-container">
      <h2>Join the Million Dollar Countdown!</h2>
      <p>Enter to win a 1 million USDT jackpot by registering now. Your entry fee will go toward the jackpot prize pool.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="fee-input-container">
          <label htmlFor="entry-fee">Entry Fee (USDT):</label>
          <input
            type="number"
            id="entry-fee"
            name="entry-fee"
            value={entryFee}
            onChange={handleFeeChange}
            min="3"
            step="0.1"
            placeholder="Enter your entry fee"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-button">
          Join Now
        </button>
      </form>

      <div className="entry-fee-info">
        <p><strong>Starting Fee: 3 USDT</strong></p>
        <p>Your payment will go toward the jackpot prize pool, and you’ll have a chance to win the grand prize on New Year's Eve!</p>
      </div>
    </div>
  );
};

export default EntryFeeComponent;
