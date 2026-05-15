import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiLock, FiUser, FiEye, FiEyeOff,
  FiArrowRight, FiPackage, FiDollarSign, FiShield, FiCheckCircle
} from "react-icons/fi";
import ERPScene from "./ERPScene";
import "../styles/auth.css";

/* ─── Floating-label input ──────────────────────────────── */
function FloatingInput({ name, label, type = "text", Icon, required = true }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPwd ? "text" : "password") : type;

  return (
    <div className="float-field">
      <span className="float-icon"><Icon size={16} /></span>
      <input
        className="float-input"
        type={inputType}
        name={name}
        placeholder=" "
        required={required}
        autoComplete={isPassword ? "current-password" : type === "email" ? "email" : "off"}
      />
      <label className="float-label">{label}</label>
      {isPassword && (
        <button
          type="button"
          className="float-eye"
          onClick={() => setShowPwd(s => !s)}
          tabIndex={-1}
          aria-label={showPwd ? "Hide password" : "Show password"}
        >
          {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      )}
    </div>
  );
}

/* ─── Feature card (left panel) ─────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      className="hero-feature-card"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
    >
      <span className="hero-feature-icon">{icon}</span>
      <div className="hero-feature-text">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Stat badge ─────────────────────────────────────────── */
function StatBadge({ value, label }) {
  return (
    <div className="hero-stat">
      <span className="hero-stat-val">{value}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH PAGE
   ══════════════════════════════════════════════════════════ */
export default function Auth() {
  /* ── State ── */
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    const form = new FormData(e.target);

    try {
      if (isLogin) {
        const res = await login({
          email: form.get("email"),
          password: form.get("password"),
        });

        const role = res.user.role?.toString().toLowerCase();

        if (role === "admin")        navigate("/admin");
        else if (role === "manager") navigate("/manager");
        else if (role === "assets")  navigate("/assets");
        else if (role === "employee") navigate("/employee/dashboard");
        else                            navigate("/dashboard");

      } else {
        await register({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        });

        alert("Registered! Now login.");
        setIsLogin(true);
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="auth-container">

      {/* ══ LEFT — Hero panel ══ */}
      <div className="auth-left">
        {/* Decorative blobs */}
        <div className="auth-blob auth-blob-1" aria-hidden="true" />
        <div className="auth-blob auth-blob-2" aria-hidden="true" />
        <div className="auth-blob auth-blob-3" aria-hidden="true" />

        {/* 3D animated sphere */}
        <motion.div
          className="auth-scene-wrap"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          <ERPScene />
        </motion.div>

        {/* Content */}
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="hero-badge-dot" />
            Enterprise Resource Platform
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Manage your business<br />
            <span className="hero-accent">smarter &amp; faster.</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            One unified platform for assets, teams, payroll, and operations —
            built for modern enterprises.
          </motion.p>

          {/* Stats row */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
          >
            <StatBadge value="500+" label="Companies" />
            <div className="hero-stat-divider" />
            <StatBadge value="98%"  label="Uptime" />
            <div className="hero-stat-divider" />
            <StatBadge value="24/7" label="Support" />
          </motion.div>

          {/* Feature cards */}
          <div className="hero-cards">
            <FeatureCard
              icon={<FiPackage />}
              title="Asset & IT Inventory"
              desc="Track devices, assign assets, monitor lifecycle with real-time visibility."
              delay={0.32}
            />
            <FeatureCard
              icon={<FiDollarSign />}
              title="Payroll Management"
              desc="Automate salary processing, deductions, payslips, and compliance."
              delay={0.42}
            />
            <FeatureCard
              icon={<FiShield />}
              title="Role-Based Access"
              desc="Secure permissions for admin, manager, and employee roles."
              delay={0.52}
            />
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Auth form ══ */}
      <div className="auth-right">
        {/* Subtle bg pattern */}
        <div className="auth-right-bg" aria-hidden="true">
          <div className="auth-right-blob auth-right-blob-1" />
          <div className="auth-right-blob auth-right-blob-2" />
        </div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Card logo */}
          <div className="auth-card-logo">
            <div className="auth-logo-mark">E</div>
            <span className="auth-logo-name">ERP Suite</span>
          </div>

          {/* Heading — animated on tab switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-head" : "register-head"}
              initial={{ opacity: 0, x: isLogin ? -14 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: isLogin ?  14 : -14 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="auth-heading">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="auth-subheading">
                {isLogin
                  ? "Sign in to access your workspace"
                  : "Join your team's workspace today"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── FORM — all name attrs, FormData parsing, and handleSubmit preserved ── */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{   opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <FloatingInput name="name" label="Full Name" Icon={FiUser} />
                </motion.div>
              )}
            </AnimatePresence>

            <FloatingInput name="email"    label="Email address" type="email"    Icon={FiMail} />
            <FloatingInput name="password" label="Password"      type="password" Icon={FiLock} />

            {authError && (
              <p className="auth-error">{authError}</p>
            )}

            <motion.button
              type="submit"
              className={`auth-submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
              whileHover={!loading ? { y: -2 } : {}}
              whileTap={!loading  ? { scale: 0.97 } : {}}
              transition={{ duration: 0.18 }}
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="auth-divider"><span>or</span></div>

          {/* Toggle */}
          <p className="auth-toggle" onClick={() => setIsLogin(s => !s)}>
            {isLogin
              ? <>Don't have an account? <span>Register free</span></>
              : <>Already have an account? <span>Sign in</span></>}
          </p>

          {/* Trust row */}
          <div className="auth-trust">
            <span><FiCheckCircle size={11} /> SOC 2 Compliant</span>
            <span><FiCheckCircle size={11} /> 256-bit Encrypted</span>
            <span><FiCheckCircle size={11} /> GDPR Ready</span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
