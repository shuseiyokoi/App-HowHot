import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import './App.css';
import fireIcon from './assets/icon-fire.svg';
import fireIconDisabled from './assets/icon-fire-disable.svg';
import loadingVideo from './assets/loading-fire.webm';
import TermsOfUse from "./TermsOfUse";
import PrivacyPolicy from "./PrivacyPolicy";

const staticStyles = {
  footer: {
    marginTop: "2rem",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.875rem",
    color: "#888",
  },
  footerLink: {
    textDecoration: "none",
    color: "#888",
  },
};

const ChatApp: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setSpiceLevel(null);
      setError(null);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    setSpiceLevel(null);
    setError(null);
  
    const formData = new FormData();
    formData.append("file", image);
  
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(`${API_BASE}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSpiceLevel(response.data.spice_level);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 415) {
          setError("Please upload a valid image file (JPEG, PNG, HEIC).");
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Prediction failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setSpiceLevel(null);
    setError(null);
    setShowFeedback(false);
    setSelectedLevel(null);
    setFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = () => {
    if (selectedLevel !== null && image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("actual_spice_level", selectedLevel.toString());
      formData.append("predicted_spice_level", spiceLevel?.toString() || "0");

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      axios.post(`${API_BASE}/feedback`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((response) => {
          console.log("✅ Feedback submitted:", response.data);
          setFeedbackSubmitted(true);
        })
        .catch((err) => {
          console.error("❌ Feedback submission failed:", err);
        });
    }
  };

  const renderChilies = (level: number) => {
    const totalIcons = 5;
    return (
      <>
        {Array.from({ length: level }, (_, i) => (
          <img
            key={`active-${i}`}
            src={fireIcon}
            alt="fire icon"
            className="inline-block w-18 h-18 mx-0.5"
          />
        ))}
        {Array.from({ length: totalIcons - level }, (_, i) => (
          <img
            key={`disabled-${i}`}
            src={fireIconDisabled}
            alt="disabled fire icon"
            className="inline-block w-18 h-18 mx-0.5 opacity-40"
          />
        ))}
      </>
    );
  };

  const openFeedbackModal = () => {
    setSelectedLevel(0);
    setShowFeedback(true);
  };

  return (
    <div className="container">
      <h1 className="title flex items-center justify-center gap-2">
        How Hot?
        <img src={fireIcon} alt="fire icon" style={{ width: '40px', height: '40px'}} />
      </h1>

      <label className="upload-box cursor-pointer" htmlFor="file-input">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="preview-img"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full w-full">
            <span className="upload-label flex items-center justify-center gap-2">
              Click to upload your spicy dish
              <img src={fireIcon} alt="fire icon" className="w-6 h-6 inline-block" />
            </span>
            <div style={{ height: '1rem' }}></div>
            <button type="button" className="button mt-4 text-center" onClick={handleChooseFile}>Choose File</button>
          </div>
        )}
      </label>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="flex flex-col items-center w-full max-w-md">
        {spiceLevel === null ? (
          <button
            onClick={handleUpload}
            disabled={!image || loading}
            className="button flex items-center gap-2 justify-center"
          >
            {loading ? (
              <>
                <span>Predicting...</span>
                <video
                  src={loadingVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="loading-icon"
                />
              </>
            ) : (
              "Predict Spiciness"
            )}
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="button">Predict Another Picture</button>
          </>
        )}

        {spiceLevel !== null && (
          <>
            <div className="result">
              Spice Level: {spiceLevel} {renderChilies(spiceLevel)}
            </div>
            <div className="modal-call">
              <button onClick={openFeedbackModal} className="link-button mt-2">Not Quite?</button></div>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      {showFeedback && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowFeedback(false); }}>
          <div className="modal relative" style={{ position: 'relative' }}>
            <button className="modal-close" onClick={() => setShowFeedback(false)} style={{ position: 'absolute', top: '0.5rem', right: '0.75rem' }}>×</button>
            {feedbackSubmitted ? (
              <div className="text-center text-green-600 font-semibold text-lg" >Thank you for your feedback!</div>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2">What was the actual spice level?</h2>
                <div>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <img
                      key={level}
                      src={selectedLevel !== null && level <= selectedLevel ? fireIcon : fireIconDisabled}
                      alt={`spice ${level}`}
                      style={{ width: '54px', height: '54px', margin: '18px 0px'}}
                      onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                    />
                  ))}
                </div>
                <div className="flex justify-center w-full mt-4">
                  <button onClick={handleFeedbackSubmit} className="button">Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Links */}
      <div style={staticStyles.footer}>
        <Link to="/terms" style={{ ...staticStyles.footerLink, marginRight: "15px" }}>Terms of Use</Link>
        <Link to="/privacy" style={staticStyles.footerLink}>Privacy Policy</Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
