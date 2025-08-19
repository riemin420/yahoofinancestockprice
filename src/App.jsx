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
import API_URL from "./config";

function App() {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("1mo");

  const fetchQuotes = async (selectedRange) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}/yahoofinance/quotes?range=${selectedRange}`,
        { mode: "cors" }
      );
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

  // セクターごとにグループ化
  const sectors = [...new Set(quotes.map((q) => q.sector))];
  const groupedQuotes = sectors.map((sec) => ({
    sector: sec,
    stocks: quotes.filter((q) => q.sector === sec),
  }));

  return (
    <div style={{ padding: "0 30px" }}>
      <h1>株価グラフ表示</h1>

      {/* 期間切替ボタン */}
      <div style={{ marginBottom: "20px" }}>
        {["1mo", "2mo", "3mo", "4mo", "5mo", "6mo"].map((r) => (
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
              cursor: "pointer",
            }}
          >
            {r.replace("mo", "ヶ月")}
          </button>
        ))}
      </div>

      {/* ローディング表示 */}
      {loading && <p>ロード中...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* セクターごとに分割 */}
      {groupedQuotes.map((group) => (
        <div key={group.sector} style={{ marginBottom: "50px" }}>
          <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "5px" }}>
            {group.sector}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)", // 横3列
              gap: "70px",
              marginTop: "20px",
              marginBottom: "30px"
            }}
          >
            {group.stocks.map((stock) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const dataset = stock.prices.map((p) => {
                const date = new Date(p.time * 1000);
                date.setHours(0, 0, 0, 0);
                return {
                  x: new Date(p.time * 1000),
                  y: p.price,
                  color: date.getTime() === today.getTime() ? "red" : "green",
                };
              });

              const chartData = {
                labels: dataset.map((d) => d.x),
                datasets: [
                  {
                    label: `${stock.ticker} (${stock.name})`,
                    data: dataset.map((d) => ({ x: d.x, y: d.y })),
                    borderColor: "green",
                    segment: {
                      borderColor: (ctx) => {
                        const idx = ctx.p0DataIndex;
                        return dataset[idx]?.color || "green";
                      },
                    },
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: false,
                    tension: 0.1,
                  },
                ],
              };

              const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                  },
                },
                scales: {
                  x: {
                    type: "time",
                    time: {
                      unit: "day",
                      tooltipFormat: "yyyy/MM/dd",
                      displayFormats: {
                        day: "M/d"
                      },
                      locale: ja,
                    },
                    title: {
                      display: true,
                      text: "日付",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "株価 (円)",
                    },
                    beginAtZero: false,
                  },
                },
              };

              return (
                <div
                  key={stock.ticker}
                  style={{
                    margin: "20px 0",
                    height: "300px",
                    width: "100%",
                    transform: "scale(1.017)",
                    transformOrigin: "top left"
                  }}
                >
                  <h3>
                    {stock.ticker} - {stock.name}
                  </h3>
                  <Line data={chartData} options={options} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
