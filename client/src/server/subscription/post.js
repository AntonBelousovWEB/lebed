import { gql } from "@apollo/client";

export const POST_UPDATED = gql `
    subscription Subscription {
        postUpdated {
            title
            desc
            img
            link
        }
    }
`