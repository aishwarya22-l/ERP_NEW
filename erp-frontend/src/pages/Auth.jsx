import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "./admin/typewriter";
import "../styles/auth.css";
import ERPScene from "./ERPScene";
import { useEffect } from "react";
import gsap from "gsap";
export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
 useEffect(() => {
  // Title animation
  gsap.from(".overlay-text h1", {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });

  // Subtitle
  gsap.from(".subtitle", {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.3,
  });

  // Feature cards stagger
  gsap.from(".feature-card", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.6,
    ease: "power2.out",
  });
}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    if (isLogin) {
      const res = await login({
        email: form.get("email"),
        password: form.get("password"),
      });

      if (res.user.role === "admin") navigate("/admin");
      else if (res.user.role === "manager") navigate("/manager");
      else if (res.user.role === "assests") navigate("/assets");
      else navigate("/dashboard");

    } else {
      await register({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });

      alert("Registered! Now login.");
      setIsLogin(true);
    }
  };

  return (
  <div className="auth-container">
  {/* LEFT SIDE */}
<div
  className="auth-left"
  onMouseMove={(e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    gsap.to(".overlay-text", {
      x,
      y,
      duration: 0.5,
      ease: "power2.out",
    });
  }}
>
  <ERPScene />

  <div className="overlay-text">
    <h1>
      <Typewriter text="ERP System" speed={100} />
    </h1>

    <p className="subtitle">
      Manage your business smarter, faster, better.
    </p>

    <div className="features">
      <div className="feature-card delay-1">
        <h3>📦 Asset & IT Inventory</h3>
        <p>
          Track devices, assign assets to employees, monitor usage and lifecycle
          with real-time visibility.
        </p>
      </div>

      <div className="feature-card delay-2">
        <h3>💰 Payroll Management</h3>
        <p>
          Automate salary processing, deductions, payslips, and compliance with accuracy.
        </p>
      </div>

      <div className="feature-card delay-3">
        <h3>🔐 Role-Based Access</h3>
        <p>
          Secure access control for admin, manager, and employees with structured permissions.
        </p>
      </div>
    </div>
  </div>
</div>

  {/* RIGHT SIDE */}
  <div className="auth-right">
    <div className="auth-bg">
      <div className="floating-bg">
  <span></span>
  <span></span>
  <span></span>
</div>

      <form className="glass-card"
  onMouseMove={(e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 30;
    const y = (window.innerHeight / 2 - e.clientY) / 30;
    e.currentTarget.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = `rotateX(8deg) rotateY(-8deg)`;
  }} onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <input name="name" placeholder="Full Name" required />
        )}

        <input name="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />

        <button>{isLogin ? "Login" : "Register"}</button>

        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New user? Register" : "Already have account? Login"}
        </p>
      </form>
    </div>
  </div>
</div>
  );
}