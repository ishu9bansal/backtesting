import 'dotenv/config';
import { clerkClient, clerkMiddleware } from '@clerk/express'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { type BacktestFormData, BacktestResult, backtestSchema } from "./types.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors'
import { authServerMetadataHandlerClerk, mcpAuthClerk, protectedResourceHandlerClerk } from '@clerk/mcp-tools/express';

const BACKTEST_API_BASE = "https://ej5u3yy5de.execute-api.us-east-1.amazonaws.com";
const USER_AGENT = "backtest-app/1.0";

// Create server instance
const server = new McpServer({
  name: "backtest-options-market",
  version: "1.0.0",
});

async function makeBacktestRequest(strategy: BacktestFormData): Promise<BacktestResult | null> {
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
        return await response.json() as BacktestResult;
    } catch (error) {
        console.error("Error making backtest request:", error);
        return null;
    }
}

function formatMessage(text: string): CallToolResult {
    return {
        content: [
            {
                type: "text",
                text,
            },
        ],
    };
}

server.tool(
    "run_backtest",
    "Run a backtest on historical options data on a given stock symbol and date range.",
    backtestSchema.shape,
    async (params: BacktestFormData, { authInfo }) => {
        const userId = authInfo!.extra!.userId! as string;
        const userData = await clerkClient.users.getUser(userId);
        console.log(`Backtest requested by user: ${userData.primaryEmailAddress?.emailAddress} (ID: ${userId})`);
        const results = await makeBacktestRequest(params);
        if(!results) {
            return formatMessage("Failed to retrieve backtest results.");
        }
        if (results.error) {
            return formatMessage(`Backtest error: ${results.error}`);
        }
        if (results.data.length === 0) {
            return formatMessage("No trades were made during the backtest period.");
        }

        let summary = `Backtest completed. Initial Capital: ₹${results.initial_capital}\n\nTrades Executed:\n`;
        results.data.forEach((order, index) => {
            summary += `${index + 1}. ${order.transaction_type} ${order.quantity} of ${order.contract.symbol} ${order.contract.strike} ${order.contract.type} at ₹${order.entry_price} on ${order.entry_time}\n`;
        });

        return formatMessage(summary);
    },
);

async function init_stdio_transport() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Backtesting MCP Server running on stdio");
}

async function init_http_transport() {
    // Set up Express and HTTP transport
    const app = express();
    app.use(cors({ exposedHeaders: ['WWW-Authenticate'] }));
    app.use(clerkMiddleware());
    app.use(express.json());
    
    app.get('/', (req, res) => {
        res.send('Backtesting MCP Server is running. Use the /mcp endpoint for MCP requests.');
    });

    app.post('/mcp', mcpAuthClerk, async (req, res) => {
        // Create a new transport for each request to prevent request ID collisions
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    });
    app.get(
        '/.well-known/oauth-protected-resource/mcp',
        protectedResourceHandlerClerk({ scopes_supported: ['email', 'profile'] }),
    )
    app.get('/.well-known/oauth-authorization-server', authServerMetadataHandlerClerk)



    const port = parseInt(process.env.PORT || '3000');
    app.listen(port, () => {
        console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
    }).on('error', error => {
        throw error;
    });
}

async function main() {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        console.log("Running in development mode");
    }
    const useHttp = process.env.USE_HTTP === 'true' || isDev;
    if (useHttp) {
        await init_http_transport();
    } else {
        await init_stdio_transport();
    }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
