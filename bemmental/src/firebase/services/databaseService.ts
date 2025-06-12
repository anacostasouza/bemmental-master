import { ref, set, get, child } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export async function registrarUsuario(nome: string, email: string, senha: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const userId = userCredential.user.uid;


    await set(ref(database, 'users/' + userId), {
      username: nome,
      email: email
    });

    return userId;
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error.message);
    throw error;
  }
}

export async function logarUsuario(email: string, senha: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao logar:", error.message);
    throw error;
  }
}

export function lerDados(userId: string) {
  const dbRef = ref(database);
  return get(child(dbRef, `users/${userId}`));
}
