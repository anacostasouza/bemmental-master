import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-social" style={{ display: 'flex', gap: '12px' }}>
        
        <a href="#" aria-label="Twitter" dangerouslySetInnerHTML={{__html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557a9.828 9.828 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.196 4.916 4.916 0 0 0-8.37 4.482A13.944 13.944 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.574 4.9 4.9 0 0 1-2.228-.616v.062a4.916 4.916 0 0 0 3.941 4.814 4.996 4.996 0 0 1-2.224.085 4.918 4.918 0 0 0 4.59 3.414 9.868 9.868 0 0 1-6.102 2.104c-.397 0-.79-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.01-7.506 14.01-14.01 0-.213-.005-.425-.014-.636A10.025 10.025 0 0 0 24 4.557z"/>
          </svg>
        `}} />

        <a href="#" aria-label="Instagram" dangerouslySetInnerHTML={{__html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm8.5 1.5a4.25 4.25 0 0 1 4.25 4.25v8.5a4.25 4.25 0 0 1-4.25 4.25h-8.5a4.25 4.25 0 0 1-4.25-4.25v-8.5a4.25 4.25 0 0 1 4.25-4.25h8.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm4.75-.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
          </svg>
        `}} />

        <a href="#" aria-label="LinkedIn" dangerouslySetInnerHTML={{__html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0h4.8v2.3h.1c.67-1.3 2.3-2.6 4.7-2.6 5 0 5.9 3.3 5.9 7.6V24h-5v-7.3c0-1.7-.03-3.9-2.4-3.9-2.4 0-2.8 1.8-2.8 3.8V24h-5V8z"/>
          </svg>
        `}} />
      </div>

      <div className="footer-copy">
        <span>Copyright Bem Mental - @2025. Todos os direitos reservados</span>
      </div>

      <div className="footer-links">
        <a href="#">Política de Privacidade</a>
        <a href="#">Termos de Uso</a>
      </div>
    </footer>
  );
};

export default Footer;
