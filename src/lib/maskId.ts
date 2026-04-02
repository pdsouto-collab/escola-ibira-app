import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Pad or slice secret key to 32 bytes
const rawKey = process.env.ID_SECRET_KEY || 'default-secret-key-that-should-be-changed';
const SECRET_KEY = crypto.createHash('sha256').update(rawKey).digest(); 

export function encodeId(id: string): string {
    if (!id) return id;
    try {
        // Use a deterministic IV (16 bytes) derived from id + secret so the output is consistent for React keys
        const iv = crypto.createHash('md5').update(id + rawKey).digest();
        
        const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
        let encrypted = cipher.update(id, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return IV + Encrypted (32 chars for IV in hex + encrypted chars)
        return `${iv.toString('hex')}${encrypted}`;
    } catch (e) {
        console.error("Erro ao ofuscar ID:", e);
        return id; // Fallback
    }
}

export function decodeId(encoded: string): string {
    if (!encoded) return encoded;
    try {
        // 16 bytes IV = 32 hex chars
        if (encoded.length <= 32) return encoded;
        
        const ivHex = encoded.substring(0, 32);
        const encryptedText = encoded.substring(32);
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (e) {
        console.error("Erro ao decodificar ID:", e);
        return encoded; // Fallback se tiver errado
    }
}
