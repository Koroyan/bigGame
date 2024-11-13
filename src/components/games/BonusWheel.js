import React, { useState } from 'react';
import '../../styles/BonusWheel.css'; // Ensure the updated CSS file is imported
import ScrollBarComponent from '../ScrollBarComponent'; // Adjust the path based on your structure

const BonusWheel = () => {
    const [name, setName] = useState('');
    const [participants, setParticipants] = useState(['','','','alex','giorgi','malxaz','jumber','vasiko','avto','martin','MKRTICH']);
    const [winner, setWinner] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false); // Track if the game is started
    const [winnerIndex, setWinnerIndex] = useState(-1); // State for the winner index input
    const jackpotAmount = 1000; // Example jackpot amount in USDT

    // Register participant if the name is unique
    const registerParticipant = (e) => {
        e.preventDefault();
        if (name && !participants.includes(name)) {
            setParticipants([...participants, name]);
            setName(''); // Reset the name input after adding
        }
    };

    // Handle the winner when the scrolling finishes
    const onFinished = (winner) => {
        setWinner(winner);
        setIsGameStarted(false); // Reset game state after winner is chosen
    };

    // Start the game
    const startGame = () => {
        if (participants.length > 0) {
            setIsGameStarted(true); // Mark the game as started
            setWinner(''); // Reset winner before starting the game
            setWinnerIndex(-1); // Reset winner index when starting the game
        }
    };

    // Set winner index manually
    const setWinnerByIndex = () => {
        if (winnerIndex >= 0 && winnerIndex < participants.length) {
            setWinner(participants[winnerIndex]);
            setIsGameStarted(false); // Reset game state after winner is chosen
        } else {
            alert('Please enter a valid winner index.');
        }
    };

    return (
        <div className="bonus-wheel-container">
            <h1 className="title">Bonus Game</h1>
            <form onSubmit={registerParticipant} className="register-form">
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name" 
                    required 
                    className="name-input"
                />
                <button type="submit" className="register-button">Register</button>
            </form>

            {participants.length > 0 && (
                <>
                    <div className="game-info">
                        <div className="info-box">
                            <span className="info-label">Participants:</span>
                            <span className="info-count">{participants.length}</span>
                        </div>
                        <div className="info-box">
                            <span className="info-label">Jackpot:</span>
                            <span className="info-count">{jackpotAmount} USDT</span>
                        </div>
                    </div>

                    <div className="scroll-bar-container">
                        {isGameStarted ? (
                            <ScrollBarComponent
                                participants={participants}
                                onFinished={onFinished}
                                scrollTime={12000}
                                winnerIndex={-1} // Pass the winner index to the scroll component
                            />
                        ) : (
                            <button onClick={startGame} className="start-button">
                                Start Game
                            </button>
                        )}
                    </div>

                    {winner && <h2 className="winner">Winner: {winner}</h2>}
                </>
            )}
        </div>
    );
};

export default BonusWheel;
