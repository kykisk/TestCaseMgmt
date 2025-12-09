@echo off
echo =========================================
echo  테스트케이스 관리 시스템
echo  개발 서버 시작
echo =========================================
echo.
echo 개발 서버를 시작합니다...
echo 포트: 5173 (Vite 기본 포트)
echo.
echo 기능:
echo   - Hot Module Replacement (HMR)
echo   - 빠른 새로고침
echo   - 소스맵 지원
echo.

cd /d "%~dp0"

echo 서버 실행 중...
echo.
echo 접속 주소:
echo   - 로컬: http://localhost:5173
echo.
echo =========================================
echo 코드 수정 시 자동으로 새로고침됩니다!
echo Ctrl+C를 눌러 서버를 중지할 수 있습니다.
echo =========================================
echo.

npm run dev
