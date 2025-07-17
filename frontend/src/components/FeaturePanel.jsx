import React, { useEffect, useState } from 'react';
import BoxPlot from './BoxPlot';

const FeaturePanel = ({ onBack, selectedFeature }) => {
  const { point, feature } = selectedFeature;
  const [dateSummary, setDateSummary] = useState(null);
  const [yearSummary, setYearSummary] = useState(null);

  useEffect(() => {
    if (!point || !feature) return;

    const date = point.Date;
    const year = new Date(date).getFullYear();

    const fetchDateSummary = async () => {
      try {
        const res = await fetch(`http://localhost:3001/summary/date/${date}`);
        if (!res.ok) throw new Error('Date summary not available');
        const data = await res.json();
        setDateSummary(data);
      } catch (err) {
        console.error('Failed to fetch date summary:', err);
        setDateSummary(null);
      }
    };

    const fetchYearSummary = async () => {
      try {
        const res = await fetch(`http://localhost:3001/summary/year/${year}`);
        if (!res.ok) throw new Error('Year summary not available');
        const data = await res.json();
        setYearSummary(data);
      } catch (err) {
        console.error('Failed to fetch year summary:', err);
        setYearSummary(null);
      }
    };

    fetchDateSummary();
    fetchYearSummary();
  }, [point, feature]);

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Date Summary Row */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start' }}>
          <div>
            <h3>Feature Summary (Date)</h3>
            {dateSummary ? (
              <pre>{JSON.stringify(getFeatureStats(dateSummary, feature), null, 2)}</pre>
            ) : (
              <p>Loading or unavailable...</p>
            )}
          </div>
          <div style={{ width: '300px' }}>
            {dateSummary && (
              <BoxPlot
                summary={getFeatureStats(dateSummary, feature)}
                selectedValue={point[feature]}
                title=""
              />
            )}
          </div>
        </div>

        {/* Year Summary Row */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start' }}>
          <div>
            <h3>Feature Summary (Year)</h3>
            {yearSummary ? (
              <pre>{JSON.stringify(getFeatureStats(yearSummary, feature), null, 2)}</pre>
            ) : (
              <p>Loading or unavailable...</p>
            )}
          </div>
          <div style={{ width: '300px' }}>
            {yearSummary && (
              <BoxPlot
                summary={getFeatureStats(yearSummary, feature)}
                selectedValue={point[feature]}
                title=""
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility to extract just the summary values for the selected feature
function getFeatureStats(summaryRow, feature) {
  const stats = {};
  const suffixes = ['min', 'q1', 'median', 'q3', 'max', 'mean', 'std'];
  for (const suffix of suffixes) {
    const key = `${feature}_${suffix}`;
    if (summaryRow[key] !== undefined) {
      stats[suffix] = summaryRow[key];
    }
  }
  return stats;
}

export default FeaturePanel;
