// src/components/BottomNav.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/BottomNav.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faTrophy, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

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
      <Link to="/games" className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faGamepad} className="nav-icon" />
        <span>Games</span>
      </Link>
      <Link to="/newyearbigprize" className={`nav-link ${location.pathname === '/newyearbigprize' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faTrophy} className="nav-icon" />
        <span>Big Game</span>
      </Link>
      <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>
        <FontAwesomeIcon icon={faExchangeAlt} className="nav-icon" />
        <span>Transactions</span>
      </Link>
    </div>
  );
};

export default BottomNav;
