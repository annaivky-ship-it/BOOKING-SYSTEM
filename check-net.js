
const https = require('https');

const url = 'https://lpnvtoysppumesllsgra.supabase.co';

console.log(`Testing connection to ${url}...`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    console.log('CONNECTION_OK');
}).on('error', (e) => {
    console.error('CONNECTION_FAILED:', e);
});
