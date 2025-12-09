# Windows 방화벽 규칙 추가 - 포트 8090
# 관리자 권한 필요

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Windows 방화벽 설정" -ForegroundColor Cyan
Write-Host " 포트 8090 허용 규칙 추가" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERROR] 관리자 권한이 필요합니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "이 파일을 우클릭 → '관리자 권한으로 실행'을 선택해주세요." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host "[OK] 관리자 권한으로 실행 중입니다." -ForegroundColor Green
Write-Host ""
Write-Host "방화벽 규칙 추가 중..." -ForegroundColor Yellow

try {
    # 인바운드 규칙 추가 - 포트 8090
    New-NetFirewallRule -DisplayName "TestCase Server - Port 8090" -Direction Inbound -Protocol TCP -LocalPort 8090 -Action Allow -Enabled True

    Write-Host ""
    Write-Host "[SUCCESS] 방화벽 규칙이 추가되었습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "이제 외부에서 접근할 수 있습니다:" -ForegroundColor Cyan
    Write-Host "  - 로컬: http://localhost:8090" -ForegroundColor White
    Write-Host "  - 내부망: http://172.31.47.228:8090" -ForegroundColor White
    Write-Host "  - 외부(AWS): http://[퍼블릭_IP]:8090" -ForegroundColor White
    Write-Host ""
    Write-Host "※ AWS Security Group에도 포트 8090을 추가해야 합니다!" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "[ERROR] 방화벽 규칙 추가 실패: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "아무 키나 누르면 종료됩니다..."
pause
