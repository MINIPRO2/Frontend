# 4. Documentación de Eventos en Tiempo Real (Socket.IO y WebRTC)

Especificación técnica del servicio `backend-realtime` (**Node.js + TypeScript + Socket.IO**) para mensajería síncrona (`TS-02`) y señalización WebRTC con `simple-peer` y servidor STUN/TURN ExpressTURN (`TS-03`).

---

## 1. Conexión y Handshake

- **URL del Servidor Realtime:** definida en `VITE_REALTIME_URL` (puerto `4001` en local / servicio Docker en Render).
- **Autenticación en Handshake (TS-02):**
  ```ts
  const socket = io(VITE_REALTIME_URL, {
    auth: {
      token: firebaseIdToken, // Verificado con Firebase Admin SDK en el servidor
    },
  });
  ```

---

## 2. Catálogo de Eventos de Sala y Presencia (Socket.IO)

| Evento | Dirección | Payload | Descripción |
| :--- | :---: | :--- | :--- |
| `room:join` | Cliente $\rightarrow$ Servidor | `{ roomId: string, displayName: string }` | Une el socket a la sala indicada y notifica a los demás participantes. |
| `room:user-joined` | Servidor $\rightarrow$ Sala | `{ socketId: string, displayName: string, joinedAt: string }` | Notifica a los miembros actuales que un nuevo estudiante ingresó (permite iniciar negociación WebRTC y anunciar por `aria-live`). |
| `room:leave` | Cliente $\rightarrow$ Servidor | `{ roomId: string }` | Retira al usuario de la sala y cierra sus flujos asociados. |
| `room:user-left` | Servidor $\rightarrow$ Sala | `{ socketId: string, displayName: string }` | Informa a la sala para limpiar el elemento `<video>` del par desconectado. |

---

## 3. Catálogo de Eventos de Chat en Tiempo Real (`T2`)

| Evento | Dirección | Payload | Descripción |
| :--- | :---: | :--- | :--- |
| `chat:message` | Cliente $\rightarrow$ Servidor | `{ roomId: string, content: string, senderName: string }` | Envía un mensaje de texto a la sala. El servidor lo persiste en Firestore (`messages`) y lo retransmite. |
| `chat:message` | Servidor $\rightarrow$ Sala | `{ id: string, roomId: string, content: string, senderName: string, createdAt: string }` | Entregado en tiempo real a todos los miembros conectados a `roomId`. |

---

## 4. Catálogo de Eventos de Señalización WebRTC y Media (`T3` y `T4`)

La transmisión de audio, video y pantalla utiliza una topología **Mesh P2P** con `simple-peer` apoyada en servidores ICE (**STUN/TURN de ExpressTURN** configurados por variables de entorno).

| Evento | Dirección | Payload | Descripción |
| :--- | :---: | :--- | :--- |
| `webrtc:signal` | Cliente A $\rightarrow$ Servidor $\rightarrow$ Cliente B | `{ targetSocketId: string, senderSocketId: string, signal: SignalData }` | Intercambia ofertas/respuestas **SDP** y candidatos **ICE** entre dos pares específicos de la sala. |
| `media:state-change` | Cliente $\rightarrow$ Servidor $\rightarrow$ Sala | `{ roomId: string, audioEnabled: boolean, videoEnabled: boolean, screenSharing: boolean }` | Sincroniza en la interfaz y en los anuncios de lector de pantalla si un compañero silenció su micrófono, apagó su cámara o inició compartición de pantalla. |
