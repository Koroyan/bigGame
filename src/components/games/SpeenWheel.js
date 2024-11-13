import React, { useState } from "react";

const SpinWheel = ({ onSpin }) => {
  const [spinResult, setSpinResult] = useState(null);

  const spinWheel = () => {
    // Randomize the result (this is a simplified example)
    const result = Math.random() > 0.5 ? "Win a Lucky Ticket!" : "Better Luck Next Time!";
    setSpinResult(result);
    if (result === "Win a Lucky Ticket!") {
      onSpin();
    }
  };

  return (
    <div className="spin-wheel">
      <h3>Spin the Wheel!</h3>
      <button onClick={spinWheel}>Spin Now</button>
      {spinResult && <p>{spinResult}</p>}
    </div>
  );
};

export default SpinWheel;
