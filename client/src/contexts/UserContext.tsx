import { useReducer, useState, useEffect, createContext, ReactElement } from "react";
import { UserType, UsersContextTypes, ErrorOrSuccessReturn } from '../../../types';

type ChildProp = { children: ReactElement };
type ReducerActionTypeVariations = 
{ type: 'uploadData', allData: UserType[] } | 
{ type: 'add', data: UserType }

const reducer = (state: UserType[], action: ReducerActionTypeVariations): UserType[] => {
  switch(action.type){
    case "uploadData":
      return action.allData;
    case "add":
      return [...state, action.data];
  }
}

const UsersContext = createContext<UsersContextTypes | undefined>(undefined);

const UsersProvider = ({ children }: ChildProp) => {

  const [users, dispatch] = useReducer(reducer, []);
  const [loggedInUser, setLoggedInUser] = useState<null | UserType>(null);

  const addNewUser = async (user: Omit<UserType, "_id">): Promise<ErrorOrSuccessReturn> => {
    try{
      const res = await fetch(`http://localhost:5500/api/users`, {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify(user)
      });
      // console.log(res); // res su status ir kitais
      if(res.status === 409){ // vartotojas įvedė panaudotą username arba email
        const errMsg = await res.json();
        // console.log(errMsg, 'error');
        return errMsg;
      } else {
        const data = await res.json();
        // console.log(data, 'sekme');
        dispatch({
          type: 'add',
          data: data
        });
        setLoggedInUser(data);
        return { success: 'Sėkmingai prisiregistruota' };
      }
    } catch(err) {
      console.error(err);
      return { error: 'Bandant atsiūsti duomenis, įvyko serverio klaida. Prašome bandyti vėliau.' };
    } 
  }

  const logUserIn = async (userLoginInfo: Pick<UserType, 'email' | 'password'>): Promise<ErrorOrSuccessReturn> => {
    try {
      // console.log(userLoginInfo);
      const res = await fetch(`http://localhost:5500/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify(userLoginInfo)
      });
      // console.log(res);
      if(res.status === 401){ // neteisingos prisijungimo įvestys
        const error = await res.json();
        // console.log(error);
        return error;
      } else { // teisingos prisijungimo įvestys
        const data = await res.json();
        // console.log(data);
        setLoggedInUser(data);
        localStorage.setItem('savedUserInfo', JSON.stringify(userLoginInfo));
        return { success: 'Prisijungimas sėkmingas. Tuoj būsite nukelti į Home puslapį.' }
      }
    } catch(err) {
      console.error(err);
      return { error: 'Bandant prisijungti, įvyko serverio klaida. Prašome bandyti vėliau.' };
    }
  }

  const logout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('savedUserInfo');
  }

  useEffect(() => {
    fetch(`http://localhost:5500/api/users`)
      .then(res => res.json())
      .then(data => dispatch({
        type: "uploadData",
        allData: data
      }))
      .catch(err => console.error(err));
    const localStorageInfo = localStorage.getItem('savedUserInfo');
    if(localStorageInfo){
      const userInfo = JSON.parse(localStorageInfo) as Pick<UserType, 'email' | 'password'>;
      logUserIn({ email: userInfo.email, password: userInfo.password });
    }
  }, []);

  return(
    <UsersContext.Provider
      value={{
        users,
        addNewUser,
        loggedInUser,
        logUserIn,
        logout
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export { UsersProvider };
export default UsersContext;