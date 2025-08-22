import React, { useState } from "react";
import "./MedicationRemainder.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faPlus, faEnvelope, faClock } from "@fortawesome/free-solid-svg-icons";

export default function MedicationReminder() {
  const [medications, setMedications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    morning: "",
    afternoon: "",
    evening: "",
    duration: "",
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const addMedication = () => {
    const { email, name, morning, afternoon, evening, duration } = form;
    const parsedDuration = parseInt(duration, 10);

    if (!email || !name || !parsedDuration || parsedDuration <= 0) {
      alert("Please provide a valid email, medication name, and duration (at least 1 day).");
      return;
    }

    const times = [morning, afternoon, evening].filter(Boolean);
    const newMedication = {
      id: Date.now(),
      name,
      times,
      duration: parsedDuration,
      email,
    };

    setMedications((prev) => [...prev, newMedication]);
    setForm({ email: "", name: "", morning: "", afternoon: "", evening: "", duration: "" });
    closeModal();

    // Call backend to schedule reminders
    times.forEach((time) => {
      fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/schedule-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tabletName: name,
          time,
          email,
          duration: parsedDuration,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Email scheduled:", data))
        .catch((err) => console.error("Error scheduling email:", err));
    });
  };

  const removeMedication = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <div className="icon-circle">
            <FontAwesomeIcon icon={faPills} />
          </div>
          <div>
            <h3>Medication Reminders</h3>
            <p className="subtitle">Take your medicine 3 times a day</p>
          </div>
        </div>
        <button className="add-btn" onClick={openModal}>
          <FontAwesomeIcon icon={faPlus} /> Add Medication
        </button>
      </div>

      <div id="medications" className="med-list">
        {medications.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faPills} size="2x" />
            <p>No medications added yet</p>
            <small>Add your medications to receive reminders</small>
          </div>
        ) : (
          medications.map((med) => (
            <div className="med-item" key={med.id}>
              <div className="med-details">
                <FontAwesomeIcon icon={faPills} />
                <div>
                  <strong>{med.name}</strong>
                  <br />
                  <small>
                    <FontAwesomeIcon icon={faClock} />{" "}
                    {med.times.length ? med.times.join(" • ") : "No times set"}
                  </small>
                  <br />
                  <small>Duration: {med.duration} day{med.duration > 1 ? "s" : ""}</small>
                  <br />
                  <small>Email: {med.email}</small>
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeMedication(med.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="voice-info">
        <FontAwesomeIcon icon={faEnvelope} className="icon" />
        <strong>Email Notifications:</strong> You will receive an email reminder for your medication
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Medication</h3>

            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              placeholder="e.g., example@gmail.com"
              value={form.email}
              onChange={handleChange}
            />

            <label htmlFor="name">Medication Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g., Aspirin"
              value={form.name}
              onChange={handleChange}
            />

            <label htmlFor="morning">Morning Time</label>
            <input type="time" id="morning" value={form.morning} onChange={handleChange} />
            <div className="help">Suggested: 07:00–09:00</div>

            <label htmlFor="afternoon">Afternoon Time</label>
            <input type="time" id="afternoon" value={form.afternoon} onChange={handleChange} />
            <div className="help">Suggested: 12:00–15:00</div>

            <label htmlFor="evening">Evening Time</label>
            <input type="time" id="evening" value={form.evening} onChange={handleChange} />
            <div className="help">Suggested: 18:00–21:00</div>

            <label htmlFor="duration">Duration (Days)</label>
            <input
              type="number"
              id="duration"
              min="1"
              placeholder="e.g., 7"
              value={form.duration}
              onChange={handleChange}
            />

            <div className="modal-buttons">
              <button className="save-medication" onClick={addMedication}>
                Add Medication
              </button>
              <button className="cancel" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
