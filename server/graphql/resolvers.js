const User = require('../models/User');
const Guild = require('../models/Guild');

const resolvers = {
  Query: {
    users: async (_, { ID }) => {
      return await User.findById(ID);
    },
    getUser: async (_, { amount }) => {
      return await User.find().limit(amount);
    },
    guild: async (_, { ID }) => {
      return await Guild.findById(ID);
    },
  },
  Mutation: {
    createUser: async (_, { userInput: { name, password, color } }) => {
      const createdUser = new User({
        name,
        password,
        tokenJWT: password,
        color,
        level: 0,
        guild: "",
      });

      const res = await createdUser.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },

    deleteUser: async (_, { ID }) => {
      const { deletedCount } = await User.deleteOne({ _id: ID });
      return deletedCount === 1;
    },

    editUser: async (_, { ID, userInput: { name, password } }) => {
      const { modifiedCount } = await User.updateOne(
        { _id: ID },
        { name, password }
      );
      return modifiedCount === 1;
    },

    createGuild: async (_, { guildInput: { name }, ownerId }) => {
      const user = await User.findById(ownerId);

      if (user.guild !== "") {
        throw new Error(`User ${user.name} already has a guild!`);
      }

      const createdGuild = await Guild.create({
        name,
        ownerId,
        level: 0,
      });

      user.guild = createdGuild.id;
      await user.save();

      return {
        id: createdGuild.id,
        ...createdGuild._doc,
      };
    },

    deleteGuild: async (_, { ID, ownerId }) => {
      const { deletedCount } = await Guild.deleteOne({ _id: ID });

      const userGuildBroken = await User.findById(ownerId);
      userGuildBroken.guild = "";
      await userGuildBroken.save();

      return deletedCount === 1;
    },
  },
};

module.exports = resolvers;