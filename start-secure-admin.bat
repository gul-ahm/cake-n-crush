@echo off
echo Starting Cake N Crush Secure Admin System...
echo.

echo Installing dependencies if needed and starting all services...
cd /d E:\cake n crush
npm install
cd server
npm install
cd ..

call npm run start:all

echo.
echo ✅ Both servers are starting in one terminal...
echo 🔒 Auth Server: http://localhost:3001
echo 🍰 Main App: http://localhost:5173 (or next available port)
echo.
echo 🔐 Admin Login: http://localhost:5173/s3cur3-m4n4g3m3nt-p0rt4l-x9z
echo Username: secure_admin_2024
echo Password: CakeNCrush#Secure!2024@Admin
echo.
pause