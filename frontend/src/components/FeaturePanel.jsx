const FeaturePanel = ({onBack, selectedFeature}) => {
  const { point, feature } = selectedFeature;

  return (
    <div className="custom-panel">
      <button onClick={() => onBack()}>← Back to Map</button>
      <h2>Feature Panel</h2>
      <div>
        <p><strong>Date:</strong> {point.Date}</p>
        <p><strong>Latitude:</strong> {point.Latitude}</p>
        <p><strong>Longitude:</strong> {point.Longitude}</p>
        <p><strong>{feature} value:</strong> {point[feature]}</p>
      </div>
    </div>
  );
};

export default FeaturePanel;