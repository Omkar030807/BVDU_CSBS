@echo off
setlocal
cmake -S . -B build -DBUILD_TESTS=ON
if errorlevel 1 exit /b 1
cmake --build build --config Release
if errorlevel 1 exit /b 1
echo.
echo Build complete. Run: build\Release\medicore.exe
