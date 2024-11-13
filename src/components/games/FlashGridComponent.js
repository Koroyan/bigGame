import React, { useEffect, useState } from 'react';
import '../../styles/FlashGridComponent.css';

const FlashGridComponent = ({ participants, flashDuration = 5000, onFinished }) => {
    const [flashingIndex, setFlashingIndex] = useState(null); // Index of the flashing item
    const [winnerIndex, setWinnerIndex] = useState(null); // Index of the final winner

    useEffect(() => {
        let flashTimer;

        if (participants.length > 0) {
            const flashNames = () => {
                // Randomly select a flashing index
                setFlashingIndex(Math.floor(Math.random() * participants.length));
            };

            // Flash random names repeatedly for the given duration
            flashTimer = setInterval(flashNames, 200);

            // After the flash duration, select a winner and stop flashing
            setTimeout(() => {
                clearInterval(flashTimer);
                const winner = Math.floor(Math.random() * participants.length);
                setWinnerIndex(winner); // Highlight the final winner
                onFinished(participants[winner]); // Trigger callback with the winner
            }, flashDuration);
        }

        return () => {
            clearInterval(flashTimer); // Cleanup the interval
        };
    }, [participants, flashDuration, onFinished]);

    return (
        <div className="grid-container">
            {participants.map((participant, index) => (
                <div
                    key={index}
                    className={`grid-item ${index === flashingIndex ? 'flash' : ''} ${index === winnerIndex ? 'winner' : ''}`}
                >
                    {participant}
                </div>
            ))}
        </div>
    );
};

export default FlashGridComponent;
