import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  TimeScale,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { ja } from "date-fns/locale";

ChartJS.register(
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  TimeScale
);

function App() {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("1mo");

  const fetchQuotes = async (selectedRange) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/yahoofinance/quotes?range=${selectedRange}`, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(range);
  }, [range]);

  return (
    <div style={{ padding: "0 30px" }}>
      <h1>株価グラフ表示</h1>

      {/* 期間切替ボタン */}
      <div style={{ marginBottom: "20px" }}>
        {["1mo", "2mo", "3mo", "4mo", "5mo", "6mo"].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              marginRight: "10px",
              backgroundColor: range === r ? "#007bff" : "#ccc",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {r.replace("mo", "ヶ月")}
          </button>
        ))}
      </div>

      {loading && <p>ロード中...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* グラフ表示 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "60px"
      }}>
        {quotes.map(stock => {
          const dataset = stock.prices.map(p => ({
            x: new Date(p.time * 1000),
            y: p.price,
          }));

          const chartData = {
            datasets: [
              {
                label: `${stock.ticker} (${stock.name})`,
                data: dataset,
                borderColor: "green",
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
                tension: 0.1,
              },
              {
                label: "取得単価",
                data: dataset.map(d => ({ x: d.x, y: stock.avg_price })),
                borderColor: "red",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
              }
            ],
          };

          const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
            },
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "day",
                  tooltipFormat: "MM/dd",
                  displayFormats: {
                    day: "MM/dd"
                  },
                  locale: ja },
                title: { display: true, text: "日付" },
              },
              y: {
                title: { display: true, text: "株価 (円)" },
                beginAtZero: false,
              },
            },
          };

          return (
            <div
              key={stock.ticker}
              style={{
                margin: "60px 50px",
                height: "470px",
                width: "470px",
                transform: "scale(1.2)",
                transformOrigin: "center top"
              }}
            >
              <h2>{stock.ticker} - {stock.name}</h2>
              <Line data={chartData} options={options} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
