import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { UsuarioPsicologo, UsuarioPaciente, AgendaDisponibilidade } from "../types/Usuarios";
import "../styles/perfil.css";

type PerfilUsuario = UsuarioPsicologo | UsuarioPaciente;

export default function Perfil() {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsuario, setEditedUsuario] = useState<PerfilUsuario | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const diasSemanaOptions: Array<AgendaDisponibilidade["diaSemana"] | ""> = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const periodosOptions: Array<AgendaDisponibilidade["periodo"] | ""> = ["", "Manhã", "Tarde", "Noite"];
  const horariosManha = ["08:00", "09:00", "10:00", "11:00"];
  const horariosTarde = ["13:00", "14:00", "15:00", "16:00", "17:00"];
  const horariosNoite = ["18:00", "19:00", "20:00"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as PerfilUsuario;
            setUsuario(data);
            setEditedUsuario(data);
            setError(null);
          } else {
            setUsuario(null);
            setEditedUsuario(null);
            setError("Seu perfil não foi encontrado. Verifique seu cadastro.");
          }
        } catch (err: any) {
          console.error("Erro ao carregar perfil:", err);
          setError("Não foi possível carregar o perfil. Tente novamente.");
        }
      } else {
        setUsuario(null);
        setEditedUsuario(null);
        setError("Nenhum usuário logado. Faça login para acessar seu perfil.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedUsuario) {
      setEditedUsuario({ ...editedUsuario, [name]: value });
    }
  };

  const handleAddDisponibilidade = () => {
    if (editedUsuario && editedUsuario.tipoUsuario === "Psicologo") {
      setEditedUsuario({
        ...editedUsuario,
        agendaDisponibilidade: [
          ...(editedUsuario.agendaDisponibilidade || []),
          { diaSemana: "", periodo: "", horarios: [] as string[] },
        ],
      });
    }
  };

  const handleRemoveDisponibilidade = (index: number) => {
    if (editedUsuario && editedUsuario.tipoUsuario === "Psicologo" && editedUsuario.agendaDisponibilidade) {
      const updatedDisponibilidade = editedUsuario.agendaDisponibilidade.filter((_, i) => i !== index);
      setEditedUsuario({
        ...editedUsuario,
        agendaDisponibilidade: updatedDisponibilidade,
      });
    }
  };

  const handleDisponibilidadeChange = (
    index: number,
    field: keyof AgendaDisponibilidade,
    value: string | string[]
  ) => {
    if (editedUsuario && editedUsuario.tipoUsuario === "Psicologo" && editedUsuario.agendaDisponibilidade) {
      const updatedDisponibilidade = [...editedUsuario.agendaDisponibilidade];
      if (field === 'horarios') {
        updatedDisponibilidade[index].horarios = typeof value === 'string'
          ? value.split(',').map(h => h.trim()).filter(h => h)
          : value;
      } else {
        (updatedDisponibilidade[index] as { [key: string]: any })[field] = value;
      }
      setEditedUsuario({
        ...editedUsuario,
        agendaDisponibilidade: updatedDisponibilidade,
      });
    }
  };


  const handleSave = async () => {
    if (!usuario || !editedUsuario) {
      setError("Não foi possível salvar: dados de usuário não disponíveis.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const docRef = doc(db, "usuarios", usuario.usuarioID);


      const updates: Partial<UsuarioPsicologo> | Partial<UsuarioPaciente> = {
        nome: editedUsuario.nome,
        sobrenome: editedUsuario.sobrenome,
        telefone: editedUsuario.telefone,
        genero: editedUsuario.genero,
        endereco: editedUsuario.endereco,
      };

      if (editedUsuario.tipoUsuario === "Psicologo") {
        const editedPsicologo = editedUsuario as UsuarioPsicologo;

        const processedDisponibilidade: AgendaDisponibilidade[] = (editedPsicologo.agendaDisponibilidade || []).map(item => {
          if (!item.diaSemana || !item.periodo) {
            console.warn("Disponibilidade ignorada devido a campo vazio:", item);
            return null;
          }

          let horariosProcessados = item.horarios;
          if (item.horarios.length === 0 || (item.horarios.length === 1 && item.horarios[0].trim() === '')) {
            switch (item.periodo) {
              case "Manhã":
                horariosProcessados = horariosManha;
                break;
              case "Tarde":
                horariosProcessados = horariosTarde;
                break;
              case "Noite":
                horariosProcessados = horariosNoite;
                break;
              default:
                horariosProcessados = [];
            }
          }
          return { ...item, horarios: horariosProcessados };
        }).filter(item => item !== null) as AgendaDisponibilidade[];

        (updates as Partial<UsuarioPsicologo>).crp = editedPsicologo.crp;
        (updates as Partial<UsuarioPsicologo>).descricaoProfissional = editedPsicologo.descricaoProfissional;
        (updates as Partial<UsuarioPsicologo>).agendaDisponibilidade = processedDisponibilidade;

      } else { 
        const editedPaciente = editedUsuario as UsuarioPaciente;
        (updates as Partial<UsuarioPaciente>).historicoMedico = editedPaciente.historicoMedico;
      }
      await updateDoc(docRef, updates); 

      setUsuario(editedUsuario);
      setIsEditing(false);
      setSuccessMessage("Perfil atualizado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      setError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };


  if (loading) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p>Carregando seu perfil...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <h1>Meu Perfil</h1>
          <p className="error-message">{error}</p>
          <p>Por favor, <a href="/login">faça login</a> ou <a href="/cadastro">cadastre-se</a>.</p>
        </div>
      </>
    );
  }

  if (!usuario || !editedUsuario) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p>Dados do perfil não disponíveis.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="perfil-container">
        <h1>Meu Perfil</h1>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}

        {!isEditing ? (
          <div className="profile-view">
            <p><strong>Nome Completo:</strong> {usuario.nome} {usuario.sobrenome}</p>
            {usuario.tipoUsuario === "Psicologo" && (
              <>
                <p><strong>CRP:</strong> {(usuario as UsuarioPsicologo).crp}</p>
                <p><strong>Descrição Profissional:</strong> {(usuario as UsuarioPsicologo).descricaoProfissional || 'Não informada'}</p>
              </>
            )}
            {usuario.tipoUsuario === "Paciente" && (
              <p><strong>Histórico Médico:</strong> {(usuario as UsuarioPaciente).historicoMedico || 'Não informado'}</p>
            )}
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Telefone:</strong> {usuario.telefone || 'Não informado'}</p>
            <p><strong>Gênero:</strong> {usuario.genero || 'Não informado'}</p>
            <p><strong>Data de Nascimento:</strong> {usuario.dataNascimento || 'Não informada'}</p>
            <p><strong>Endereço:</strong> {usuario.endereco || 'Não informado'}</p>


            {usuario.tipoUsuario === "Psicologo" && (
              <>
                <h2>Minha Disponibilidade Cadastrada</h2>
                {((usuario as UsuarioPsicologo).agendaDisponibilidade?.length ?? 0) > 0 ? (
                  <ul>
                    {(usuario as UsuarioPsicologo).agendaDisponibilidade?.map((disp, index) => (
                      <li key={index}>
                        <strong>{disp.diaSemana || 'Dia não selecionado'} - {disp.periodo || 'Período não selecionado'}:</strong> {disp.horarios.join(", ") || 'Nenhum horário'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma disponibilidade cadastrada.</p>
                )}
              </>
            )}

            <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
              Editar Perfil
            </button>
          </div>
        ) : (
          <div className="profile-edit">
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={editedUsuario.nome}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome:</label>
              <input
                type="text"
                id="sobrenome"
                name="sobrenome"
                value={editedUsuario.sobrenome}
                onChange={handleChange}
              />
            </div>
            {editedUsuario.tipoUsuario === "Psicologo" && (
              <>
                <div className="form-group">
                  <label htmlFor="crp">CRP:</label>
                  <input
                    type="text"
                    id="crp"
                    name="crp"
                    value={(editedUsuario as UsuarioPsicologo).crp || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="descricaoProfissional">Descrição Profissional:</label>
                  <textarea
                    id="descricaoProfissional"
                    name="descricaoProfissional"
                    value={(editedUsuario as UsuarioPsicologo).descricaoProfissional || ''}
                    onChange={handleChange}
                    rows={4}
                  ></textarea>
                </div>
              </>
            )}
            {editedUsuario.tipoUsuario === "Paciente" && (
              <div className="form-group">
                <label htmlFor="historicoMedico">Histórico Médico:</label>
                <textarea
                  id="historicoMedico"
                  name="historicoMedico"
                  value={(editedUsuario as UsuarioPaciente).historicoMedico || ''}
                  onChange={handleChange}
                  rows={4}
                ></textarea>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="text" id="email" name="email" value={editedUsuario.email} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone:</label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={editedUsuario.telefone || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="genero">Gênero:</label>
              <input
                type="text"
                id="genero"
                name="genero"
                value={editedUsuario.genero || ''}
                onChange={handleChange}
              />
            </div>
              <div className="form-group">
                <label htmlFor="endereco">Endereço:</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={editedUsuario.endereco || ''}
                  onChange={handleChange}
                />
              </div>


            {editedUsuario.tipoUsuario === "Psicologo" && (
              <>
                <h2>Editar Disponibilidade</h2>
                {((editedUsuario as UsuarioPsicologo).agendaDisponibilidade?.length ?? 0) > 0 ? (
                  (editedUsuario as UsuarioPsicologo).agendaDisponibilidade?.map((disp, index) => (
                    <div key={index} className="disponibilidade-item">
                      <div className="form-group">
                        <label>Dia da Semana:</label>
                        <select
                          value={disp.diaSemana}
                          onChange={(e) => handleDisponibilidadeChange(index, "diaSemana", e.target.value as AgendaDisponibilidade["diaSemana"])}
                        >
                          <option value="">Selecione um dia</option>
                          {diasSemanaOptions.filter(d => d !== "").map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Período:</label>
                        <select
                          value={disp.periodo}
                          onChange={(e) => handleDisponibilidadeChange(index, "periodo", e.target.value as AgendaDisponibilidade["periodo"])}
                        >
                          <option value="">Selecione um período</option>
                          {periodosOptions.filter(p => p !== "").map(period => <option key={period} value={period}>{period}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Horários (separados por vírgula: Ex: 09:00,10:00):</label>
                        <input
                          type="text"
                          value={disp.horarios.join(', ')}
                          onChange={(e) => handleDisponibilidadeChange(index, "horarios", e.target.value)}
                          placeholder="Deixe em branco para considerar todo o período"
                        />
                      </div>
                      <button onClick={() => handleRemoveDisponibilidade(index)} className="btn-remove">Remover</button>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma disponibilidade adicionada. Clique em "Adicionar Disponibilidade" para começar.</p>
                )}
                <button onClick={handleAddDisponibilidade} className="btn-add-disponibilidade">
                  Adicionar Disponibilidade
                </button>
              </>
            )}

            <div className="profile-actions">
              <button onClick={handleSave} className="btn-save-profile">
                Salvar Alterações
              </button>
              <button onClick={() => {
                setIsEditing(false);
                setEditedUsuario(usuario);
                setError(null);
                setSuccessMessage(null);
              }} className="btn-cancel-edit">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}