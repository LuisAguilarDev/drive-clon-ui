import { Navigate } from "react-router-dom";
import { auth } from "../../../lib/firebase/firebaseConfig";
import "firebaseui/dist/firebaseui.css";
import FirebaseSignIn from "~/components/FirebaseSignIn";

const SignInPage = () => {
  const config = {
    signInOptions: [
      {
        provider: "google.com", // Login con Google
        scopes: ["profile", "email"],
      },
    ],
    signInFlow: "popup", // Opciones: 'popup' o 'redirect'
    signInSuccessUrl: "/drive", // Redirección después de login exitoso
    tosUrl: "/terms-of-service", // URL de términos de servicio
    privacyPolicyUrl: "/privacy-policy", // URL de política de privacidad
  };
  const user = auth.currentUser;
  if (user) {
    return <Navigate to="/drive" replace />;
  }
  return (
    <>
      <FirebaseSignIn config={config} />
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} TerraNova Drive. All rights reserved.
      </footer>
    </>
  );
};

export default SignInPage;
