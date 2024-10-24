export type UserType = {
  _id: string,
  email: string,
  username: string,
  password: string,
  password_visible: string,
  role: "user" | "admin"
};
export type UsersContextTypes = {
  users: UserType[],
  addNewUser: (user: Omit<UserType, "_id">) => Promise<ErrorOrSuccessReturn>,
  loggedInUser: UserType | null,
  logUserIn: (userLoginInfo: Pick<UserType, "email" | "password">) => Promise<ErrorOrSuccessReturn>,
  logout: () => void
}
export type ErrorOrSuccessReturn = { error: string } | { success: string };

// export type CommentType = {
//   _id: string,
//   userId: UserType['_id'],
//   restaurantId: string, // RestaurantType['_id'],
//   comment: string,
//   rating: 1 | 2 | 3 | 4 | 5,
//   dateTime: string,
//   likes: UserType['_id'][]
// };