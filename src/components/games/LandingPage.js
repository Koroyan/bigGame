import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/LandingPage.module.css'; // Scoped CSS for LandingPage styling

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} animate__animated animate__fadeIn`}>🎉 Big Wins Await This New Year! 🎉</h1>
          <p className={`${styles.heroSubtitle} animate__animated animate__fadeIn animate__delay-1s`}>
            Join the ultimate gaming experience and win amazing prizes this New Year!
          </p>
          <Link to="/login" className={`${styles.ctaButton} animate__animated animate__fadeIn animate__delay-2s`}>
            Log in to Play
          </Link>
        </div>
      </header>

      <section className={styles.gameHighlight}>
        <div className={`${styles.gameCard} animate__animated animate__fadeIn animate__delay-3s`}>
          <h2 className={styles.gameTitle}>🎰 Mini Games</h2>
          <p className={styles.gameDescription}>
            Play exciting mini-games and win instant rewards. Simple, fun, and packed with surprises!
          </p>
          <Link to="/games" className={styles.ctaButton}>Explore Mini Games</Link>
        </div>

        <div className={`${styles.gameCard} animate__animated animate__fadeIn animate__delay-4s`}>
          <h2 className={styles.gameTitle}>🎉 New Year Big Win Jackpot</h2>
          <p className={styles.gameDescription}>
            Don't miss your chance to win a life-changing jackpot this New Year! Big prizes are just one spin away.
          </p>
          <Link to="/jackpot" className={styles.ctaButton}>Play the Jackpot</Link>
        </div>
      </section>

      <footer className={styles.mainFooter}>
        <p>© 2024 Game of Chance. All rights reserved. Play responsibly.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
