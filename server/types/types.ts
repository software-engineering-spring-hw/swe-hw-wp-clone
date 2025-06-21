export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  image: string;
};

export type LatestMessage = {
  content: string;
  createdAt: string;
};

export type SendMessagePayload = {
  senderId: string;
  recipientId: string;
  content: string;
};

export type ContextUser = Pick<User, "id" | "firstName" | "lastName">;

export type Group = {
  id: string;
  name: string;
  createdAt: string;
};

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  createdAt: string;
};

export type GroupMessage = {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
};