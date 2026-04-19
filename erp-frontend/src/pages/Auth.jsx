import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
    <h1>ERP System</h1>
    <p>Manage your business smarter, faster, better.</p>
  </div>

  {/* RIGHT SIDE */}
  <div className="auth-right">
    <div className="auth-bg">
      <div className="floating-bg">
        <span className="ball1"></span>
        <span className="ball2"></span>
        <span className="ball3"></span>
        <span className="ball4"></span>
        <span className="ball5"></span>
      </div>

      <form className="glass-card" onSubmit={handleSubmit}>
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