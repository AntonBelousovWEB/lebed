import { gql } from "@apollo/client";

export const GET_REF = gql `
    query Query {
        ctxRefUpdate {
            dataRef
        }
    }
`