import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";

import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
import Departments from "./pages/admin/Departments";
import Assets from "./pages/assets/Assets";

import Categories from "./pages/assets/Categories";
import Assignments from "./pages/assets/Assignments";
import Maintenance from "./pages/assets/Maintenance";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Auth />} />

          {/* Dashboard */}
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

          {/* Manager */}
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

          {/* Admin */}
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

          {/* Users */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Roles */}
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

          {/* Departments */}
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AppLayout>
                  <Departments />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ ASSET MODULE ROUTES */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute roles={["admin","manager","assests"]}>
                <AppLayout>
                  <Assets />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/assets"
            element={
              <ProtectedRoute roles={["admin","manager","assests"]}>
                <AppLayout>
                  <Assets />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/categories"
            element={
              <ProtectedRoute roles={["admin","manager","assests"]}>
                <AppLayout>
                  <Categories />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/assignments"
            element={
              <ProtectedRoute roles={["admin","manager","assests"]}>
                <AppLayout>
                  <Assignments />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/maintenance"
            element={
              <ProtectedRoute roles={["admin","manager","assests"]}>
                <AppLayout>
                  <Maintenance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}