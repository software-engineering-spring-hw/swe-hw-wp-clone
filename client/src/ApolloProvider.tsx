import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import App from "./App";

const isProduction = process.env.NODE_ENV === "production";

let httpLink: any = new HttpLink({
  uri: isProduction ?
    `https://${process.env.REACT_APP_BASE_URL_PRODUCTION}` :
    `http://${process.env.REACT_APP_BASE_URL}`
});

const authLink = setContext((_, { headers }: any) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  uri: isProduction ?
    `wss://${process.env.REACT_APP_BASE_URL_PRODUCTION}` :
    `ws://${process.env.REACT_APP_BASE_URL}/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);