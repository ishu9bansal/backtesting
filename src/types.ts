import { z } from "zod";

// Constants for dropdowns
export const SYMBOLS = ["NIFTY", "BANKNIFTY"] as const;
export const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;
export const FREQS = ["WEEKLY", "MONTHLY"] as const;
export const OPTION_TYPES = ["CE", "PE"] as const;
export const TRANSACTION_TYPES = ["BUY", "SELL"] as const;

// Schema for validating the form
export const backtestSchema = z.object({
    start_date: z.string().min(1, "Start date is required").describe("Start date for backtesting period in YYYY-MM-DD format"),
    end_date: z.string().min(1, "End date is required").describe("End date for backtesting period in YYYY-MM-DD format"),
    capital: z.coerce.number().min(1).describe("Initial capital amount for backtesting (e.g., 100000)"),
    lot_size: z.coerce.number().min(1).describe("Number of units per lot for trading (e.g., 50)"),

    position: z.object({
        per_day_positions_threshold: z.coerce.number().min(1).describe("Maximum number of positions allowed per trading day (e.g., 5)"),

        entry: z.object({
            time: z.string().min(1).describe("Entry time for positions in HH:MM format (e.g., '09:17')"),
        }).describe("Position entry configuration"),

        exit: z.object({
            time: z.string().min(1).describe("Exit time for positions in HH:MM format (e.g., '15:00')"),
            movement: z.coerce.number().optional().describe("Upon how many points of market movement should we do a readjustment by exiting the current position and taking a new one at new ATM (e.g., 100)"),
        }).describe("Position exit configuration"),

        focus: z.object({
            symbol: z.enum(SYMBOLS).describe("Trading symbol (NIFTY or BANKNIFTY)"),
            step: z.coerce.number().min(1).describe("Strike price step interval (e.g., 50 for NIFTY)"),
            expiry: z.object({
                weekday: z.coerce.number().min(0).max(6).describe("Day of week for expiry (0=Sunday, 1=Monday, ..., 6=Saturday, e.g., 3=Wednesday)"),
                frequency: z.enum(FREQS).describe("Expiry frequency (WEEKLY or MONTHLY)"),
            }).describe("Options expiry configuration"),
        }).describe("Trading focus and expiry settings"),

        legs: z
            .array(
                z.object({
                    strike: z.object({
                        offset: z.coerce.number().describe("Strike price offset from current price (e.g., 0 for ATM, +50 for OTM call, -50 for ITM call)"),
                    }).describe("Strike price configuration"),
                    type: z.enum(OPTION_TYPES).describe("Option type (CE for Call or PE for Put)"),
                    transaction: z.enum(TRANSACTION_TYPES).describe("Transaction type (BUY or SELL)"),
                }).describe("Individual option leg configuration")
            )
            .min(1)
            .describe("Array of option legs in the strategy (e.g., straddle has 2 legs: CE SELL and PE SELL)"),
    }).describe("Position configuration including entry/exit rules, focus symbol, and option legs"),
}).describe("Complete backtesting configuration schema for options trading strategies");

// Infer TypeScript type from schema
export type BacktestFormData = z.infer<typeof backtestSchema>;

export type TransactionType = "BUY" | "SELL";
export type OptionType = "CE" | "PE";

export type Contract = {
    expiry: string; // ISO date string
    type: OptionType; // Call or Put
    strike: number; // Strike price
    symbol: string; // e.g., "NIFTY"
}

export type RawOrder = {
    entry_price: number;
    quantity: number;
    transaction_type: TransactionType;
    entry_time: string;
    contract: Contract;
};

export type BacktestResult = {
    data: RawOrder[];
    initial_capital: number;
    error?: string;
};
