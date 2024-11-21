const crypto = require('crypto');
require('dotenv').config(); 

// Ensure the key is exactly 32 bytes (256 bits)
//const key = process.env.ENCRYPTION_KEY;

// Generate a random 32-byte key and convert it to a 64-character hexadecimal string
const key = process.env.ENCRYPTION_KEY;

// Ensure the key is 64 characters long (representing 32 bytes)
if (!key || key.length !== 64) {
    console.log(key);
  throw new Error('ENCRYPTION_KEY must be 64 characters long (32 bytes)');
}

// Encryption function
const encrypt = (data) => {
  if (typeof data !== 'string') {
    throw new TypeError('Data must be a string');
  }

  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV
  const derivedKey = crypto.createHash('sha256').update(key).digest(); // Ensure the key is 32 bytes
  
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv); // Use the derived 32-byte key
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return both the IV and encrypted data in hex format
  return iv.toString('hex') + encrypted;
};

// Decryption function
const decrypt = (encryptedText) => {
  if (typeof encryptedText !== 'string') {
    throw new TypeError('Encrypted text must be a string');
  }
  
  if (encryptedText.length < 32) {
    throw new Error('Invalid encrypted text length');
  }

  // Extract the IV from the first 16 bytes (32 hex characters)
  const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); // First 16 bytes
  const encryptedData = encryptedText.slice(32); // The remaining part is the encrypted data
  
  const derivedKey = crypto.createHash('sha256').update(key).digest(); // Ensure the key is 32 bytes
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = { encrypt, decrypt };
