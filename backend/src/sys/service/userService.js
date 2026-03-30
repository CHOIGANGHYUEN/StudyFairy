const { User } = require("../../index");

exports.getAllUsers = async () => {
  return await User.findAll({ order: [["id", "DESC"]] });
};

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.findOrCreateUser = async (profile) => {
  const { email, name, picture } = profile;

  const [user, created] = await User.findOrCreate({
    where: { userId: email },
    defaults: {
      userId: email,
      createdBy: "SYSTEM",
      changedBy: "SYSTEM",
    },
  });

  // user 객체에 이름과 프로필 사진 정보를 추가 (DB에 저장하지 않더라도 프론트에 전달)
  const userJson = user.toJSON();
  userJson.name = name;
  userJson.picture = picture;

  return userJson;
};
