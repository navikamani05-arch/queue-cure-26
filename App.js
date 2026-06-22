import "./App.css";
import Receptionist from "./Receptionist";
import Patient from "./Patient";

function App() {
  const path = window.location.pathname;

  return path === "/patient"
    ? <Patient />
    : <Receptionist />;
}

export default App;