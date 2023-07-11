import { Prisma } from "./db.js";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";

(async function() {
    const typeDefs = gql `
        type Post {
            id: String
            title: String
            name: String
        }

        type Query {
            getAllPosts: [Post]
        }

        type Mutation {
            createPost(title: String, name: String): Post
        }
    `

    interface createPostInput {
        title: string
        name: string
    }

    const resolvers = {
        Mutation: {
            createPost: async(_parent: any, args: createPostInput) => {
                const post = await Prisma.post.create({
                    data: {
                        title: args.title,
                        name: args.name
                    }
                });

                return post;
            }
        },
        Query: {
            getAllPosts: async () => {
                return Prisma.post.findMany();
            }
        }
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    const { url } = await startStandaloneServer(server, {
        listen: {port: 4000}
    });

    console.log("Server is ready at " + url);

})();