import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

const Header = ({ 
  title = 'Direct Home Service', 
  subtitle = 'Customer Service Knowledge Base',
  logoSrc = '/brand/logo-12.png',
  logoAlt = 'Direct Home Service',
  homeUrl = '/index.html'
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <a href={homeUrl} className={styles.logoLink}>
          <img 
            src={logoSrc} 
            alt={logoAlt} 
            className={styles.logo}
          />
        </a>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  logoSrc: PropTypes.string,
  logoAlt: PropTypes.string,
  homeUrl: PropTypes.string
};

export default Header;