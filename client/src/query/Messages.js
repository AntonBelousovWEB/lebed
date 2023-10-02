import { gql } from "@apollo/client";

export const GET_MESSAGES = gql `
    query Query {
        getMessages {
            color
            message
        }
    }
`