import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, push } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://medikiosk-7cf65-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, onValue, set, update, push };
