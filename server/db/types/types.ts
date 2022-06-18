export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  image: string;
};

export type SendMessagePayload = {
  senderId: string;
  recipientId: string;
  content: string;
};