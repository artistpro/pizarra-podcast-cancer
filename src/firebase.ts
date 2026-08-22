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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  window.dispatchEvent(new CustomEvent("board_state_updated", { detail: stateWithTimestamp }));

  if (db) {
    try {
      const boardRef = ref(db, "podcast_cancer/board_state");
      await set(boardRef, stateWithTimestamp);
    } catch (err) {
      console.error("Error guardando en Firebase:", err);
    }
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
