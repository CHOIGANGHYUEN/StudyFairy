const codeService = require("../service/codeService");

const handleErrors = (res, error) => {
  console.error(error);
  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "An unexpected error occurred." });
};

// --- Code Head (Group) Controller ---

exports.getAllHeads = async (req, res) => {
  try {
    const { categoryCode } = req.params;
    const heads = await codeService.getAllHeads(categoryCode);
    res.status(200).json(heads);
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.createHead = async (req, res) => {
  try {
    await codeService.createHead(req.body);
    res.status(201).json({ message: "Code Group created successfully." });
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.updateHead = async (req, res) => {
  try {
    const { categoryCode, groupCode } = req.params;
    await codeService.updateHead(categoryCode, groupCode, req.body);
    res.status(200).json({ message: "Code Group updated successfully." });
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.deleteHead = async (req, res) => {
  try {
    const { categoryCode, groupCode } = req.params;
    await codeService.deleteHead(categoryCode, groupCode);
    res.status(200).json({ message: "Code Group deleted successfully." });
  } catch (error) {
    handleErrors(res, error);
  }
};

// --- Code Item (Detail) Controller ---

exports.getItemsByGroupCode = async (req, res) => {
  try {
    const { categoryCode, groupCode } = req.params;
    const items = await codeService.getItemsByGroupCode(
      categoryCode,
      groupCode,
    );
    res.status(200).json(items);
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.createItem = async (req, res) => {
  try {
    await codeService.createItem(req.body);
    res.status(201).json({ message: "Code Item created successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Duplicate Sub Code for this Group Code." });
    }
    handleErrors(res, error);
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { categoryCode, groupCode, subCode } = req.params;
    await codeService.updateItem(categoryCode, groupCode, subCode, req.body);
    res.status(200).json({ message: "Code Item updated successfully." });
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { categoryCode, groupCode, subCode } = req.params;
    await codeService.deleteItem(categoryCode, groupCode, subCode);
    res.status(200).json({ message: "Code Item deleted successfully." });
  } catch (error) {
    handleErrors(res, error);
  }
};

exports.initializeCategories = async (req, res) => {
  try {
    const result = await codeService.initializeCategories();
    res.status(201).json({ message: "Categories initialized successfully.", ...result });
  } catch (error) {
    handleErrors(res, error);
  }
};
