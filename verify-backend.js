
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('ENV_FILE_MISSING');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
console.log('Raw content length:', envContent.length);
console.log('First 100 chars:', JSON.stringify(envContent.slice(0, 100)));
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[key] = value;
        // console.log(`Loaded key: ${key}`); // Uncomment for debug
    }
});
console.log('Keys loaded:', Object.keys(env));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using Anon Key for this check

if (!supabaseUrl || !supabaseKey) {
    console.log('MISSING_CREDENTIALS');
    process.exit(1);
}

console.log('Checking connection with Anon Key...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        // Try to select from a table that should exist - users might be restricted, let's try a public check or just auth
        // Attempting to fetch session or just a simple query
        const { data, error } = await supabase.from('performers').select('count', { count: 'exact', head: true });

        if (error) {
            console.log('CONNECTION_ERROR: ' + error.message);
            // If it's a permission error, that means we CONNECTED but were denied, which is a success for connectivity
            if (error.code === '42501' || error.message.includes('permission denied')) {
                console.log('CONNECTION_ESTABLISHED (Permission Denied - Expected for Anon Key on some tables)');
            }
        } else {
            console.log('CONNECTION_SUCCESS');
        }
    } catch (err) {
        console.log('EXECUTION_ERROR: ' + err.message);
    }
}

check();
