import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-social">
        <a href="#">X</a>
        <a href="#">📸</a>
        <a href="#">▶️</a>
        <a href="#">🔗</a>
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
