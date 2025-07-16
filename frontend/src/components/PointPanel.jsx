import React, { useEffect, useState } from 'react';
import './PointPanel.css';

function PointPanel({features, point, setActivePanel, setSelectedFeature, setSelectedShap, predictionEnabled}) {
  const [shapEnabled, setShapEnabled] = useState(false);
  const [shapValues, setShapValues] = useState(null);
  const spatiotemporal = ['Date', 'Longitude', 'Latitude'];
  // useEffect(() => {
  //   console.log('Point data updated:', point);
  // }, [point]);

  useEffect(() => {
    if(!point) return;
    setShapEnabled(false);
    setShapValues(null);

    const { Date, Latitude, Longitude } = point;
    if (!Date || Latitude == null || Longitude == null) return;

    const url = `http://localhost:3001/shap/${Date}/${Latitude}/${Longitude}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('No SHAP data');
        return res.json();
      })
      .then(data => {
        setShapValues(data);
        setShapEnabled(true);
      })
      .catch(() => {
        setShapEnabled(false);
        setShapValues(null);
      });
  }, [point]);

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

  if (!point) return <div>No point selected</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Point Details</h3>
        {shapEnabled && (
          <button onClick={() => handleShapClick(shapValues)}>
            View SHAP
          </button>
        )}
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
      {predictionEnabled && (
        console.log('Rendering Prediction feature'),
        <div
          className="row"
          key="Prediction"
          onClick={() => handleFeatureClick?.(point, 'Prediction')}
          title="Click to view Prediction details"
        >
          <span className="label">Prediction</span>
          <span className="value">{point['Prediction']}</span>
          <div
            className="bar"
            style={{
              height: '10px',
              width: `${Math.max(0, Math.min(100, point['Prediction_height']))}px`,
              backgroundColor: `rgb(${point['Prediction_color']})`,
              cursor: 'pointer'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PointPanel;
