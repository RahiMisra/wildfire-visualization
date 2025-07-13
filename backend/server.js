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

function addToCache(date, data) {
  if (dayCache.has(date)) {
    dayCache.delete(date);
  } else if (dayCache.size >= MAX_CACHE_DAYS) {
    const oldestKey = dayCache.keys().next().value;
    dayCache.delete(oldestKey);
  }
  dayCache.set(date, data);
}

app.get('/', (req, res) => {
  res.send('backend access');
});

app.get('/data/:date', (req, res) => {
  
  const date = req.params.date;
  const year = date.split('-')[0];
  const filename = `${year}data_Elevation.csv`;
  const filePath = path.join('/home', 'geo-info', 'Data', filename);

  const daySet = new Set();
  for (let i = 0; i < 5; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    daySet.add(d.toLocaleDateString('en-CA'));
  }
  
  // if (cachedFile === filename) {
  //   const filtered = cachedData.filter(row => row.Date === date);
  //   return res.json(filtered);
  // }
  
  if (dayCache.has(date)) {
    console.log(`Serving ${date} from cache`);
    return res.json(dayCache.get(date));
  }

  const results = [];
  let rowCount = 0;
  let lastLogTime = Date.now();

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      rowCount++;
      const now = Date.now();
      if (now - lastLogTime >= 10000) {
        console.log(`Processed ${rowCount} rows so far...`);
        lastLogTime = now;
      }
      if (daySet.has(row.Date)) {
        results.push({
          Date: row.Date,
          Latitude: parseFloat(row.Latitude),
          Longitude: parseFloat(row.Longitude),
          Elevation: parseFloat(row.Elevation),
          EVI: parseFloat(row.EVI),
          TA: parseFloat(row.TA),
          LST: parseFloat(row.LST),
          Wind: parseFloat(row.Wind),
          Fire: parseInt(row.Fire)
        });
      }
    })
    .on('end', () => {
      console.log(`Finished processing ${rowCount} rows.`);
      rowCount = 0;
      addToCache(date, results);
      res.json(dayCache.get(date));
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
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
