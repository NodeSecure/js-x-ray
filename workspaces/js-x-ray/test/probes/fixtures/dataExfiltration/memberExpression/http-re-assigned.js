import http from "http";
import os from "os";

const postData = os.hostname();

const options = {
  hostname: 'api.example.com',
  port: 80,
  path: '/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const request = http.request; 

const req = request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

const req2 = req;

const write = req2.write;

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

write(postData);
req2.end();