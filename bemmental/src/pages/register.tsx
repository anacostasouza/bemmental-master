import React, { useState } from "react";
import { createUserProfile } from "../utils/firebaseUtils";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Cadastrar: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    tipoUsuario: "",
    cro: "",
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

  // Função para checar se o usuário tem 18 anos ou mais
  const verificarMaiorIdade = (dataNascimento: string) => {
    if (!dataNascimento) return false;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      return idade - 1 >= 18;
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

      const userData = {
        usuarioID: user.uid,
        email: formData.email,
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        tipoUsuario: formData.tipoUsuario as "Paciente" | "Psicologo",
        isPsicologo: formData.tipoUsuario === "Psicologo",
        cro: formData.tipoUsuario === "Psicologo" ? formData.cro : null,
        genero: formData.genero,
        dataNascimento: formData.dataNascimento,
      };

      await createUserProfile(userData);

      alert("Usuário registrado com sucesso!");

      setFormData({
        nome: "",
        sobrenome: "",
        tipoUsuario: "",
        cro: "",
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
        <h1>Cadastro de Usuário</h1>

        <div className="name-fields">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="sobrenome"
            placeholder="Sobrenome"
            value={formData.sobrenome}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
          minLength={6}
        />

        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
          required
        >
          <option value="">Tipo de Usuário</option>
          <option value="Paciente">Paciente</option>
          <option value="Psicologo">Psicólogo</option>
        </select>

        {formData.tipoUsuario === "Psicologo" && (
          <input
            type="text"
            name="cro"
            placeholder="CRO"
            value={formData.cro}
            onChange={handleChange}
            required
          />
        )}

        <select
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          required
        >
          <option value="">Gênero</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
          <option value="Prefiro não dizer">Prefiro não dizer</option>
        </select>

        <input
          type="date"
          name="dataNascimento"
          placeholder="Data de nascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
          required
          max={new Date().toISOString().split("T")[0]} // Impede datas futuras
        />
        {erroMaiorIdade && (
          <p className="error-message">{erroMaiorIdade}</p>
        )}

        <button type="submit">Registrar</button>
      </form>
      <div className="register-image" />
    </div>
  );
};

export default Cadastrar;
