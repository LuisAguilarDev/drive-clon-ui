import React, { FC, useCallback, useEffect, useState, useRef } from "react";
import { auth } from "../lib/firebase/firebaseConfig";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Singleton para la instancia de Firebase UI
let firebaseUiInstance: any = null;

interface Props {
  config: any;
}

const FirebaseSignIn: FC<Props> = ({ config }) => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);  // Estado para errores
  const navigate = useNavigate();
  const authContainerRef = useRef<HTMLDivElement>(null);  // Referencia para el div

  // Carga Firebase UI y maneja instancias
  const loadFirebaseui = useCallback(async () => {
    try {
      const firebaseui = await import("firebaseui");

      if (!firebaseUiInstance) {
        firebaseUiInstance = new firebaseui.auth.AuthUI(auth);
      } else {
        firebaseUiInstance.reset(); // 🔄 Resetea la instancia existente en logout
      }

      if (authContainerRef.current) {  // Verifica que el div esté montado
        firebaseUiInstance.start(authContainerRef.current, config);
      }
    } catch (err) {
      console.error("Failed to load Firebase UI:", err);
      setError("Failed to load Firebase UI.");
    }
  }, [config]);

  // Verifica si hay un usuario autenticado después del redirect
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setUser(result.user);
          navigate("/drive");
        }
      } catch (err) {
        console.error("Redirect login failed:", err);
        setError("Redirect login failed.");
      }
    };

    checkRedirectResult();
  }, [navigate]);

  // Listener para cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        navigate("/drive");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    loadFirebaseui();
  }, [loadFirebaseui]);

  // Muestra un mensaje de error si falla algo
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      {user ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Welcome, {user.email}!</h2>
          <button
            onClick={() => auth.signOut()}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div ref={authContainerRef} id="firebaseui-auth-container"></div>
      )}
    </div>
  );
};

export default FirebaseSignIn;
