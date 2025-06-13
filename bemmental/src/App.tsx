import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/register"; 
import MarcarConsulta from "./pages/marcarConsulta";
import AgendaConsultas from "./pages/agendaConsultas"; 
import AgendarDetalhes from "./pages/AgendarDetalhes";
import MinhasConsultasPaciente from './pages/minhasConsultasPaciente';
import Perfil from "./pages/perfil"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/marcar-consulta" element={<MarcarConsulta />} />
        <Route path="/agenda" element={<AgendaConsultas />} />
        <Route path="/agendar/:psicologoId" element={<AgendarDetalhes />} />
        <Route path="/minhas-consultas-paciente" element={<MinhasConsultasPaciente />} />
        <Route path="/perfil" element={<Perfil />} /> 
      </Routes>
    </Router>
  );
}

export default App;