const sampleData = {
  "capital": 100000,
  "end_date": "2022-06-09",
  "lot_size": 50,
  "position": {
    "exit": {
      "time": "15:00",
      "movement": 100
    },
    "legs": [
      {
        "type": "CE",
        "strike": {
          "offset": 0
        },
        "transaction": "SELL"
      },
      {
        "type": "PE",
        "strike": {
          "offset": 0
        },
        "transaction": "SELL"
      }
    ],
    "entry": {
      "time": "09:17"
    },
    "focus": {
      "step": 50,
      "expiry": {
        "weekday": 4,
        "frequency": "WEEKLY"
      },
      "symbol": "NIFTY"
    },
    "per_day_positions_threshold": 5
  },
  "start_date": "2022-06-01"
};
const BACKTEST_API_BASE = "https://ej5u3yy5de.execute-api.us-east-1.amazonaws.com";
const USER_AGENT = "backtest-app/1.0";


async function makeBacktestRequest(strategy) {
    try {
        const response = await fetch(`${BACKTEST_API_BASE}/backtest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
            },
            body: JSON.stringify(strategy),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error making backtest request:", error);
        return null;
    }
}

async function main() {
    const params = sampleData;
    const results = await makeBacktestRequest(params);
    console.log("Backtest Results:", results);
}

main();