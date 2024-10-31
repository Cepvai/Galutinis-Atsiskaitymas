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
  sentAt: string; // Gali būti ir Date tipo, jei naudojate laiką Date formatu
  liked?: boolean;
};

// Conversation type
export type ConversationType = {
  _id: string;
  participants: string[]; // Dalyviai kaip userId sąrašas
  messages: MessageType[]; // Žinučių masyvas
  createdAt: string; // Gali būti ir Date tipo
  hasUnreadMessages?: boolean;
};