const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        name: String
        password: String
        tokenJWT: String
        color: String
        level: Float
        guild: String
        badges: Badges
    }

    type Badges {
        owner: Boolean
        admin: Boolean
        topOne: Boolean
        topGuild: Boolean
    }

    type Guild {
        name: String
        ownerId: String
        membersId: User
        level: Int
    }

    type CtxRef {
        name: String
        dataRef: String
    }

    type Message {
        color: String
        message: String
    }

    type Post {
        title: String
        desc: String
        img: String
        link: String
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

    input UpdateLvlUser {
        name: String
        level: Float
    }

    input GuildInput {
        name: String
    }

    input AddMemberInput {
        userId: ID!
        guildId: ID!
    }      

    input AddPostInput {
        title: String!
        desc: String!
        img: String
        link: String
    }
    
    input EditCtxRefInput {
        dataRef: String!
        token: String!
    }

    input AddMessageInput {
        color: String!
        message: String!
    }

    input KeyInput {
        id: String!
    }

    type Query {
        users(ID: ID!): User!
        getUser(amount: Int, name: String): [User]
        guild(ID: ID!): Guild!
        ctxRefUpdate(amount: Int): [CtxRef]
        getMessages(amount: Int): [Message]
        getPost(amount: Int): [Post]
    }

    type Subscription {
        ctxRefUpdated: CtxRef
        chatUpdated: Message
        postUpdated: Post
        levelUpdated: User
    }

    type Mutation {
        registerUser(registerUserInput: RegisterUserInput, key: KeyInput): User
        loginUser(loginUserInput: LoginUserInput): User!
        updateLvlUser(updateLvlUserInput: UpdateLvlUser): User!
        deleteUser(ID: ID!): Boolean
        createGuild(guildInput: GuildInput, ownerId: String): Guild!
        deleteGuild(ID: ID!, ownerId: String): Boolean
        addMemberGuild(input: AddMemberInput!): Guild!
        editCtxRef(editCtxRefInput: EditCtxRefInput!): CtxRef
        addMessage(addMessageInput: AddMessageInput!): Message
        addPost(addPostInput: AddPostInput!): Post
    }
`