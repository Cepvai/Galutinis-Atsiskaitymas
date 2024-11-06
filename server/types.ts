import { ObjectId } from "mongodb";

export type UserType = {
  _id: string| ObjectId;
  email: string;
  username: string;
  password: string;
  password_visible: string;
  profileImage?: string;
};
export type UsersContextTypes = {
  users: UserType[],
  addNewUser: (user: Omit<UserType, "_id">) => Promise<ErrorOrSuccessReturn>,
  loggedInUser: UserType | null,
  setLoggedInUser: (user: UserType | null) => void,
  logUserIn: (userLoginInfo: Pick<UserType, "username" | "password">) => Promise<ErrorOrSuccessReturn>,
  logout: () => void
  updateUserProfile: (updatedUser: UserType) => Promise<ErrorOrSuccessReturn>;
  startConversation: (recipientId: string) => Promise<ConversationType | ErrorOrSuccessReturn>,
  sendMessage: (conversationId: string, message: Omit<MessageType, "_id">) => Promise<MessageType | ErrorOrSuccessReturn>,
  likeMessage: (messageId: string) => Promise<ErrorOrSuccessReturn>
}
export type ErrorOrSuccessReturn = { error: string } | { success: string };

// Message type
export type MessageType = {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string; 
  liked?: boolean;
  isRead: boolean;
};

// Conversation type
export type ConversationType = {
  _id: string;
  participants: (string | ObjectId)[];
  messages: MessageType[];
  createdAt: Date;
};