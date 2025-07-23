import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Playlist from "./pages/Playlist";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="playlist/:collectionName" element={<Playlist />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
