const interactService = require("../service/interactService");
const logger = require("../config/logger");

exports.generateAnswer = async (req, res) => {
  try {
    const { model, contextText, question } = req.body;

    if (!contextText || !question) {
      return res
        .status(400)
        .json({ message: "Required data (contextText, question) is missing." });
    }

    const answerText = await interactService.generateAnswer(
      model,
      contextText,
      question
    );

    res.status(200).json({ text: answerText });
  } catch (error) {
    logger.error("Interaction controller error:", error.message);
    res
      .status(500)
      .json({ message: "A server error occurred during AI interaction." });
  }
};
