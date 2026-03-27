import "../App.css";

function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <div>
        <h1 className="logo">Lånestatistik</h1>
        <p>Översikt över lån och återlämningar från Loan API</p>
      </div>

      <button
        className="darkmode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Växla mörkt läge"
      >
        <span className="icon">{darkMode ? "☀" : "☾"}</span>
      </button>
    </nav>
  );
}

export default Navbar;
