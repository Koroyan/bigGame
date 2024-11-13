import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import FlashGridSelection from './FlashGridSelection';

const FlashGridGame = () => {
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Establish socket connection within the useEffect
        const socket = io('http://192.168.0.79:5000'); // Adjust to your server URL

        // Listen for winner selection event from the server
        socket.on('winnerSelected', (data) => {
            setWinner(data.winnerId); // Set the winner when received
            setPlayers(data.players); // Update the player list from the server
        });

        // Clean up the socket connection when component unmounts
        // return () => {
        //     socket.off('winnerSelected'); // Remove the listener
        //     socket.disconnect(); // Disconnect the socket
        // };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div>
            <h1>Flash Grid Selection</h1>
            <FlashGridSelection userList={players} winner={winner} />
        </div>
    );
};

export default FlashGridGame;
