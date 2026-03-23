const db = require("../config/db");
const codeMapper = require("../mapper/codeMapper");

// --- Code Head (Group) Service ---

exports.getAllHeads = async (categoryCode) => {
  if (!categoryCode) {
    throw new Error("Category Code is required.");
  }
  return await codeMapper.findAllHeads(categoryCode);
};

exports.createHead = async (headData) => {
  if (!headData.categoryCode || !headData.groupCode) {
    const error = new Error("Category Code and Group Code are required.");
    error.statusCode = 400;
    throw error;
  }
  const existing = await codeMapper.findHead(
    headData.categoryCode,
    headData.groupCode,
  );
  if (existing) {
    const error = new Error("Duplicate Group Code for this Category.");
    error.statusCode = 409;
    throw error;
  }
  return await codeMapper.createHead(headData);
};

exports.updateHead = async (categoryCode, groupCode, headData) => {
  const result = await codeMapper.updateHead(categoryCode, groupCode, headData);
  if (result.affectedRows === 0) {
    const error = new Error("Group Code not found.");
    error.statusCode = 404;
    throw error;
  }
  return result;
};

exports.deleteHead = async (categoryCode, groupCode) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Delete all items in the group
    await codeMapper.deleteItemsByGroup(connection, categoryCode, groupCode);

    // 2. Delete the head of the group
    const result = await codeMapper.deleteHead(
      connection,
      categoryCode,
      groupCode,
    );

    if (result[0].affectedRows === 0) {
      throw new Error("Group Code not found."); // This will trigger rollback
    }

    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    // Re-throw the error to be handled by the controller
    const serviceError = new Error(error.message || "Failed to delete code group.");
    serviceError.statusCode = error.statusCode || 500;
    throw serviceError;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// --- Code Item (Detail) Service ---

exports.getItemsByGroupCode = async (categoryCode, groupCode) => {
  if (!categoryCode || !groupCode) {
    throw new Error("Category Code and Group Code are required.");
  }
  return await codeMapper.findItemsByGroupCode(categoryCode, groupCode);
};

exports.createItem = async (itemData) => {
  if (!itemData.categoryCode || !itemData.groupCode || !itemData.subCode) {
    const error = new Error(
      "Category Code, Group Code, and Sub Code are required.",
    );
    error.statusCode = 400;
    throw error;
  }
  return await codeMapper.createItem(itemData);
};

exports.updateItem = async (categoryCode, groupCode, subCode, itemData) => {
  const result = await codeMapper.updateItem(
    categoryCode,
    groupCode,
    subCode,
    itemData,
  );
  if (result.affectedRows === 0) {
    const error = new Error("Code Item not found.");
    error.statusCode = 404;
    throw error;
  }
  return result;
};

exports.deleteItem = async (categoryCode, groupCode, subCode) => {
  const result = await codeMapper.deleteItem(categoryCode, groupCode, subCode);
  if (result.affectedRows === 0) {
    const error = new Error("Code Item not found.");
    error.statusCode = 404;
    throw error;
  }
  return result;
};

exports.initializeCategories = async () => {
  return await codeMapper.initializeCategories();
};

