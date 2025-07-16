import React, { useEffect } from 'react';
import './PointPanel.css';

function PointPanel({features, point, setActivePanel, setSelectedFeature, setSelectedShap}) {
  const spatiotemporal = ['Date', 'Longitude', 'Latitude'];
  // useEffect(() => {
  //   console.log('Point data updated:', point);
  // }, [point]);

  if (!point) return <div>No point selected</div>;

  // return (
  //   <div>
  //     <h3>Point Details</h3>
  //     <pre>{JSON.stringify(point, null, 2)}</pre>
  //   </div>
  // );

  const handleFeatureClick = (point, featureName) => {
    setSelectedFeature({point, feature: featureName});
    setActivePanel('feature');
  };

  const handleShapClick = (point) => {
    setSelectedShap(point);
    setActivePanel('shap');
  };

  return (
    <div>
      <h3>Point Details</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Point Details</h3>
        <button onClick={() => handleShapClick?.(point)}>
          View SHAP
        </button>
      </div>

      {spatiotemporal.map((k) => {
        if (point[k] == null) return null;
          return(
            <div className="row" key={k}>
              <span className="label">{k}</span>
              <span className="value">{point[k]}</span>
            </div>
          )
      })}

      {features.map((feat) => {
        const value = point[feat];
        const color = point[`${feat}_color`];
        const height = point[`${feat}_height`];

        return (
          <div className="row" 
            key={feat}
            onClick={() => handleFeatureClick?.(point, feat)}
            title={`Click to view ${feat} details`}
          >
            <span className="label">{feat}</span>
            <span className="value">{value}</span>
            <div
              className="bar"
              style={{
                height: '10px',
                width: `${Math.max(0, Math.min(100, height))}px`,
                backgroundColor: `rgb(${color})`,
                cursor: 'pointer'
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default PointPanel;
