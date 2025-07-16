import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Slider from '@mui/material/Slider';
import './FilterPanel.css';

function FilterPanel({features, selectedDate, setSelectedDate, selectedFeatures, setSelectedFeatures, featureRanges, activeRanges, setActiveRanges, predictionEnabled}) {

    // const [selectedDate, setSelectedDate] = useState(new Date('2020-01-01'));
    // tracks the selected date in the console
    const handleDateChange = (date) => {
        // console.log('Date selected:', date);
        setSelectedDate(date);
    };

    // initialize all features to true
    // const [toggledFeatures, setToggledFeatures] = useState(() => {
    //     const initial = {};
    //     features.forEach(feature => initial[feature] = true);
    //     return initial;
    // });

    // swaps the toggle of the selected featurev
    const swapToggle = (feature) => {
        setSelectedFeatures(prev => ({
            ...prev,
            [feature]: !prev[feature]
        }));
    };

    const handleRangeChange = (feature, newRange) => {
        setActiveRanges(prev => ({
            ...prev,
            [feature]: newRange
        }));
    };

    return (
        <div>
            <div className="date-picker-container">
                <DatePicker
                    selected = {selectedDate}
                    onChange = {handleDateChange}
                    dateFormat = "yyyy-MM-dd"
                    placeholderText = "Select a date"
                    minDate={new Date('2013-01-01')}
                    maxDate={new Date('2023-12-31')}
                    showYearDropdown
                    scrollableYearDropdown
                />
                <button className="download-button" onClick={() => {
                    const formattedDate = selectedDate.toLocaleDateString('en-CA');
                    const url = `http://localhost:3001/download/day/${formattedDate}`;
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `data_${formattedDate}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }}>
                    Download Day
                </button>
            </div>

            <div className="filter-container">
                {features.map(feature => (
                <div key={feature} className="feature-filter">
                    <label>{feature}</label>
                    <input
                        className="feature-checkbox"
                        type="checkbox"
                        checked={selectedFeatures[feature]}
                        onChange={() => swapToggle(feature)}
                    />

                    <Slider
                        className="feature-slider"
                        size="small"
                        sx={{ width: 150 }}
                        value={activeRanges[feature]}
                        onChange={(_, newValue) => handleRangeChange(feature, newValue)}
                        valueLabelDisplay="auto"
                        min={featureRanges[feature][0]} 
                        max={featureRanges[feature][1]}
                        disableSwap
                    />
                </div>
                ))}
                <div className="feature-filter">
                    <label>Latitude</label>
                    <Slider
                    className="feature-slider"
                    size="small"
                    sx={{ width: 150 }}
                    value={activeRanges['Latitude']}
                    onChange={(_, newValue) => handleRangeChange('Latitude', newValue)}
                    valueLabelDisplay="auto"
                    min={featureRanges['Latitude'][0]} 
                    max={featureRanges['Latitude'][1]}
                    disableSwap
                    />
                </div>
                <div className="feature-filter">
                    <label>Longitude</label>
                    <Slider
                    className="feature-slider"
                    size="small"
                    sx={{ width: 150 }}
                    value={activeRanges['Longitude']}
                    onChange={(_, newValue) => handleRangeChange('Longitude', newValue)}
                    valueLabelDisplay="auto"
                    min={featureRanges['Longitude'][0]} 
                    max={featureRanges['Longitude'][1]}
                    disableSwap
                    />
                </div>
                {predictionEnabled && (
                    <div key="Prediction" className="feature-filter">
                    <label>Prediction</label>
                    <input
                        className="feature-checkbox"
                        type="checkbox"
                        checked={selectedFeatures.Prediction}
                        onChange={() => swapToggle('Prediction')}
                    />
                    <Slider
                        className="feature-slider"
                        size="small"
                        sx={{ width: 150 }}
                        value={activeRanges.Prediction}
                        onChange={(_, newValue) => handleRangeChange('Prediction', newValue)}
                        valueLabelDisplay="auto"
                        min={featureRanges.Prediction?.[0] || 0}
                        max={featureRanges.Prediction?.[1] || 1}
                        disableSwap
                    />
                    </div>
                )}
            </div>
        </div>
    );
}
export default FilterPanel;