
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const args = ['deploy', '--prod', '--yes', '--force'];

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (key && val) {
                args.push('--env');
                args.push(`${key}=${val}`);
                args.push('--build-env');
                args.push(`${key}=${val}`);
            }
        }
    });
}

console.log('Starting Vercel deployment (FORCE) with injected environment variables...');
const child = spawn('vercel', args, { stdio: 'inherit', shell: true });

child.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
});

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    process.exit(code);
});
