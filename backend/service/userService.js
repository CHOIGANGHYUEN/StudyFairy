const userMapper = require("../mapper/userMapper");

exports.getAllUsers = async () => {
  return await userMapper.findAll();
};
