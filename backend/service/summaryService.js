const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

exports.generateSummary = async (model, prompt, content, tocTitle) => {
  try {
    // 백엔드 환경 변수(.env)에서 안전하게 API 키 로드
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 클라이언트가 선택한 모델 검증 (Gemini 모델이 아니면 기본 모델로 안전하게 강제 치환)
    const aiModel = genAI.getGenerativeModel({
      model:
        model && model.toLowerCase().includes("gemini")
          ? model
          : "gemini-1.5-flash-preview", // Note: Model name updated for latest
    });

    // 프롬프트 조립
    const fullPrompt = `${prompt}
---
[전체 내용]:
${content}
---
[요약할 주요 항목]:
${tocTitle}
---
위 내용을 바탕으로 선택된 주요 항목에 초점을 맞춰서 상세하고 구조화된 요약을 생성해줘. 결과는 마크다운(Markdown) 형식으로 제공해줘.`;

    const result = await aiModel.generateContent(fullPrompt);
    const text = result.response.text();

    return text;
  } catch (error) {
    logger.error("AI 요약 생성 중 서비스 오류 발생:", error);
    // 컨트롤러에서 처리할 수 있도록 에러를 다시 던집니다.
    throw new Error("AI 요약 생성 중 서비스 오류가 발생했습니다.");
  }
};
