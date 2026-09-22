@echo off
echo ===================================================
echo   Pushing GeoTag Studio to GitHub Repository
echo ===================================================
echo.
git push -u origin main
git push origin --tags
echo.
echo ===================================================
echo   Done! Check GitHub Actions:
echo   https://github.com/bapanayya/GeoTag-Photo-Studio/actions
echo ===================================================
pause
