import React, { useEffect, useRef, useState } from 'react';
import '../styles/ScrollBarComponent.css'; // Ensure the updated CSS file is imported

const ScrollBarComponent = ({ participants, onFinished, winnerIndex = -1, scrollTime = 5500 }) => {
    const scrollListRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const scrollPositionRef = useRef(0); // Track the scroll position
    const [isScrolling, setIsScrolling] = useState(true); // To track if scrolling is ongoing
    const [currentParticipants, setCurrentParticipants] = useState(participants); // Manage dynamic list

    useEffect(() => {
        // Update currentParticipants when the participants prop changes
        setCurrentParticipants(participants);
    }, [participants]);

    useEffect(() => {
        if (currentParticipants.length === 0) return;

        const itemHeight = scrollListRef.current.firstChild.offsetHeight;
        const totalHeight = itemHeight * currentParticipants.length;

        // Function to start scrolling
        const startScrolling = () => {
            // Set an interval to continuously scroll
            scrollIntervalRef.current = setInterval(() => {
                scrollPositionRef.current += 1; // Increment scroll position
                scrollListRef.current.style.transform = `translateY(-${scrollPositionRef.current}px)`;

                // Once we reach the end of the list, we continue seamlessly by shifting items
                if (scrollPositionRef.current >= totalHeight) {
                    scrollPositionRef.current -= itemHeight; // Reset to the first item position

                    // Move the first item to the end of the list
                    setCurrentParticipants((prevParticipants) => {
                        const updatedParticipants = [...prevParticipants];
                        const firstParticipant = updatedParticipants.shift();
                        updatedParticipants.push(firstParticipant);
                        return updatedParticipants;
                    });
                }
            }, 20); // Adjust this value for your desired scroll speed
        };

        // Start scrolling initially
        startScrolling();

        // Clean up the interval on unmount
        return () => {
            clearInterval(scrollIntervalRef.current);
        };
    }, [currentParticipants]);

    useEffect(() => {
        if (winnerIndex === -1 || !isScrolling) return; // If winnerIndex is -1 or not scrolling, keep spinning

        // Stop continuous scrolling and smooth scroll to the winner
        clearInterval(scrollIntervalRef.current);
        setIsScrolling(false);

        const itemHeight = scrollListRef.current.firstChild.offsetHeight;
        const scrollPosition = winnerIndex * itemHeight - scrollListRef.current.offsetHeight / 2 + itemHeight / 2;

        // Smooth scroll to the winner
        scrollListRef.current.style.transition = `transform ${scrollTime}ms ease-out`;
        scrollListRef.current.style.transform = `translateY(-${scrollPosition}px)`;

        // Announce the winner after the scrolling is done
        setTimeout(() => {
            onFinished(currentParticipants[winnerIndex]);
        }, scrollTime + 1000); // Adding 1 second buffer before announcing the winner

    }, [winnerIndex, currentParticipants, onFinished, scrollTime, isScrolling]);

    return (
        <div className="scroll-bar">
            <div className="scroll-list" ref={scrollListRef}>
                {currentParticipants.map((participant, index) => (
                    <div key={index} className={`scroll-item ${winnerIndex === index ? 'center-item' : ''}`}>
                        {participant}
                    </div>
                ))}
                {/* Duplicate list for seamless scrolling */}
                {currentParticipants.map((participant, index) => (
                    <div key={`duplicate-${index}`} className={`scroll-item ${winnerIndex === index ? 'center-item' : ''}`}>
                        {participant}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollBarComponent;
