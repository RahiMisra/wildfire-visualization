const express = require('express');
const fs = require('fs');
const os = require('os');
const archiver = require("archiver");
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;
app.use(cors());

const MAX_CACHE_DAYS = 20;
const dayCache = new Map();
const shapCache = new Map();

function addToDayCache(date, data) {
  console.log(`adding ${date} to cache`)
  if (dayCache.has(date)) {
    dayCache.delete(date);
  } else if (dayCache.size >= MAX_CACHE_DAYS) {
    const oldestKey = dayCache.keys().next().value;
    dayCache.delete(oldestKey);
  }
  dayCache.set(date, data);
}

function addToShapCache(date, data) {
  console.log(`adding ${date} to shap cache`)
  if (shapCache.has(date)) {
    shapCache.delete(date);
  } else if (shapCache.size >= MAX_CACHE_DAYS) {
    const oldestKey = shapCache.keys().next().value;
    shapCache.delete(oldestKey);
  }
  shapCache.set(date, data);
}

function buildDateSet(startDateStr) {
  console.log("5 days");
  const daySet = new Set();
  const start = new Date(startDateStr);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    daySet.add(d.toLocaleDateString('en-CA'));
    // console.log(d);
  }
  const sorted = Array.from(daySet).sort();
  return { daySet, maxDay: sorted[sorted.length - 1] };
}

async function loadPredictions(filePath, daySet, maxDay) {
  console.log("prediction");
  const predictionMap = new Map();
  if (!fs.existsSync(filePath)) {
    console.warn("Prediction file not found:", filePath);
    return predictionMap;
  };

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(csv());
    stream.on('data', row => {
      if (row.Date > maxDay) {
        console.log(`Reached cutoff date ${row.Date} > ${maxDay}, stopping stream`);
        stream.destroy();
        return;
      }
      if (daySet.has(row.Date)) {
        const key = `${row.Date}_${row.Latitude}_${row.Longitude}`;
        let val = parseFloat(row.FirePrediction);
        predictionMap.set(key, val === 0.0 ? 0 : val === 1.0 ? 1 : val);
      }
    });
    stream.on('close', resolve);
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  return predictionMap;
}

async function loadShapValues(filePath, daySet, maxDay) {
  console.log("shap");
  const shapByDate = new Map();
  if (!fs.existsSync(filePath)) return;

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(csv());
    stream.on('data', row => {
      if (row.Date > maxDay) return stream.destroy();
      if (daySet.has(row.Date)) {
        const key = `${row.Date}_${row.Latitude}_${row.Longitude}`;
        const shapRow = {
          Date: row.Date,
          Latitude: parseFloat(row.Latitude),
          Longitude: parseFloat(row.Longitude),
          Date_shap: parseFloat(row.Date_shap),
          Latitude_shap: parseFloat(row.Latitude_shap),
          Longitude_shap: parseFloat(row.Longitude_shap),
          Elevation_shap: parseFloat(row.Elevation_shap),
          EVI_shap: parseFloat(row.EVI_shap),
          TA_shap: parseFloat(row.TA_shap),
          LST_shap: parseFloat(row.LST_shap),
          Wind_shap: parseFloat(row.Wind_shap),
          Fire_shap: parseFloat(row.Fire_shap)
        };
        if (!shapByDate.has(row.Date)) {
          shapByDate.set(row.Date, new Map());
        }
        shapByDate.get(row.Date).set(key, shapRow);
      }
    });
    stream.on('close', resolve);
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  for (const [dateKey, shapMap] of shapByDate.entries()) {
    addToShapCache(dateKey, shapMap);
  }
}

