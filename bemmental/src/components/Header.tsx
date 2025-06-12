import "../styles/Header.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="header">
      <div className="logo-container">
        <Link to={"/"}>
          <img src={logo} alt="Logo Bem Mental" className="logo" />
        </Link>
      </div>

      <div className="button-group">
        {!user ? (
          <>
            <Link to={"/Login"}>
              <button className="btn btn-login">Entrar</button>
            </Link>
            <Link to={"/Register"}>
              <button className="btn btn-register">Registrar</button>
            </Link>
          </>
        ) : (
          <span className="user-name">
            Olá, {user.displayName || "Usuário"}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
