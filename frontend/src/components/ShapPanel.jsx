import ShapPlot from './ShapPlot';

const ShapPanel = ({ onBack, selectedShap }) => {
  if (!selectedShap) return null;
  const shapData = selectedShap
    ? (({ Fire_shap, ...rest }) => rest)(selectedShap)
    : null;

  const { Latitude, Longitude, Date, ...shapValues } = shapData;

  return (
    <div className="custom-panel">
      <button onClick={onBack}>← Back to Map</button>
      <h2>SHAP Panel</h2>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <p><strong>Latitude:</strong> {Latitude}</p>
          <p><strong>Longitude:</strong> {Longitude}</p>
          <p><strong>Date:</strong> {Date}</p>

          <h3>SHAP Values</h3>
          {Object.entries(shapValues).map(([feature, value]) => (
            <p key={feature}>
              <strong>{feature}:</strong> {parseFloat(value).toFixed(4)}
            </p>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <ShapPlot shapData={shapData} />
        </div>
      </div>
    </div>
  );
};

export default ShapPanel;
