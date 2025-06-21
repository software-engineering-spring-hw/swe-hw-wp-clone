import { gql } from "@apollo/client";

export const GET_GROUP_MESSAGES = gql`
  query GetGroupMessages($groupId: ID!) {
    getGroupMessages(groupId: $groupId) {
      id
      groupId
      senderId
      content
      createdAt
      sender {
        id
        firstName
        lastName
        image
      }
    }
  }
`;

export const SEND_GROUP_MESSAGE = gql`
  mutation SendGroupMessage($groupId: ID!, $content: String!) {
    sendGroupMessage(groupId: $groupId, content: $content) {
      id
      groupId
      senderId
      content
      createdAt
      sender {
        id
        firstName
        lastName
        image
      }
    }
  }
`;

export const NEW_GROUP_MESSAGE = gql`
  subscription NewGroupMessage($groupId: ID!) {
    newGroupMessage(groupId: $groupId) {
      id
      groupId
      senderId
      content
      createdAt
      sender {
        id
        firstName
        lastName
        image
      }
    }
  }
`;
