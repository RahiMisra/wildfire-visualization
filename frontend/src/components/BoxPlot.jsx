import Plot from 'react-plotly.js';

const BoxPlot = ({ summary, selectedValue, title }) => {
  const { min, q1, median, q3, max } = summary;

  return (
    <Plot
      data={[
        {
          type: 'box',
          name: title,
          q1: [parseFloat(q1)],
          median: [parseFloat(median)],
          q3: [parseFloat(q3)],
          lowerfence: [parseFloat(min)],
          upperfence: [parseFloat(max)],
          boxpoints: false,
          orientation: 'v',
          showlegend: false,
          fillcolor: 'lightblue',
          line: { width: 1 },
        },
        {
          type: 'scatter',
          x: [title],
          y: [selectedValue],
          mode: 'markers',
          name: 'Selected Value',
          marker: { color: 'red', size: 10 },
        }
      ]}
      layout={{
        title,
        yaxis: { title: 'Value' },
        boxmode: 'overlay',
        margin: { t: 40, b: 40 },
        height: 300
      }}
    />
  );
};

export default BoxPlot;
