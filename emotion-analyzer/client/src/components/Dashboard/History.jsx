import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const green = "linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)";
const EMOTION_EMOJI = {
  happy:"😄", sad:"😢", angry:"😠",
  fearful:"😨", disgusted:"🤢", surprised:"😲", neutral:"😐"
};

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/scans", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then(data => { setScans(data); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#061a0f" }}>
      {/* Navbar */}
      <nav style={{ background:"#0a2214", borderBottom:"1px solid rgba(46,125,50,0.12)", padding:"0 28px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg, transparent, rgba(46,125,50,0.35), transparent)" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:green, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          </div>
          <span style={{ fontSize:17, fontWeight:800, background:"linear-gradient(90deg,#66bb6a,#a5d6a7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MoodSense AI</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link to="/detect" style={{ color:"#81c784", fontSize:13, textDecoration:"none", fontWeight:500, padding:"6px 14px", border:"1px solid rgba(46,125,50,0.3)", borderRadius:8 }}>← Back to Detector</Link>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ background:"rgba(239,83,80,0.1)", border:"1px solid rgba(239,83,80,0.22)", color:"#ef9a9a", fontSize:12, fontWeight:600, padding:"7px 14px", borderRadius:8, cursor:"pointer" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"36px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#e8f5e9", marginBottom:6 }}>Scan History</h1>
        <p style={{ fontSize:14, color:"rgba(232,245,233,0.38)", marginBottom:28 }}>Your last 20 emotion scans</p>

        {loading && <p style={{ color:"#81c784" }}>Loading...</p>}

        {!loading && scans.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 24px", color:"rgba(232,245,233,0.35)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>😐</div>
            <div style={{ fontSize:16, fontWeight:600, color:"#e8f5e9", marginBottom:8 }}>No scans yet</div>
            <div style={{ fontSize:13 }}>Go back and analyse your first photo!</div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {scans.map((scan, i) => (
            <div key={i} style={{ background:"#0a2214", border:"1px solid rgba(46,125,50,0.14)", borderRadius:16, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:36 }}>{EMOTION_EMOJI[scan.dominantEmotion] || "😐"}</div>
                <div>
                  <div style={{ fontSize:17, fontWeight:700, color:"#e8f5e9" }}>{scan.dominantEmotion?.charAt(0).toUpperCase() + scan.dominantEmotion?.slice(1)}</div>
                  <div style={{ fontSize:12, color:"rgba(232,245,233,0.38)", marginTop:3 }}>
                    {new Date(scan.createdAt).toLocaleString()} · {scan.imageType}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", maxWidth:280, justifyContent:"flex-end" }}>
                {scan.emotions?.slice(0,3).map((e, j) => (
                  <span key={j} style={{ fontSize:11, background:"rgba(46,125,50,0.15)", color:"#81c784", padding:"3px 10px", borderRadius:16 }}>
                    {e.name} {(e.score * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}