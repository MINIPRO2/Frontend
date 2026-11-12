import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSprint0FirestoreStatus,
  checkUsernameAvailabilityApi,
  fetchCurrentUserProfileApi,
  registerManualProfileApi,
  syncGoogleProfileApi,
  assignUniqueUsernameApi,
  registerViaBackendAuthApi,
  loginViaBackendAuthApi,
  ApiFieldError,
} from "./services/api";
import {
  getFirebaseClientAuth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  sendPasswordResetEmail,
} from "./services/firebase";
import { Sprint0FirestoreData } from "./types/status";
import { UserProfile } from "./types/auth";

const SESSION_STORAGE_TOKEN_KEY = "studyroom_auth_token";
const SESSION_STORAGE_USER_KEY = "studyroom_auth_user";
const OWNER_FIRESTORE_EMAIL = "juanesteban0625@gmail.com";

function isOwnerAccount(user?: UserProfile | null): boolean {
  return Boolean(
    user?.email && user.email.trim().toLowerCase() === OWNER_FIRESTORE_EMAIL
  );
}

type IconName =
  | "arrow"
  | "book"
  | "check"
  | "chevron"
  | "eye"
  | "eyeOff"
  | "grid"
  | "lock"
  | "logout"
  | "mail"
  | "user";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.1 3.1M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    grid: (
      <>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
      </>
    ),
    lock: (
      <>
        <rect width="16" height="12" x="4" y="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
    mail: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.6 5.5a2.6 2.6 0 0 1-2.8 0L2 7" />
      </>
    ),
    user: (
      <>
        <path d="M19 21a7 7 0 0 0-14 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const AVATAR_OPTIONS = [
  { id: "INI", label: "Iniciales", badge: "IN" },
  { id: "🎓", label: "Académico", badge: "🎓" },
  { id: "🚀", label: "Explorador", badge: "🚀" },
  { id: "📚", label: "Lector", badge: "📚" },
  { id: "💡", label: "Innovador", badge: "💡" },
  { id: "⚡", label: "Constante", badge: "⚡" },
];

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}

function FieldErrorAlert({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold leading-snug text-red-700"
    >
      <span
        className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-red-600 text-[10px] text-[#fff]"
        aria-hidden="true"
      >
        !
      </span>
      <span>{message}</span>
    </p>
  );
}

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  general?: string;
};

