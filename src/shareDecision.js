import { buildExportPayload } from './exportDecision';

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptDecisionExport(state, password) {
  if (!password?.trim()) throw new Error('Password required');
  const payload = buildExportPayload(state);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(payload))
  );
  return {
    version: 1,
    app: 'Decision Coach',
    encrypted: true,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    data: bufferToBase64(ciphertext),
  };
}

export async function decryptDecisionExport(fileContent, password) {
  const parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
  if (!parsed.encrypted) return parsed;
  const salt = new Uint8Array(base64ToBuffer(parsed.salt));
  const iv = new Uint8Array(base64ToBuffer(parsed.iv));
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    base64ToBuffer(parsed.data)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export async function downloadEncryptedExport(state, password, filename) {
  const encrypted = await encryptDecisionExport(state, password);
  const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (filename || 'decision').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  a.href = url;
  a.download = `${safeName || 'decision'}-encrypted.dcoach.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importEncryptedFile(onLoaded) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.dcoach.json,application/json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed.encrypted) {
      const password = window.prompt('Enter password to decrypt this decision file:');
      if (!password) return;
      try {
        const data = await decryptDecisionExport(parsed, password);
        onLoaded(data);
      } catch {
        window.alert('Could not decrypt — wrong password or corrupted file.');
      }
    } else {
      onLoaded(parsed);
    }
  };
  input.click();
}
