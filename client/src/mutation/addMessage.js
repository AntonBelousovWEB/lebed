import { gql } from "@apollo/client";

export const ADD_MESSAGE = gql `
    mutation AddMessage($addMessageInput: AddMessageInput!) {
        addMessage(addMessageInput: $addMessageInput) {
            color
            message
        }
    }
`