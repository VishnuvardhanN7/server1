import React, { useState, useEffect } from "react";
import "../App.css"
import { FaPills, FaPlus, FaBell, FaClock, FaCalendarDay, FaCheck } from "react-icons/fa";
import pic from "./images/b2.jpg"


export default function TabletReminder() {
  const [medications, setMedications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [medName, setMedName] = useState("");
  const [morning, setMorning] = useState("");
  const [afternoon, setAfternoon] = useState("");
  const [evening, setEvening] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (medications.length > 0 && Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [medications]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      medications.forEach((med) => {
        if (isActive(med) && med.times.includes(currentTime)) {
          showNotification(med.name);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [medications]);

  const isActive = (med) => {
    const now = new Date();
    const started = new Date(med.startDate);
    const daysPassed = Math.floor((now - started) / (1000 * 60 * 60 * 24));
    return daysPassed < med.duration;
  };

  const showNotification = (tablet) => {
    if (!("Notification" in window)) {
      alert(`Time to take your ${tablet}! 💊`);
      return;
    }
    if (Notification.permission === "granted") {
      new Notification("Tablet Reminder", {
        body: `Time to take your ${tablet}! 💊`,
        icon: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
      });
    } else {
      alert(`Time to take your ${tablet}! 💊`);
    }
  };

  const addMedication = () => {
    if (medName && duration > 0) {
      const med = {
        id: Date.now(),
        name: medName.trim(),
        times: [morning, afternoon, evening].filter(Boolean),
        duration: parseInt(duration, 10),
        startDate: new Date().toISOString(),
      };
      setMedications((prev) => [...prev, med]);
      setShowModal(false);
      setMedName("");
      setMorning("");
      setAfternoon("");
      setEvening("");
      setDuration("");
    } else {
      alert("Please fill in Medication Name and a valid duration (days). Times are optional.");
    }
  };

  const removeMedication = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };
  

  return (
    <div style={{
            backgroundImage: `url(${pic})`, // optional, keep image if needed
            backgroundSize: "cover",
            backgroundPosition: "center",
            
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
            
          }}>
    <div className="container">
      <div className="header">
        <div className="header-left">
          <div className="icon-circle"><FaPills /></div>
          <div>
            <h3>Medication Reminders</h3>
            <p style={{ fontSize: "14px", color: "gray" }}>Take your medicine 3 times a day</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}>
          <FaPlus /> Add Medication
        </button>
      </div>

      <div className="med-list">
        {medications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "gray" }}>
            <FaPills size={30} />
            <p>No medications added yet</p>
            <small>Add your medications to receive reminders</small>
          </div>
        ) : (
          medications.map((med) => {
            const active = isActive(med);
            const timesDisplay = med.times.length > 0 ? med.times.join(" • ") : "No times set";

            return (
              <div key={med.id} className="med-item">
                <div className="med-details">
                  <FaPills />
                  <div>
                    <strong>{med.name}</strong><br />
                    <small><FaClock /> {timesDisplay}</small><br />
                    <small><FaCalendarDay /> Duration: {med.duration} day{med.duration > 1 ? "s" : ""}</small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {active ? (
                    <span className="badge"><FaBell /> Active</span>
                  ) : (
                    <span className="badge" style={{ borderColor: "#999", color: "#999" }}>
                      <FaCheck /> Completed
                    </span>
                  )}
                  <button className="remove-btn" onClick={() => removeMedication(med.id)}>Remove</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="voice-info">
        <FaBell style={{ color: "white" }} />
        <strong style={{ color: "white" }}> Voice Notifications:</strong> "It's time to take your medication"
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Medication</h3>

            <label>Medication Name</label>
            <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g., Aspirin" />

            <label>Morning Time</label>
            <input type="time" value={morning} onChange={(e) => setMorning(e.target.value)} />
            <div className="help">Suggested: 07:00–09:00</div>

            <label>Afternoon Time</label>
            <input type="time" value={afternoon} onChange={(e) => setAfternoon(e.target.value)} />
            <div className="help">Suggested: 12:00–15:00</div>

            <label>Evening Time</label>
            <input type="time" value={evening} onChange={(e) => setEvening(e.target.value)} />
            <div className="help">Suggested: 18:00–21:00</div>

            <label>Duration (Days)</label>
            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 7" />

            <button className="save-medication" onClick={addMedication}>Add Medication</button>
            <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
