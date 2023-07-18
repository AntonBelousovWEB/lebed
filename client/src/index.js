import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  createHttpLink 
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context'
import { AuthProvider } from './context/authContext';

const link = createHttpLink({
  uri: process.env.REACT_APP_SERVER_LINK
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authrization: localStorage.getItem("token") || ""
    }
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(link)
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </AuthProvider>
);