import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import BottomNav from '../bottomnav/BottomNav'; // Import BottomNav
import '../../styles/TableList.css'; // Import the CSS file for styling

const TableList = () => {
  const [tables, setTables] = useState([]);

  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await api.get('/tables'); // Updated endpoint to fetch all tables
        setTables(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTables();
  }, []);

  const calculateRemainingTime = (expiresAt) => {
    const now = new Date().getTime();
    const distance = new Date(expiresAt).getTime() - now;

    if (distance < 0) {
      return 'Expired';
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  };

  return (
    <div className="table-list-container">
      {!isLoggedIn() && (
        <div className="marketing-banner">
          <h3>Exciting Rewards Await!</h3>
          <p>Join now for a chance to win big and enjoy the thrill of the game!</p>
          <Link to="/register" className="register-link">Sign Up Today!</Link>
        </div>
      )}
      <h2 className="title">Join Our Exciting Tables!</h2>
      <ul className="table-list">
        {tables.map(table => (
          <li key={table._id} className="table-item">
            <div className="table-details">
              <span className="table-id">Table ID: {table._id}</span>
              <span className="table-cost">Cost to Join: <strong>{table.cost} USDT</strong></span>
              <span className="table-participants">Current Participants: <strong>{table.players.length}</strong></span>
              <span className="table-timer">
                Time Left to Join: <strong>{calculateRemainingTime(table.expiresAt)}</strong>
              </span>
            </div>
            <Link to={`/join/${table._id}`} className="join-link">Join Now & Win!</Link>
          </li>
        ))}
      </ul>
      <BottomNav /> {/* Include the BottomNav component */}
    </div>
  );
};

export default TableList;
