const User = require('../models/User');
const Guild = require('../models/Guild');
const ctxRef = require('../models/ctxRef');
const Message = require('../models/message');
const Post = require('../models/Post')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PubSub } = require('graphql-subscriptions');
const { ApolloError, UserInputError } = require('apollo-server');
const NodeRSA = require('node-rsa');
const dotenv = require('dotenv');
const key = new NodeRSA({ b: 512 });

dotenv.config();
const pubsub = new PubSub();

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
    ctxRefUpdate: async (_, { amount }) => {
      return await ctxRef.find().limit(amount);
    },
    getMessages: async (_, { amount }) => {
      const messages = await Message.find().limit(amount);
      const decryptedMessages = messages.map(message => {
          const decryptedMessage = key.decrypt(message.message, 'utf8');
          return {
              ...message._doc,
              message: decryptedMessage,
          };
      });   
      return decryptedMessages;
    },  
    getPost: async (_, { amount }) => {
      return await Post.find().limit(amount);
    }
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
          name,
          color,
          level: 0
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
            name: user.name,
            level: user.level
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
        throw new Error("Incorrect password or name!");
      }
    },    

    deleteUser: async (_, { ID }) => {
      const { deletedCount } = await User.deleteOne({ _id: ID });
      return deletedCount === 1;
    },

    updateLvlUser: async (_, { updateLvlUserInput: { name, level } }) => {
      try {
        const user = await User.findOne({name});
        const updatedLevel = user.level + level;
        const result = await User.updateOne({ name }, { $set: { level: updatedLevel } });
        return result;
      } catch(err) {
        throw new Error(err)
      }
    },

    // //////////////////////////////////////////////////////////

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
    
    async editCtxRef(_, { editCtxRefInput: { dataRef, token } }) {
      try {
        // const user = await User.findOne({ tokenJWT: token });
        // if (!user) {
        //   throw new UserInputError('User not found');
        // }
    
        const name = process.env.NAME_REF;
        const existingRef = await ctxRef.findOne({ name });
    
        if (existingRef) {
          const wasEdited = (await ctxRef.updateOne({ name }, { dataRef })).modifiedCount;
    
          if (wasEdited) {
            pubsub.publish('CTX_REF_UPDATED', { ctxRefUpdated: existingRef });
          }
    
          return wasEdited;
        } else {
          const createdCtxRef = new ctxRef({
            name,
            dataRef,
          });
    
          const res = await createdCtxRef.save();
    
          if (res) {
            pubsub.publish('CTX_REF_UPDATED', { ctxRefUpdated: res });
          }
    
          return {
            id: res.id,
            ...res._doc,
          };
        }
      } catch (error) {
        console.error('Error in editCtxRef:', error);
        throw new ApolloError('Failed to edit ctxRef', 'EDIT_CTX_REF_ERROR');
      }
    }, 
    async addMessage(_, { addMessageInput: { color, message } }) {
      try {
        const encryptedMessage = key.encrypt(message, 'base64');
        const decryptedMessage = key.decrypt(encryptedMessage, 'utf8');

        if(message.length > 150 || message.length < 1) {
          throw new Error('Error send Message!');
        }

        const addMessage = new Message({
         color,
         message: encryptedMessage
        });

        const res = await addMessage.save();
    
        if (res) {
          pubsub.publish('CHAT_UPDATED', { chatUpdated: { ...res, color, message: decryptedMessage }});
        }

        return {
          id: res.id,
          ...res._doc,
        };
      } catch(error) {
        throw new Error(error);
      }
    },
    async addPost(_, { addPostInput: { title, desc, img, link } }) {
      try {
        const addPost = new Post({
          title,
          desc,
          img,
          link
        });
        const res = await addPost.save();

        if (res) {
          pubsub.publish('POST_UPDATED', { postUpdated: res });
        }

        return {
          id: res.id,
          ...res._doc,
        };
      } catch(error) {
        throw new Error(error);
      }
    }
  },
  Subscription: {
    ctxRefUpdated: {
      subscribe: () => pubsub.asyncIterator(['CTX_REF_UPDATED']),
    },
    chatUpdated: {
      subscribe: () => pubsub.asyncIterator(['CHAT_UPDATED']),
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterator(['POST_UPDATED']),
    }
  },
};

module.exports = resolvers;