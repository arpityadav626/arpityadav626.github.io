@echo off
title Arpit Yadav Portfolio - Local Server
color 0b
echo ======================================================================
echo    ARPIT YADAV PORTFOLIO - LOCAL WEB SERVER
echo ======================================================================
echo.
echo  Website files: %~dp0
echo  Server Address: http://localhost:8000
echo.
echo  [1/2] Opening browser at http://localhost:8000 ...
start "" "http://localhost:8000"
echo.
echo  [2/2] Running Python Web Server...
echo  (Is window ko band mat karna jab tak aap website test kar rahe ho!)
echo  (Band karne ke liye ye window cross kar dena ya Ctrl + C dabana)
echo ======================================================================
echo.

python -m http.server 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Notice] Python direct command nahi mila! index.html directly browser me khol rahe hain...
    start "" "index.html"
    pause
)
