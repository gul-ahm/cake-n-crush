import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.development explicitly
dotenv.config({ path: path.join(__dirname, '.env.development') });

async function testAuth() {
    console.log('=== Auth Debug Script ===');

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    console.log('1. Loading Credentials:');
    console.log('   Username:', username ? `'${username}'` : 'MISSING');
    console.log('   Password:', password ? `'${password}'` : 'MISSING');

    if (!password) {
        console.error('❌ Password missing from .env.development');
        return;
    }

    console.log('\n2. Hashing Password:');
    const hashedPassword = bcrypt.hashSync(password, 12);
    console.log('   Hash generated successfully');

    console.log('\n3. Verifying Password:');
    const inputPassword = 'CakeNCrush#Secure!2025@Admin';
    console.log(`   Testing against: '${inputPassword}'`);

    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    console.log('   Result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');

    if (!isMatch) {
        console.log('\n⚠️  Mismatch Analysis:');
        console.log('   Env Password Length:', password.length);
        console.log('   Input Password Length:', inputPassword.length);
        console.log('   Are they identical?', password === inputPassword ? 'Yes' : 'No');

        // Check for hidden characters
        console.log('   Env Password Codes:', [...password].map(c => c.charCodeAt(0)));
        console.log('   Input Password Codes:', [...inputPassword].map(c => c.charCodeAt(0)));
    }
}

testAuth();
