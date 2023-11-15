import { gql } from '@apollo/client'

export const GET_ALL_USERS = gql `
  query Users($name: String) {
    getUser(name: $name) {
      color
      level
      name
    }
  }
`