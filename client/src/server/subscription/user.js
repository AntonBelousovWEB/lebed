import { gql } from "@apollo/client";

export const LEVEL_UPDATED = gql `
    subscription Subscription {
        levelUpdated {
            level
        }
    }
`