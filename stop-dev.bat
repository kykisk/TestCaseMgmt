@echo off
echo =========================================
echo  테스트케이스 관리 시스템
echo  개발 서버 중지
echo =========================================
echo.
echo 포트 5173을 사용하는 개발 서버를 중지합니다...
echo.

REM 포트 5173을 사용하는 프로세스 찾기 및 종료
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo 프로세스 종료 중: PID %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo 개발 서버가 중지되었습니다!
echo.
pause
