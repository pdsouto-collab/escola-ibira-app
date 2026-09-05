const https = require('https');

https.get('https://escola-ibira-app.vercel.app/api/knowledge?type=skill', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Is Array?', Array.isArray(parsed));
      if (Array.isArray(parsed)) {
        console.log('Nodes count:', parsed.length);
        const macro = parsed[0];
        console.log('Macro node:', macro.name, 'classId:', macro.classId, 'period:', macro.period);
      } else {
        console.log('Response:', parsed);
      }
    } catch (e) {
      console.log('Error parsing JSON', e.message);
      console.log('Raw data:', data.slice(0, 200));
    }
  });
}).on('error', console.error);
