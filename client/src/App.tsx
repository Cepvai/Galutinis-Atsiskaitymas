import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BaseOutlet from "./components/temples/BaseOutlet";
import Home from "./components/pages/Home"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BaseOutlet />}>
          <Route index element={<Home />} /> 
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
