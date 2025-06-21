import { gql } from "@apollo/client";

export const LEAVE_GROUP = gql`
  mutation LeaveGroup($groupId: ID!, $userId: ID!) {
    removeGroupMember(groupId: $groupId, userId: $userId)
  }
`;
