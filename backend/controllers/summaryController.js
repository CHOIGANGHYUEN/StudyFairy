const summaryService = require("../service/summaryService");
const logger = require("../config/logger");

exports.generateSummary = async (req, res) => {
  try {
    const { model, prompt, content, tocTitle } = req.body;

    if (!content || !tocTitle) {
      return res
        .status(400)
        .json({ message: "필수 데이터(문서 내용, 목차)가 누락되었습니다." });
    }

    const summaryText = await summaryService.generateSummary(
      model,
      prompt,
      content,
      tocTitle
    );

    res.status(200).json({ text: summaryText });
  } catch (error) {
    logger.error("요약 생성 컨트롤러에서 오류 발생:", error.message);
    res
      .status(500)
      .json({ message: "AI 요약 생성 중 서버 오류가 발생했습니다." });
  }
};
