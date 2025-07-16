import { useState } from 'react'
import './Visualization.css'
import MapPanel from './MapPanel';
import FilterPanel from './FilterPanel';
import HoverPanel from './HoverPanel';
import PointPanel from './PointPanel';
import ShapPanel from './ShapPanel';
import FeaturePanel from './FeaturePanel';

// base this off of overall data range
const initialFeatureRange = {
  Latitude: [0, 1],
  Longitude: [0, 1],
  Elevation: [0, 1],
  EVI: [0, 1],
  TA: [0, 1],
  LST: [0, 1],
  Wind: [0, 1],
  Fire: [0, 1],
  Prediction: [0, 1]
};

function Visualization() {
  const features = ['Elevation', 'EVI', 'TA', 'LST', 'Wind', 'Fire'];
  const [selectedFeatures, setSelectedFeatures] = useState({
    Elevation: false, EVI: false, TA: false, LST: false, Wind: false, Fire: true, Prediction: false
  });

  const [predictionEnabled, setPredictionEnabled] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date(2020, 0, 1));

  const [featureRanges, setFeatureRanges] = useState(initialFeatureRange);
  const [activeRanges, setActiveRanges] = useState(initialFeatureRange);

  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [pointHover, setPointHover] = useState(null);

  const [activePanel, setActivePanel] = useState('map');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedShap, setSelectedShap] = useState(null);

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
          predictionEnabled={predictionEnabled}
        />  
      </div>
      <div className="map-panel">
        {activePanel === 'map' && (
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
            predictionEnabled={predictionEnabled}
            setPredictionEnabled={setPredictionEnabled}
          />
        )}
        {activePanel === 'feature' && (
          <FeaturePanel 
            onBack={() => setActivePanel('map')}
            selectedFeature={selectedFeature}
          />
        )}
        {activePanel === 'shap' && (
          <ShapPanel
            onBack={() => setActivePanel('map')}
            selectedShap={selectedShap}
          />
        )}
      </div>
      <div className="hover-panel">
        <HoverPanel
          point={pointHover}
          features={features}
        />
      </div>
      <div className="point-panel-a">
        <PointPanel
          features={features}
          point={pointA}
          setActivePanel={setActivePanel}
          setSelectedFeature={setSelectedFeature}
          setSelectedShap={setSelectedShap}
          predictionEnabled={predictionEnabled}
        />
      </div>
      <div className="point-panel-b">
        <PointPanel
          features={features}
          point={pointB}
          setActivePanel={setActivePanel}
          setSelectedFeature={setSelectedFeature}
          setSelectedShap={setSelectedShap}
          predictionEnabled={predictionEnabled}
        />
      </div>
    </div>
  );
}

export default Visualization
