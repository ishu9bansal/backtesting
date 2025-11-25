# Backtesting MCP Server

A Model Context Protocol (MCP) server for backtesting options trading strategies on NIFTY and BANKNIFTY.

## Installation

```bash
npm install
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Running the Server

### Development Mode (HTTP with Hot Reload)

Run the server in development mode with automatic restart on file changes:

```bash
npm run dev:watch
```

Or run once without hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000/mcp` (or the port specified in `PORT` environment variable).

### Production Mode

#### STDIO Mode (for MCP clients)

Run the server in STDIO mode for integration with MCP clients like Claude Desktop:

```bash
npm start
```

Or directly:

```bash
node build/index.js
```

#### HTTP Mode

Run the server in HTTP mode:

```bash
npm run start:http
```

Or with custom port:

```bash
USE_HTTP=true PORT=8080 node build/index.js
```

### Testing with MCP Inspector

Use the MCP Inspector to test and debug the server:

```bash
npm run inspector
```

Or manually:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## Environment Variables

- `NODE_ENV`: Set to `development` to automatically enable HTTP mode
- `USE_HTTP`: Set to `true` to force HTTP mode
- `PORT`: HTTP server port (default: 3000)

## Available Tools

### `run_backtest`

Run a backtest on historical options data for a given stock symbol and date range.

**Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `capital`: Initial capital amount
- `lot_size`: Number of units per lot
- `position`: Position configuration including:
  - `per_day_positions_threshold`: Max positions per day
  - `entry`: Entry time configuration
  - `exit`: Exit time and movement configuration
  - `focus`: Symbol, step, and expiry settings
  - `legs`: Array of option legs (strike, type, transaction)

## Example Usage

See `src/sample.json` for a complete example configuration.

## Development

### Project Structure

```
├── src/
│   ├── index.ts       # Main server implementation
│   ├── types.ts       # Zod schemas and TypeScript types
│   └── sample.json    # Example backtest configuration
├── build/             # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Hot Reload Development

For the best development experience, use:

```bash
npm run dev:watch
```

This will:
- Run the server in HTTP mode on port 3000
- Automatically restart when you change any TypeScript files
- Show console logs for debugging

### Making Changes

1. Edit TypeScript files in `src/`
2. The server will automatically restart (if using `dev:watch`)
3. Test your changes using HTTP requests or the MCP Inspector
4. Build for production with `npm run build`
