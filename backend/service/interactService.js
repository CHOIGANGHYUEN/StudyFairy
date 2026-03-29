const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

exports.generateAnswer = async (model, contextText, question) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const aiModel = genAI.getGenerativeModel({
      model:
        model && model.toLowerCase().includes("gemini")
          ? model
          : "gemini-1.5-flash-preview",
    });

    const fullPrompt = `
      Based on the following context, please provide a detailed and structured answer to the question.
      The answer should be in Korean and formatted in Markdown.

      ---
      [Context]:
      ${contextText}
      ---
      [Question]:
      ${question}
      ---
    `;

    const result = await aiModel.generateContent(fullPrompt);
    const text = result.response.text();

    return text;
  } catch (error) {
    logger.error("AI interaction service error:", error);
    throw new Error("An error occurred in the AI interaction service.");
  }
};
