const GrandPrizeDraw = ({ players }) => {
    const drawWinner = () => {
      const winnerIndex = Math.floor(Math.random() * players.length);
      alert(`The winner is ${players[winnerIndex].name}! Congratulations!`);
    };
  
    return (
      <div className="grand-prize">
        <button onClick={drawWinner}>Draw Winner</button>
      </div>
    );
  };
  