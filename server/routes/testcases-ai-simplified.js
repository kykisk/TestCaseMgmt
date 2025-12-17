// 이 코드를 testcases.js의 generate-from-ai 엔드포인트로 교체하세요

// POST generate testcases from AI
router.post('/generate-from-ai', async (req, res) => {
  try {
    const { title, description, projectId, category = 'Functional' } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({ error: 'Missing required fields: title, description, projectId' });
    }

    // 카테고리별 테스트 가이드
    const categoryGuides = {
      'Functional': '기능의 정상 동작, 예외 처리, 입력값 검증, 비즈니스 로직 등을 검증하는 테스트',
      'Integration': '여러 모듈/컴포넌트 간의 연동, 데이터 흐름, API 통합 등을 검증하는 테스트',
      'UI': 'UI 요소 표시, 레이아웃, 사용자 인터랙션, 반응형 디자인 등을 검증하는 테스트',
      'API': 'REST API 엔드포인트, 요청/응답 형식, 상태 코드, 에러 핸들링 등을 검증하는 테스트',
      'Performance': '응답 시간, 처리 속도, 부하 처리, 메모리 사용량 등 성능을 검증하는 테스트',
      'Security': '인증/인가, 권한 검증, 데이터 보안, SQL 인젝션 방어 등 보안을 검증하는 테스트',
    };

    // Create AI prompt
    const prompt = `당신은 테스트케이스 작성 전문가입니다. 다음 기능에 대한 "${category}" 테스트케이스를 JSON 형식으로 생성해주세요.

기능 제목: ${title}
테스트 카테고리: ${category}
카테고리 설명: ${categoryGuides[category] || '기능 테스트'}

기능 설명/명세:
${description}

위 기능 설명은 자유 형식이거나 구조화된 템플릿 형식일 수 있습니다.
- 구조화된 템플릿인 경우: ## 섹션으로 구분된 입력/출력/규칙/예외상황 등을 분석하세요
- 자유 형식인 경우: 전체 내용을 분석하여 테스트 시나리오를 도출하세요

다음 JSON 형식으로 여러 개의 테스트케이스를 생성해주세요:
{
  "testcases": [
    {
      "title": "테스트케이스 제목",
      "description": "테스트케이스 설명",
      "priority": "High|Medium|Low",
      "category": "${category}",
      "preconditions": "사전 조건",
      "steps": [
        {
          "stepNumber": 1,
          "action": "수행할 액션",
          "expectedResult": "예상 결과"
        }
      ],
      "postconditions": "사후 조건",
      "tags": ["tag1", "tag2"]
    }
  ]
}

중요: 모든 테스트케이스의 category는 반드시 "${category}"로 설정하세요.

"${category}" 카테고리에 맞는 다양한 시나리오를 포함해주세요:
${category === 'Functional' ? `
- 정상 동작 케이스 (Happy Path)
- 예외 처리 케이스 (Error Cases)
- 경계값 테스트 (Boundary Tests)
- 부정적인 케이스 (Negative Cases)
- 비즈니스 규칙 검증` : ''}
${category === 'Integration' ? `
- 모듈 간 데이터 전달 테스트
- API 연동 테스트
- 외부 시스템 통합 테스트
- 에러 전파 테스트` : ''}
${category === 'UI' ? `
- UI 요소 표시 테스트
- 사용자 인터랙션 테스트
- 반응형 레이아웃 테스트
- 접근성 테스트` : ''}
${category === 'API' ? `
- 엔드포인트 정상 호출 테스트
- 요청/응답 형식 검증
- HTTP 상태 코드 검증
- 에러 응답 테스트` : ''}
${category === 'Performance' ? `
- 응답 시간 측정 테스트
- 대용량 데이터 처리 테스트
- 동시 접속 부하 테스트
- 메모리 사용량 테스트` : ''}
${category === 'Security' ? `
- 인증/인가 테스트
- 권한 검증 테스트
- 데이터 암호화 테스트
- 보안 취약점 테스트` : ''}

5-7개의 "${category}" 테스트케이스를 생성해주세요. (너무 많으면 응답이 잘릴 수 있습니다)
중요:
- JSON만 반환하고 다른 설명은 추가하지 마세요
- 각 테스트케이스는 간결하게 작성하세요
- 응답은 반드시 완전한 JSON 형식이어야 합니다`;

    // AI 생성 (설정된 모델 자동 사용)
    const aiResponse = await generateTestCases(prompt, projectId);

    console.log('AI Response length:', aiResponse.length);
    console.log('AI Response preview:', aiResponse.substring(0, 200));

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    // Check if JSON is complete (ends with })
    if (!jsonStr.trim().endsWith('}')) {
      console.error('[AI] Incomplete JSON response - response was truncated');
      return res.status(500).json({
        error: 'AI response was incomplete',
        details: 'The AI response was truncated. Try with a shorter description or simpler requirements.'
      });
    }

    const generatedData = JSON.parse(jsonStr);

    res.json({
      success: true,
      testcases: generatedData.testcases,
      message: `${generatedData.testcases.length}개의 테스트케이스가 생성되었습니다.`,
    });
  } catch (error) {
    console.error('Error generating testcases from AI:', error);
    res.status(500).json({
      error: 'Failed to generate testcases from AI',
      details: error.message
    });
  }
});
