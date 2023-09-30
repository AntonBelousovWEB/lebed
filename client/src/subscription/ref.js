import { gql } from "@apollo/client";

export const CTX_REF_UPDATED = gql `
    subscription Subscription {
        ctxRefUpdated {
            dataRef
        }
    }
`