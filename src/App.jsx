import React, { useState } from "react";

function App() {
  const [quotes, setQuotes] = useState({});
  const [error, setError] = useState("");

  const fetchQuotes = async () => {
    try {
      const res = await fetch("https://kokitechblog.com/yahoofinance/quotes", { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuotes(data);
    } catch(err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>株価取得</h1>
      <button onClick={fetchQuotes}>現在の株価を取得</button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <ul>
        {Object.entries(quotes).map(([t, p]) => (
          <li key={t}>{t}: {p.toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
