import { Sprint0StatusResponse } from '../types/status';
import { ApiUserResponse, UsernameCheckResponse, UserProfile } from '../types/auth';
import {
  getFirebaseClientAuth,
  getFirebaseClientDb,
  doc,
  getDoc,
  runTransaction,
} from './firebase';

const PRODUCTION_RENDER_API_URL = 'https://studyroom-backend-api.onrender.com';

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    if (window.location.hostname.endsWith('.vercel.app')) {
      return PRODUCTION_RENDER_API_URL;
    }
    if (
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return `http://${window.location.hostname}:4000`;
    }
  }
  return (envUrl || 'http://localhost:4000').replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiFieldError extends Error {
  public readonly field?: string;
  public readonly status: number;

  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiFieldError';
    this.status = status;
    this.field = field;
  }
}

class BackendUnavailableError extends Error {
  public readonly status: number;
  constructor(status: number) {
    super(`Backend status ${status}`);
    this.name = 'BackendUnavailableError';
    this.status = status;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    throw new BackendUnavailableError(0);
  } finally {
    window.clearTimeout(id);
  }
}

async function parseJsonOrFallback<T>(response: Response): Promise<T> {
  if (response.status === 404 || response.status >= 502) {
    throw new BackendUnavailableError(response.status);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BackendUnavailableError(response.status);
  }
}

function validateUsernameFormat(rawUsername: string): string {
  const cleaned = rawUsername.trim();
  if (!cleaned) {
    throw new ApiFieldError(
      'Debes elegir un nombre de usuario único.',
      400,
      'username'
    );
  }
  if (cleaned.length < 3 || cleaned.length > 20) {
    throw new ApiFieldError(
      'El nombre de usuario debe tener entre 3 y 20 caracteres.',
      400,
      'username'
    );
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(cleaned)) {
    throw new ApiFieldError(
      'Usa solo letras, números, puntos (.), guiones (-) o guiones bajos (_), sin espacios.',
      400,
      'username'
    );
  }
  return cleaned;
}

export async function fetchSprint0FirestoreStatus(): Promise<Sprint0StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sprint0/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let payload: Sprint0StatusResponse;
  try {
    payload = JSON.parse(text) as Sprint0StatusResponse;
  } catch {
    throw new Error('No se pudo leer la respuesta del servidor.');
  }

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error ||
        `Error HTTP ${response.status} al consultar el endpoint /api/sprint0/status`
    );
  }

  return payload;
}

export async function checkUsernameAvailabilityApi(
  username: string,
  excludeUid?: string
): Promise<UsernameCheckResponse> {
  const cleaned = validateUsernameFormat(username);
  const params = new URLSearchParams({ username: cleaned });
  if (excludeUid) {
    params.set('excludeUid', excludeUid);
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/check-username?${params.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    const payload = await parseJsonOrFallback<UsernameCheckResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No se pudo verificar el nombre de usuario.',
        response.status,
        payload.field || 'username'
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    const db = getFirebaseClientDb();
    if (!db) {
      throw new ApiFieldError(
        'No se pudo verificar el nombre de usuario.',
        500,
        'username'
      );
    }

    const lower = cleaned.toLowerCase();
    const ref = doc(db, 'usernames', lower);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as { uid?: string };
      if (!excludeUid || data.uid !== excludeUid) {
        return {
          ok: true,
          available: false,
          username: cleaned,
          message:
            'Este nombre de usuario ya está ocupado. Elige otro diferente.',
        };
      }
    }

    return {
      ok: true,
      available: true,
      username: cleaned,
      message: 'Nombre de usuario disponible',
    };
  }
}

export async function fetchCurrentUserProfileApi(
  idToken: string
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No se pudo obtener tu perfil.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    const auth = getFirebaseClientAuth();
    const db = getFirebaseClientDb();
    const currentUser = auth?.currentUser;
    if (!db || !currentUser) {
      throw new ApiFieldError('No se pudo obtener tu perfil.', 401);
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw new ApiFieldError(
        'Aún no hemos completado tu perfil en StudyRoom.',
        404
      );
    }

    const profile = snap.data() as UserProfile;
    return {
      ok: true,
      requiresUsername: Boolean(profile.requiresUsername || !profile.username),
      data: profile,
    };
  }
}

export async function registerManualProfileApi(
  idToken: string,
  input: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar: string;
  }
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(input),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible completar el registro.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    const auth = getFirebaseClientAuth();
    const db = getFirebaseClientDb();
    const currentUser = auth?.currentUser;
    if (!db || !currentUser) {
      throw new ApiFieldError('No fue posible completar el registro.', 500);
    }

    const cleanedUsername = validateUsernameFormat(input.username);
    const usernameLower = cleanedUsername.toLowerCase();
    const now = new Date().toISOString();

    const profile: UserProfile = await runTransaction(db, async (tx) => {
      const usernameRef = doc(db, 'usernames', usernameLower);
      const userRef = doc(db, 'users', currentUser.uid);

      const usernameSnap = await tx.get(usernameRef);
      if (usernameSnap.exists()) {
        const owner = (usernameSnap.data() as { uid?: string }).uid;
        if (owner !== currentUser.uid) {
          throw new ApiFieldError(
            'Este nombre de usuario ya está ocupado. Elige otro diferente.',
            400,
            'username'
          );
        }
      }

      const newProfile: UserProfile = {
        uid: currentUser.uid,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        username: cleanedUsername,
        usernameLower,
        email: input.email.trim().toLowerCase(),
        avatar: input.avatar,
        provider: 'password',
        requiresUsername: false,
        createdAt: now,
        updatedAt: now,
      };

      tx.set(usernameRef, {
        uid: currentUser.uid,
        username: cleanedUsername,
        updatedAt: now,
      });
      tx.set(userRef, newProfile);
      return newProfile;
    });

    return {
      ok: true,
      requiresUsername: false,
      data: profile,
    };
  }
}

