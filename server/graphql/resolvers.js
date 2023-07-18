const User = require('../models/User');
const Guild = require('../models/Guild');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    registerUser: async (_, { registerUserInput: { name, password, color } }) => {
      const existingUser = await User.findOne().or([{ name }, { color }]);
    
      if (existingUser) {
        if (existingUser.name === name) {
          throw new Error(`The name ${name} is taken!`);
        } else {
          throw new Error(`The color ${color} is taken!`);
        }
      }
    
      const encryptedPassword = await bcrypt.hash(password, 10);
    
      const createdUser = new User({
        name,
        password: encryptedPassword,
        color,
        level: 0,
        guild: "",
      });
    
      const token = jwt.sign(
        {
          user_id: createdUser._id,
          color,
        },
        "UNSAFE_STRING",
        {
          expiresIn: "2h",
        }
      );
    
      createdUser.tokenJWT = token;
    
      const res = await createdUser.save();
    
      return {
        id: res.id,
        ...res._doc,
      };
    },    

    loginUser: async (_, { loginUserInput: { name, password } }) => {
      const user = await User.findOne({ name });
    
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          {
            user_id: user._id,
            color: user.color,
            name: user.name
          },
          "UNSAFE_STRING",
          {
            expiresIn: "2h",
          }
        );
    
        user.tokenJWT = token;
    
        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        throw new Error("Incorrect password!");
      }
    },    

    deleteUser: async (_, { ID }) => {
      const { deletedCount } = await User.deleteOne({ _id: ID });
      return deletedCount === 1;
    },

    createGuild: async (_, { guildInput: { name }, ownerId }) => {
      const user = await User.findById(ownerId);

      if (!user.guild) {
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

    async addMemberGuild(_, { input: { userId, guildId } }) {
      const user = await User.findById(userId);
      const guild = await Guild.findById(guildId);
    
      if (!user || !guild) {
        throw new Error("User or guild not found");
      }
    
      if (!user.guild) {
        throw new Error("User is already a member of a guild");
      }
    
      guild.membersId.push(userId);
      await guild.save();
    
      user.guild = guildId;
      await user.save();
    
      return guild;
    },    
  },
};

module.exports = resolvers;