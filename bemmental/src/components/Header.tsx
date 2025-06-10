import "../styles/Header.css";
import logo from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/Login");
  };
  const handleRegisterClick = () => {
    navigate("/Register");
  };

  return (
    <header className="header">
      <div className="logo-container">
        {<img src={logo} alt="Logo Bem Mental" className="logo" />}
      </div>

      <div className="button-group">
        <button onClick={(handleLoginClick)} className="btn btn-login">Entrar</button>
        <button onClick={(handleRegisterClick)} className="btn btn-register">Registrar</button>
      </div>
    </header>
  );
};

export default Header;
