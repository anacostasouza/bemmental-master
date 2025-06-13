import { getFirestore, doc, setDoc } from "firebase/firestore";
import type { Usuario } from "../types/Usuarios"; 

const db = getFirestore();

export const createUserProfile = async (usuario: Usuario) => {
  try {
    const userRef = doc(db, "usuarios", usuario.usuarioID);
    await setDoc(userRef, usuario);
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
    throw error;
  }
};
