import { Routes, Route } from "react-router-dom";
import BaseOutlet from "./components/temples/BaseOutlet";
import Home from "./components/pages/Home"; 
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import AllUsers from "./components/pages/AllUsers";
import ParticularUser from "./components/pages/ParticularUser";

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
        </Route>
      </Routes>
  );
};

export default App;
