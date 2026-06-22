import { Routes, Route, Outlet } from "react-router-dom";

import HomeLayout from "./app/(home)/layout";
import HomePage from "./app/(home)/page";
import SignInPage from "./app/(home)/sign-in/page";
import DrivePage from "./app/(home)/drive/page";
import TermsOfService from "./app/(home)/terms-of-service/page";
import GoogleDriveClone from "./app/f/[folderId]/page";

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <HomeLayout>
            <Outlet />
          </HomeLayout>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/drive" element={<DrivePage />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Route>
      <Route path="/f/:folderId" element={<GoogleDriveClone />} />
    </Routes>
  );
}
