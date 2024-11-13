import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/JoinTable.css'; // Import the CSS file here

const JoinTable = () => {
  const { tableId } = useParams();
  const [table, setTable] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null); // New state for the timer
  const navigate = useNavigate();
  var selectedTable;

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const res = await api.get(`/tables`); // Fetch all tables
        selectedTable = res.data.find((t) => t._id === tableId); // Use _id for MongoDB
        setTable(selectedTable);

        if (selectedTable) {
          // Calculate time remaining
          const expiresAt = new Date(selectedTable.expiresAt).getTime();
          updateTimer(expiresAt);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTable();

    // Timer update every second
    const interval = setInterval(() => {
      if (selectedTable) {
        const expiresAt = new Date(selectedTable.expiresAt).getTime();
        updateTimer(expiresAt);
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up the timer
  }, [tableId]);

  const updateTimer = (expiresAt) => {
    const now = new Date().getTime();
    const distance = expiresAt - now;

    if (distance < 0) {
      setTimeRemaining('Expired');
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const handleJoin = async () => {
   

    try {
      const token = localStorage.getItem('token'); // Retrieve the token stored after login
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const userResponse = await api.get('/auth/user', config);
      const { walletAddress: from, privateKey, _id } = userResponse.data;

  

    //   const res = await api.post('/transactions/withdraw', {
    //     to: '0x12a4180f436ca93d6cb19403844929EDd38Bb23B',  // Recipient address
    //     amount: table.cost
    // }, config);
      console.log('idid ', _id);
      // After successful transfer, join the table
      await api.post(`/tables/${tableId}/register`, { userId: _id }); // Register the user
      alert('Joined the table successfully');
      navigate('/tables');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Withdrawal failed!');
    }
  };

  if (!table) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Join Table {table._id}</h2>
        <p className="cost">Cost: {table.cost} USDT</p> {/* Display table cost */}
        <p className="timer">Time Remaining: {timeRemaining}</p> {/* Display timer */}
        <p className="participants">
          Participants: {table.players ? table.players.length : 0}
        </p>
        <button className="join-button" onClick={handleJoin}>
          Join for {table.cost} USDT
        </button>
      </div>
    </div>
  );
};

export default JoinTable;
