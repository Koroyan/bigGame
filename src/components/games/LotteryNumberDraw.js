import React, { useEffect, useState } from 'react';
import '../../styles/LotteryNumberDraw.css'; // We'll define this CSS later

const LotteryNumberDraw = ({ numberOfDigits = 6, winnerId = '000567', onFinish }) => {
    const [currentNumbers, setCurrentNumbers] = useState(Array(numberOfDigits).fill(0));

    useEffect(() => {
        const spinTime = 5000; // Total spin time in ms
        const intervals = [];

        // Spin each digit separately with a delay
        currentNumbers.forEach((_, index) => {
            intervals.push(
                setTimeout(() => {
                    // Generate random numbers for the digit
                    const spinInterval = setInterval(() => {
                        setCurrentNumbers((prev) =>
                            prev.map((num, i) => (i === index ? Math.floor(Math.random() * 10) : num))
                        );
                    }, 50);

                    // Stop spinning after spinTime
                    setTimeout(() => {
                        clearInterval(spinInterval);
                        setCurrentNumbers((prev) => prev.map((num, i) => (i === index ? Number(winnerId[i]) : num)));
                        
                        // When last digit is locked, call onFinish
                        if (index === numberOfDigits - 1) {
                            setTimeout(() => {
                                onFinish && onFinish(winnerId);
                            }, 1000);
                        }
                    }, spinTime);
                }, index * 2000) // Delay each digit's spinning by 500ms
            );
        });

        // Cleanup intervals on unmount
        return () => {
            intervals.forEach((interval) => clearTimeout(interval));
        };
    }, [winnerId, numberOfDigits, onFinish]);

    return (
        <div className="lottery-container">
            {currentNumbers.map((number, index) => (
                <div key={index} className="lottery-digit">
                    {number}
                </div>
            ))}
        </div>
    );
};

export default LotteryNumberDraw;
