import { gql } from "@apollo/client";

export const CREATE_REF = gql `
    mutation EditCtxRef($editCtxRefInput: EditCtxRefInput!) {
        editCtxRef(editCtxRefInput: $editCtxRefInput) {
            dataRef
        }
    }
`