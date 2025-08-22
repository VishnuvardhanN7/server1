import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // ✅ Added for Markdown rendering
import pic1 from "./images/light.jpg";
import pic2 from "./images/normal.jpg";
import pic3 from "./images/heavy.jpg";

export default function Image6Click({ onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [checkedSymptoms, setCheckedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [displayText, setDisplayText] = useState("See your selected symptoms here...");
  const [patientAge, setPatientAge] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponsePopup, setShowResponsePopup] = useState(false);

  const symptomsList = [
    "cramping",
  "aching pain",
  "sharp pain",
  
  "joint pain",
  "leg feels shaky",
  "visible veins",
  
  "pain while walking",
  
  "heaviness",
  "coldness in leg",
  
  "skin discoloration",
 
  ];

  const images = [
    { src: pic1, alt: "Lighter" },
    { src: pic2, alt: "Moderate" },
    { src: pic3, alt: "Heavy" },
  ];

  const updateDisplayText = (painLevel, symptoms) => {
    setDisplayText(
      `Pain Level: ${painLevel || "Not selected"}\nSelected Symptoms: ${
        symptoms.length > 0 ? symptoms.join(", ") : "None"
      }`
    );
  };

  const handleImageClick = (index) => {
    const newPainLevel = images[index].alt;
    setSelectedImageIndex(index);
    updateDisplayText(newPainLevel, checkedSymptoms);
  };

  const handleCheckboxChange = (symptom) => {
    const updatedSymptoms = checkedSymptoms.includes(symptom)
      ? checkedSymptoms.filter((item) => item !== symptom)
      : [...checkedSymptoms, symptom];
    setCheckedSymptoms(updatedSymptoms);

    const painLevel =
      selectedImageIndex !== null ? images[selectedImageIndex].alt : null;
    updateDisplayText(painLevel, updatedSymptoms);
  };

  const handleAddCustomSymptom = () => {
    const trimmedSymptom = customSymptom.trim();
    if (trimmedSymptom && !checkedSymptoms.includes(trimmedSymptom)) {
      const updatedSymptoms = [...checkedSymptoms, trimmedSymptom];
      setCheckedSymptoms(updatedSymptoms);
      setCustomSymptom("");

      const painLevel =
        selectedImageIndex !== null ? images[selectedImageIndex].alt : null;
      updateDisplayText(painLevel, updatedSymptoms);
    }
  };

  const handleSubmit = async () => {
    if (!patientAge.trim()) {
      alert("Please enter your age before submitting.");
      return;
    }

    const painLevel =
      selectedImageIndex !== null ? images[selectedImageIndex].alt : "Not selected";

    const symptomsText = checkedSymptoms.join(", ") || "None";

    const query = `
You are a medical information assistant. You are NOT a doctor and cannot give a medical diagnosis, but you can provide educational health information based on symptoms. 

User information:  
Age: ${patientAge}  
Symptoms: ${symptomsText}  
Pain Level: ${painLevel}

This is leg related. Analyze and respond in **Markdown** with:  

**1. Urgency Level** (choose one and make it bold & vibrant):  
- **✅ Don’t worry, it’s probably normal.** (green)  
- **⚠️ Consult a doctor for evaluation.** (yellow)  
- **🚨 Go to a hospital immediately.** (red)  

**2. Related Diseases**  
- Bullet points listing possible related conditions.

**3. Possible Causes**  
- Bullet points possible causes no explanation need.

**4. Suggested Care**  
- Provide food, medicine, or exercise suggestions based on pain level and symptoms.

Keep it clean, formal, and easy to read.
    `;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/gpt", { query });
      setResponse(res.data?.answer || "No valid response from server.");
      setShowResponsePopup(true);
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      setResponse(error.response?.data?.answer || "Error fetching data from server.");
      setShowResponsePopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Popup */}
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>

          <div className="popup-header">Pain Level Assistant</div>

          {/* Age Input */}
          <div className="age-input-container">
            <input
              type="number"
              placeholder="Age"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              required
              className="age-input"
            />
          </div>

          {/* Pain Level Images */}
          <div className="image-row">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.src}
                alt={img.alt}
                className={selectedImageIndex === index ? "selected" : ""}
                onClick={() => handleImageClick(index)}
              />
            ))}
          </div>

          {/* Symptoms Checkboxes */}
          <div style={{ marginTop: "20px" }}>
            <div className="checkbox-title">Select Your Symptoms</div>
            <div className="checkbox-grid">
              {symptomsList.map((symptom, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    value={symptom}
                    checked={checkedSymptoms.includes(symptom)}
                    onChange={() => handleCheckboxChange(symptom)}
                  />{" "}
                  {symptom}
                </label>
              ))}
            </div>

            {/* Custom Symptom Input */}
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <input
                type="text"
                placeholder="Enter custom symptom"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginRight: "10px",
                }}
              />
              <button
                onClick={handleAddCustomSymptom}
                style={{
                  padding: "6px 12px",
                  borderRadius: "5px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>

            {/* Display Box */}
            <div id="selectedDisplay" style={{ marginTop: "15px" }}>
              {displayText}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <button id="submitSymptomsBtn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Response Popup */}
      {showResponsePopup && (
        <div className="popup-overlay" onClick={() => setShowResponsePopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowResponsePopup(false)}>
              &times;
            </button>
            <div className="popup-header">Your Result</div>
            <div
              style={{
                marginTop: "10px",
                background: "#f0f0f0",
                borderRadius: "5px",
                padding: "10px",
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              {/* ✅ Render Markdown */}
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
