# AWS EC2 Security Group 설정 가이드

## 🎯 필수 설정: 포트 8090 열기

AWS EC2에서 외부 접속을 허용하려면 **Security Group**에 인바운드 규칙을 추가해야 합니다.

---

## 📋 설정 방법

### **1단계: AWS Console 접속**
```
https://console.aws.amazon.com/ec2/
```

### **2단계: EC2 인스턴스 찾기**
```
1. 왼쪽 메뉴 → "인스턴스" 클릭
2. 현재 EC2 인스턴스 선택 (프라이빗 IP: 172.31.47.228)
```

### **3단계: Security Group 열기**
```
1. 하단 "보안" 탭 클릭
2. "보안 그룹" 항목의 링크 클릭 (예: sg-xxxxx)
```

### **4단계: 인바운드 규칙 추가**
```
1. "인바운드 규칙" 탭 선택
2. "인바운드 규칙 편집" 버튼 클릭
3. "규칙 추가" 버튼 클릭
```

### **5단계: 규칙 설정**
```
유형: 사용자 지정 TCP
프로토콜: TCP
포트 범위: 8090
소스: 다음 중 선택
  - 0.0.0.0/0 (전 세계 누구나 접속 가능)
  - [회사IP]/32 (특정 IP만 허용)
  - [집IP]/32 (본인 IP만 허용)
설명: TestCase Management System
```

### **6단계: 저장**
```
"규칙 저장" 버튼 클릭
```

---

## 🔒 보안 권장사항

### 옵션 1: 특정 IP만 허용 (가장 안전)
```
소스: [본인IP]/32
```
본인 IP 확인: https://www.whatismyip.com/

### 옵션 2: 회사 네트워크만 허용
```
소스: [회사IP대역]/24
예: 203.123.45.0/24
```

### 옵션 3: 전체 허용 (테스트용)
```
소스: 0.0.0.0/0
주의: 누구나 접속 가능하므로 테스트 후 삭제 권장
```

---

## 🌐 설정 완료 후 접속

### EC2 퍼블릭 IP 확인:
```
AWS Console → EC2 → 인스턴스 → "퍼블릭 IPv4 주소" 복사
```

### 브라우저에서 접속:
```
http://[퍼블릭_IP]:8090
```

예시:
```
http://54.180.123.45:8090
```

---

## ✅ 설정 확인 방법

### 1. Security Group 규칙 확인
```
AWS Console → EC2 → 보안 그룹 → 인바운드 규칙
→ "TCP 8090" 규칙이 있는지 확인
```

### 2. 서버 실행 확인 (EC2 내부)
```bash
netstat -ano | findstr :8090
# LISTENING 보이면 정상
```

### 3. 로컬 접속 테스트
```bash
curl http://localhost:8090
```

### 4. 외부 접속 테스트
```
브라우저에서: http://[퍼블릭_IP]:8090
```

---

## 🚨 문제 해결

### "연결할 수 없음" 오류
- [ ] Security Group에 포트 8090 추가했나요?
- [ ] 소스가 0.0.0.0/0 또는 본인 IP인가요?
- [ ] 서버가 실행 중인가요? (`netstat -ano | findstr :8090`)

### "Access Denied" 오류
- [ ] Windows 방화벽도 설정했나요?
```powershell
New-NetFirewallRule -DisplayName "TestCase - Port 8090" -Direction Inbound -Protocol TCP -LocalPort 8090 -Action Allow
```

### "Timeout" 오류
- [ ] EC2 인스턴스가 실행 중인가요?
- [ ] VPC의 Network ACL 확인
- [ ] 올바른 퍼블릭 IP를 사용하고 있나요?

---

## 📊 현재 설정 상태

| 항목 | 포트 | 상태 |
|------|------|------|
| 서버 실행 | 8090 | ✅ 준비 완료 |
| package.json | 8090 | ✅ 업데이트 완료 |
| start-server.bat | 8090 | ✅ 업데이트 완료 |
| stop-server.bat | 8090 | ✅ 업데이트 완료 |
| AWS Security Group | 8090 | ⚠️ **설정 필요** |
| Windows 방화벽 | 8090 | ⚠️ **설정 필요** |

---

## 🎯 지금 해야 할 일

1. **AWS Console 접속**
2. **Security Group에 TCP 8090 추가**
3. **PowerShell에서 방화벽 설정**
4. **서버 시작**: `start-server.bat`
5. **접속**: `http://[퍼블릭_IP]:8090`

완료! 🚀
