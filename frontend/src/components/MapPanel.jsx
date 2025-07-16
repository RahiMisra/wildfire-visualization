import { ScatterplotLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import {DataFilterExtension} from '@deck.gl/extensions';
import React, { useEffect, useState, useRef } from 'react';
import Legend from './Legend';
import './Legend.css';

const INITIAL_VIEW_STATE = {
    longitude: -123.75,
    latitude: 41.99,
    zoom: 3,
    pitch: 0,
    bearing: 0
};

function MapPanel({features, selectedDate, selectedFeatures, featureRanges, setFeatureRanges, activeRanges, setActiveRanges, setPointA, setPointB, setPointHover}) {
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
                    Latitude: getMinMax(data, 'Latitude'),
                    Longitude: getMinMax(data, 'Longitude'),
                    Elevation: getMinMax(data, 'Elevation'),
                    EVI: getMinMax(data, 'EVI'),
                    TA: getMinMax(data, 'TA'),
                    LST: getMinMax(data, 'LST'),
                    Wind: getMinMax(data, 'Wind'),
                    Fire: [0, 1]
                };
                const defaultFeatureRanges = {
                    Latitude: [newFeatureRanges.Latitude[0], newFeatureRanges.Latitude[0]],
                    Longitude: [newFeatureRanges.Longitude[0], newFeatureRanges.Longitude[0]],
                    Elevation: [newFeatureRanges.Elevation[0], newFeatureRanges.Elevation[0]],
                    EVI: [newFeatureRanges.EVI[0], newFeatureRanges.EVI[0]],
                    TA: [newFeatureRanges.TA[0], newFeatureRanges.TA[0]],
                    LST: [newFeatureRanges.LST[0], newFeatureRanges.LST[0]],
                    Wind: [newFeatureRanges.Wind[0], newFeatureRanges.Wind[0]],
                    Fire: [newFeatureRanges.Fire[0], newFeatureRanges.Fire[1]],
                };

                setFeatureRanges(newFeatureRanges);
                setActiveRanges(defaultFeatureRanges);
                console.log('features recieved');
            });
    }, [formattedDate]);
    
    
    const getColorScale = (value, min, max) => {
        if (max === min) return [0, 0, 0]; // avoid division by zero
        const t = (value - min) / (max - min);
        const r = Math.round(255 * (1 - t));
        const g = Math.round(255 * (1 - t));
        const b = Math.round(255 * t);
        return [r, g, b];
    };

    const getMinMax = (data, feature) => {
        let min = Infinity;
        let max = -Infinity;

        for (const d of data) {
            const value = parseFloat(d[feature]);
            if (!isNaN(value)) {
            if (value < min) min = value;
            if (value > max) max = value;
            }
        }

        return [min, max];
    };

    //calculate height based on proportion of value on min/max range
    const getProportional = (value, minValue, maxValue, minHeight=0, maxHeight=100) => {
        if (maxValue === minValue) return minHeight;  
        let t = (value - minValue) / (maxValue - minValue);
        t = Math.max(0, Math.min(1, t));
        return minHeight + t * (maxHeight - minHeight);
    }

    const clickHandler = (point) => {
        const pointInfo = { ...point };
        console.log('features:', features);
        features.forEach((feature) => {
            pointInfo[`${feature}_color`] = getColorScale(pointInfo[feature], featureRanges[feature][0], featureRanges[feature][1]);
            pointInfo[`${feature}_height`] = getProportional(pointInfo[feature], featureRanges[feature][0], featureRanges[feature][1]);
        })

        if (clickCounter.current % 2 === 0) {
            setPointA(pointInfo);
        } else {
            setPointB(pointInfo);
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
            getFilterValue: d => [d.Fire, d.Latitude, d.Longitude],
            filterRange: [activeRanges.Fire, activeRanges.Latitude, activeRanges.Longitude],
            extensions: [new DataFilterExtension({filterSize: 3})]
        })
    ];
  return (
    // <DeckGL
    //     initialViewState={INITIAL_VIEW_STATE}
    //     controller={true}
    //     layers={layers}
    // />
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
            style={{ width: '100%', height: '100%' }}
        />
        <div style={{ position: 'absolute', bottom: 100, right: 100 }}>
            <Legend selectedFeatures={selectedFeatures} />
        </div>
  </div>
  );
}

export default MapPanel;
