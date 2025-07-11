import { useState } from 'react'
import './Visualization.css'
import MapPanel from './MapPanel';
import FilterPanel from './FilterPanel';
import HoverPanel from './HoverPanel';
import PointPanel from './PointPanel';

// base this off of overall data range
const initialFeatureRange = {
  Elevation: [0, 1],
  EVI: [0, 1],
  TA: [0, 1],
  LST: [0, 1],
  Wind: [0, 1],
  Fire: [0, 1]
};

function Visualization() {
  const features = ['Elevation', 'EVI', 'TA', 'LST', 'Wind', 'Fire'];
  const [selectedFeatures, setSelectedFeatures] = useState({
    Elevation: false, EVI: false, TA: false, LST: false, Wind: false, Fire: true
  });
  const [selectedDate, setSelectedDate] = useState(new Date(2020, 0, 1));

  const [featureRanges, setFeatureRanges] = useState(initialFeatureRange);
  const [activeRanges, setActiveRanges] = useState(initialFeatureRange);

  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [pointHover, setPointHover] = useState(null);

  return (
    <div className="grid-container">
      <div className="filter-panel">  
        <FilterPanel
          features={features}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedFeatures={selectedFeatures}
          setSelectedFeatures={setSelectedFeatures}
          featureRanges={featureRanges}
          activeRanges={activeRanges}
          setActiveRanges={setActiveRanges}
        />  
      </div>
      <div className="map-panel">
        <MapPanel
          features={features}
          selectedDate={selectedDate}
          selectedFeatures={selectedFeatures}
          featureRanges={featureRanges}
          setFeatureRanges={setFeatureRanges}
          activeRanges={activeRanges}
          setActiveRanges={setActiveRanges}
          setPointA={setPointA}
          setPointB={setPointB}
          setPointHover={setPointHover}
        />
      </div>
      <div className="hover-panel">
        <HoverPanel
          point={pointHover}
        />
      </div>
      <div className="point-panel-a">
        <PointPanel
          features={features}
          point={pointA}
        />
      </div>
      <div className="point-panel-b">
        <PointPanel
          features={features}
          point={pointB}
        />
      </div>
    </div>
  );
}

export default Visualization
