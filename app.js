// ======================================================
// app.js (KODE LENGKAP - SMAN 1 BATUDAA PANTAI)
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

// ==========================================
// 2. LOGIKA AUTENTIKASI (LOGIN & LOGOUT)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika User sudah Login, tampilkan dashboard & konten
        if(document.getElementById("loginSection")) {
            document.getElementById("loginSection").classList.add("hidden");
            document.getElementById("dashboardSection").classList.remove("hidden");
            document.getElementById("btnLogout").classList.remove("hidden");
        }
        if(document.getElementById("kontenJurnal")) document.getElementById("kontenJurnal").classList.remove("hidden");
        if(document.getElementById("kontenPerangkat")) document.getElementById("kontenPerangkat").classList.remove("hidden");
        
        // Panggil fungsi muat data jika tabelnya ada di halaman tersebut
        if(document.getElementById("tabelJurnalData")) muatJurnal();
        if(document.getElementById("listPerangkat")) muatPerangkat();
    } else {
        // Jika Belum Login, lempar kembali ke halaman index (login)
        if(!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/" && !window.location.pathname.endsWith("administrasi-guru/")) {
            window.location.href = "index.html";
        }
    }
});

const formLogin = document.getElementById("formLogin");
if(formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("emailLogin").value;
        const pass = document.getElementById("passLogin").value;
        
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => alert("Login Berhasil!"))
            .catch((error) => alert("Login Gagal, periksa email/password Anda. " + error.message));
    });
}

const btnLogout = document.getElementById("btnLogout");
if(btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });
}

// ==========================================
// 3. LOGIKA JURNAL MENGAJAR (VERSI REVISI LENGKAP)
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
                mapel: document.getElementById("jurnalMapel").value,
                materi: document.getElementById("jurnalMateri").value,
                keterangan: document.getElementById("jurnalKeterangan").value,
                kegiatan: document.getElementById("jurnalKegiatan").value,
                masalah: document.getElementById("jurnalMasalah").value,
                tindakLanjut: document.getElementById("jurnalTindakLanjut").value,
                timestamp: serverTimestamp()
            });
            alert("Jurnal berhasil disimpan!");
            formJurnal.reset();
            muatJurnal();
        } catch (error) {
            alert("Gagal menyimpan data jurnal: " + error.message);
        }
        document.getElementById("btnSimpanJurnal").innerText = "Simpan Jurnal";
    });
}

async function muatJurnal() {
    const tabelBody = document.getElementById("tabelJurnalData");
    tabelBody.innerHTML = "<tr><td colspan='8' class='text-center'>Memuat data...</td></tr>";
    
    const q = query(collection(db, "jurnal_mengajar"), orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);
    
    tabelBody.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        tabelBody.innerHTML += `
            <tr>
                <td>${data.tanggal || "-"}</td>
                <td>${data.kelas || "-"}</td>
                <td>${data.mapel || "-"}</td>
                <td>${data.materi || "-"}</td>
                <td>${data.keterangan || "-"}</td>
                <td>${data.kegiatan || "-"}</td>
                <td>${data.masalah || "-"}</td>
                <td>${data.tindakLanjut || "-"}</td>
            </tr>
        `;
    });
}

// ==========================================
// 4. LOGIKA PERANGKAT PEMBELAJARAN (LINK GOOGLE DRIVE)
// ==========================================
const formPerangkat = document.getElementById("formPerangkat");
if(formPerangkat) {
    formPerangkat.addEventListener("submit", async (e) => {
        e.preventDefault();
        const namaDokumen = document.getElementById("namaFile").value;
        const linkDrive = document.getElementById("linkDrive").value;
        const btnUpload = document.getElementById("btnUploadFile");
        
        btnUpload.innerText = "Menyimpan...";
        btnUpload.disabled = true;

        try {
            await addDoc(collection(db, "arsip_perangkat"), {
                nama: namaDokumen,
                url: linkDrive,
                timestamp: serverTimestamp()
            });
            
            alert("Data perangkat berhasil ditambahkan!");
            formPerangkat.reset();
            muatPerangkat();
        } catch (error) {
            alert("Gagal menyimpan data perangkat: " + error.message);
        }
        
        btnUpload.innerText = "Simpan Data";
        btnUpload.disabled = false;
    });
}

async function muatPerangkat() {
    const listGrup = document.getElementById("listPerangkat");
    listGrup.innerHTML = "<li class='list-group-item'>Memuat data...</li>";
    
    const q = query(collection(db, "arsip_perangkat"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    listGrup.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        listGrup.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${data.nama}
                <a href="${data.url}" target="_blank" class="btn btn-sm btn-outline-success">Buka Dokumen</a>
            </li>
        `;
    });
}
