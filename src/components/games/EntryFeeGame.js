import React from 'react';
import EntryFeeComponent from '../EntryFeeComponent';

const EntryFeeGame = () => {
  // Simulating the payment process (you would connect this to your payment gateway or smart contract)
  const handlePayment = (entryFee) => {
    // For now, we're just logging the payment
    console.log(`User has entered with ${entryFee} USDT`);

    // Here you can initiate a payment transaction, e.g., using a crypto wallet or payment gateway
    // For example:
    // initiatePayment(entryFee);

    alert(`You have successfully entered the Million Dollar Countdown with a fee of ${entryFee} USDT!`);
  };

  return (
    <div className="game-page">
      <h1>Welcome to the Million Dollar Countdown!</h1>
      <EntryFeeComponent onSubmit={handlePayment} />
    </div>
  );
};

export default EntryFeeGame;
