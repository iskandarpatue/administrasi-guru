// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// ==========================================
// 1. GANTI BAGIAN INI DENGAN CONFIG FIREBASE ANDA
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCkKwGoWQFUmP0BUlSdQPY7Esscm6N82Hk",
  authDomain: "administrasi-guru-sma.firebaseapp.com",
  projectId: "administrasi-guru-sma",
  storageBucket: "administrasi-guru-sma.firebasestorage.app",
  messagingSenderId: "921439707926",
  appId: "1:921439707926:web:e484ef576f3bf553c46637",
  measurementId: "G-HPXZM13EMP"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// 2. LOGIKA AUTENTIKASI (LOGIN & LOGOUT)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika User sudah Login
        if(document.getElementById("loginSection")) {
            document.getElementById("loginSection").classList.add("hidden");
            document.getElementById("dashboardSection").classList.remove("hidden");
            document.getElementById("btnLogout").classList.remove("hidden");
        }
        if(document.getElementById("kontenJurnal")) document.getElementById("kontenJurnal").classList.remove("hidden");
        if(document.getElementById("kontenPerangkat")) document.getElementById("kontenPerangkat").classList.remove("hidden");
        
        // Panggil fungsi muat data jika ada di halaman tersebut
        if(document.getElementById("tabelJurnalData")) muatJurnal();
        if(document.getElementById("listPerangkat")) muatPerangkat();
    } else {
        // Jika Belum Login
        if(!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
            window.location.href = "index.html"; // Lempar kembali ke halaman login
        }
    }
});

// Proses Form Login
const formLogin = document.getElementById("formLogin");
if(formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("emailLogin").value;
        const pass = document.getElementById("passLogin").value;
        
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => alert("Login Berhasil!"))
            .catch((error) => alert("Login Gagal: " + error.message));
    });
}

// Proses Logout
const btnLogout = document.getElementById("btnLogout");
if(btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });
}

// ==========================================
// 3. LOGIKA JURNAL MENGAJAR (FIRESTORE DATABASE)
// ==========================================
const formJurnal = document.getElementById("formJurnal");
if(formJurnal) {
    formJurnal.addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("btnSimpanJurnal").innerText = "Menyimpan...";
        
        try {
            await addDoc(collection(db, "jurnal_mengajar"), {
                tanggal: document.getElementById("jurnalTanggal").value,
                kelas: document.getElementById("jurnalKelas").value,
                materi: document.getElementById("jurnalMateri").value,
                keterangan: document.getElementById("jurnalKeterangan").value,
                timestamp: serverTimestamp()
            });
            alert("Jurnal berhasil disimpan!");
            formJurnal.reset();
            muatJurnal(); // Refresh tabel
        } catch (error) {
            alert("Gagal menyimpan data: " + error.message);
        }
        document.getElementById("btnSimpanJurnal").innerText = "Simpan Jurnal";
    });
}

async function muatJurnal() {
    const tabelBody = document.getElementById("tabelJurnalData");
    tabelBody.innerHTML = "<tr><td colspan='4' class='text-center'>Memuat data...</td></tr>";
    
    // Ambil data diurutkan berdasarkan waktu terbaru
    const q = query(collection(db, "jurnal_mengajar"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);
    
    tabelBody.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        tabelBody.innerHTML += `
            <tr>
                <td>${data.tanggal}</td>
                <td>${data.kelas}</td>
                <td>${data.materi}</td>
                <td>${data.keterangan || "-"}</td>
            </tr>
        `;
    });
}

// ==========================================
// 4. LOGIKA PERANGKAT PEMBELAJARAN (FIREBASE STORAGE)
// ==========================================
const formPerangkat = document.getElementById("formPerangkat");
if(formPerangkat) {
    formPerangkat.addEventListener("submit", async (e) => {
        e.preventDefault();
        const file = document.getElementById("fileInput").files[0];
        const namaDokumen = document.getElementById("namaFile").value;
        const btnUpload = document.getElementById("btnUploadFile");
        
        if(!file) return alert("Pilih file terlebih dahulu!");
        
        btnUpload.innerText = "Mengupload...";
        btnUpload.disabled = true;

        try {
            // Upload ke Firebase Storage
            const storageRef = ref(storage, 'perangkat/' + file.name);
            await uploadBytes(storageRef, file);
            
            // Dapatkan URL Download URL
            const downloadURL = await getDownloadURL(storageRef);
            
            // Simpan info file (Nama & Link) ke Firestore Database agar bisa di-list
            await addDoc(collection(db, "arsip_perangkat"), {
                nama: namaDokumen,
                url: downloadURL,
                timestamp: serverTimestamp()
            });
            
            alert("File berhasil diupload!");
            formPerangkat.reset();
            muatPerangkat(); // Refresh daftar file
        } catch (error) {
            alert("Gagal upload: " + error.message);
        }
        
        btnUpload.innerText = "Upload File";
        btnUpload.disabled = false;
    });
}

async function muatPerangkat() {
    const listGrup = document.getElementById("listPerangkat");
    listGrup.innerHTML = "<li class='list-group-item'>Memuat file...</li>";
    
    const q = query(collection(db, "arsip_perangkat"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    listGrup.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        listGrup.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${data.nama}
                <a href="${data.url}" target="_blank" class="btn btn-sm btn-outline-success">Lihat / Download</a>
            </li>
        `;
    });
}