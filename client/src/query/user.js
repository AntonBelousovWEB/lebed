import { gql } from '@apollo/client'

export const GET_ALL_USERS = gql `
    query Users {
        getUser {
            color
            level
            name
        }
    }
`