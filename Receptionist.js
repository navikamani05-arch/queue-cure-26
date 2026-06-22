import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, onValue, push } from "firebase/database";

const speak = (text) => {
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 0.9;
  msg.pitch = 1;

  window.speechSynthesis.speak(msg);
};

export default function Receptionist() {
  const [patientName, setPatientName] = useState("");
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(0);
  const [avgTime, setAvgTime] = useState(10);
  const [doctorStatus, setDoctorStatus] = useState("Available");
  const [calledTime, setCalledTime] = useState("");

  useEffect(() => {
    onValue(ref(db, "queue"), (snap) => {
      const data = snap.val();
      setQueue(data ? Object.values(data) : []);
    });

    onValue(ref(db, "currentToken"), (snap) => {
      setCurrentToken(snap.val() || 0);
    });

    onValue(ref(db, "doctorStatus"), (snap) => {
      setDoctorStatus(snap.val() || "Available");
    });

    onValue(ref(db, "calledTime"), (snap) => {
      setCalledTime(snap.val() || "");
    });
  }, []);

  const addPatient = () => {
    if (!patientName.trim()) return;

    const token = queue.length + 1;

    push(ref(db, "queue"), {
      name: patientName,
      token,
    });

    setPatientName("");
  };

  const callNext = () => {
    const next = currentToken + 1;

    const time = new Date().toLocaleTimeString();

    set(ref(db, "currentToken"), next);
    set(ref(db, "avgTime"), avgTime);
    set(ref(db, "calledTime"), time);

    const patient = queue.find(
      (p) => p.token === next
    );

    if (patient) {
      speak(
        `Token number ${next},
         ${patient.name},
         please proceed to the doctor`
      );
    } else {
      speak(
        `Token number ${next},
         please proceed to the doctor`
      );
    }
  };

  const toggleDoctor = () => {
    const newStatus =
      doctorStatus === "Available"
        ? "Busy"
        : "Available";

    set(
      ref(db, "doctorStatus"),
      newStatus
    );

    speak(`Doctor is now ${newStatus}`);
  };

  const currentPatient = queue.find(
    (p) => p.token === currentToken
  );

  const waiting = Math.max(
    0,
    queue.length - currentToken
  );

  const served = currentToken;
  const total = queue.length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        🏥 Receptionist Panel
      </h1>

      <div
        style={{
          ...styles.statusCard,
          background:
            doctorStatus === "Available"
              ? "#dcfce7"
              : "#fee2e2",
        }}
      >
        <h3>
          Doctor{" "}
          {doctorStatus === "Available"
            ? "🟢 Available"
            : "🔴 Busy"}
        </h3>

        <button
          style={styles.btn}
          onClick={toggleDoctor}
        >
          Mark as{" "}
          {doctorStatus === "Available"
            ? "Busy"
            : "Available"}
        </button>
      </div>

      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Enter Patient Name"
          value={patientName}
          onChange={(e) =>
            setPatientName(
              e.target.value
            )
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            addPatient()
          }
        />

        <button
          style={styles.btn}
          onClick={addPatient}
        >
          Add Patient
        </button>
      </div>

      <div style={styles.card}>
        <label>
          ⏱ Avg Consultation Time:
        </label>

        <input
          style={styles.smallInput}
          type="number"
          value={avgTime}
          onChange={(e) =>
            setAvgTime(
              Number(e.target.value)
            )
          }
        />

        mins
      </div>

      <button
        style={styles.callBtn}
        onClick={callNext}
      >
        📢 Call Next Token
      </button>

      <div style={styles.nowCard}>
        <h2>
          Now Serving:
          Token {currentToken}
        </h2>

        {currentPatient && (
          <h3>
            👤 {currentPatient.name}
          </h3>
        )}

        {calledTime && (
          <p>
            🕐 Called at:
            {" "}
            {calledTime}
          </p>
        )}
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>👥 Waiting</h3>
          <h2>{waiting}</h2>
        </div>

        <div style={styles.statCard}>
          <h3>✅ Served</h3>
          <h2>{served}</h2>
        </div>

        <div style={styles.statCard}>
          <h3>📋 Total</h3>
          <h2>{total}</h2>
        </div>
      </div>

      <h2>Waiting Queue</h2>

      {queue.length === 0 && (
        <p>No patients added.</p>
      )}

      {queue.map((p, i) => (
        <div
          key={i}
          style={styles.patient}
        >
          <span>
            Token {p.token} — {p.name}
          </span>

          <span>
            {p.token === currentToken
              ? "🟢 Now"
              : p.token <
                currentToken
              ? "✅ Done"
              : "⏳ Waiting"}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: 25,
    maxWidth: 750,
    margin: "30px auto",
    fontFamily: "Arial",
    background:
      "rgba(255,255,255,0.9)",
    borderRadius: 25,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.2)",
  },

  title: {
    textAlign: "center",
    color: "#2563eb",
  },

  statusCard: {
    padding: 20,
    borderRadius: 15,
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    marginBottom: 20,
  },

  input: {
    width: "65%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    marginRight: 10,
  },

  smallInput: {
    width: 70,
    padding: 8,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8,
  },

  btn: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },

  callBtn: {
    width: "100%",
    padding: 16,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 18,
    cursor: "pointer",
  },

  nowCard: {
    marginTop: 20,
    background: "#eff6ff",
    padding: 20,
    borderRadius: 15,
    textAlign: "center",
  },

  stats: {
    display: "flex",
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    background: "#f8fafc",
    padding: 20,
    borderRadius: 15,
    textAlign: "center",
  },

  patient: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    background: "#f1f5f9",
    display: "flex",
    justifyContent:
      "space-between",
  },
};