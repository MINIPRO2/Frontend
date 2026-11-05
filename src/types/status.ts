export interface Sprint0FirestoreData {
  id: string;
  appName: string;
  sprint: string;
  message: string;
  accessibilityTarget: string;
  activeRoomsCount: number;
  updatedAt: string;
}

export interface Sprint0StatusResponse {
  ok: boolean;
  source?: string;
  data?: Sprint0FirestoreData;
  error?: string;
}
