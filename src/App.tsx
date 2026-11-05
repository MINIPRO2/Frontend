import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchSprint0FirestoreStatus } from './services/api';
import { Sprint0FirestoreData } from './types/status';

type KnownRoute =
  | '/'
  | '/ingreso'
  | '/registro'
  | '/panel'
  | '/sala'
  | '/perfil'
  | '/ayuda';

type FetchStatus = 'loading' | 'success' | 'error';

const ROUTE_TITLES: Record<KnownRoute, string> = {
  '/': 'Inicio',
  '/ingreso': 'Ingreso',
  '/registro': 'Registro',
  '/panel': 'Panel',
  '/sala': 'Sala',
  '/perfil': 'Perfil',
  '/ayuda': 'Ayuda',
};

const VALID_ROUTES = Object.keys(ROUTE_TITLES) as KnownRoute[];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '') return '/';
  const clean =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return clean;
}

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  // Estado del dato leído de Cloud Firestore (TS-00)
  const [firestoreStatus, setFirestoreStatus] =
    useState<FetchStatus>('loading');
  const [firestoreData, setFirestoreData] =
    useState<Sprint0FirestoreData | null>(null);
  const [firestoreError, setFirestoreError] = useState<string>('');

  const mainRef = useRef<HTMLElement | null>(null);

  const isNotFound = !VALID_ROUTES.includes(currentPath as KnownRoute);

  const navigateTo = useCallback((path: string) => {
    const normalized = normalizePath(path);
    window.history.pushState({}, '', normalized);
    setCurrentPath(normalized);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Título distinto en cada página (TS-04)
  useEffect(() => {
    if (isNotFound) {
      document.title = 'Página no encontrada (404) | StudyRoom';
    } else {
      const routeTitle = ROUTE_TITLES[currentPath as KnownRoute];
      document.title = `${routeTitle} | StudyRoom`;
    }
  }, [currentPath, isNotFound]);

  // Consulta a Cloud Firestore a través de la API (TS-00)
  const loadFirestoreData = useCallback(async () => {
    setFirestoreStatus('loading');
    setFirestoreError('');
    try {
      const response = await fetchSprint0FirestoreStatus();
      if (response.data) {
        setFirestoreData(response.data);
        setFirestoreStatus('success');
      } else {
        throw new Error('No se recibió el dato desde Firestore.');
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el servidor.';
      setFirestoreError(msg);
      setFirestoreStatus('error');
    }
  }, []);

  useEffect(() => {
    loadFirestoreData();
  }, [loadFirestoreData]);

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FDFBF9] text-[#1E293B] relative overflow-x-hidden">
      {/* Resplandores suaves del estilo StudyRoom */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-36 top-1/4 w-[420px] h-[420px] rounded-full bg-[#FDE2DC] opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-36 bottom-8 w-[420px] h-[420px] rounded-full bg-[#FDE2DC] opacity-60 blur-3xl"
      />

      {/* Enlace Saltar al contenido (TS-04) */}
      <a
        href="#contenido-principal"
        onClick={handleSkipToContent}
        className="skip-link"
      >
        Saltar al contenido
      </a>

      {/* Encabezado y Navegación base */}
      <header className="relative z-10 border-b border-[#F3D5CC] bg-white/85 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="flex items-center gap-3 rounded-xl focus:ring-2 focus:ring-indigo-400"
          >
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white shadow-sm"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#1E293B] block leading-none">
                StudyRoom
              </span>
              <span className="text-xs text-slate-600">
                Tu salón de estudio colaborativo en tiempo real
              </span>
            </div>
          </a>

          <nav aria-label="Navegación principal">
            <ul className="flex flex-wrap items-center gap-1.5" role="list">
              {VALID_ROUTES.map((path) => {
                const isActive = currentPath === path;
                return (
                  <li key={path}>
                    <a
                      href={path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo(path);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-indigo-400 ${
                        isActive
                          ? 'bg-[#D32F2F] text-white'
                          : 'text-[#1E293B] hover:bg-[#FDF0EC]'
                      }`}
                    >
                      {ROUTE_TITLES[path]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main
        id="contenido-principal"
        ref={mainRef}
        tabIndex={-1}
        className="relative z-10 flex-1 max-w-xl w-full mx-auto px-4 py-10 flex flex-col items-center justify-center focus:outline-none"
      >
        {/* PANTALLA PRINCIPAL (/): APARTADO DEL DATO DE FIRESTORE */}
        {currentPath === '/' && (
          <section
            aria-labelledby="titulo-inicio"
            className="w-full bg-[#FDF0EC] border border-[#F3D5CC] rounded-[24px] p-7 sm:p-9 shadow-[0_10px_30px_-10px_rgba(185,28,28,0.07)] space-y-6"
          >
            <div className="text-center space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#991B1B]">
                CLOUD FIRESTORE
              </p>
              <h1
                id="titulo-inicio"
                className="text-2xl font-extrabold text-[#1E293B]"
              >
                Estado de Conexión
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Dato consultado en tiempo real a través de la API
              </p>
            </div>

            {/* Estado: Cargando */}
            {firestoreStatus === 'loading' && (
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="bg-white rounded-2xl border border-[#E6C7BE] p-6 flex items-center justify-center gap-3"
              >
                <span
                  aria-hidden="true"
                  className="w-5 h-5 rounded-full border-2 border-[#D32F2F] border-t-transparent animate-spin"
                />
                <span className="text-sm font-bold text-[#1E293B]">
                  Cargando dato de Firestore...
                </span>
              </div>
            )}

            {/* Estado: Error (con botón Reintentar) */}
            {firestoreStatus === 'error' && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 rounded-2xl border border-[#EF4444] p-6 text-center space-y-4"
              >
                <p className="text-sm font-bold text-[#991B1B]">
                  {firestoreError}
                </p>
                <button
                  type="button"
                  onClick={loadFirestoreData}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs bg-[#D32F2F] hover:bg-[#B91C1C] text-white shadow-sm focus:ring-2 focus:ring-indigo-400"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Estado: Éxito */}
            {firestoreStatus === 'success' && firestoreData && (
              <div
                role="region"
                aria-label="Dato de Firestore"
                aria-live="polite"
                className="bg-white rounded-2xl border border-[#E6C7BE] p-6 text-center space-y-3 shadow-sm"
              >
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                  Conectado a Firestore
                </span>
                <p className="text-base sm:text-lg font-bold text-[#1E293B]">
                  {firestoreData.message}
                </p>
                <p className="text-xs text-slate-500">
                  Salas activas: <strong>{firestoreData.activeRoomsCount}</strong>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={loadFirestoreData}
              disabled={firestoreStatus === 'loading'}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl font-bold text-sm bg-[#D32F2F] hover:bg-[#B91C1C] text-white shadow-sm transition-colors focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
            >
              Actualizar dato
            </button>
          </section>
        )}

        {/* RUTAS EN BLANCO DEL MAPA DEL SITIO (/ingreso, /registro, /panel, /sala, /perfil, /ayuda) */}
        {!isNotFound && currentPath !== '/' && (
          <section
            aria-labelledby="titulo-ruta"
            className="w-full bg-[#FDF0EC] border border-[#F3D5CC] rounded-[24px] p-8 text-center shadow-sm space-y-4"
          >
            <h1
              id="titulo-ruta"
              className="text-2xl font-extrabold text-[#1E293B]"
            >
              {ROUTE_TITLES[currentPath as KnownRoute]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Ruta <code className="font-mono font-bold">{currentPath}</code>
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs bg-[#D32F2F] hover:bg-[#B91C1C] text-white focus:ring-2 focus:ring-indigo-400"
              >
                Volver a Inicio
              </button>
            </div>
          </section>
        )}

        {/* PÁGINA 404 (CUANDO SE ESCRIBE UNA RUTA QUE NO EXISTE) */}
        {isNotFound && (
          <section
            aria-labelledby="titulo-404"
            className="w-full bg-[#FDF0EC] border border-[#F3D5CC] rounded-[24px] p-8 text-center shadow-sm space-y-4"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#991B1B]">
              Error 404
            </p>
            <h1
              id="titulo-404"
              className="text-2xl font-extrabold text-[#1E293B]"
            >
              Página no encontrada
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              La ruta que ingresaste no existe en StudyRoom.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs bg-[#D32F2F] hover:bg-[#B91C1C] text-white focus:ring-2 focus:ring-indigo-400"
              >
                Volver a Inicio
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Pie de página común */}
      <footer className="relative z-10 border-t border-[#F3D5CC] bg-white/80 py-4 px-4 text-center text-xs text-slate-600">
        <p>StudyRoom • Tu salón de estudio colaborativo en tiempo real</p>
      </footer>
    </div>
  );
}

export default App;