async function loadDataWithPredictions(dataFilePath, daySet, maxDay, predictionMap) {
  console.log("data");
  const results = [];
  if (!fs.existsSync(dataFilePath)) return results;

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(dataFilePath).pipe(csv());
    stream.on('data', row => {
      if (row.Date > maxDay) return stream.destroy();
      if (daySet.has(row.Date)) {
        const key = `${row.Date}_${row.Latitude}_${row.Longitude}`;
        const prediction = predictionMap.get(key);
        const baseRow = {
          Date: row.Date,
          Latitude: parseFloat(row.Latitude),
          Longitude: parseFloat(row.Longitude),
          Elevation: parseFloat(row.Elevation),
          EVI: parseFloat(row.EVI),
          TA: parseFloat(row.TA),
          LST: parseFloat(row.LST),
          Wind: parseFloat(row.Wind),
          Fire: parseInt(row.Fire),
        };
        if (prediction !== undefined) baseRow.Prediction = prediction;
        results.push(baseRow);
      }
    });
    stream.on('close', resolve);
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  return results;
}



app.get('/', (req, res) => {
  res.send('backend access');
});

app.get('/data/:date', async (req, res) => {
  const date = req.params.date;
  if (dayCache.has(date)) {
    console.log(`Serving ${date} from cache`);
    return res.json(dayCache.get(date));
  }

  const year = date.split('-')[0];
  const basePath = '/home';
  const dataPath = path.join(basePath, 'geo-info', 'Data', `${year}data_Elevation.csv`);
  const predictionPath = path.join(basePath, 'rm579300', 'wildfire-visualization', 'preprocessing', 'data', `predictions_${year}.csv`);
  const shapPath = path.join(basePath, 'rm579300', 'wildfire-visualization', 'preprocessing', 'data', `shap_values_${year}.csv`);

  const { daySet, maxDay } = buildDateSet(date);

  try {
    const predictionMap = await loadPredictions(predictionPath, daySet, maxDay);
    await loadShapValues(shapPath, daySet, maxDay);
    const mergedData = await loadDataWithPredictions(dataPath, daySet, maxDay, predictionMap);


    const groupedByDate = new Map();
    for (const row of mergedData) {
      const d = row.Date;
      if (!groupedByDate.has(d)) groupedByDate.set(d, []);
      groupedByDate.get(d).push(row);
    }

    for (const [d, rows] of groupedByDate.entries()) {
      addToDayCache(d, rows);
    }

    return res.json(groupedByDate.get(date) || []);
  } catch (err) {
    console.error('Error in /data/:date:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/shap/:date/:lat/:lon', (req, res) => {
  const { date, lat, lon } = req.params;

  if (!shapCache.has(date)) {
    return res.status(404).json({ error: 'No SHAP values cached for this date.' });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  const shapRows = shapCache.get(date);

  const key = `${date}_${latNum}_${lonNum}`;

  const match = shapRows.get(key);

  if (!match) {
    return res.status(404).json({ error: 'SHAP value not found for the specified point.' });
  }

  return res.json(match);
});


app.get('/download/day/:date', (req, res) => {
  const date = req.params.date;
  const year = date.split('-')[0];
  const filename = `${year}data_Elevation.csv`;
  const filePath = path.join('home', 'geo-info', 'data', filename);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="data_${date}.csv"`
  );

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.Date === date) {
        results.push(row);
      }
    })
    .on('end', () => {
      const headers = Object.keys(results[0]);
      const csvData = [
        headers.join(','),
        ...results.map(row =>
          headers.map(h => row[h]).join(',')
        )
      ].join('\n');

      res.send(csvData);
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).send('Failed to generate CSV for selected date');
    });
});

app.get('/download/year/:year', (req, res) => {
  const { year } = req.params;
  const filename = `${year}data_Elevation.csv`;
  const filePath = path.join('home', 'geo-info', 'data', filename);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="data_${year}.zip"`
  );
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', err => {
    console.error('Archive error:', err);
    res.status(500).send({ error: 'Failed to create ZIP file' });
  });

  archive.pipe(res);

  archive.file(filePath, {name: filename});

  archive.finalize();

});



app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
