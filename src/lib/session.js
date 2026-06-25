import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function decodeBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  let binary = '';
  for (const b of new Uint8Array(sig)) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function hmacVerify(payload, signature, secret) {
  const expected = await hmacSign(payload, secret);
  return expected === signature;
}

export async function sessionMiddleware(c, next) {
  const cookie = getCookie(c, 'session');
  if (cookie) {
    const dotIdx = cookie.lastIndexOf('.');
    if (dotIdx > 0) {
      const payloadB64 = cookie.substring(0, dotIdx);
      const sig = cookie.substring(dotIdx + 1);
      const valid = await hmacVerify(payloadB64, sig, c.env.SESSION);
      if (valid) {
        try {
          c.set('currentUser', JSON.parse(decodeBase64(payloadB64)));
        } catch {}
      }
    }
  }
  await next();
}

export async function setSession(c, userData) {
  const payloadB64 = encodeBase64(JSON.stringify(userData));
  const sig = await hmacSign(payloadB64, c.env.SESSION);
  setCookie(c, 'session', `${payloadB64}.${sig}`, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 86400,
  });
}

export function destroySession(c) {
  deleteCookie(c, 'session', { path: '/' });
}
