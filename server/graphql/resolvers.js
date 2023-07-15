const User = require('../models/User');
const Guild = require('../models/Guild')

const resolvers = {
  Query: {
    async users(_, { ID }) {
      return await User.findById(ID);
    },
    async getUser(_, { amount }) {
      return await User.find().limit(amount);
    },
    async guild(_, { ID }) {
        return await Guild.findById(ID)
    }
  },
  Mutation: {
    async createUser(_, { userInput: { name, password, color } }) {
      const createdUser = new User({
        name: name,
        password: password,
        tokenJWT: password,
        color: color,
        level: 0,
        guild: ""
      });

      const res = await createdUser.save();

      return {
        id: res.id,
        ...res._doc
      };
    },

    async deleteUser(_, { ID }) {
      const wasDeleted = (await User.deleteOne({ _id: ID })).deletedCount;
      return wasDeleted === 1;
    },

    async editUser(_, { ID, userInput: { name, password } }) {
      const wasEdited = (await User.updateOne(
        { _id: ID },
        { name: name, password: password }
      )).modifiedCount;
      return wasEdited === 1;
    },

    async createGuild(_, { guildInput: { name }, ownerId }) {
      const createdGuild = new Guild({
        name: name,
        ownerId: ownerId,
        level: 0,
      });
    
      const user = await User.findById(ownerId);
    
      if (user.guild !== "") {
        throw new Error(`user ${user.name} has a guild!`);
      } else {
        const res = await createdGuild.save();
    
        user.guild = res.id;
        await user.save();
    
        return {
          id: res.id,
          ...res._doc,
        };
      }
    },
    
    async deleteGuild(_, { ID }) {
      
    }
  },
};

module.exports = resolvers;