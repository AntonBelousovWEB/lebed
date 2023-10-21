import { gql } from "@apollo/client";

export const GET_POST = gql `
    query Query {
        getPost {
            title
            desc
            img
            link
        }
    }
`