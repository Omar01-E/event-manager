#!/bin/bash
echo "🚀 Starting EventHub..."

# Start backend
cd "$(dirname "$0")/server"
node index.js &
SERVER_PID=$!
echo "✅ Server running on http://localhost:4000 (PID: $SERVER_PID)"

# Start frontend
cd "$(dirname "$0")/client"
npm run dev &
CLIENT_PID=$!
echo "✅ Client running on http://localhost:5173 (PID: $CLIENT_PID)"

echo ""
echo "📅 EventHub is ready! Open http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

wait
