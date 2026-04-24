import { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const green = "linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)";

const EMOTION_EMOJI = {
  happy: "😄", sad: "😢", angry: "😠",
  fearful: "😨", disgusted: "🤢", surprised: "😲", neutral: "😐",
};
const EMOTION_COLOR = {
  happy: "#66bb6a", sad: "#42a5f5", angry: "#ef5350",
  fearful: "#ab47bc", disgusted: "#26a69a", surprised: "#ffa726", neutral: "#78909c",
};

const StatCard = ({ value, label }) => (
  <div style={{ background:"rgba(46,125,50,0.07)", border:"1px solid rgba(46,125,50,0.18)", borderRadius:14, padding:"16px 12px", textAlign:"center" }}>
    <div style={{ fontSize:24, fontWeight:800, background:"linear-gradient(135deg,#66bb6a,#a5d6a7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{value}</div>
    <div style={{ fontSize:11, color:"rgba(232,245,233,0.38)", marginTop:4 }}>{label}</div>
  </div>
);

export default function EmotionDetector() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mode, setMode] = useState("upload"); // "upload" | "webcam"
  const [imageURL, setImageURL] = useState(null);
  const [emotions, setEmotions] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [liveRunning, setLiveRunning] = useState(false);
  const liveInterval = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Stop live detection when switching mode
  useEffect(() => {
    if (mode !== "webcam") stopLive();
  }, [mode]);

  const detectFromImage = async () => {
    if (!modelsLoaded || !imageRef.current) return;
    setDetecting(true);
    const detection = await faceapi
      .detectSingleFace(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    setDetecting(false);
    if (!detection) { alert("No face detected — please try another image."); return; }
    const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
    setEmotions(sorted);
    drawBoxOnImage(detection);
    saveScan(sorted, "upload");
    setScanCount(c => c + 1);
  };

  const drawBoxOnImage = (detection) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const dims = faceapi.matchDimensions(canvas, img, true);
    const resized = faceapi.resizeResults(detection, dims);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);
  };

  const detectLive = useCallback(async () => {
    if (!webcamRef.current?.video || !modelsLoaded) return;
    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    if (!detection) return;
    const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
    setEmotions(sorted);
    // Draw on canvas overlay
    const canvas = canvasRef.current;
    if (canvas) {
      const dims = faceapi.matchDimensions(canvas, video, true);
      const resized = faceapi.resizeResults(detection, dims);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);
    }
  }, [modelsLoaded]);

  const startLive = () => {
    setLiveRunning(true);
    liveInterval.current = setInterval(detectLive, 800);
    setScanCount(c => c + 1);
  };

  const stopLive = () => {
    setLiveRunning(false);
    clearInterval(liveInterval.current);
  };

  const saveScan = async (sorted, imageType) => {
    try {
      await fetch("http://localhost:5000/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          emotions: sorted.map(([name, score]) => ({ name, score })),
          dominantEmotion: sorted[0][0],
          imageType,
        }),
      });
    } catch (_) {}
  };

  const dominant = emotions?.[0];

  return (
    <div style={{ minHeight:"100vh", background:"#061a0f" }}>

      {/* Ambient glows */}
      <div style={{ position:"fixed", top:"5%", left:"2%", width:400, height:400, background:"radial-gradient(circle, rgba(46,125,50,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"5%", right:"2%", width:350, height:350, background:"radial-gradient(circle, rgba(56,142,60,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>

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
          <Link to="/history" style={{ color:"#81c784", fontSize:13, textDecoration:"none", fontWeight:500, padding:"6px 14px", border:"1px solid rgba(46,125,50,0.3)", borderRadius:8 }}>History</Link>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(46,125,50,0.08)", border:"1px solid rgba(46,125,50,0.18)", borderRadius:22, padding:"5px 14px 5px 6px" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#e8f5e9" }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:"#e8f5e9" }}>{user?.email}</div>
              <div style={{ fontSize:10, color:"rgba(46,125,50,0.7)" }}>{scanCount} scans today</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ background:"rgba(239,83,80,0.1)", border:"1px solid rgba(239,83,80,0.22)", color:"#ef9a9a", fontSize:12, fontWeight:600, padding:"7px 14px", borderRadius:8, cursor:"pointer" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"36px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.25)", color:"#81c784", fontSize:12, fontWeight:500, padding:"5px 16px", borderRadius:20, marginBottom:18 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#66bb6a", display:"inline-block", animation:"gpulse 2s infinite" }}/>
            {modelsLoaded ? "AI model ready" : "Loading AI models..."}
          </div>
          <h1 style={{ fontSize:36, fontWeight:900, color:"#e8f5e9", lineHeight:1.15, marginBottom:12 }}>
            Analyse{" "}
            <span style={{ background:"linear-gradient(90deg,#66bb6a,#a5d6a7,#81c784)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>emotions & mood</span>
            <br/>in real time
          </h1>
          <p style={{ fontSize:15, color:"rgba(232,245,233,0.38)", maxWidth:500, margin:"0 auto" }}>
            Powered by face-api.js — detects 7 emotions from photos or live webcam feed
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:30 }}>
          <StatCard value="7" label="Emotions detected"/>
          <StatCard value={scanCount} label="Scans this session"/>
          <StatCard value={dominant ? (dominant[0].charAt(0).toUpperCase() + dominant[0].slice(1)) : "—"} label="Last dominant mood"/>
        </div>

        {/* Mode toggle */}
        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          {["upload", "webcam"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"12px", background:mode===m ? green : "rgba(46,125,50,0.06)", color:"#e8f5e9", border:`1px solid ${mode===m ? "rgba(56,142,60,0.6)" : "rgba(46,125,50,0.2)"}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
              {m === "upload" ? "📁 Upload Image" : "📷 Live Webcam"}
            </button>
          ))}
        </div>

        {/* Upload mode */}
        {mode === "upload" && (
          <div>
            <div onClick={() => modelsLoaded && fileRef.current.click()} style={{ border:"2px dashed rgba(46,125,50,0.28)", borderRadius:20, padding:"48px 24px", textAlign:"center", background:"rgba(46,125,50,0.03)", cursor:modelsLoaded?"pointer":"not-allowed", marginBottom:24 }}>
              <div style={{ width:56, height:56, borderRadius:14, background:"rgba(46,125,50,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:"#e8f5e9", marginBottom:8 }}>
                {modelsLoaded ? "Drop a photo or click to browse" : "Loading AI models, please wait..."}
              </div>
              <div style={{ fontSize:13, color:"rgba(232,245,233,0.3)", marginBottom:22 }}>Supports JPG, PNG, WEBP</div>
              {modelsLoaded && (
                <button style={{ background:green, color:"#e8f5e9", border:"none", borderRadius:10, padding:"11px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Choose file</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                setEmotions(null);
                setImageURL(URL.createObjectURL(f));
              }}/>
            </div>
            {imageURL && (
              <div style={{ background:"#0a2214", border:"1px solid rgba(46,125,50,0.14)", borderRadius:18, padding:18, textAlign:"center", marginBottom:24, position:"relative" }}>
                {detecting && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(6,26,15,0.8)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, flexDirection:"column", gap:14 }}>
                    <div style={{ width:44, height:44, border:"3px solid rgba(46,125,50,0.2)", borderTop:"3px solid #66bb6a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <span style={{ color:"#81c784", fontSize:14, fontWeight:600 }}>Analysing emotions...</span>
                  </div>
                )}
                <div style={{ position:"relative", display:"inline-block" }}>
                  <img ref={imageRef} src={imageURL} alt="upload" style={{ maxWidth:"100%", maxHeight:480, borderRadius:12, display:"block" }} onLoad={detectFromImage}/>
                  <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}/>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Webcam mode */}
        {mode === "webcam" && (
          <div style={{ background:"#0a2214", border:"1px solid rgba(46,125,50,0.14)", borderRadius:18, padding:18, textAlign:"center", marginBottom:24 }}>
            <div style={{ position:"relative", display:"inline-block" }}>
              <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" style={{ borderRadius:12, maxWidth:"100%", maxHeight:480 }}/>
              <canvas ref={canvasRef} style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}/>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
              <button onClick={startLive} disabled={!modelsLoaded || liveRunning} style={{ padding:"11px 28px", background:liveRunning?"rgba(46,125,50,0.3)":green, color:"#e8f5e9", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:liveRunning?"not-allowed":"pointer" }}>
                {liveRunning ? "🟢 Detecting..." : "▶ Start Detection"}
              </button>
              <button onClick={stopLive} disabled={!liveRunning} style={{ padding:"11px 28px", background:"rgba(239,83,80,0.1)", color:"#ef9a9a", border:"1px solid rgba(239,83,80,0.22)", borderRadius:10, fontSize:14, fontWeight:700, cursor:!liveRunning?"not-allowed":"pointer" }}>
                ⏹ Stop
              </button>
            </div>
          </div>
        )}

        {/* Emotion results */}
        {emotions && (
          <div>
            {/* Dominant emotion card */}
            {dominant && (
              <div style={{ background:"rgba(46,125,50,0.07)", border:"1px solid rgba(46,125,50,0.2)", borderRadius:16, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:18 }}>
                <div style={{ fontSize:52 }}>{EMOTION_EMOJI[dominant[0]] || "😐"}</div>
                <div>
                  <div style={{ fontSize:13, color:"rgba(232,245,233,0.4)", marginBottom:4 }}>Dominant emotion</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#e8f5e9" }}>{dominant[0].charAt(0).toUpperCase() + dominant[0].slice(1)}</div>
                  <div style={{ fontSize:14, color:"#81c784" }}>{(dominant[1] * 100).toFixed(1)}% confidence</div>
                </div>
              </div>
            )}
            {/* All emotions */}
            <h3 style={{ fontSize:16, fontWeight:700, color:"#e8f5e9", marginBottom:14 }}>
              All emotions
              <span style={{ marginLeft:10, fontSize:12, background:"rgba(46,125,50,0.18)", color:"#81c784", padding:"3px 12px", borderRadius:20 }}>7 detected</span>
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
              {emotions.map(([name, score], i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid rgba(${i===0?"46,125,50":"255,255,255"},0.12)`, borderRadius:13, padding:"14px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:18 }}>{EMOTION_EMOJI[name]}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:"#e8f5e9" }}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:"rgba(232,245,233,0.4)", marginBottom:8 }}>{(score * 100).toFixed(1)}%</div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(score * 100).toFixed(1)}%`, borderRadius:2, background:`linear-gradient(90deg,${EMOTION_COLOR[name]||"#66bb6a"},${EMOTION_COLOR[name]||"#a5d6a7"})`, transition:"width 0.9s ease" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gpulse { 0%,100%{opacity:1;box-shadow:0 0 6px #66bb6a} 50%{opacity:.3;box-shadow:none} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}