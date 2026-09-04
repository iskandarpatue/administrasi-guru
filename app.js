// Import fungsi Firebase (Pastikan menggunakan versi terbaru, contoh v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// GANTI DENGAN CONFIG FIREBASE PROYEK ANDA
const firebaseConfig = {
  apiKey: "API_KEY_ANDA",
  authDomain: "PROYEK_ANDA.firebaseapp.com",
  projectId: "PROYEK_ANDA",
  storageBucket: "PROYEK_ANDA.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Logika Logout
const btnLogout = document.getElementById("btnLogout");
if(btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Berhasil keluar dari portal.");
            // Arahkan ke halaman login (bisa dibuat file login.html terpisah)
        });
    });
}

// CONTOH: Cara upload file RPP/Modul ke Firebase Storage
async function uploadPerangkat(file) {
    const storageRef = ref(storage, 'perangkat/' + file.name);
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        console.log("File berhasil diupload! URL:", url);
        // Simpan URL ini ke Firestore Database agar bisa ditampilkan di website
    } catch (error) {
        console.error("Gagal upload file", error);
    }
}