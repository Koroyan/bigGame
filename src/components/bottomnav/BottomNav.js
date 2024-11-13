// src/components/BottomNav.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/BottomNav.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTable, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

const BottomNav = () => {
  const location = useLocation(); // Get the current location
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`bottom-nav ${showNavbar ? 'show' : ''}`}>
      <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faUser} className="nav-icon" />
        <span>Account</span>
      </Link>
      <Link to="/tables" className={`nav-link ${location.pathname === '/tables' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faTable} className={`nav-icon`} />
        <span>Tables</span>
      </Link>
      <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />
        <span>Transactions</span>
      </Link>
    </div>
  );
};

export default BottomNav;
