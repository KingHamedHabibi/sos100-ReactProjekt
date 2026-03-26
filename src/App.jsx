import { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Huvudkomponentenk
function App() {
  // State för att lagra statistik från API
  const [stats, setStats] = useState([]);

  // Håller koll på om dark mode är aktivt eller inte
  const [darkMode, setDarkMode] = useState(false);

  // Körs när komponenten laddas första gången
  useEffect(() => {
    // Hämtar data från ditt API
    fetch("http://localhost:5125/api/loans/stats")
      .then(response => response.json()) // Gör om till JSON
      .then(data => {
        console.log("Data från API:", data); // För debug
        setStats(data); // Sparar datan i state
      })
      .catch(error => {
        console.error("Fel vid hämtning:", error);
      });
  }, []);


  // 2. Hanterar dark mode (körs när darkMode ändras)
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Räknar ut totalt antal lån från alla statistikrader
  const totalLoansCount = stats.reduce((sum, item) => sum + item.totalLoans, 0);

  // Sorterar statistiken så att mest lånade item visas först
  const sortedStats = [...stats].sort((a, b) => b.totalLoans - a.totalLoans);



  return (
    <>
      <nav className="navbar">
        <h2 className="logo"></h2>

        <button
          className="darkmode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          <span className="icon">
            {darkMode ? "☀️" : "🌙"}
          </span>
        </button>
      </nav>

      <main className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-header">
          <h1>Loan Statistik</h1>
          <p>Översikt över lån och återlämningar från Loan API</p>
        </header>

        <section className="summary-card">
          <h2>Sammanfattning</h2>
          <p>Totalt antal lån: {totalLoansCount}</p>
        </section>

        <section className="chart-section">
          <h2>Antal lån per pryl</h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={sortedStats}
              layout="vertical"
              margin={{ left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                type="category"
                dataKey="itemName"
                width={200}
              />

              <Tooltip />

              <Bar dataKey="totalLoans" fill="#2e8b57" name="Antal lån" />
              <Bar dataKey="lateReturns" fill="#c0392b" name="Sena återlämningar" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="stats-grid">
          {sortedStats.map((item) => (
            <article className={`stat-card ${item.lateReturns > 0 ? "late-card" : "normal-card"}`}
              key={item.id}>
              <h3>{item.itemName}</h3>
              <p>Antal lån: <span className="badge">{item.totalLoans}</span></p>
              <p>Sena återlämningar: <span className="badge late">{item.lateReturns}</span></p>
              <p className={item.lateReturns > 0 ? "status status-late" : "status status-ok"}>
                {item.lateReturns > 0 ? "Sen återlämning" : "OK"}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export default App;