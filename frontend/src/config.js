// Define the base URL for API requests.
// Falls back to http://127.0.0.1:5000 for local development if not set in environment.

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
