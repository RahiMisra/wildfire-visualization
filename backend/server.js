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

app.get('/', (req, res) => {
  res.send('backend access');
});

let cachedFile = null;
let cachedData = null;
app.get('/data/:date', (req, res) => {
  const date = req.params.date;
  const year = date.split('-')[0];
  const filename = `${year}data-Backend.csv`;
  const filePath = path.join(os.homedir(), 'data', filename);
  
  if (cachedFile === filename) {
    const filtered = cachedData.filter(row => row.Date === date);
    return res.json(filtered);
  }
  
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push({
      Date: row.Date,
      Latitude: parseFloat(row.Latitude),
      Longitude: parseFloat(row.Longitude),
      Elevation: parseFloat(row.Elevation),
      EVI: parseFloat(row.EVI),
      TA: parseFloat(row.TA),
      LST: parseFloat(row.LST),
      Wind: parseFloat(row.Wind),
      Fire: parseInt(row.Fire),
      });
    })
    .on('end', () => {
      cachedFile = filename;
      cachedData = results;
      const filtered = results.filter(row => row.Date === date);
      res.json(filtered);
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

app.get('/download/day/:date', (req, res) => {
  const date = req.params.date;
  const year = date.split('-')[0];
  const filename = `${year}data-Backend.csv`;
  const filePath = path.join(os.homedir(), 'data', filename);

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
  const filePath = path.join(os.homedir(), 'data', `${year}data-Backend.csv`);

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

  archive.file(filePath, { name: `${year}data-Backend.csv` });

  archive.finalize();

});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
