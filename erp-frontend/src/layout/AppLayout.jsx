import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import NotificationCenter from "../components/NotificationCenter";
import GlobalSearch from "../components/GlobalSearch";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 900;
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Close sidebar on route change (mobile)
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* ── Mobile overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar-wrapper ${isMobile ? (sidebarOpen ? "open" : "closed") : "desktop"}`}>
        <Sidebar onNavigate={closeSidebar} />
      </aside>

      {/* ── Main area ── */}
      <div className="main-wrapper">
        {/* Top bar — mobile & desktop */}
        <header className={`app-topbar${isMobile ? " mobile" : ""}`}>
          {isMobile && (
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          )}
          {isMobile && <span className="mobile-brand gradient-text">ERP Suite</span>}
          {!isMobile && user && (
            <div style={{ flex: 1, maxWidth: 440, margin: "0 16px" }}>
              <GlobalSearch />
            </div>
          )}
          <div style={{ marginLeft: isMobile ? "auto" : 0 }}>
            <NotificationCenter />
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: #F8FAFC;
        }

        /* ── Sidebar wrapper ── */
        .sidebar-wrapper {
          flex-shrink: 0;
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity  0.32s ease;
        }

        .sidebar-wrapper.desktop {
          transform: translateX(0);
          opacity: 1;
        }

        .sidebar-wrapper.closed {
          position: fixed;
          top: 0;
          left: 0;
          transform: translateX(-100%);
          opacity: 0;
          height: 100vh;
        }

        .sidebar-wrapper.open {
          position: fixed;
          top: 0;
          left: 0;
          transform: translateX(0);
          opacity: 1;
          height: 100vh;
          box-shadow: 4px 0 40px rgba(0, 0, 0, 0.18);
        }

        /* ── Backdrop ── */
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(2px);
          z-index: 99;
          animation: fadeIn 0.2s ease;
        }

        /* ── Main area ── */
        .main-wrapper {
          flex: 1;
          min-width: 0;
          width: calc(100% - var(--sidebar-width));
          min-height: 100vh;
          margin-left: var(--sidebar-width);
          display: flex;
          flex-direction: column;
          overflow: visible;
        }

        /* ── Top bar (mobile + desktop) ── */
        .app-topbar {
          height: 54px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 22px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
          flex-shrink: 0;
          box-shadow: 0 1px 0 rgba(99, 102, 241, 0.06),
                      0 2px 12px rgba(0,0,0,0.05);
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #F9FAFB;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hamburger-btn:hover {
          background: #EDE9FE;
          border-color: rgba(124, 58, 237, 0.4);
          color: #7c3aed;
        }

        .mobile-brand {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        /* ── Page content ── */
        .page-content {
          flex: 1;
          min-height: calc(100vh - 54px);
          overflow-x: hidden;
          padding: 24px;
          background: var(--bg-primary);
          background-image: radial-gradient(ellipse 80% 50% at 50% -5%, rgba(139,92,246,0.05) 0%, transparent 65%);
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 900px) {
          .main-wrapper {
            width: 100%;
            margin-left: 0;
          }

          .page-content {
            padding: 20px 16px;
          }
        }

        @media (max-width: 480px) {
          .page-content {
            padding: 16px 12px;
          }
        }
      `}</style>
    </div>
  );
}
