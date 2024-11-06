import { useReducer, useState, useEffect, createContext, ReactElement } from "react";
import { UserType, UsersContextTypes, ErrorOrSuccessReturn, MessageType, ConversationType } from '../../../server/types';

type ChildProp = { children: ReactElement };
type ReducerActionTypeVariations = 
  | { type: 'uploadData', allData: UserType[] }
  | { type: 'add', data: UserType }
  | { type: 'update', data: UserType };

const reducer = (state: UserType[], action: ReducerActionTypeVariations): UserType[] => {
  switch (action.type) {
    case "uploadData":
      return action.allData;
    case "add":
      return [...state, action.data];
    case "update":
      return state.map(user => user._id === action.data._id ? action.data : user);
    default:
      return state;
  }
};

const UsersContext = createContext<UsersContextTypes | undefined>(undefined);

const UsersProvider = ({ children }: ChildProp) => {
  const [users, dispatch] = useReducer(reducer, []);
  const [loggedInUser, setLoggedInUser] = useState<null | UserType>(null);

  // Patikrinti, ar `localStorage` turi `loggedInUser` informaciją, kai aplikacija užkraunama
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  // Kiekvieną kartą, kai atnaujinamas `loggedInUser`, išsaugoti jį `localStorage`
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }, [loggedInUser]);

  const addNewUser = async (user: Omit<UserType, "_id">): Promise<ErrorOrSuccessReturn> => {
    try {
      const res = await fetch(`http://localhost:5500/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      if (res.status === 409) {
        return await res.json();
      } else {
        const data = await res.json();
        dispatch({ type: 'add', data });
        setLoggedInUser(data);
        return { success: 'Sėkmingai prisiregistruota' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Serverio klaida. Bandykite vėliau.' };
    }
  };

  const logUserIn = async (userLoginInfo: Pick<UserType, 'username' | 'password'>): Promise<ErrorOrSuccessReturn> => {
    try {
      const res = await fetch(`http://localhost:5500/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userLoginInfo)
      });
      if (res.status === 401) {
        return await res.json();
      } else {
        const data = await res.json();
        setLoggedInUser(data);
        localStorage.setItem('loggedInUser', JSON.stringify(data)); // Saugo `localStorage`
        return { success: 'Prisijungimas sėkmingas. Tuoj būsite nukelti į Visi vartotojai puslapį.' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Serverio klaida. Bandykite vėliau.' };
    }
  };

  const updateUserProfile = async (updatedUser: UserType): Promise<ErrorOrSuccessReturn> => {
    try {
      const res = await fetch(`http://localhost:5500/api/users/${updatedUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
      });
      if (!res.ok) {
        const error = await res.json();
        return { error: error.message || "Įvyko klaida atnaujinant profilį" };
      } else {
        const data = await res.json();
        setLoggedInUser(data);
        dispatch({ type: 'update', data });
        return { success: "Profilis atnaujintas sėkmingai!" };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Serverio klaida.' };
    }
  };

  const logout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser'); // Ištrina `localStorage`
  };

  const startConversation = async (recipientId: string): Promise<ConversationType | ErrorOrSuccessReturn> => {
    try {
        const response = await fetch(`http://localhost:5500/api/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user1Id: loggedInUser?._id, user2Id: recipientId })
        });
        if (!response.ok) throw new Error("Failed to start conversation.");
  
        const conversation = await response.json();
        
        return { ...conversation, hasUnreadMessages: true }; // Pridedame hasUnreadMessages lauką
    } catch (err) {
        console.error("Error starting conversation:", err);
        return { error: "Nepavyko pradėti pokalbio." };
    }
  };
  
  
  const sendMessage = async (conversationId: string, message: Omit<MessageType, "_id">): Promise<MessageType | ErrorOrSuccessReturn> => {
    try {
      const response = await fetch(`http://localhost:5500/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      });
      if (!response.ok) throw new Error("Failed to send message.");
      return await response.json();
    } catch (err) {
      console.error("Error sending message:", err);
      return { error: "Nepavyko išsiųsti žinutės." };
    }
  };
  
  const likeMessage = async (messageId: string): Promise<ErrorOrSuccessReturn> => {
    try {
      const response = await fetch(`http://localhost:5500/api/messages/${messageId}/like`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to like message.");
      return { success: "Žinutė sėkmingai patiko." };
    } catch (err) {
      console.error("Error liking message:", err);
      return { error: "Nepavyko patikti žinutės." };
    }
  };
  
  useEffect(() => {
    fetch(`http://localhost:5500/api/users`)
    .then(res => res.json())
    .then(data => {
      //console.log("Gauti vartotojai:", data);
      dispatch({
        type: "uploadData",
        allData: data
      });
    })
      .catch(err => console.error(err));
    const localStorageInfo = localStorage.getItem('savedUserInfo');
    if(localStorageInfo){
      const userInfo = JSON.parse(localStorageInfo) as Pick<UserType, 'username' | 'password'>;
      logUserIn({ username: userInfo.username, password: userInfo.password });
    }
  }, []);
  
  return(
    <UsersContext.Provider
      value={{
        users,
        addNewUser,
        loggedInUser,
        setLoggedInUser,
        logUserIn,
        logout,
        updateUserProfile,
        startConversation,
        sendMessage,
        likeMessage
      }}
    >
      {children}
    </UsersContext.Provider>
  );
  };

export { UsersProvider };
export default UsersContext;
