import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "./admin/typewriter";
import "../styles/auth.css";

export default function Auth() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

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
  <div className="auth-left">
   <h1>
  <Typewriter text="ERP System" speed={100} />
</h1>
<p>
  <Typewriter
    text="Manage your business smarter, faster, better."
    speed={40}
  />
</p>
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