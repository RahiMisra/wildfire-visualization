const ShapPanel = ({onBack, selectedShap}) => {
  return (
    <div className="custom-panel">
      <button onClick={() => onBack()}>← Back to Map</button>
      <h2>Shap Panel</h2>
      <p>Latitude: {selectedShap?.Latitude}</p>
      <p>Longitude: {selectedShap?.Longitude}</p>
      <p>Date: {selectedShap?.Date}</p>
      <p>[SHAP values will go here]</p>
    </div>
  );
};


export default ShapPanel;
