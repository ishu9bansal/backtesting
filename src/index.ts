import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BACKTEST_API_BASE = "https://api.weather.gov";
const USER_AGENT = "backtest-app/1.0";

// Create server instance
const server = new McpServer({
  name: "backtest-options-market",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making API requests
async function makeAPIRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making API request:", error);
    return null;
  }
}

const BacktestParamsSchema = {
    symbol: z.string().describe("The stock symbol to backtest."),
    start_date: z.string().describe("The start date for the backtest in YYYY-MM-DD format."),
    end_date: z.string().describe("The end date for the backtest in YYYY-MM-DD format."),
};

server.tool(
    "run_backtest",
    "Run a backtest on historical options data on a given stock symbol and date range.",
    BacktestParamsSchema,
    async (params, context) => {
        return {
            content: [
                {
                    type: "text",
                    text: "Backtest tool not implemented yet.",
                },
            ],
        };
    },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Backtesting MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
