function AboutPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>About This App</h2>
      <p>
        This application provides an interactive visualization of environmental and geospatial data
        related to wildfire prediction in California.
      </p>
      <p>
        Built with React and Node.js, it uses Deck.gl for map rendering and Plotly for statistical visualizations.
      </p>
      <p>
        The visualized model is a Support Vector Machine (SVM) trained on 2013 data. Input features include:
        date, latitude, longitude, elevation, EVI, LST, TA, wind, and fire occurrence.
      </p>
      <p>
        Model predictions and SHAP values are precomputed and displayed alongside the input data to
        provide insight into feature contributions for each prediction.
      </p>
    </div>
  );
}

export default AboutPage;
