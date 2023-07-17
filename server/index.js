const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const MONGODB = process.env.MONGODB_KEY

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const server = new ApolloServer({
    typeDefs,
    resolvers
}) 

mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connection successful");
        return server.listen({port: 3000});
    })
    .then((res) => {
        console.log(`Server running at ${res.url}`);
    });