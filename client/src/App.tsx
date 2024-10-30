import { Routes, Route } from "react-router-dom";
import BaseOutlet from "./components/temples/BaseOutlet";
import Home from "./components/pages/Home"; 
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import AllUsers from "./components/pages/AllUsers";
import ParticularUser from "./components/pages/ParticularUser";
import ChatPage from "./components/pages/ChatPage";
import Conversations from "./components/pages/Conversations";

const App = () => {
  return (
      <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
        <Route path="/" element={<BaseOutlet />}>
          <Route index element={<Home />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/users/:id" element={<ParticularUser />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/conversations" element={<Conversations />} />
        </Route>
      </Routes>
  );
};

export default App;