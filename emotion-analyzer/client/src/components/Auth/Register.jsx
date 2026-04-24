import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const green = "linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.id) { alert("Account created! Please sign in."); navigate("/login"); }
    else alert(data.message);
  };

  const inputStyle = {
    width:"100%", background:"rgba(46,125,50,0.08)",
    border:"1px solid rgba(46,125,50,0.25)", borderRadius:10,
    padding:"12px 16px", fontSize:14, color:"#e8f5e9", outline:"none",
  };
  const labelStyle = {
    display:"block", fontSize:10, fontWeight:600,
    color:"rgba(165,214,167,0.7)", letterSpacing:"0.07em",
    textTransform:"uppercase", marginBottom:7,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#061a0f", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ position:"fixed", top:"20%", right:"10%", width:300, height:300, background:"radial-gradient(circle, rgba(46,125,50,0.07) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ background:"#0a2214", border:"1px solid rgba(46,125,50,0.2)", borderRadius:22, padding:"40px 36px", width:"100%", maxWidth:380, position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:"0 0 4px 4px", background:green }}/>

        <div style={{ width:56, height:56, borderRadius:16, background:green, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>

        <h1 style={{ textAlign:"center", fontSize:22, fontWeight:700, color:"#e8f5e9", marginBottom:6 }}>Create account</h1>
        <p style={{ textAlign:"center", fontSize:13, color:"rgba(232,245,233,0.35)", marginBottom:32 }}>Join MoodSense AI today</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Email address</label>
            <input style={inputStyle} type="email" placeholder="you@example.com" required onChange={(e) => setForm({ ...form, email: e.target.value })}/>
          </div>
          <div style={{ marginBottom:26 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="Min 8 characters" required onChange={(e) => setForm({ ...form, password: e.target.value })}/>
          </div>
          <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:loading?"rgba(46,125,50,0.35)":green, color:"#e8f5e9", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ textAlign:"center", marginTop:22, fontSize:13, color:"rgba(232,245,233,0.35)" }}>
          Already have an account? <Link to="/login" style={{ color:"#81c784", textDecoration:"none", fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}