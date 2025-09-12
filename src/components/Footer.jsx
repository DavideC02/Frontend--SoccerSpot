import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto">
      <div className="container">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} SoccerSpot — Tutti i diritti riservati
        </p>
      </div>
    </footer>
  );
}

export default Footer;