function LoginPage({
  initialMode,
  navigateTo,
  onAuthenticated,
}: {
  initialMode: "login" | "register";
  navigateTo: (path: string) => void;
  onAuthenticated: (profile: UserProfile, token: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarChoice, setAvatarChoice] = useState("INI");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailableMsg, setUsernameAvailableMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const computedInitials =
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "SM";
  const resolvedAvatar = avatarChoice === "INI" ? computedInitials : avatarChoice;

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field] && !prev.general) return prev;
      return { ...prev, [field]: undefined, general: undefined };
    });
  };

  const handleUsernameBlur = async () => {
    if (mode !== "register") return;
    const trimmed = username.trim();
    if (!trimmed) return;

    setCheckingUsername(true);
    setUsernameAvailableMsg("");
    try {
      const res = await checkUsernameAvailabilityApi(trimmed);
      if (!res.available) {
        setFieldErrors((prev) => ({
          ...prev,
          username:
            res.message || "Este nombre de usuario ya está ocupado. Elige otro diferente.",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, username: undefined }));
        setUsernameAvailableMsg("Nombre de usuario disponible");
      }
    } catch (err) {
      if (err instanceof ApiFieldError) {
        setFieldErrors((prev) => ({ ...prev, username: err.message }));
      }
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateClientFields = (): boolean => {
    const errors: FieldErrors = {};
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "register") {
      if (!firstName.trim()) {
        errors.firstName = "Escribe tus nombres para completar tu perfil.";
      }
      if (!lastName.trim()) {
        errors.lastName = "Escribe tus apellidos para completar tu perfil.";
      }
      const userTrimmed = username.trim();
      if (!userTrimmed) {
        errors.username = "Elige un nombre de usuario único (ej. santi.martinez).";
      } else if (userTrimmed.length < 3 || userTrimmed.length > 20) {
        errors.username = "El nombre de usuario debe tener entre 3 y 20 caracteres.";
      } else if (!/^[a-zA-Z0-9._-]+$/.test(userTrimmed)) {
        errors.username =
          "Usa solo letras, números, puntos (.), guiones (-) o guiones bajos (_), sin espacios.";
      }
    }

    if (!emailTrimmed) {
      errors.email = "Escribe tu correo.";
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email =
        "El formato del correo no es válido. Usa el formato ejemplo@correo.com.";
    }

    if (!password) {
      errors.password =
        mode === "login"
          ? "Escribe tu contraseña para iniciar sesión."
          : "Crea una contraseña de al menos 8 caracteres con letras y números.";
    } else if (mode === "register") {
      if (password.length < 8) {
        errors.password =
          "La contraseña es muy corta: escribe al menos 8 caracteres.";
      } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        errors.password =
          "La contraseña es débil: combina letras y al menos un número.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");

    if (!validateClientFields()) {
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const fbAuth = getFirebaseClientAuth();

      if (mode === "register") {
        const check = await checkUsernameAvailabilityApi(username.trim());
        if (!check.available) {
          setFieldErrors({
            username:
              check.message ||
              "Este nombre de usuario ya está ocupado. Elige otro diferente.",
          });
          setLoading(false);
          return;
        }

        if (fbAuth) {
          try {
            const cred = await createUserWithEmailAndPassword(
              fbAuth,
              email.trim(),
              password
            );
            const idToken = await cred.user.getIdToken();
            const apiRes = await registerManualProfileApi(idToken, {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              username: username.trim(),
              email: email.trim().toLowerCase(),
              avatar: resolvedAvatar,
            });
            if (apiRes.data) {
              onAuthenticated(apiRes.data, idToken);
              navigateTo("/dashboard");
              return;
            }
          } catch (fbErr: unknown) {
            const code = (fbErr as { code?: string })?.code || "";
            if (
              code !== "auth/configuration-not-found" &&
              code !== "auth/operation-not-allowed"
            ) {
              throw fbErr;
            }
          }
        }

        const apiRes = await registerViaBackendAuthApi({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          avatar: resolvedAvatar,
        });
        if (apiRes.data && apiRes.token) {
          onAuthenticated(apiRes.data, apiRes.token);
          navigateTo("/dashboard");
          return;
        }
      } else {
        if (fbAuth) {
          try {
            const cred = await signInWithEmailAndPassword(
              fbAuth,
              email.trim(),
              password
            );
            const idToken = await cred.user.getIdToken();
            const meRes = await fetchCurrentUserProfileApi(idToken);
            if (meRes.data) {
              onAuthenticated(meRes.data, idToken);
              if (meRes.requiresUsername || !meRes.data.username) {
                navigateTo("/completar-username");
              } else {
                navigateTo("/dashboard");
              }
              return;
            }
          } catch (fbErr: unknown) {
            const code = (fbErr as { code?: string })?.code || "";
            if (
              code !== "auth/configuration-not-found" &&
              code !== "auth/operation-not-allowed"
            ) {
              throw fbErr;
            }
          }
        }

        const apiRes = await loginViaBackendAuthApi({
          email: email.trim().toLowerCase(),
          password,
        });
        if (apiRes.data && apiRes.token) {
          onAuthenticated(apiRes.data, apiRes.token);
          if (apiRes.requiresUsername || !apiRes.data.username) {
            navigateTo("/completar-username");
          } else {
            navigateTo("/dashboard");
          }
          return;
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiFieldError) {
        if (
          err.field &&
          ["firstName", "lastName", "username", "email", "password"].includes(err.field)
        ) {
          setFieldErrors({ [err.field]: err.message });
        } else {
          setFieldErrors({ general: err.message });
        }
      } else {
        const fbCode = (err as { code?: string })?.code || "";
        if (fbCode === "auth/email-already-in-use") {
          setFieldErrors({
            email: "Este correo ya está registrado. Inicia sesión o usa otro correo.",
          });
        } else if (
          fbCode === "auth/invalid-credential" ||
          fbCode === "auth/wrong-password" ||
          fbCode === "auth/user-not-found"
        ) {
          setFieldErrors({ general: "Correo o contraseña incorrectos" });
        } else if (fbCode === "auth/weak-password") {
          setFieldErrors({
            password:
              "La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.",
          });
        } else {
          setFieldErrors({
            general:
              mode === "login"
                ? "Correo o contraseña incorrectos"
                : "No se pudo completar el registro. Verifica tus datos e inténtalo de nuevo.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    const fbAuth = getFirebaseClientAuth();

    if (!fbAuth) {
      setFieldErrors({
        general:
          "No se encontró la configuración de Firebase para abrir la ventana de Google.",
      });
      return;
    }

    const popupPromise = signInWithPopup(fbAuth, googleProvider);
    setFieldErrors({});
    setNotice("Conectando con tu cuenta de Google...");
    setLoading(true);

    try {
      const cred = await popupPromise;
      const idToken = await cred.user.getIdToken();
      const syncRes = await syncGoogleProfileApi(idToken, {
        email: cred.user.email || "",
        firstName: cred.user.displayName?.split(" ")[0] || "Estudiante",
        lastName: cred.user.displayName?.split(" ").slice(1).join(" ") || "",
      });
      if (syncRes.data) {
        onAuthenticated(syncRes.data, idToken);
        if (syncRes.requiresUsername || !syncRes.data.username) {
          navigateTo("/completar-username");
        } else {
          navigateTo("/dashboard");
        }
      }
    } catch (err: unknown) {
      setNotice("");
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setFieldErrors({
          general: "Cerraste la ventana de Google antes de elegir una cuenta.",
        });
      } else if (code === "auth/popup-blocked") {
        setFieldErrors({
          general:
            "Tu navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para este sitio e intenta de nuevo.",
        });
      } else if (
        code === "auth/configuration-not-found" ||
        code === "auth/operation-not-allowed"
      ) {
        setFieldErrors({
          general:
            "Falta activar el proveedor Google en Firebase Console (Authentication -> Sign-in method -> Google -> Habilitar).",
        });
      } else if (code === "auth/unauthorized-domain") {
        setFieldErrors({
          general: `El dominio actual (${window.location.hostname}) no está autorizado en Firebase Authentication.`,
        });
      } else if (err instanceof ApiFieldError) {
        setFieldErrors({
          general: err.message,
        });
      } else {
        setFieldErrors({
          general:
            "No se pudo conectar con el servidor tras autenticar con Google. Verifica tu conexión e inténtalo de nuevo.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async () => {
    setFieldErrors({});
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFieldErrors({
        email: "Escribe primero tu correo para recuperar la contraseña.",
      });
      return;
    }
    const fbAuth = getFirebaseClientAuth();
    if (fbAuth) {
      try {
        await sendPasswordResetEmail(fbAuth, cleanEmail);
      } catch {
        // Aviso estándar por privacidad
      }
    }
    setNotice(`Enviaremos las instrucciones de recuperación a ${cleanEmail}.`);
  };

  const switchMode = () => {
    const nextMode = mode === "login" ? "register" : "login";
    setMode(nextMode);
    setFieldErrors({});
    setNotice("");
    setUsernameAvailableMsg("");
    navigateTo(nextMode === "register" ? "/register" : "/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 selection:bg-indigo-500/40 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[20%] size-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-9rem] right-[-5rem] size-96 rounded-full bg-[#ffd9c7]/45 blur-3xl" />

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg flex-col justify-center focus:outline-none"
      >
        <header className="mb-7 text-center">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              setMode("login");
              navigateTo("/login");
            }}
            className="button-focus mx-auto inline-flex items-center gap-3 rounded-xl"
            aria-label="StudyRoom, volver al inicio"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
              <Icon name="book" size={24} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white">StudyRoom</span>
          </a>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Tu salón de estudio colaborativo en tiempo real
          </p>
        </header>

        <section className="rounded-3xl border border-slate-700/80 bg-slate-800/90 p-5 shadow-2xl shadow-black/10 sm:p-8">
          <div className="mb-7 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
              {mode === "login" ? "Bienvenido de nuevo" : "Únete a StudyRoom"}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {mode === "login" ? "Iniciar sesión" : "Crear una cuenta"}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {mode === "login"
                ? "Ingresa con tu correo o Google"
                : "Regístrate con tu correo o Google"}
            </p>
          </div>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={loading}
            className="login-focus flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-600 bg-white px-4 text-sm font-bold text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-900 active:scale-[.99] disabled:opacity-60"
          >
            <GoogleMark />
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-slate-600" />
            <span className="text-xs font-medium text-slate-500">
              {mode === "login" ? "o ingresa con tu correo" : "o regístrate con tu correo"}
            </span>
            <div className="h-px flex-1 bg-slate-600" />
          </div>

          <form onSubmit={submitAuth} noValidate>
            {mode === "register" && (
              <>
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="register-firstName"
                      className="mb-1.5 block text-sm font-bold text-slate-200"
                    >
                      Nombres
                    </label>
                    <input
                      id="register-firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearFieldError("firstName");
                      }}
                      placeholder="Ej. Santiago"
                      aria-invalid={!!fieldErrors.firstName}
                      aria-describedby={
                        fieldErrors.firstName ? "firstName-error" : undefined
                      }
                      className={`login-focus h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-100 placeholder:text-slate-500 ${
                        fieldErrors.firstName
                          ? "border-red-500 ring-1 ring-red-500/30"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    />
                    <FieldErrorAlert
                      id="firstName-error"
                      message={fieldErrors.firstName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="register-lastName"
                      className="mb-1.5 block text-sm font-bold text-slate-200"
                    >
                      Apellidos
                    </label>
                    <input
                      id="register-lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearFieldError("lastName");
                      }}
                      placeholder="Ej. Martínez"
                      aria-invalid={!!fieldErrors.lastName}
                      aria-describedby={
                        fieldErrors.lastName ? "lastName-error" : undefined
                      }
                      className={`login-focus h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-100 placeholder:text-slate-500 ${
                        fieldErrors.lastName
                          ? "border-red-500 ring-1 ring-red-500/30"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    />
                    <FieldErrorAlert
                      id="lastName-error"
                      message={fieldErrors.lastName}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="register-username"
                    className="mb-1.5 block text-sm font-bold text-slate-200"
                  >
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Icon name="user" size={18} />
                    </span>
                    <input
                      id="register-username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setUsernameAvailableMsg("");
                        clearFieldError("username");
                      }}
                      onBlur={handleUsernameBlur}
                      placeholder="Ej. santi.martinez"
                      aria-invalid={!!fieldErrors.username}
                      aria-describedby={
                        fieldErrors.username
                          ? "username-error"
                          : "username-help"
                      }
                      className={`login-focus h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-slate-100 placeholder:text-slate-500 ${
                        fieldErrors.username
                          ? "border-red-500 ring-1 ring-red-500/30"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    />
                  </div>
                  <p id="username-help" className="mt-1 text-xs text-slate-400">
                    Entre 3 y 20 caracteres (letras, números, puntos o guiones).
                  </p>
                  {checkingUsername && (
                    <p role="status" className="mt-1 text-xs font-semibold text-slate-300">
                      Verificando disponibilidad...
                    </p>
                  )}
                  {usernameAvailableMsg && !fieldErrors.username && (
                    <p
                      role="status"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-300"
                    >
                      <Icon name="check" size={15} /> {usernameAvailableMsg}
                    </p>
                  )}
                  <FieldErrorAlert
                    id="username-error"
                    message={fieldErrors.username}
                  />
                </div>

                <fieldset className="mb-5">
                  <legend className="mb-2 block text-sm font-bold text-slate-200">
                    Elige tu avatar
                  </legend>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {AVATAR_OPTIONS.map((item) => {
                      const isSelected = avatarChoice === item.id;
                      const previewText =
                        item.id === "INI" ? computedInitials : item.badge;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAvatarChoice(item.id)}
                          aria-pressed={isSelected}
                          aria-label={`Avatar ${item.label}`}
                          className={`login-focus flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-300 ring-2 ring-indigo-500/30"
                              : "border-slate-600 bg-white text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-bold text-white">
                            {previewText}
                          </span>
                          <span className="truncate text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            )}

            <div className="mb-5">
              <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-slate-200">
                Correo
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Icon name="mail" size={19} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                  placeholder="ejemplo@correo.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`login-focus h-13 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-slate-100 placeholder:text-slate-500 hover:border-slate-500 ${
                    fieldErrors.email
                      ? "border-red-500 ring-1 ring-red-500/30"
                      : "border-slate-600"
                  }`}
                />
              </div>
              <FieldErrorAlert id="email-error" message={fieldErrors.email} />
            </div>

            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="login-password" className="block text-sm font-bold text-slate-200">
                Contraseña
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={recoverPassword}
                  className="login-focus rounded text-xs font-bold text-indigo-300 underline-offset-4 hover:text-indigo-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Icon name="lock" size={19} />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                placeholder={
                  mode === "login"
                    ? "Ingresa tu contraseña"
                    : "Mínimo 8 caracteres con letras y números"
                }
                aria-invalid={!!fieldErrors.password || !!fieldErrors.general}
                aria-describedby={
                  fieldErrors.password
                    ? "password-error"
                    : fieldErrors.general
                      ? "auth-error"
                      : undefined
                }
                className={`login-focus h-13 w-full rounded-xl border bg-white pl-11 pr-12 text-[15px] text-slate-100 placeholder:text-slate-500 hover:border-slate-500 ${
                  fieldErrors.password || fieldErrors.general
                    ? "border-red-500 ring-1 ring-red-500/30"
                    : "border-slate-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="login-focus absolute inset-y-1 right-1 grid w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={20} />
              </button>
            </div>
            <FieldErrorAlert id="password-error" message={fieldErrors.password} />

            <div className="min-h-10 pt-2">
              {fieldErrors.general && (
                <p
                  id="auth-error"
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold leading-snug text-red-700"
                >
                  <span
                    className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-red-600 text-[10px] text-[#fff]"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  {fieldErrors.general}
                </p>
              )}
              {notice && !fieldErrors.general && (
                <p
                  role="status"
                  className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300"
                >
                  {notice}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-focus mt-2 flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-500 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-400 active:scale-[.99] disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:opacity-80"
            >
              {loading ? (
                <>
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  {mode === "login" ? "Autenticando..." : "Creando tu cuenta..."}
                </>
              ) : mode === "login" ? (
                "Iniciar sesión"
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="login-focus rounded font-bold text-indigo-300 underline-offset-4 hover:text-indigo-400 hover:underline"
            >
              {mode === "login" ? "Regístrate aquí" : "Inicia sesión"}
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Al continuar, aceptas los términos de uso y la política de privacidad de StudyRoom.
        </p>
      </main>
    </div>
  );
}

function CompleteUsernamePage({
  user,
  token,
  onProfileUpdated,
  onLogout,
  navigateTo,
}: {
  user: UserProfile;
  token: string;
  onProfileUpdated: (profile: UserProfile) => void;
  onLogout: () => void;
  navigateTo: (path: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [avatarChoice, setAvatarChoice] = useState(user.avatar || "INI");
  const [error, setError] = useState("");
  const [availableNotice, setAvailableNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0) || "G"}`.toUpperCase() || "SR";
  const resolvedAvatar = avatarChoice === "INI" ? initials : avatarChoice;

  const verifyUsernameOnBlur = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    try {
      const check = await checkUsernameAvailabilityApi(trimmed, user.uid);
      if (!check.available) {
        setError(
          check.message || "Este nombre de usuario ya está ocupado. Elige otro diferente."
        );
        setAvailableNotice("");
      } else {
        setError("");
        setAvailableNotice("¡Nombre de usuario disponible!");
      }
    } catch (err) {
      if (err instanceof ApiFieldError) {
        setError(err.message);
        setAvailableNotice("");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setAvailableNotice("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Debes elegir un nombre de usuario antes de entrar a tu panel.");
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError("El nombre de usuario debe tener entre 3 y 20 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError(
        "Usa solo letras, números, puntos (.), guiones (-) o guiones bajos (_), sin espacios."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await assignUniqueUsernameApi(token, {
        username: trimmed,
        avatar: resolvedAvatar,
      });
      if (res.data) {
        onProfileUpdated(res.data);
        navigateTo("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiFieldError) {
        setError(err.message);
      } else {
        setError("No se pudo guardar el nombre de usuario. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 selection:bg-indigo-500/40 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[20%] size-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-9rem] right-[-5rem] size-96 rounded-full bg-[#ffd9c7]/45 blur-3xl" />

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg flex-col justify-center focus:outline-none"
      >
        <section className="rounded-3xl border border-slate-700/80 bg-slate-800/90 p-6 shadow-2xl shadow-black/10 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-indigo-500 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25">
              {resolvedAvatar}
            </span>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
              Configura tu perfil
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Elige tu nombre de usuario
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              ¡Hola, <strong className="text-slate-200">{user.firstName}</strong>! Para
              identificarte en las salas de estudio, elige un nombre de usuario único antes de
              continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="google-username-input"
                className="mb-2 block text-sm font-bold text-slate-200"
              >
                Nombre de usuario
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Icon name="user" size={19} />
                </span>
                <input
                  id="google-username-input"
                  type="text"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                    if (availableNotice) setAvailableNotice("");
                  }}
                  onBlur={verifyUsernameOnBlur}
                  placeholder="Ej. juan.esteban"
                  aria-invalid={!!error}
                  aria-describedby={error ? "google-username-error" : "google-username-help"}
                  className={`login-focus h-13 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-slate-100 placeholder:text-slate-500 ${
                    error ? "border-red-500 ring-1 ring-red-500/30" : "border-slate-600"
                  }`}
                />
              </div>
              <p id="google-username-help" className="mt-1.5 text-xs text-slate-400">
                Entre 3 y 20 caracteres (letras, números, puntos, guiones o guion bajo).
              </p>
              {availableNotice && !error && (
                <p
                  role="status"
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-300"
                >
                  <Icon name="check" size={15} /> {availableNotice}
                </p>
              )}
              <FieldErrorAlert id="google-username-error" message={error} />
            </div>

            <fieldset className="mb-6">
              <legend className="mb-2 block text-sm font-bold text-slate-200">
                Personaliza tu avatar
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {AVATAR_OPTIONS.map((item) => {
                  const isSelected = avatarChoice === item.id;
                  const previewText = item.id === "INI" ? initials : item.badge;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatarChoice(item.id)}
                      aria-pressed={isSelected}
                      aria-label={`Avatar ${item.label}`}
                      className={`login-focus flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-300 ring-2 ring-indigo-500/30"
                          : "border-slate-600 bg-white text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-bold text-white">
                        {previewText}
                      </span>
                      <span className="truncate text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="login-focus flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-500 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-400 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Guardando tu nombre de usuario...
                </>
              ) : (
                <>
                  Guardar y entrar al panel <Icon name="arrow" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onLogout}
              className="login-focus rounded text-xs font-bold text-slate-400 underline-offset-4 hover:text-indigo-300 hover:underline"
            >
              Cancelar y usar otra cuenta
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function PostLoginHeader({
  currentPath,
  user,
  navigateTo,
  onLogout,
}: {
  currentPath: "/dashboard" | "/firestore";
  user: UserProfile;
  navigateTo: (path: string) => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canSeeFirestore = isOwnerAccount(user);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const fullName = `${user.firstName} ${user.lastName}`.trim() || "Estudiante";
  const avatarBadge =
    user.avatar ||
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    "SM";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("/dashboard");
          }}
          className="button-focus flex items-center gap-3 rounded-lg"
          aria-label="StudyRoom, ir al panel principal"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
            <Icon name="book" size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">StudyRoom</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          {canSeeFirestore && (
            <nav aria-label="Navegación privada" className="flex items-center gap-1.5">
              <a
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/dashboard");
                }}
                aria-current={currentPath === "/dashboard" ? "page" : undefined}
                className={`button-focus rounded-lg px-3 py-2 text-xs font-bold transition ${
                  currentPath === "/dashboard"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Panel
              </a>
              <a
                href="/firestore"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/firestore");
                }}
                aria-current={currentPath === "/firestore" ? "page" : undefined}
                className={`button-focus rounded-lg px-3 py-2 text-xs font-bold transition ${
                  currentPath === "/firestore"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Estado Firestore
              </a>
            </nav>
          )}

          <p className="hidden text-sm text-slate-400 sm:block">
            ¡Hola, <strong className="font-semibold text-slate-200">{user.firstName}</strong>!
          </p>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="button-focus flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-800"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Menú de cuenta de ${fullName}`}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-950">
                {avatarBadge}
              </span>
              <Icon name="chevron" size={15} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-14 w-60 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-2xl shadow-black/40"
              >
                <div className="border-b border-slate-700 px-3 py-2.5">
                  <p className="text-sm font-semibold text-white">{fullName}</p>
                  {user.username && (
                    <p className="text-xs font-bold text-indigo-300">@{user.username}</p>
                  )}
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="button-focus mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                >
                  <Icon name="logout" size={17} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardPage({
  user,
  navigateTo,
  onLogout,
}: {
  user: UserProfile;
  navigateTo: (path: string) => void;
  onLogout: () => void;
}) {
  const fullName = `${user.firstName} ${user.lastName}`.trim() || "Estudiante";
  const avatarBadge =
    user.avatar ||
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    "SM";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/40">
      <PostLoginHeader
        currentPath="/dashboard"
        user={user}
        navigateTo={navigateTo}
        onLogout={onLogout}
      />

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="mx-auto max-w-5xl px-4 pb-16 pt-9 focus:outline-none sm:px-6 lg:px-8 lg:pt-12"
      >
        <section
          aria-labelledby="welcome-heading"
          className="mb-8 rounded-3xl border border-slate-700/80 bg-slate-800/90 p-6 shadow-2xl shadow-black/10 sm:p-8"
        >
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span
                className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 text-lg font-extrabold text-white shadow-lg shadow-indigo-500/25"
                aria-hidden="true"
              >
                {avatarBadge}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">
                  Panel principal
                </p>
                <h1
                  id="welcome-heading"
                  className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
                >
                  ¡Bienvenido, {fullName}!
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                  {user.username && (
                    <span className="font-bold text-indigo-300">@{user.username}</span>
                  )}
                  <span aria-hidden="true">•</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="button-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-white px-4 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
            >
              <Icon name="logout" size={17} /> Cerrar sesión
            </button>
          </div>
        </section>

        <section aria-labelledby="rooms-title">
          <div className="mb-5">
            <div className="flex items-center gap-2 text-indigo-400">
              <Icon name="grid" size={18} />
              <span className="text-xs font-bold uppercase tracking-[.16em]">
                Tu espacio de estudio
              </span>
            </div>
            <h2
              id="rooms-title"
              className="mt-1.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl"
            >
              Mis salas de estudio
            </h2>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/45 px-6 py-16 text-center">
            <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-slate-800 text-indigo-300">
              <Icon name="book" size={34} />
            </div>
            <h3 className="text-xl font-bold text-white">Aún no tienes salas registradas</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Tu cuenta está activa y lista. Aquí aparecerán tus salones de estudio colaborativo.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

type FetchStatus = "loading" | "success" | "error";

function FirestoreStatusPage({
  user,
  navigateTo,
  onLogout,
}: {
  user: UserProfile;
  navigateTo: (path: string) => void;
  onLogout: () => void;
}) {
  const [firestoreStatus, setFirestoreStatus] = useState<FetchStatus>("loading");
  const [firestoreData, setFirestoreData] = useState<Sprint0FirestoreData | null>(null);
  const [firestoreError, setFirestoreError] = useState<string>("");

  const loadFirestoreData = useCallback(async () => {
    setFirestoreStatus("loading");
    setFirestoreError("");
    try {
      const response = await fetchSprint0FirestoreStatus();
      if (response.data) {
        setFirestoreData(response.data);
        setFirestoreStatus("success");
      } else {
        throw new Error("No se recibió el dato desde Firestore.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo conectar con el servidor.";
      setFirestoreError(msg);
      setFirestoreStatus("error");
    }
  }, []);

  useEffect(() => {
    loadFirestoreData();
  }, [loadFirestoreData]);

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100">
      <PostLoginHeader
        currentPath="/firestore"
        user={user}
        navigateTo={navigateTo}
        onLogout={onLogout}
      />

      <div className="pointer-events-none absolute left-[-8rem] top-[20%] size-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-9rem] right-[-5rem] size-96 rounded-full bg-[#ffd9c7]/45 blur-3xl" />

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-10 focus:outline-none"
      >
        <section
          aria-labelledby="titulo-inicio"
          className="w-full space-y-6 rounded-3xl border border-slate-700/80 bg-slate-800/90 p-7 shadow-2xl shadow-black/10 sm:p-9"
        >
          <div className="space-y-1.5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
              CLOUD FIRESTORE
            </p>
            <h1 id="titulo-inicio" className="text-2xl font-extrabold text-white">
              Estado de Conexión
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm">
              Dato consultado en tiempo real a través de la API
            </p>
          </div>

          {firestoreStatus === "loading" && (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-600 bg-white p-6"
            >
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
              />
              <span className="text-sm font-bold text-slate-100">
                Cargando dato de Firestore...
              </span>
            </div>
          )}

          {firestoreStatus === "error" && (
            <div
              role="alert"
              aria-live="assertive"
              className="space-y-4 rounded-2xl border border-red-500 bg-red-50 p-6 text-center"
            >
              <p className="text-sm font-bold text-red-700">{firestoreError}</p>
              <button
                type="button"
                onClick={loadFirestoreData}
                className="button-focus min-h-[44px] rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-400"
              >
                Reintentar
              </button>
            </div>
          )}

          {firestoreStatus === "success" && firestoreData && (
            <div
              role="region"
              aria-label="Dato de Firestore"
              aria-live="polite"
              className="space-y-3 rounded-2xl border border-slate-600 bg-white p-6 text-center shadow-sm"
            >
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                Conectado a Firestore
              </span>
              <p className="text-base font-bold text-slate-100 sm:text-lg">
                {firestoreData.message}
              </p>
              <p className="text-xs text-slate-400">
                Salas activas: <strong>{firestoreData.activeRoomsCount}</strong>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={loadFirestoreData}
            disabled={firestoreStatus === "loading"}
            className="button-focus min-h-[48px] w-full rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Actualizar dato
          </button>
        </section>
      </main>
    </div>
  );
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "") return "/";
  const clean =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (clean === "/panel") return "/dashboard";
  if (clean === "/ingreso") return "/login";
  if (clean === "/registro") return "/register";
  return clean;
}

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_STORAGE_TOKEN_KEY)
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const navigateTo = useCallback((path: string) => {
    const normalized = normalizePath(path);
    window.history.pushState({}, "", normalized);
    setCurrentPath(normalized);
  }, []);

  const handleAuthenticated = useCallback((profile: UserProfile, token: string) => {
    localStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token);
    localStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(profile));
    setAuthToken(token);
    setCurrentUser(profile);
  }, []);

  const handleProfileUpdated = useCallback((profile: UserProfile) => {
    localStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(profile));
    setCurrentUser(profile);
  }, []);

  const handleLogout = useCallback(async () => {
    const fbAuth = getFirebaseClientAuth();
    if (fbAuth) {
      try {
        await firebaseSignOut(fbAuth);
      } catch {
        // Continúa cerrando sesión local
      }
    }
    localStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
    localStorage.removeItem(SESSION_STORAGE_USER_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    navigateTo("/login");
  }, [navigateTo]);

  useEffect(() => {
    if (!authToken) return;
    let active = true;
    fetchCurrentUserProfileApi(authToken)
      .then((res) => {
        if (!active) return;
        if (res.data) {
          handleProfileUpdated(res.data);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiFieldError && err.status === 401) {
          handleLogout();
        }
      });
    return () => {
      active = false;
    };
  }, [authToken, handleProfileUpdated, handleLogout]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const isPrivateRoute =
      currentPath === "/dashboard" ||
      currentPath === "/firestore" ||
      currentPath === "/completar-username";

    if (!currentUser || !authToken) {
      if (isPrivateRoute) {
        navigateTo("/login");
      }
      return;
    }

    const needsUsername = currentUser.requiresUsername || !currentUser.username;

    if (needsUsername && currentPath !== "/completar-username") {
      navigateTo("/completar-username");
      return;
    }

    if (currentPath === "/firestore" && !isOwnerAccount(currentUser)) {
      navigateTo("/dashboard");
      return;
    }

    if (
      !needsUsername &&
      (currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath === "/completar-username")
    ) {
      navigateTo("/dashboard");
    }
  }, [currentPath, currentUser, authToken, navigateTo]);

  useEffect(() => {
    if (currentPath === "/" || currentPath === "/login") {
      document.title = "Iniciar sesión | StudyRoom";
    } else if (currentPath === "/register") {
      document.title = "Crear una cuenta | StudyRoom";
    } else if (currentPath === "/completar-username") {
      document.title = "Elegir nombre de usuario | StudyRoom";
    } else if (currentPath === "/dashboard") {
      document.title = "Panel de estudio | StudyRoom";
    } else if (currentPath === "/firestore") {
      document.title = "Estado Firestore | StudyRoom";
    } else {
      document.title = "Página no encontrada (404) | StudyRoom";
    }
  }, [currentPath]);

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainEl = document.getElementById("contenido-principal");
    mainEl?.focus();
  };

  return (
    <>
      <a href="#contenido-principal" onClick={handleSkipToContent} className="skip-link">
        Saltar al contenido
      </a>
      {(currentPath === "/" || currentPath === "/login" || currentPath === "/register") && (
        <LoginPage
          initialMode={currentPath === "/register" ? "register" : "login"}
          navigateTo={navigateTo}
          onAuthenticated={handleAuthenticated}
        />
      )}
      {currentPath === "/completar-username" && currentUser && authToken && (
        <CompleteUsernamePage
          user={currentUser}
          token={authToken}
          onProfileUpdated={handleProfileUpdated}
          onLogout={handleLogout}
          navigateTo={navigateTo}
        />
      )}
      {currentPath === "/dashboard" && currentUser && authToken && (
        <DashboardPage
          user={currentUser}
          navigateTo={navigateTo}
          onLogout={handleLogout}
        />
      )}
      {currentPath === "/firestore" &&
        currentUser &&
        authToken &&
        isOwnerAccount(currentUser) && (
          <FirestoreStatusPage
            user={currentUser}
            navigateTo={navigateTo}
            onLogout={handleLogout}
          />
        )}
      {currentPath !== "/" &&
        currentPath !== "/login" &&
        currentPath !== "/register" &&
        currentPath !== "/completar-username" &&
        currentPath !== "/dashboard" &&
        currentPath !== "/firestore" && (
          <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <main
              id="contenido-principal"
              tabIndex={-1}
              className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-10 focus:outline-none"
            >
              <section
                aria-labelledby="titulo-404"
                className="w-full space-y-4 rounded-3xl border border-slate-700/80 bg-slate-800/90 p-8 text-center shadow-xl"
              >
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  Error 404
                </p>
                <h1 id="titulo-404" className="text-2xl font-extrabold text-white">
                  Página no encontrada
                </h1>
                <p className="text-sm text-slate-400">
                  La ruta que ingresaste no existe en StudyRoom.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo(currentUser ? "/dashboard" : "/login")}
                    className="button-focus min-h-[44px] rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-400"
                  >
                    {currentUser ? "Volver al panel" : "Ir al inicio de sesión"}
                  </button>
                </div>
              </section>
            </main>
          </div>
        )}
    </>
  );
}

export default App;
