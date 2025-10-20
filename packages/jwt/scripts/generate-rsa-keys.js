const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Generate key ID
const keyId = `key-${Date.now()}`;

// Save to keys directory
const keysDir = path.join(__dirname, '../src/keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'key-id.txt'), keyId);

console.log('✅ RSA key pair generated!');
console.log(`   Key ID: ${keyId}`);
console.log(`   Location: ${keysDir}`);
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('   1. Add src/keys/ to .gitignore');
console.log('   2. Store private key in environment variables for production');
console.log('   3. Never commit private key to git!');
