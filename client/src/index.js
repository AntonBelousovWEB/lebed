import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  createHttpLink 
} from "@apollo/client";

const link = createHttpLink({
  uri: process.env.REACT_APP_SERVER_LINK
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);