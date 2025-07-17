import './Legend.css';

function Legend({ selectedFeatures }) {
  const featureList = Object.keys(selectedFeatures).filter((name) => selectedFeatures[name]);

  return (
    <div className="legend">
      {featureList.map((f) => {
        const isRedSquare = f === 'Fire' || f === 'Prediction';
        const style = isRedSquare
          ? {
              width: 10,
              height: 10,
              backgroundColor: 'red',
            }
          : {
              width: 100,
              height: 10,
              background: 'linear-gradient(to right, rgb(255 255 0) 0%, rgb(0 0 255) 100%)',
            };

        return (
          <div className="legend-row" key={f}>
            <span className="legend-name">{f}</span>
            <span className="legend-bar" style={style} />
          </div>
        );
      })}
    </div>
  );
}

export default Legend;
