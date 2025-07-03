import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import MapPanel from './components/MapPanel';
// import FilterPanel from './components/FilterPanel';
// import HoverPanel from './components/HoverPanel';
// import PointPanel from './components/PointPanel';

function App() {
  return (
    <div className="app-grid">
      {/* <FilterPanel />
      <MapPanel />
      <HoverPanel />
      <PointPanel /> */}
      <MapPanel />
    </div>
  );
}

export default App
