const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        name: String
        password: String
        tokenJWT: String
        color: String
        level: Int
        guild: String
    }

    type Guild {
        name: String
        ownerId: String
        membersId: User
        level: Int
    }

    input RegisterUserInput {
        name: String
        password: String
        color: String
    }

    input LoginUserInput {
        name: String
        password: String
    }

    input GuildInput {
        name: String
    }

    input AddMemberInput {
        userId: ID!
        guildId: ID!
    }          

    type Query {
        users(ID: ID!): User!
        getUser(amount: Int): [User]
        guild(ID: ID!): Guild!
    }

    type Mutation {
        registerUser(registerUserInput: RegisterUserInput): User!
        loginUser(loginUserInput: LoginUserInput): User!
        deleteUser(ID: ID!): Boolean
        createGuild(guildInput: GuildInput, ownerId: String): Guild!
        deleteGuild(ID: ID!, ownerId: String): Boolean
        addMemberGuild(input: AddMemberInput!): Guild!
    }
`