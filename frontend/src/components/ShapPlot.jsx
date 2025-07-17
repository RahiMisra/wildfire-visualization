import Plot from 'react-plotly.js';

const ShapPlot = ({ shapData }) => {
  if (!shapData) return null;

  const { Latitude, Longitude, Date, ...shapValues } = shapData;

  // Convert to array and sort by absolute value descending
  const sorted = Object.entries(shapValues)
    .map(([feature, value]) => ({ feature, value: parseFloat(value) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const features = sorted.map(d => d.feature);
  const values = sorted.map(d => d.value);

  return (
    <Plot
      data={[
        {
          type: 'bar',
          orientation: 'h',
          x: values,
          y: features,
          marker: {
            color: values.map(v => v >= 0 ? 'rgba(255,100,100,0.75)' : 'rgba(100,100,255,0.75)'), // red/blue
          },
        }
      ]}
      layout={{
        title: 'SHAP Values by Feature',
        height: Math.max(300, features.length * 20),
        margin: { l: 150, r: 150, t: 20, b: 20 },
        xaxis: { title: 'SHAP Value' },
      }}
    />
  );
};

export default ShapPlot;
