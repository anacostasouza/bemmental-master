import "../styles/Header.css";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<"Psicologo" | "Paciente" | null>(null);
  const [userName, setUserName] = useState<string | null>(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (userDoc.exists()) {
          const dados = userDoc.data();
          setTipoUsuario(dados.tipoUsuario);
          setUserName(dados.nome || currentUser.displayName || currentUser.email);
        } else {
          setUserName(currentUser.displayName || currentUser.email);
        }
      } else {
        setTipoUsuario(null);
        setUserName(null); 
      }
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

      {user && (
        <div className="center-button">
          {tipoUsuario === "Paciente" ? (
            <button onClick={() => navigate("/marcar-consulta")} className="btn btn-agendar">
              Agendar Consulta
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/agenda")} className="btn btn-agendar">
                Minha Agenda
              </button>
            </>
          )}
        </div>
      )}

      <div className="button-group">
        {!user ? (
          <>
            <Link to={"/login"}>
              <button className="btn btn-login">Entrar</button>
            </Link>
            <Link to={"/cadastrar"}> 
              <button className="btn btn-register">Registrar</button>
            </Link>
          </>
        ) : (
          <span className="user-info-dropdown" onClick={() => navigate("/perfil")}>
            Olá, {userName || "Usuário"}
            <i className="fas fa-caret-down" style={{ marginLeft: '5px' }}></i>
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;