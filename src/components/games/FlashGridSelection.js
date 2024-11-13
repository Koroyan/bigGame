// FlashGridSelection.js
import React, { useState, useEffect } from 'react';
import '../../styles/FlashGridSelection.css';

const FlashGridSelection = ({ userList, winner }) => {
    const [users, setUsers] = useState(userList.slice(0, 100)); // Display only 100 users on the screen
    const [isFlashing, setIsFlashing] = useState(true);

    useEffect(() => {
        if (isFlashing) {
            const shuffleInterval = setInterval(() => {
                // Shuffle a random subset of users
                const randomSubset = userList.sort(() => 0.5 - Math.random()).slice(0, 100);
                setUsers(randomSubset);
            }, 500); // Flashing speed (500ms interval)

            // Stop flashing after 20 seconds and select a winner
            const timeout = setTimeout(() => {
                clearInterval(shuffleInterval);
                setIsFlashing(false);
            }, 20000); // Duration of flashing

            return () => {
                clearInterval(shuffleInterval);
                clearTimeout(timeout);
            };
        }
    }, [isFlashing, userList]);

    return (
        <div className="flash-grid">
            <div className="grid">
                {users.map((user, index) => (
                    <div key={index} className={`grid-item ${user === winner ? 'winner' : ''}`}>
                        {user}
                    </div>
                ))}
            </div>
            {winner && <div className="winner-banner">🎉 Winner: {winner} 🎉</div>}
        </div>
    );
};

export default FlashGridSelection;
