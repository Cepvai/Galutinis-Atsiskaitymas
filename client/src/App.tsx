import { Routes, Route } from "react-router-dom";
import BaseOutlet from "./components/temples/BaseOutlet";
import Home from "./components/pages/Home"; 
import Register from "./components/pages/Register";


const App = () => {
  return (
      <Routes>
      <Route path='/register' element={<Register />} />
        <Route path="/" element={<BaseOutlet />}>
          <Route index element={<Home />} /> 
        </Route>
      </Routes>
  );
};

export default App;
