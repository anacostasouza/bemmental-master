import "../styles/Header.css";
import logo from "../assets/logo.png";
import { useNavigate, Link } from 'react-router-dom';

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
        <Link to={"/"}>
        {<img src={logo} alt="Logo Bem Mental" className="logo" />}
        </Link>
      </div>

      <div className="button-group">
        <button onClick={(handleLoginClick)} className="btn btn-login">Entrar</button>
        <button onClick={(handleRegisterClick)} className="btn btn-register">Registrar</button>
      </div>
    </header>
  );
};

export default Header;
