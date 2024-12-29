import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="simple-footer">
      <div className="copyright">
        © {currentYear} Quiz App. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

export default Footer; 