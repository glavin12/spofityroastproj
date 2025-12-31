import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { redirectToAuthCodeFlow, getAccessToken, fetchTopTracks } from "./services/spotify";
import { generateRoast } from "./services/gemini";
import DecryptedText from "./components/DecryptedText";
import ShinyText from "./components/ShinyText";
import { Play, Zap, Skull, Music } from "lucide-react";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [inputKey, setInputKey] = useState(""); // Temporary state for input
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const storedToken = localStorage.getItem("spotify_token");

    if (error) {
      // Handle Spotify Auth Errors (like User not registered)
      console.error("Spotify Auth Error:", error);
      if (error === "access_denied") {
        alert("Login Failed: You are likely not added to the Spotify Developer Dashboard.\n\nAsk the developer to add your email to the 'Users' list in the dashboard!");
      } else {
        alert(`Login Error: ${error}`);
      }
      window.history.replaceState({}, document.title, "/"); // Clean URL
    } else if (code) {
      // Exchange code for token
      getAccessToken(code).then(accessToken => {
        if (accessToken) {
          setToken(accessToken);
          localStorage.setItem("spotify_token", accessToken);
          window.history.replaceState({}, document.title, window.location.pathname); // Clean URL fully
        }
      });
    } else if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = () => {
    redirectToAuthCodeFlow();
  };

  const handleRoast = async (keyOverride) => {
    // Ensure effectiveKey is a string (ignore Click Events passed by React)
    const effectiveKey = (typeof keyOverride === "string" ? keyOverride : null) || apiKey;

    if (!effectiveKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setStatus("analyzing");

    try {
      const trackData = await fetchTopTracks(token);

      if (trackData.error) {
        if (trackData.error.status === 401) {
          localStorage.removeItem("spotify_token");
          setToken(null);
          setLoading(false);
          return alert("Session expired. Please login again.");
        }
        throw new Error(trackData.error.message);
      }

      setTracks(trackData.items);
      setStatus("roasting");

      const roastData = await generateRoast(effectiveKey, trackData.items);
      setRoast(roastData);
      setStatus("done");
    } catch (err) {
      console.error("Roast error:", err);

      const errorMessage = err.toString();
      if (errorMessage.includes("400") || errorMessage.includes("API key not valid")) {
        alert("Invalid Gemini API Key! Clearing it so you can try again.");
        localStorage.removeItem("gemini_api_key");
        setApiKey("");
        setShowKeyInput(true);
      } else {
        alert("Failed to roast. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveKey = (key) => {
    if (!key) return;
    localStorage.setItem("gemini_api_key", key);
    setApiKey(key);
    setShowKeyInput(false);
    handleRoast(key); // Pass key directly to avoid stale state
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-green-500 selection:text-black">
      {/* Background Noise/Gradient */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-green-500/20 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse-slow"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {!token && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-6xl font-black mb-6 tracking-tighter">
                <ShinyText text="SPOTIFY ROASTER" speed={3} />
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto">
                Ready to get cooked by AI based on your questionable music taste?
              </p>
              <button
                onClick={handleLogin}
                className="group relative px-8 py-4 bg-green-500 rounded-full font-bold text-black text-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                LOGIN WITH SPOTIFY
              </button>
            </motion.div>
          )}

          {token && (
            <>
              {!tracks && !loading && !showKeyInput && !roast && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <h2 className="text-4xl font-bold mb-8 text-white">Logged In. Prepared to die?</h2>
                  <button
                    onClick={() => handleRoast()}
                    className="px-8 py-4 bg-red-500 rounded-full font-bold text-white text-xl hover:bg-red-600 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center mx-auto mb-4"
                  >
                    ROAST ME <Zap className="inline ml-2 fill-white" />
                  </button>
                  
                  <button onClick={() => {
                    localStorage.removeItem("spotify_token");
                    setToken(null);
                    window.history.replaceState({}, document.title, "/");
                  }} className="text-sm text-gray-500 hover:text-white transition-colors mt-4 underline decoration-gray-700 hover:decoration-white underline-offset-4">
                    Wait, I'm scared (Log Out)
                  </button>
                </motion.div>
              )}

              {showKeyInput && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-20"
                >
                  <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-white">One Last Thing...</h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      We need a Gemini API Key to generate the roast.
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-green-400 hover:underline ml-1">Get one here</a>.
                    </p>
                    <input
                      type="password"
                      placeholder="Paste API Key here"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveKey(inputKey);
                      }}
                    />
                    <button onClick={() => saveKey(inputKey)} className="w-full bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-500/20">Submit</button>
                    <button onClick={() => setShowKeyInput(false)} className="w-full mt-3 text-gray-500 hover:text-white transition-colors text-sm">Cancel</button>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5, repeat: Infinity } }}
                    className="inline-block mb-8"
                  >
                    <Skull size={80} className="text-red-500 shadow-red-500/50 drop-shadow-lg" />
                  </motion.div>
                  <h2 className="text-3xl font-bold animate-pulse text-red-500/80 tracking-widest font-mono">
                    {status === "analyzing" ? <DecryptedText text="JUDGING YOUR LIFE CHOICES..." speed={50} /> : <DecryptedText text="TRANSLATING 'TRASH' TO ENGLISH..." speed={50} />}
                  </h2>
                </motion.div>
              )}

              {roast && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                >
                  {/* Top Tracks Card */}
                  <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 h-full">
                    <h3 className="text-xl text-green-500 font-bold mb-6 flex items-center tracking-widest uppercase text-sm">
                      <Music className="mr-2" size={18} /> Evidence (Your Top Hits)
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {tracks.map((track, i) => (
                        <div key={track.id} className="flex items-center group p-3 hover:bg-white/5 rounded-xl transition-all">
                          <span className="text-2xl font-black text-gray-700 w-10 group-hover:text-green-500 transition-colors">#{i + 1}</span>
                          <img src={track.album.images[2]?.url} alt={track.name} className="w-12 h-12 rounded-lg mr-4 group-hover:scale-105 transition-transform shadow-lg" />
                          <div className="min-w-0">
                            <p className="font-bold truncate text-white group-hover:text-green-400 transition-colors">{track.name}</p>
                            <p className="text-xs text-gray-400 truncate">{track.artists[0].name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roast Card */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full"></div>
                    <div className="relative bg-gradient-to-b from-red-950/80 to-black p-8 rounded-3xl border border-red-500/30 flex flex-col justify-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                      <div className="absolute top-4 right-4 text-red-500/20">
                        <Skull size={48} />
                      </div>
                      <h2 className="text-4xl font-black text-red-500 uppercase mb-8 leading-none tracking-tighter">
                        <DecryptedText text={roast.title} speed={80} revealDelay={0} />
                      </h2>
                      <div className="text-lg text-gray-200 leading-relaxed font-medium mb-8">
                        <DecryptedText text={roast.body} speed={10} revealDelay={1000} className="font-mono" />
                      </div>
                      <div className="pt-8 border-t border-red-500/20 text-center flex gap-4 justify-center">
                        <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 text-sm text-gray-300 transition-all font-bold">Try Code Again</button>
                        <button onClick={() => {
                          localStorage.removeItem("spotify_token");
                          localStorage.removeItem("verifier");
                          setToken(null);
                          setTracks(null);
                          setRoast(null);
                          window.history.replaceState({}, document.title, "/");
                        }} className="px-6 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 transition-all text-sm font-bold">Log Out</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
