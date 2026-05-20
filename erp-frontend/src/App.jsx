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
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const EmployeeAssets    = lazy(() => import("./pages/employee/EmployeeAssets"));
const RaiseTicket       = lazy(() => import("./pages/employee/RaiseTicket"));
const MyTickets         = lazy(() => import("./pages/employee/MyTickets"));

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

const NON_EMP = ["assets", "manager", "admin"];
const EMP = ["employee"];
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
          <Route path="/dashboard" element={<Wrap roles={NON_EMP}><Dashboard /></Wrap>} />

          {/* Admin area */}
          <Route path="/admin"               element={<Wrap roles={ADM}><Admin /></Wrap>} />
          <Route path="/admin/users"         element={<Wrap roles={ADM}><Users /></Wrap>} />
          <Route path="/admin/roles"         element={<Wrap roles={ADM}><Roles /></Wrap>} />
          <Route path="/admin/departments"   element={<Wrap roles={ADM}><Departments /></Wrap>} />

          {/* Manager */}
          <Route path="/manager" element={<Wrap roles={MGR}><Manager /></Wrap>} />

          {/* Assets */}
          <Route path="/assets"              element={<Wrap roles={NON_EMP}><Assets /></Wrap>} />
          <Route path="/assets/assets"       element={<Wrap roles={NON_EMP}><Assets /></Wrap>} />
          <Route path="/assets/categories"   element={<Wrap roles={NON_EMP}><Categories /></Wrap>} />
          <Route path="/assets/assignments"  element={<Wrap roles={NON_EMP}><Assignments /></Wrap>} />
          <Route path="/assets/maintenance"  element={<Wrap roles={NON_EMP}><Maintenance /></Wrap>} />

          {/* Employee module */}
          <Route path="/employee/dashboard"    element={<Wrap roles={EMP}><EmployeeDashboard /></Wrap>} />
          <Route path="/employee/assets"       element={<Wrap roles={EMP}><EmployeeAssets /></Wrap>} />
          <Route path="/employee/raise-ticket" element={<Wrap roles={EMP}><RaiseTicket /></Wrap>} />
          <Route path="/employee/tickets"      element={<Wrap roles={EMP}><MyTickets /></Wrap>} />

          {/* Tickets */}
          <Route path="/tickets"    element={<Wrap roles={NON_EMP}><Tickets /></Wrap>} />
          <Route path="/tickets/:id" element={<Wrap roles={NON_EMP}><TicketDetail /></Wrap>} />

          {/* Analytics */}
          <Route path="/analytics"  element={<Wrap roles={NON_EMP}><Analytics /></Wrap>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
