import { ScatterplotLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import {DataFilterExtension} from '@deck.gl/extensions';
import React, { useEffect, useState, useRef } from 'react';

const INITIAL_VIEW_STATE = {
    longitude: -123.75,
    latitude: 41.99,
    zoom: 1,
    pitch: 0,
    bearing: 0
};

function MapPanel({selectedDate, selectedFeatures, featureRanges, setFeatureRanges, activeRanges, setActiveRanges, setPointA, setPointB, setPointHover}) {
    const [data, setData] = useState([]);
    const clickCounter = useRef(0);

    const formattedDate = selectedDate.toLocaleDateString('en-CA');
    // console.log('Selected date in MapPanel:', formattedDate);
    // console.log('Selected features in MapPanel:', selectedFeatures);

    useEffect(() => {
        fetch(`http://localhost:3001/data/${formattedDate}`)
            .then(response => response.json())
            .then(data => {
                setData(data);

                const newFeatureRanges = {
                    Elevation: getMinMax(data, 'Elevation'),
                    EVI: getMinMax(data, 'EVI'),
                    TA: getMinMax(data, 'TA'),
                    LST: getMinMax(data, 'LST'),
                    Wind: getMinMax(data, 'Wind'),
                    Fire: [0, 1]
                };
                setFeatureRanges(newFeatureRanges);
                setActiveRanges(newFeatureRanges);
            });
    }, [formattedDate]);
    
    
    const getColorScale = (value, min, max) => {
        const t = (value - min) / (max - min);
        const r = Math.round(255 * (1 - t));
        const g = Math.round(255 * (1 - t));
        const b = Math.round(255 * t);
        return [r, g, b];
    };
    const getMinMax = (data, feature) => {
        const values = data
            .map(d => parseFloat(d[feature]))
            .filter(v => !isNaN(v));
        return [Math.min(...values), Math.max(...values)];
    };
    const clickHandler = (point) => {
        if (clickCounter.current % 2 === 0) {
            setPointA(point);
        } else {
            setPointB(point);
        }
        clickCounter.current++;
    };
    const resetSelection = () => {
        setSelectedPointA(null);
        setSelectedPointB(null);
        clickCounter.current = 0;
    };

    const layers = [
        new ScatterplotLayer({
            id: 'elevation-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => getColorScale(d.Elevation, featureRanges.Elevation[0], featureRanges.Elevation[1]),
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.Elevation,
            getFilterValue: d => d.Elevation,
            filterRange: activeRanges.Elevation,
            extensions: [new DataFilterExtension({filterSize: 1})]
        }),
        new ScatterplotLayer({
            id: 'evi-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => getColorScale(d.EVI, featureRanges.EVI[0], featureRanges.EVI[1]),
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.EVI,
            getFilterValue: d => d.EVI,
            filterRange: activeRanges.EVI,
            extensions: [new DataFilterExtension({filterSize: 1})]
        }),
        new ScatterplotLayer({
            id: 'ta-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => getColorScale(d.TA, featureRanges.TA[0], featureRanges.TA[1]),
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.TA,
            getFilterValue: d => d.TA,
            filterRange: activeRanges.TA,
            extensions: [new DataFilterExtension({filterSize: 1})]
        }),
        new ScatterplotLayer({
            id: 'lst-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => getColorScale(d.LST, featureRanges.LST[0], featureRanges.LST[1]),
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.LST,
            getFilterValue: d => d.LST,
            filterRange: activeRanges.LST,
            extensions: [new DataFilterExtension({filterSize: 1})]
        }),
        new ScatterplotLayer({
            id: 'wind-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => getColorScale(d.Wind, featureRanges.Wind[0], featureRanges.Wind[1]),
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.Wind,
            getFilterValue: d => d.Wind,
            filterRange: activeRanges.Wind,
            extensions: [new DataFilterExtension({filterSize: 1})]
        }),
        new ScatterplotLayer({
            id: 'fire-layer',
            data: data,
            getPosition: d => [d.Longitude, d.Latitude],
            getRadius: 5,
            radiusUnits: 'pixels',
            radiusMinPixels: 5,
            getFillColor: d => d.Fire > 0 ? [255, 0, 0] : [0, 0, 0],
            pickable: true,
            onClick: ({object}) => clickHandler(object),
            onHover: ({object}) => setPointHover(object),
            visible: selectedFeatures.Fire,
            getFilterValue: d => d.Fire,
            filterRange: activeRanges.Fire,
            extensions: [new DataFilterExtension({filterSize: 1})]
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
