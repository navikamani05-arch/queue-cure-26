import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function Patient() {
  const [currentToken, setCurrentToken] = useState(0);
  const [avgTime, setAvgTime] = useState(10);
  const [myToken, setMyToken] = useState("");
  const [doctorStatus, setDoctorStatus] = useState("Available");
  const [calledTime, setCalledTime] = useState("");
  const [queue, setQueue] = useState([]);
  const [prevToken, setPrevToken] = useState(0);

  const funFacts = [
    "🦷 Teeth are the strongest part of your body!",
    "❤️ Your heart beats around 100,000 times every day!",
    "🌟 Smiling can make you feel happier!",
    "🦴 Babies have more bones than adults!"
  ];

  const [fact, setFact] = useState(funFacts[0]);
  const [message, setMessage] = useState("");

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    window.speechSynthesis.speak(msg);
  };

  useEffect(() => {
    onValue(ref(db, "currentToken"), (snap) => {
      const val = snap.val() || 0;

      if (val > prevToken && prevToken !== 0) {
        speak(
          `Attention please. Token number ${val} is now being called.`
        );
      }

      setPrevToken(val);
      setCurrentToken(val);
    });

    onValue(ref(db, "avgTime"), (snap) => {
      setAvgTime(snap.val() || 10);
    });

    onValue(ref(db, "doctorStatus"), (snap) => {
      setDoctorStatus(snap.val() || "Available");
    });

    onValue(ref(db, "calledTime"), (snap) => {
      setCalledTime(snap.val() || "");
    });

    onValue(ref(db, "queue"), (snap) => {
      const data = snap.val();
      setQueue(data ? Object.values(data) : []);
    });

    setFact(
      funFacts[
        Math.floor(Math.random() * funFacts.length)
      ]
    );
  }, []);

  const tokensAhead =
    myToken > currentToken
      ? myToken - currentToken - 1
      : 0;

  const waitTime = tokensAhead * avgTime;

  const progress =
    myToken > 0
      ? Math.min(
          Math.round(
            (currentToken / myToken) * 100
          ),
          100
        )
      : 0;

  const currentPatient = queue.find(
    (p) => p.token === currentToken
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial",
        backgroundImage:
          "url('/hospital-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          maxWidth: "550px",
          margin: "auto",
          background: "rgba(255,255,255,0.95)",
          padding: "25px",
          borderRadius: "20px",
        }}
      >
        <h1
          style={{
            color: "#7c3aed",
            textAlign: "center",
          }}
        >
          🪑 Patient Waiting Room
        </h1>

        <div
          style={{
            background:
              doctorStatus === "Available"
                ? "#dcfce7"
                : "#fee2e2",
            padding: "12px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          <b>
            Doctor:
            {doctorStatus === "Available"
              ? " 🟢 Available"
              : " 🔴 Busy"}
          </b>
        </div>

        <div
          style={{
            background: "#7c3aed",
            color: "white",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <p>Now Serving</p>

          <h1>Token {currentToken}</h1>

          {currentPatient && (
            <p>👤 {currentPatient.name}</p>
          )}

          {calledTime && (
            <p>🕐 {calledTime}</p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#fef3c7",
              padding: "15px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p>👥 Waiting</p>
            <h2>
              {Math.max(
                0,
                queue.length - currentToken
              )}
            </h2>
          </div>

          <div
            style={{
              flex: 1,
              background: "#dcfce7",
              padding: "15px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p>✅ Served</p>
            <h2>{currentToken}</h2>
          </div>
        </div>

        <div
          style={{
            background: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <p>Enter your token number</p>

          <input
            type="number"
            value={myToken}
            placeholder="Your Token"
            onChange={(e) =>
              setMyToken(Number(e.target.value))
            }
            style={{
              padding: "12px",
              width: "70%",
              fontSize: "18px",
              borderRadius: "10px",
              border:
                "2px solid #7c3aed",
            }}
          />
        </div>

        {myToken > 0 && (
          <div
            style={{
              marginTop: "20px",
              background: "#eff6ff",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            <h3>
              👥 Tokens Ahead:
              {tokensAhead}
            </h3>

            <h3>
              ⏱ Estimated Wait:
              {waitTime} mins
            </h3>

            <h3>
              📍 Your Position:
              {tokensAhead + 1}
            </h3>

            <div
              style={{
                width: "100%",
                height: "20px",
                background: "#e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
                marginTop: "15px",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background:
                    "#7c3aed",
                  height: "100%",
                  transition:
                    "0.5s",
                }}
              />
            </div>

            <p>
              Queue Progress:
              {progress}%
            </p>

            {tokensAhead <= 2 &&
              tokensAhead > 0 && (
                <div
                  style={{
                    background:
                      "#fef3c7",
                    padding:
                      "12px",
                    borderRadius:
                      "10px",
                    marginTop:
                      "15px",
                  }}
                >
                  ⚠️ Only
                  {tokensAhead}
                  patient(s)
                  left. Please
                  proceed to the
                  waiting area.
                </div>
              )}

            {tokensAhead > 2 && (
              <div
                style={{
                  background:
                    "#dcfce7",
                  padding:
                    "12px",
                  borderRadius:
                    "10px",
                  marginTop:
                    "15px",
                }}
              >
                🏡 You still
                have about
                <b>
                  {" "}
                  {waitTime} mins
                </b>
                .
                <br />
                Feel free to
                relax outside.
              </div>
            )}

            {myToken ===
              currentToken && (
              <h2
                style={{
                  color:
                    "#16a34a",
                  marginTop:
                    "20px",
                }}
              >
                🎉 It's your
                turn now!
              </h2>
            )}
          </div>
        )}

        <div
          style={{
            background:
              "#fff7ed",
            padding: "20px",
            borderRadius:
              "15px",
            marginTop:
              "20px",
          }}
        >
          <h2>
            🎈 Kid Zone
          </h2>

          <p>
            🐼 Dr. Panda says:
            Don't worry! The
            doctor will see you
            soon.
          </p>

          <p>
            🎉 Fun Fact:
            {fact}
          </p>

          <button
            onClick={() =>
              setMessage(
                "🐻 Teddy says: You are very brave!"
              )
            }
          >
            😟 I am Nervous
          </button>

          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Patient;