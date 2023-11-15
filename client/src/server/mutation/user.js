import { gql } from "@apollo/client";

export const REGISTER_USER = gql `
    mutation Mutation($registerUserInput: RegisterUserInput) {
        registerUser(registerUserInput: $registerUserInput) {
            color
            guild
            level
            name
            tokenJWT
        }
    }
`
export const LOGIN_USER = gql `
    mutation LoginUser($loginUserInput: LoginUserInput) {
        loginUser(loginUserInput: $loginUserInput) {
            color
            guild
            level
            name
            tokenJWT
        }
    }
`

export const UPDATE_LVL = gql `
    mutation UpdateLvlUser($updateLvlUserInput: UpdateLvlUser) {
        updateLvlUser(updateLvlUserInput: $updateLvlUserInput) {
            name
            level
        }
    }
`