import "../firebase/firebaseConfig";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../styles/login.css";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));

      if (userDoc.exists()) {
        const dados = userDoc.data();

        if (dados.tipoUsuario === "Psicologo") {
          navigate("/"); 
        } else {
          navigate("/");
        }
      } else {
        alert("Perfil de usuário não encontrado.");
      }
    } catch (error) {
      alert("Usuário ou senha inválidos!");
    }
  };

  return (
    <div className="login-container">
        <div className="login-form">
          <form onSubmit={handleLogin} className="form">
            <div className="titulo">
              <h1>Login de Usuário</h1>
              <p>
                Não tem conta?
                  <Link to={'/cadastro'} className="cadastro">
                    <p>Cadastrar</p>
                  </Link>
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail*</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha*</label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Entrar</button>
          </form>
        </div>
      <div className="register-image" />
    </div>
  );
};

export default Login;
