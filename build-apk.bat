@echo off
echo ===================================================
echo   TOP-GPS Tracker — Automated APK Builder
echo ===================================================
echo.
echo [1/3] Syncing latest web app assets...
call npx cap sync android

echo.
echo [2/3] Building Android APK...
cd android
call gradlew.bat assembleDebug

echo.
echo [3/3] Copying generated APK...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy "app\build\outputs\apk\debug\app-debug.apk" "..\TOP-GPS-Tracker.apk"
    echo.
    echo ===================================================
    echo  SUCCESS! APK generated: TOP-GPS-Tracker.apk
    echo ===================================================
) else (
    echo.
    echo [!] Build failed. Please ensure JDK/Android SDK is installed.
)
cd ..
pause
