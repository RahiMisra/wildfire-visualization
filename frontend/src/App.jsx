import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Visualization from './components/Visualization';
import About from './components/About';
import Download from './components/Download';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/">Visualization</Link>
          <Link to="/about">About</Link>
          <Link to="/download">Download Data</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Visualization/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/download" element={<Download/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
