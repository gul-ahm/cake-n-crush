#!/bin/bash

echo "Starting Cake N Crush Secure Admin System..."
echo

echo "Starting Authentication Server..."
cd server
npm start &
SERVER_PID=$!

echo "Waiting for auth server to start..."
sleep 3

echo "Starting Main Application..."
cd ..
npm run dev &
APP_PID=$!

echo
echo "✅ Both servers are running..."
echo "🔒 Auth Server: http://localhost:3001 (PID: $SERVER_PID)"
echo "🍰 Main App: http://localhost:5173 (PID: $APP_PID)"
echo
echo "🔐 Admin Login: http://localhost:5173/s3cur3-m4n4g3m3nt-p0rt4l-x9z"
echo "Username: secure_admin_2024"
echo "Password: CakeNCrush#Secure!2024@Admin"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "kill $SERVER_PID $APP_PID; exit" INT
wait