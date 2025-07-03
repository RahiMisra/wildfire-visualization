// src/components/MapPanel.jsx
import { ScatterplotLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import React, { useEffect, useState } from 'react';

const INITIAL_VIEW_STATE = {
    longitude: -123.75,
    latitude: 41.99,
    zoom: 5,
    pitch: 0,
    bearing: 0
};

const sampleData = [
  { position: [-122.45, 37.78], value: 10 },
  { position: [-122.4, 37.76], value: 20 }
];

function MapPanel() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/data/2020-01-01')
            .then(response => response.json())
            .then(data => {
            console.log('Fetched raw data:', data);
            if (typeof data[0].Latitude === 'string') {
                console.error('Latitude is a string — will need to convert to number.');
            }
            setData(data);
        });
    }, []);


    const layers = [
        new ScatterplotLayer({
            id: 'scatterplot-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: d => d.Elevation,
            getFillColor: (d, {index}) => [index * 20 % 255, 100, 200],
            radiusMinPixels: 5,
            pickable: true,
            onClick: ({object, index}) => {
                console.log(`Clicked on point #${index}:`, object);
            }
        })
    ];
  return (
    <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller={true}
    layers={layers}
    />
  );
}

export default MapPanel;
