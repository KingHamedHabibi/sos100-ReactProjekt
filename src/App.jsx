import { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import Navbar from "./Components/Navbar";
import LoanChart from "./Components/LoanChart";
import StatsCards from "./Components/StatsCards";

function App() {
  const [stats, setStats] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const getItemKey = (item) => item.itemId ?? item.ItemId ?? item.itemName ?? item.ItemName;
  const getUserKey = (item) =>
    item.borrowerId ?? item.BorrowerId ?? item.userName ?? item.UserName ?? item.borrowerName;
  const getTotalLoans = (item) => item.totalLoans ?? item.TotalLoans ?? 0;
  const getLateReturns = (item) => item.lateReturns ?? item.LateReturns ?? 0;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/loans/stats`, {
      headers: {
        "X-Api-Key": apiKey,
      },
    })
      .then(async (response) => {
        const text = await response.text();

        console.log("Statuskod:", response.status);
        console.log("Rått svar från API:", text);

        if (!response.ok) {
          throw new Error(`API-fel ${response.status}: ${text}`);
        }

        return JSON.parse(text);
      })
      .then((data) => {
        console.log("Data från API:", data);
        setStats(data);
      })
      .catch((error) => {
        console.error("Fel vid hämtning:", error);
      });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const totalLoansCount = stats.reduce((sum, item) => sum + getTotalLoans(item), 0);
  const totalLateReturnsCount = stats.reduce((sum, item) => sum + getLateReturns(item), 0);
  const uniqueItemsCount = new Set(stats.map((item) => getItemKey(item))).size;
  const uniqueUsersCount = new Set(stats.map((item) => getUserKey(item))).size;
  const itemsWithLateReturns = new Set(
    stats
      .filter((item) => getLateReturns(item) > 0)
      .map((item) => getItemKey(item)),
  ).size;

  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-header">
          <h1>Diagram för Lånestatistik</h1>
          <p>Översikt över lån och återlämningar</p>
        </header>

        <section className="dashboard-top">
          <section className="chart-section">
            <h2>Antal lån per pryl</h2>
            <LoanChart data={stats} />
          </section>

          <aside className="summary-stack">
            <section className="summary-card">
              <h2>Totalt antal lån</h2>
              <p className="summary-value">{totalLoansCount}</p>
              <p className="summary-meta">Lån i hela perioden</p>
            </section>

            <section className="summary-card summary-details">
              <h3>Nyckeltal</h3>
              <div className="metric-row">
                <span>Unika prylar</span>
                <strong>{uniqueItemsCount}</strong>
              </div>
              <div className="metric-row">
                <span>Unika användare</span>
                <strong>{uniqueUsersCount}</strong>
              </div>
              <div className="metric-row">
                <span>Sena återlämningar totalt</span>
                <strong>{totalLateReturnsCount}</strong>
              </div>
              <div className="metric-row">
                <span>Prylar med försening</span>
                <strong>{itemsWithLateReturns}</strong>
              </div>
            </section>
          </aside>
        </section>

        <section className="cards-section">
          <StatsCards data={stats} />
        </section>
      </main>
    </>
  );
}

export default App;
