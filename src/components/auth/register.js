import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/Register.css'; // Import the CSS file for styling

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the visibility of the password
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await api.post('/auth/register', { email: form.email, password: form.password });
      alert('Registration successful');
      navigate('/login');
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || 'Registration failed. Please try again.');
      } else if (err.request) {
        alert('No response received. Please check your network connection. ' + err.message);
      } else {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">Join the adventure now!</p>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            className="register-input"
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <div className="password-container">
            <input
              className="register-input"
              name="password"
              type={showPassword ? 'text' : 'password'} // Change input type based on visibility state
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="button" className="toggle-password-btn" onClick={togglePasswordVisibility}>
              {showPassword ? 'Hide' : 'Show'} {/* Button text changes based on state */}
            </button>
          </div>
          <div className="password-container">
            <input
              className="register-input"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'} // Toggle confirm password input type
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
            <button type="button" className="toggle-password-btn" onClick={togglePasswordVisibility}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="register-button">Register</button>
        </form>
        <p className="register-footer-text">Already have an account? <a href="/login" className="login-link">Login here</a></p>
      </div>
    </div>
  );
};

export default Register;
