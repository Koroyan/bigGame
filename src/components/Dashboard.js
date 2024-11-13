import React, { useState } from "react";

const Dashboard = ({ player }) => {
  const [luckyTickets, setLuckyTickets] = useState(player ? player.luckyTickets : 0);

  // Simulating lucky ticket accumulation via mini-games or referral bonuses
  const accumulateTickets = () => {
    setLuckyTickets(luckyTickets + 1); // Increase tickets by 1 each time
  };

  return (
    <div className="dashboard">
      <h2>Your Dashboard</h2>
      {player ? (
        <div>
          <p>Entry Fee: {player.entryFee} USDT</p>
          <p>Lucky Tickets: {luckyTickets}</p>
          <button onClick={accumulateTickets}>Earn Lucky Ticket (Mini-Game)</button>
        </div>
      ) : (
        <p>Please register to participate in the game!</p>
      )}
    </div>
  );
};

export default Dashboard;
