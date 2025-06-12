import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import MarcarConsulta from "./pages/marcarConsulta";
import Home from "./pages/home";
import ProtectedRoute from "./routes/ProtectedRoute";
import Cadastrar from "./pages/register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Cadastrar />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/marcar-consulta"
          element={
            <ProtectedRoute>
              <MarcarConsulta />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
