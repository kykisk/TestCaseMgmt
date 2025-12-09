# AWS EC2 외부 접속 설정 가이드

## ✅ 현재 상태
- 서버 실행 중: **포트 8080**
- 프라이빗 IP: 172.31.47.228
- 접속 주소: http://0.0.0.0:8080 (모든 인터페이스)

---

## 🔧 AWS에서 설정해야 할 것

### 1️⃣ **Security Group 설정** (필수!)

#### AWS Console에서 설정:

```
1. AWS Console 로그인
2. EC2 대시보드로 이동
3. 왼쪽 메뉴 → "인스턴스" 클릭
4. 현재 EC2 인스턴스 선택
5. 하단 "보안" 탭 클릭
6. "보안 그룹" 링크 클릭
7. "인바운드 규칙" 탭 선택
8. "인바운드 규칙 편집" 버튼 클릭
```

#### 규칙 추가:
```
- 유형: 사용자 지정 TCP
- 프로토콜: TCP
- 포트 범위: 8080
- 소스: 0.0.0.0/0 (모든 IP 허용)
  또는
  소스: [특정 IP]/32 (특정 IP만 허용)
- 설명: TestCase Management System

"규칙 저장" 클릭
```

---

### 2️⃣ **Windows 방화벽 설정** (필수!)

#### PowerShell 관리자 권한으로 실행:
```powershell
New-NetFirewallRule -DisplayName "TestCase Server - Port 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Enabled True
```

또는 GUI 설정:
```
1. Windows Defender 방화벽 → 고급 설정
2. 인바운드 규칙 → 새 규칙
3. 포트 → TCP → 8080
4. 연결 허용 → 모두 체크
5. 이름: "TestCase Server" → 완료
```

---

## 🌐 접속 주소

### Security Group 설정 후:

#### EC2 퍼블릭 IP 확인:
```
AWS Console → EC2 → 인스턴스 선택 → "퍼블릭 IPv4 주소" 복사
```

#### 접속:
```
http://[퍼블릭_IP]:8080
```

예시:
```
http://54.123.45.67:8080
```

---

## 🔍 현재 서버 상태 확인

```bash
# 서버 실행 확인
netstat -ano | findstr :8080

# 결과:
# TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    15904
# → 정상 실행 중!
```

---

## 📋 설정 체크리스트

### ✅ 완료된 항목
- [x] 프로덕션 빌드 생성
- [x] 서버 실행 (포트 8080)
- [x] 내부 IP 확인 (172.31.47.228)

### ⚠️ 필요한 작업
- [ ] **AWS Security Group에 포트 8080 추가** (필수!)
- [ ] **Windows 방화벽 포트 8080 허용** (필수!)
- [ ] EC2 퍼블릭 IP 확인

---

## 🎯 빠른 설정 순서

### 1. AWS Security Group 설정 (5분)
```
EC2 Console → 인스턴스 → 보안 그룹 → 인바운드 규칙 편집
→ TCP 8080 추가 → 소스: 0.0.0.0/0 → 저장
```

### 2. Windows 방화벽 설정 (1분)
```powershell
# PowerShell 관리자 권한
New-NetFirewallRule -DisplayName "TestCase - Port 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### 3. 접속 테스트
```
http://[EC2_퍼블릭_IP]:8080
```

---

## 🔐 보안 권장사항

### 1. 특정 IP만 허용 (권장)
```
Security Group 소스:
- 0.0.0.0/0 대신
- [회사_IP]/32 또는 [집_IP]/32
```

### 2. HTTPS 설정 (선택사항)
```
- Route 53 도메인 연결
- Certificate Manager SSL 인증서 발급
- Application Load Balancer 사용
```

### 3. 기본 인증 추가
```bash
# 사용자명/비밀번호 보호
serve -s dist -l tcp://0.0.0.0:8080 --auth username:password
```

---

## 🚨 문제 해결

### "Access Denied" 오류
- **원인**: Security Group에서 포트 8080이 허용되지 않음
- **해결**: AWS Console에서 인바운드 규칙 추가

### "Connection Timeout" 오류
- **원인**: 방화벽 또는 Security Group 차단
- **해결**: 두 가지 모두 설정 확인

### 여전히 안 되는 경우
```bash
# 서버 재시작
cd C:\Workspace\MyWork\TestCase
taskkill /F /IM node.exe
npm run serve:external
```

---

## 🎉 최종 확인

### 로컬 테스트 (EC2 내부)
```bash
curl http://localhost:8080
```

### 외부 테스트 (브라우저)
```
http://[EC2_퍼블릭_IP]:8080
```

---

## 💡 포트 변경이 필요한 경우

일반적인 웹 포트 사용:
```bash
# 포트 80 (HTTP 기본 포트)
serve -s dist -l tcp://0.0.0.0:80

# Security Group: TCP 80 허용
# 방화벽: TCP 80 허용
# 접속: http://[EC2_IP] (포트 번호 생략 가능)
```

---

## 📞 다음 단계

1. **AWS Console 접속**
2. **Security Group에 포트 8080 추가**
3. **Windows 방화벽 설정** (위의 PowerShell 명령어)
4. **http://[퍼블릭_IP]:8080** 접속

완료! 🚀
