const { CodeHead, CodeItem, sequelize } = require("../models");
const { Op } = require("sequelize");

// --- Code Head (Group) Service ---

exports.getAllHeads = async (categoryCode) => {
  if (!categoryCode) {
    throw new Error("Category Code is required.");
  }
  return await CodeHead.findAll({
    where: { categoryCode },
    order: [["groupCode", "ASC"]],
  });
};

exports.createHead = async (headData) => {
  if (!headData.categoryCode || !headData.groupCode) {
    const error = new Error("Category Code and Group Code are required.");
    error.statusCode = 400;
    throw error;
  }
  const existing = await CodeHead.findOne({
    where: {
      categoryCode: headData.categoryCode,
      groupCode: headData.groupCode,
    },
  });
  if (existing) {
    const error = new Error("Duplicate Group Code for this Category.");
    error.statusCode = 409;
    throw error;
  }
  return await CodeHead.create(headData);
};

exports.updateHead = async (categoryCode, groupCode, headData) => {
  const [affectedRows] = await CodeHead.update(headData, {
    where: { categoryCode, groupCode },
  });
  if (affectedRows === 0) {
    const error = new Error("Group Code not found.");
    error.statusCode = 404;
    throw error;
  }
  return { affectedRows };
};

exports.deleteHead = async (categoryCode, groupCode) => {
  return sequelize.transaction(async (t) => {
    // 1. Delete all items in the group
    await CodeItem.destroy({
      where: { categoryCode, groupCode },
      transaction: t,
    });

    // 2. Delete the head of the group
    const affectedRows = await CodeHead.destroy({
      where: { categoryCode, groupCode },
      transaction: t,
    });

    if (affectedRows === 0) {
      throw new Error("Group Code not found."); // This will trigger rollback
    }

    return { affectedRows };
  });
};

// --- Code Item (Detail) Service ---

exports.getItemsByGroupCode = async (categoryCode, groupCode) => {
  if (!categoryCode || !groupCode) {
    throw new Error("Category Code and Group Code are required.");
  }
  return await CodeItem.findAll({
    where: { categoryCode, groupCode },
    order: [["subCode", "ASC"]],
  });
};

exports.createItem = async (itemData) => {
  if (!itemData.categoryCode || !itemData.groupCode || !itemData.subCode) {
    const error = new Error(
      "Category Code, Group Code, and Sub Code are required.",
    );
    error.statusCode = 400;
    throw error;
  }
  return await CodeItem.create(itemData);
};

exports.updateItem = async (categoryCode, groupCode, subCode, itemData) => {
  const [affectedRows] = await CodeItem.update(itemData, {
    where: { categoryCode, groupCode, subCode },
  });
  if (affectedRows === 0) {
    const error = new Error("Code Item not found.");
    error.statusCode = 404;
    throw error;
  }
  return { affectedRows };
};

exports.deleteItem = async (categoryCode, groupCode, subCode) => {
  const affectedRows = await CodeItem.destroy({
    where: { categoryCode, groupCode, subCode },
  });
  if (affectedRows === 0) {
    const error = new Error("Code Item not found.");
    error.statusCode = 404;
    throw error;
  }
  return { affectedRows };
};

exports.initializeCategories = async () => {
    const categories = [
        { categoryCode: 'SYS', groupCode: 'CAT001', subCode: 'SYS', description: 'System Codes', useYn: 1, createdBy: 'ADMIN' },
        { categoryCode: 'SYS', groupCode: 'CAT001', subCode: 'GEN', description: 'General Codes', useYn: 1, createdBy: 'ADMIN' },
    ];

    return await CodeItem.bulkCreate(categories, { ignoreDuplicates: true });
};
