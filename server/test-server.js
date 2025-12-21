const http = require('http');

const endpoints = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://0.0.0.0:5000'
];

endpoints.forEach(url => {
  http.get(url, (res) => {
    console.log(`✅ ${url} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`❌ ${url} - Error: ${err.message}`);
  });
});