export async function syncGoogleProfileApi(
  idToken: string,
  input?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  }
): Promise<ApiUserResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/google-sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(input || {}),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible sincronizar tu cuenta de Google.',
        response.status,
        payload.field
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    const auth = getFirebaseClientAuth();
    const db = getFirebaseClientDb();
    const currentUser = auth?.currentUser;
    if (!db || !currentUser) {
      throw new ApiFieldError(
        'No fue posible sincronizar tu cuenta de Google.',
        500
      );
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const needsUsername = Boolean(
        existing.requiresUsername || !existing.username
      );
      return {
        ok: true,
        requiresUsername: needsUsername,
        data: existing,
      };
    }

    const now = new Date().toISOString();
    const firstName =
      input?.firstName?.trim() ||
      currentUser.displayName?.split(' ')[0] ||
      'Estudiante';
    const lastName =
      input?.lastName?.trim() ||
      currentUser.displayName?.split(' ').slice(1).join(' ') ||
      '';
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0) || 'G'}`.toUpperCase() ||
      'SR';

    const createdProfile: UserProfile = {
      uid: currentUser.uid,
      firstName,
      lastName,
      username: null,
      usernameLower: null,
      email: (input?.email || currentUser.email || '').trim().toLowerCase(),
      avatar: input?.avatar || initials,
      provider: 'google',
      requiresUsername: true,
      createdAt: now,
      updatedAt: now,
    };

    await runTransaction(db, async (tx) => {
      tx.set(userRef, createdProfile);
    });

    return {
      ok: true,
      requiresUsername: true,
      data: createdProfile,
    };
  }
}

export async function assignUniqueUsernameApi(
  idToken: string,
  input: { username: string; avatar?: string }
): Promise<ApiUserResponse> {
  const cleanedUsername = validateUsernameFormat(input.username);

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/users/username`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: cleanedUsername,
          avatar: input.avatar,
        }),
      }
    );

    const payload = await parseJsonOrFallback<ApiUserResponse>(response);

    if (!response.ok || !payload.ok) {
      throw new ApiFieldError(
        payload.error || 'No fue posible guardar el nombre de usuario.',
        response.status,
        payload.field || 'username'
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiFieldError) {
      throw err;
    }

    const auth = getFirebaseClientAuth();
    const db = getFirebaseClientDb();
    const currentUser = auth?.currentUser;
    if (!db || !currentUser) {
      throw new ApiFieldError(
        'No fue posible guardar el nombre de usuario.',
        500,
        'username'
      );
    }

    const usernameLower = cleanedUsername.toLowerCase();
    const now = new Date().toISOString();

    const updatedProfile: UserProfile = await runTransaction(db, async (tx) => {
      const usernameRef = doc(db, 'usernames', usernameLower);
      const userRef = doc(db, 'users', currentUser.uid);

      const [usernameSnap, userSnap] = await Promise.all([
        tx.get(usernameRef),
        tx.get(userRef),
      ]);

      if (usernameSnap.exists()) {
        const owner = (usernameSnap.data() as { uid?: string }).uid;
        if (owner !== currentUser.uid) {
          throw new ApiFieldError(
            'Este nombre de usuario ya está ocupado. Elige otro diferente.',
            400,
            'username'
          );
        }
      }

      const existing = userSnap.exists()
        ? (userSnap.data() as UserProfile)
        : null;
      const firstName =
        existing?.firstName ||
        currentUser.displayName?.split(' ')[0] ||
        'Estudiante';
      const lastName =
        existing?.lastName ||
        currentUser.displayName?.split(' ').slice(1).join(' ') ||
        '';
      const initials =
        `${firstName.charAt(0)}${lastName.charAt(0) || 'G'}`.toUpperCase() ||
        'SR';

      const nextProfile: UserProfile = {
        uid: currentUser.uid,
        firstName,
        lastName,
        username: cleanedUsername,
        usernameLower,
        email:
          existing?.email || (currentUser.email || '').trim().toLowerCase(),
        avatar: input.avatar || existing?.avatar || initials,
        provider: existing?.provider || 'google',
        requiresUsername: false,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      tx.set(usernameRef, {
        uid: currentUser.uid,
        username: cleanedUsername,
        updatedAt: now,
      });
      tx.set(userRef, nextProfile);
      return nextProfile;
    });

    return {
      ok: true,
      requiresUsername: false,
      data: updatedProfile,
    };
  }
}

export async function registerViaBackendAuthApi(input: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
}): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonOrFallback<ApiUserResponse>(response);

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible completar el registro.',
      response.status,
      payload.field
    );
  }

  return payload;
}

export async function loginViaBackendAuthApi(input: {
  email: string;
  password: string;
}): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonOrFallback<ApiUserResponse>(response);

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'Correo o contraseña incorrectos',
      response.status,
      payload.field
    );
  }

  return payload;
}
