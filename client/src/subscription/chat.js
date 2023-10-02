import { gql } from "@apollo/client";

export const CHAT_UPDATED = gql `
    subscription Subscription {
        chatUpdated {
            color
            message
        }
    }
`