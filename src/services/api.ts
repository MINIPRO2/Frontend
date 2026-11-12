import { Sprint0StatusResponse } from '../types/status';
import { ApiUserResponse, UsernameCheckResponse } from '../types/auth';

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.endsWith('.vercel.app')
  ) {
    return `http://${window.location.hostname}:4000`;
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

export async function fetchSprint0FirestoreStatus(): Promise<Sprint0StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sprint0/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload: Sprint0StatusResponse = await response.json();

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
  const params = new URLSearchParams({ username });
  if (excludeUid) {
    params.set('excludeUid', excludeUid);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/users/check-username?${params.toString()}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }
  );

  const payload: UsernameCheckResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No se pudo verificar el nombre de usuario.',
      response.status,
      payload.field || 'username'
    );
  }

  return payload;
}

export async function fetchCurrentUserProfileApi(
  idToken: string
): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No se pudo obtener tu perfil.',
      response.status,
      payload.field
    );
  }

  return payload;
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
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(input),
  });

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible completar el registro.',
      response.status,
      payload.field
    );
  }

  return payload;
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
  const response = await fetch(`${API_BASE_URL}/api/users/google-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(input || {}),
  });

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible sincronizar tu cuenta de Google.',
      response.status,
      payload.field
    );
  }

  return payload;
}

export async function assignUniqueUsernameApi(
  idToken: string,
  input: { username: string; avatar?: string }
): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/username`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(input),
  });

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible guardar el nombre de usuario.',
      response.status,
      payload.field || 'username'
    );
  }

  return payload;
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

  const payload: ApiUserResponse = await response.json();

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

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'Correo o contraseña incorrectos',
      response.status,
      payload.field
    );
  }

  return payload;
}

export async function googleAuthViaBackendApi(input: {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): Promise<ApiUserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload: ApiUserResponse = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiFieldError(
      payload.error || 'No fue posible continuar con Google.',
      response.status,
      payload.field
    );
  }

  return payload;
}
