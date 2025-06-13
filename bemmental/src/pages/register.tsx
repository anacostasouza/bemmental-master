import React, { useState } from "react";
import { createUserProfile } from "../utils/firebaseUtils";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { type Usuario } from "../types/Usuarios"
import "../styles/register.css";

const Cadastrar: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    tipoUsuario: "",
    crp: "",
    email: "",
    senha: "",
    genero: "",
    dataNascimento: "",
  });

  const [erroMaiorIdade, setErroMaiorIdade] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "dataNascimento") {
      setErroMaiorIdade(null);
    }
  };

  const verificarMaiorIdade = (dataNascimento: string) => {
    if (!dataNascimento) return false;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificarMaiorIdade(formData.dataNascimento)) {
      setErroMaiorIdade("Você precisa ter 18 anos ou mais para se cadastrar.");
      return;
    }

    if (!formData.genero) {
      alert("Por favor, selecione o gênero.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.nome} ${formData.sobrenome}`,
      });


      let userData: Usuario;

      if (formData.tipoUsuario === "Psicologo") {
        userData = {
          usuarioID: user.uid,
          email: formData.email,
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          tipoUsuario: "Psicologo" as const,
          isPsicologo: true,
          crp: formData.crp,
          genero: formData.genero,
          dataNascimento: formData.dataNascimento,
        };
      } else {
        userData = {
          usuarioID: user.uid,
          email: formData.email,
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          tipoUsuario: "Paciente" as const,
          isPsicologo: false,
          genero: formData.genero,
          dataNascimento: formData.dataNascimento,
        };
      }

      await createUserProfile(userData);

      alert("Usuário registrado com sucesso!");

      setFormData({
        nome: "",
        sobrenome: "",
        tipoUsuario: "",
        crp: "",
        email: "",
        senha: "",
        genero: "",
        dataNascimento: "",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Erro ao registrar:", error.message);
      alert("Erro: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="titulo">
          <h1>Cadastro de Usuário</h1>
          <p>
            Já possui uma conta?
            <Link to={"/Login"} className="entrar">
              <p> Entrar</p>
            </Link>
          </p>
        </div>
        <div className="cadastro-campos">
          <div className="name-fields">
            <div className="nome">
              <p>Nome*</p>
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sobrenome">
              <p>Sobrenome*</p>
              <input
                type="text"
                name="sobrenome"
                placeholder="Sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="email">
            <p>Email*</p>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="senha">
            <p>Senha*</p>
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="tipo-usuario">
            <p>Tipo de usuário*</p>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="Paciente">Paciente</option>
              <option value="Psicologo">Psicólogo</option>
            </select>

            {formData.tipoUsuario === "Psicologo" && (
              <input
                id="crp"
                type="text"
                name="crp"
                placeholder="CRP"
                value={formData.crp}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="genero">
            <p>Gênero*</p>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
              <option value="Prefiro não dizer">Prefiro não dizer</option>
            </select>
          </div>

          <div className="data-nascimento">
            <p>Data de Nascimento*</p>
            <input
              type="date"
              name="dataNascimento"
              placeholder="Data de nascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
            />
            {erroMaiorIdade && (
              <p className="error-message">{erroMaiorIdade}</p>
            )}
          </div>

          <button type="submit">Registrar</button>
        </div>
      </form>
      <div className="register-image" />
    </div>
  );
};

export default Cadastrar;
