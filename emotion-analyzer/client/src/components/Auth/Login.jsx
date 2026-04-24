import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const green = "linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.token) { login(data); navigate("/detect"); }
    else alert(data.message);
  };

  const inputStyle = {
    width: "100%", background: "rgba(46,125,50,0.08)",
    border: "1px solid rgba(46,125,50,0.25)", borderRadius: 10,
    padding: "12px 16px", fontSize: 14, color: "#e8f5e9", outline: "none",
  };
  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 600,
    color: "rgba(165,214,167,0.7)", letterSpacing: "0.07em",
    textTransform: "uppercase", marginBottom: 7,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#061a0f", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      {/* Ambient glows */}
      <div style={{ position:"fixed", top:"15%", left:"10%", width:350, height:350, background:"radial-gradient(circle, rgba(46,125,50,0.07) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"15%", right:"10%", width:300, height:300, background:"radial-gradient(circle, rgba(56,142,60,0.05) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ background:"#0a2214", border:"1px solid rgba(46,125,50,0.2)", borderRadius:22, padding:"40px 36px", width:"100%", maxWidth:380, position:"relative" }}>
        {/* Top accent */}
        <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:"0 0 4px 4px", background:green }}/>

        {/* Logo */}
        <div style={{ width:56, height:56, borderRadius:16, background:green, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>

        <h1 style={{ textAlign:"center", fontSize:22, fontWeight:700, color:"#e8f5e9", marginBottom:6 }}>Welcome back</h1>
        <p style={{ textAlign:"center", fontSize:13, color:"rgba(232,245,233,0.35)", marginBottom:32 }}>Sign in to MoodSense AI</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Email address</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" required onChange={(e) => setForm({ ...form, email: e.target.value })}/>
          </div>
          <div style={{ marginBottom:26 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" required onChange={(e) => setForm({ ...form, password: e.target.value })}/>
          </div>
          <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:loading?"rgba(46,125,50,0.35)":green, color:"#e8f5e9", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ textAlign:"center", marginTop:22, fontSize:13, color:"rgba(232,245,233,0.35)" }}>
          No account? <Link to="/register" style={{ color:"#81c784", textDecoration:"none", fontWeight:600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}