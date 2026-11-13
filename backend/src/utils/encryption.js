const crypto = require('crypto');

// Master key must be 32 bytes (256 bits)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

// Get Master Key from env or crash if missing
const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY;
if (!MASTER_KEY || MASTER_KEY.length < 32) {
  console.warn("⚠️ WARNING: MASTER_ENCRYPTION_KEY is missing or too short. Keys will not be secure!");
}

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string} text 
 * @returns {string} Encrypted string in format iv:authTag:encryptedText
 */
function encrypt(text) {
  if (!text) return '';
  const key = Buffer.from(MASTER_KEY.substring(0, 32), 'utf-8');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt cipher text using AES-256-GCM
 * @param {string} encryptedText format iv:authTag:encryptedText
 * @returns {string} Original plain text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return '';
  const key = Buffer.from(MASTER_KEY.substring(0, 32), 'utf-8');
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid cipher text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
