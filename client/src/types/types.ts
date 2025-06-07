export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  image: string;
  isBlocked?: boolean;
  hasBlocked?: boolean;
};

export interface SidebarUser extends Omit<User, "username" | "password"> {
  isBlocked: boolean;
  hasBlocked: boolean;
  latestMessage: {
    content: string | null;
    createdAt: string | null;
  };
}

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
};
