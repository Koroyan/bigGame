import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/Profile.css'; // Ensure your CSS is linked

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await api.get('/auth/user', config);
        setUser(response.data);
        setForm({
        //   username: response.data.username,
          email: response.data.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.put('/auth/user', form, config);
      setEditing(false);
      // Update user state after editing
      setUser({ ...user, ...form });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      {editing ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Balance:</strong> {user.balance} USDT</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      )}
      <h2>Transaction History</h2>
      <ul>
        {user.transactions.map((transaction, index) => (
          <li key={index}>
            {transaction.type} - {transaction.amount} USDT - {transaction.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
