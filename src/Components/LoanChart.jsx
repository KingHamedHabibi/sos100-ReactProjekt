import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

function LoanChart({ data }) {
  const [visibleCount, setVisibleCount] = useState("5");
  const [metric, setMetric] = useState("totalLoans");

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const sortingKey = metric === "lateReturns" ? "lateReturns" : "totalLoans";
    const sortedData = [...data].sort((a, b) => b[sortingKey] - a[sortingKey]);

    if (visibleCount === "all") {
      return sortedData;
    }

    return sortedData.slice(0, Number(visibleCount));
  }, [data, metric, visibleCount]);

  const chartHeight = 380;

  if (chartData.length === 0) {
    return <p>Ingen statistik att visa.</p>;
  }

  return (
    <div className="loan-chart-wrapper">
      <div className="chart-controls">
        <label className="chart-control">
          <span>Visa</span>
          <select
            value={visibleCount}
            onChange={(event) => setVisibleCount(event.target.value)}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="all">Alla</option>
          </select>
        </label>

        <label className="chart-control">
          <span>Typ</span>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
          >
            <option value="totalLoans">Antal lån</option>
            <option value="lateReturns">Sena återlämningar</option>
            <option value="both">Båda</option>
          </select>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 10, right: 20, left: 10, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="category"
            dataKey="itemName"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={70}
          />
          <YAxis
            type="number"
            allowDecimals={false}
          />
          <Tooltip />

          {metric !== "lateReturns" && (
            <Bar dataKey="totalLoans" fill="#2e8b57" name="Antal lån" />
          )}
          {metric !== "totalLoans" && (
            <Bar dataKey="lateReturns" fill="#c0392b" name="Sena återlämningar" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LoanChart;
