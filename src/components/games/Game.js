// src/pages/Game.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Assuming this is the path to your API service


const Game = () => {
  const [players, setPlayers] = useState([]);  // Default to an empty array
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the current game state, players, etc.
    const fetchData = async () => {
      try {
        const response = await api.get('/game/status');  // Make sure you have this API route
        setPlayers(response.data.players || []);  // Safeguard: default to empty array if players are undefined
      } catch (error) {
        console.error('Error fetching game data:', error);
        setMessage('Error fetching game data.');
      }
    };
    fetchData();
  }, []);

  const joinGame = async () => {
    try {
      const response = await api.post('/game/join');
      setPlayers(response.data.game.players || []);  // Safeguard: default to empty array if players are undefined
      setMessage('You joined the game.');
    } catch (error) {
      console.error('Error joining the game:', error);
      setMessage('Failed to join the game.');
    }
  };

  const startGame = async () => {
    try {
      const response = await api.post('/game/start');
      setWinner(response.data.winner);
      setMessage('Game started! Winner has been chosen.');
    } catch (error) {
      console.error('Error starting the game:', error);
      setMessage('Failed to start the game.');
    }
  };

  return (
    <div>
      <h1>Game of Chance</h1>
      <button onClick={joinGame}>Join Game</button>
      <button onClick={startGame}>Start Game</button>
      
      <h2>Players:</h2>
      <ul>
        {players.length > 0 ? (
          players.map((player, index) => (
            <li key={index}>{player}</li>
          ))
        ) : (
          <p>No players yet</p>
        )}
      </ul>

      {winner && <h2>Winner: {winner}</h2>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Game;
