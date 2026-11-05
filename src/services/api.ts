import { Sprint0StatusResponse } from '../types/status';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

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
