import { Routes, Route, Navigate } from "react-router-dom";
import BaseOutlet from "./components/temples/BaseOutlet";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import AllUsers from "./components/pages/AllUsers";
import ParticularUser from "./components/pages/ParticularUser";
import ChatPage from "./components/pages/ChatPage";
import Conversations from "./components/pages/Conversations";
import { useContext } from "react";
import UsersContext from "./contexts/UserContext";

const App = () => {
  // Pritaikome Optional Chaining, kad patikrintume `UsersContext`
  const { loggedInUser } = useContext(UsersContext) || {};

  return (
    <Routes>
      {/* Patikriname, ar vartotojas yra prisijungęs */}
      {!loggedInUser ? (
        <Route path="*" element={<Navigate to="/login" />} />
      ) : (
        <Route path="/" element={<BaseOutlet />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/users/:id" element={<ParticularUser />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/conversations" element={<Conversations />} />
        </Route>
      )}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
