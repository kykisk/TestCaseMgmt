@echo off
echo =========================================
echo  Windows 방화벽 설정
echo  포트 3000 허용 규칙 추가
echo =========================================
echo.
echo 관리자 권한이 필요합니다...
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] 관리자 권한으로 실행 중입니다.
    echo.
    echo 방화벽 규칙 추가 중...
    netsh advfirewall firewall add rule name="TestCase Server - Port 3000" dir=in action=allow protocol=TCP localport=3000
    echo.
    echo [SUCCESS] 방화벽 규칙이 추가되었습니다!
    echo.
    echo 이제 외부에서 http://172.31.47.228:3000 으로 접근할 수 있습니다.
) else (
    echo [ERROR] 관리자 권한이 필요합니다!
    echo.
    echo 이 파일을 마우스 우클릭 후 "관리자 권한으로 실행"을 선택해주세요.
)

echo.
pause
