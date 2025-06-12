import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ref, child, get } from "firebase/database";
import { auth, database } from "../firebase/firebaseConfig";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snapshot = await get(child(ref(database), `users/${user.uid}`));
          if (snapshot.exists()) {
            setAutenticado(true);
          } else {
            setAutenticado(false);
          }
        } catch (error) {
          console.error("Erro ao verificar usuário:", error);
          setAutenticado(false);
        }
      } else {
        setAutenticado(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (!autenticado) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
