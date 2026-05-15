import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { lazy, Suspense } from "react";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

// Eagerly load Auth — it's the first page every visitor sees
import Auth from "./pages/Auth";

// Lazy-load everything else so each chunk loads on demand
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Admin        = lazy(() => import("./pages/Admin"));
const Manager      = lazy(() => import("./pages/Manager"));
const Users        = lazy(() => import("./pages/admin/Users"));
const Roles        = lazy(() => import("./pages/admin/Roles"));
const Departments  = lazy(() => import("./pages/admin/Departments"));
const Assets       = lazy(() => import("./pages/assets/Assets"));
const Categories   = lazy(() => import("./pages/assets/Categories"));
const Assignments  = lazy(() => import("./pages/assets/Assignments"));
const Maintenance  = lazy(() => import("./pages/assets/Maintenance"));
const Tickets      = lazy(() => import("./pages/tickets/Tickets"));
const TicketDetail = lazy(() => import("./pages/tickets/TicketDetail"));
const Analytics    = lazy(() => import("./pages/analytics/Analytics"));

function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", gap: 12, color: "#9ca3af", fontSize: "0.9rem",
    }}>
      <span style={{
        width: 20, height: 20, border: "3px solid #e5e7eb",
        borderTopColor: "#a855f7", borderRadius: "50%",
        display: "inline-block", animation: "spin 0.7s linear infinite",
      }} />
      Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Wrap({ roles, children }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

const ALL  = ["employee", "assets", "manager", "admin"];
const MGR  = ["manager", "admin"];
const ADM  = ["admin"];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Auth />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Wrap roles={ALL}><Dashboard /></Wrap>} />

          {/* Admin area */}
          <Route path="/admin"               element={<Wrap roles={ADM}><Admin /></Wrap>} />
          <Route path="/admin/users"         element={<Wrap roles={ADM}><Users /></Wrap>} />
          <Route path="/admin/roles"         element={<Wrap roles={ADM}><Roles /></Wrap>} />
          <Route path="/admin/departments"   element={<Wrap roles={ADM}><Departments /></Wrap>} />

          {/* Manager */}
          <Route path="/manager" element={<Wrap roles={MGR}><Manager /></Wrap>} />

          {/* Assets */}
          <Route path="/assets"              element={<Wrap roles={ALL}><Assets /></Wrap>} />
          <Route path="/assets/assets"       element={<Wrap roles={ALL}><Assets /></Wrap>} />
          <Route path="/assets/categories"   element={<Wrap roles={ALL}><Categories /></Wrap>} />
          <Route path="/assets/assignments"  element={<Wrap roles={ALL}><Assignments /></Wrap>} />
          <Route path="/assets/maintenance"  element={<Wrap roles={ALL}><Maintenance /></Wrap>} />

          {/* Tickets */}
          <Route path="/tickets"    element={<Wrap roles={ALL}><Tickets /></Wrap>} />
          <Route path="/tickets/:id" element={<Wrap roles={ALL}><TicketDetail /></Wrap>} />

          {/* Analytics */}
          <Route path="/analytics"  element={<Wrap roles={ALL}><Analytics /></Wrap>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
