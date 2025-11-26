require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('ADMIN_USERNAME:', JSON.stringify(process.env.ADMIN_USERNAME));
console.log('ADMIN_USERNAME length:', process.env.ADMIN_USERNAME?.length);
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? `[${process.env.ADMIN_PASSWORD.length} chars]` : 'undefined');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('INTERNAL_API_KEY:', process.env.INTERNAL_API_KEY ? '✅ Set' : '❌ Missing');
