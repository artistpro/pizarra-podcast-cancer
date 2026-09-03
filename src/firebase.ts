import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import type { BoardState } from "./types/board";
import { DEFAULT_BOARD_STATE, normalizeBoardState } from "./types/board";

const firebaseConfig = {
  apiKey: "AIzaSyBndIKt7SPNUl4mG7IRVd6EGUGkZLpLD0A",
  authDomain: "dashboard-bch.firebaseapp.com",
  databaseURL: "https://dashboard-bch-default-rtdb.firebaseio.com",
  projectId: "dashboard-bch",
  storageBucket: "dashboard-bch.firebasestorage.app",
  messagingSenderId: "1082690329234",
  appId: "1:1082690329234:web:8129fa99bdded9aa3f244b",
  measurementId: "G-D66Z66FM1X"
};

let db: any = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.warn("Firebase no inicializado, usando almacenamiento local:", e);
}

export { db };

const STORAGE_KEY = "podcast_cancer_board_state";

export const saveBoardState = async (state: BoardState): Promise<void> => {
  const normalized = normalizeBoardState(state);
  const stateWithTimestamp = {
    ...normalized,
    lastUpdated: Date.now()
  };

  // 1. Sanitización profunda: elimina cualquier clave undefined que pueda bloquear Firebase
  const cleanPayload = JSON.parse(JSON.stringify(stateWithTimestamp));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPayload));
  window.dispatchEvent(new CustomEvent("board_state_updated", { detail: cleanPayload }));

  let savedSuccessfully = false;

  // 2. Intento vía Firebase Web SDK (WebSocket)
  if (db) {
    try {
      const boardRef = ref(db, "podcast_cancer/board_state");
      await set(boardRef, cleanPayload);
      savedSuccessfully = true;
    } catch (err) {
      console.warn("Firebase Web SDK set() fallo, usando fallback REST API directo:", err);
    }
  }

  // 3. Fallback Infalible: REST API directo (HTTP PUT a Firebase RTDB)
  if (!savedSuccessfully) {
    try {
      const resp = await fetch("https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/board_state.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload)
      });
      if (resp.ok) {
        savedSuccessfully = true;
      } else {
        console.error("Fallo REST API Firebase:", resp.status, await resp.text());
      }
    } catch (restErr) {
      console.error("Error en petición REST a Firebase:", restErr);
    }
  }

  if (!savedSuccessfully) {
    throw new Error("No se pudo persistir el estado en Firebase.");
  }
};

export const subscribeBoardState = (callback: (state: BoardState) => void): (() => void) => {
  const localSaved = localStorage.getItem(STORAGE_KEY);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      callback(normalizeBoardState(parsed));
    } catch {
      callback(DEFAULT_BOARD_STATE);
    }
  } else {
    callback(DEFAULT_BOARD_STATE);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(normalizeBoardState(parsed));
      } catch (err) {
        console.error("Error parseando storage:", err);
      }
    }
  };

  const handleCustomEvent = (e: any) => {
    if (e.detail) {
      callback(normalizeBoardState(e.detail));
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("board_state_updated", handleCustomEvent);

  let unsubscribeFirebase = () => {};
  if (db) {
    const boardRef = ref(db, "podcast_cancer/board_state");
    unsubscribeFirebase = onValue(boardRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const normalized = normalizeBoardState(val);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        callback(normalized);
      }
    });
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("board_state_updated", handleCustomEvent);
    if (unsubscribeFirebase) unsubscribeFirebase();
  };
};

export const sendLiveAlert = async (alert: any): Promise<void> => {
  const cleanAlert = JSON.parse(JSON.stringify(alert));
  let sent = false;

  if (db) {
    try {
      const alertRef = ref(db, "podcast_cancer/live_alerts/latest");
      await set(alertRef, cleanAlert);
      sent = true;
    } catch (err) {
      console.warn("Fallo SDK enviando alerta, usando fallback REST:", err);
    }
  }

  if (!sent) {
    try {
      await fetch("https://dashboard-bch-default-rtdb.firebaseio.com/podcast_cancer/live_alerts/latest.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanAlert)
      });
    } catch (e) {
      console.error("Error en fallback REST de alerta:", e);
    }
  }
};

export const subscribeLiveAlert = (callback: (alert: any) => void): (() => void) => {
  if (!db) return () => {};
  const alertRef = ref(db, "podcast_cancer/live_alerts/latest");
  return onValue(alertRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      callback(val);
    }
  });
};
