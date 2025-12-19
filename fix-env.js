
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    let fixed = false;

    if (content.includes('VITE_SUPABASE_URL')) {
        content = content.replace(/VITE_SUPABASE_URL/g, 'NEXT_PUBLIC_SUPABASE_URL');
        fixed = true;
    }
    if (content.includes('VITE_SUPABASE_ANON_KEY')) {
        content = content.replace(/VITE_SUPABASE_ANON_KEY/g, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
        fixed = true;
    }

    if (fixed) {
        fs.writeFileSync(envPath, content);
        console.log('FIXED_ENV_VARS');
    } else {
        console.log('NO_FIX_NEEDED');
    }
} else {
    console.log('FILE_NOT_FOUND');
}
