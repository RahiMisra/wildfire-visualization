import './Legend.css';

function Legend({selectedFeatures}) {
    const featureList = Object.keys(selectedFeatures).filter((name) => selectedFeatures[name]);
    return (
        <div className="legend">
            {featureList.map((f) => {
                const gradient = `linear-gradient(to right, rgb(255 255 0) 0%, rgb(0 0 255) 100%)`;
                return (
                <div className="legend-row" key={f}>
                    <span className="legend-name">{f}</span>
                    <span
                    className="legend-bar"
                    style={{
                        width: 100,
                        height: 10,
                        background: gradient
                    }}
                    />
                </div>
                );
            })}
        </div>
    )
}
export default Legend;