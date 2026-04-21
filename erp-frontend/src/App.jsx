import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Auth />} />

          {/* Protected with Sidebar */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["employee","manager","admin"]}>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={["manager","admin"]}>
                <AppLayout>
                  <Manager />
                </AppLayout>
              </ProtectedRoute>
            }
          />
       <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["manager","admin"]}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AppLayout>
                  <Roles />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AppLayout>
                  <Admin />
                </AppLayout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
} 