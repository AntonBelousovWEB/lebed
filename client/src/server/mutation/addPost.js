import { gql } from "@apollo/client";

export const ADD_POST = gql `
    mutation AddPostInput($addPostInput: AddPostInput!) {
        addPost(addPostInput: $addPostInput) {
            title
            desc
            img
            link
        }
    }
`