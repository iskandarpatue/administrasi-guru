// ======================================================
// app.js (KODE LENGKAP - JURNAL, PERANGKAT, & PENILAIAN)
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
        if(document.getElementById("loginSection")) {
            document.getElementById("loginSection").classList.add("hidden");
            document.getElementById("dashboardSection").classList.remove("hidden");
            document.getElementById("btnLogout").classList.remove("hidden");
        }
        if(document.getElementById("kontenJurnal")) document.getElementById("kontenJurnal").classList.remove("hidden");
        if(document.getElementById("kontenPerangkat")) document.getElementById("kontenPerangkat").classList.remove("hidden");
        if(document.getElementById("kontenPenilaian")) document.getElementById("kontenPenilaian").classList.remove("hidden");
        
        if(document.getElementById("tabelJurnalData")) muatJurnal();
        if(document.getElementById("listPerangkat")) muatPerangkat();
        if(document.getElementById("tabelNilaiData")) muatPenilaian();
    } else {
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
            .catch((error) => alert("Login Gagal: " + error.message));
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
// 3. LOGIKA JURNAL MENGAJAR 
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
    if(!tabelBody) return;
    tabelBody.innerHTML = "<tr><td colspan='8' class='text-center'>Memuat data...</td></tr>";
    try {
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
    } catch (e) {
        tabelBody.innerHTML = "<tr><td colspan='8' class='text-center text-danger'>Gagal memuat data</td></tr>";
    }
}

// ==========================================
// 4. LOGIKA PERANGKAT PEMBELAJARAN (DRIVE)
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
    if(!listGrup) return;
    listGrup.innerHTML = "<li class='list-group-item'>Memuat data...</li>";
    try {
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
    } catch (e) {
        listGrup.innerHTML = "<li class='list-group-item text-danger'>Gagal memuat data</li>";
    }
}

// ==========================================
// 5. LOGIKA PENILAIAN SISWA
// ==========================================
const formPenilaian = document.getElementById("formPenilaian");
const jenisPenilaian = document.getElementById("jenisPenilaian");
const filterJenisPenilaian = document.getElementById("filterJenisPenilaian");
const tpInputs = document.querySelectorAll(".tp-input");
const grupCatatan = document.getElementById("grupCatatan");

if(jenisPenilaian) {
    jenisPenilaian.addEventListener("change", (e) => {
        if(e.target.value === "Sumatif") {
            tpInputs.forEach(input => { input.type = "number"; input.max = "100"; input.min = "0"; });
            grupCatatan.classList.add("hidden");
        } else {
            tpInputs.forEach(input => { input.type = "text"; input.removeAttribute("max"); input.removeAttribute("min"); });
            grupCatatan.classList.remove("hidden");
        }
    });
}

if(filterJenisPenilaian) {
    filterJenisPenilaian.addEventListener("change", muatPenilaian);
}

if(formPenilaian) {
    formPenilaian.addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("btnSimpanNilai").innerText = "Menyimpan...";
        
        const jenis = jenisPenilaian.value;
        const data = {
            kelas: document.getElementById("nilaiKelas").value,
            nama: document.getElementById("nilaiNama").value,
            gender: document.getElementById("nilaiGender").value,
            jenis: jenis,
            tp1: document.getElementById("tp1").value,
            tp2: document.getElementById("tp2").value,
            tp3: document.getElementById("tp3").value,
            tp4: document.getElementById("tp4").value,
            tp5: document.getElementById("tp5").value,
            tp6: document.getElementById("tp6").value,
            tp7: document.getElementById("tp7").value,
            timestamp: serverTimestamp()
        };

        if(jenis === "Formatif") {
            let terkumpul = 0;
            tpInputs.forEach(input => { if(input.value.trim() !== "") terkumpul++; });
            data.jumlahTerkumpul = terkumpul;
            data.catatan = document.getElementById("nilaiCatatan").value;
        } else {
            let total = 0, count = 0;
            tpInputs.forEach(input => { 
                let val = parseFloat(input.value);
                if(!isNaN(val)) { total += val; count++; } 
            });
            data.rataRata = count > 0 ? (total / count).toFixed(1) : 0; 
        }

        try {
            await addDoc(collection(db, "penilaian_siswa"), data);
            alert("Data Penilaian berhasil disimpan!");
            formPenilaian.reset();
            if(jenis === "Sumatif") grupCatatan.classList.add("hidden");
            muatPenilaian();
        } catch (error) {
            alert("Gagal menyimpan data: " + error.message);
        }
        document.getElementById("btnSimpanNilai").innerText = "Simpan Penilaian";
    });
}

async function muatPenilaian() {
    const tabelBody = document.getElementById("tabelNilaiData");
    const headerTabel = document.getElementById("headerTabelNilai");
    if(!tabelBody) return;
    
    const jenisDitampilkan = document.getElementById("filterJenisPenilaian").value;
    
    if(jenisDitampilkan === "Formatif") {
        headerTabel.innerHTML = `<tr><th>Nama</th><th>L/P</th><th>Kelas</th><th>TP1</th><th>TP2</th><th>TP3</th><th>TP4</th><th>TP5</th><th>TP6</th><th>TP7</th><th>Jml</th><th>Catatan</th></tr>`;
    } else {
        headerTabel.innerHTML = `<tr><th>Nama</th><th>L/P</th><th>Kelas</th><th>TP1</th><th>TP2</th><th>TP3</th><th>TP4</th><th>TP5</th><th>TP6</th><th>TP7</th><th>Rata-rata</th></tr>`;
    }

    tabelBody.innerHTML = `<tr><td colspan='12' class='text-center'>Memuat data...</td></tr>`;
    
    try {
        const q = query(collection(db, "penilaian_siswa"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        tabelBody.innerHTML = "";
        let hasData = false;
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            if(d.jenis === jenisDitampilkan) {
                hasData = true;
                let rowHTML = `<td>${d.nama}</td><td>${d.gender}</td><td><small>${d.kelas}</small></td>`;
                rowHTML += `<td>${d.tp1||"-"}</td><td>${d.tp2||"-"}</td><td>${d.tp3||"-"}</td><td>${d.tp4||"-"}</td><td>${d.tp5||"-"}</td><td>${d.tp6||"-"}</td><td>${d.tp7||"-"}</td>`;
                
                if(jenisDitampilkan === "Formatif") {
                    rowHTML += `<td><b>${d.jumlahTerkumpul||0}</b></td><td><small>${d.catatan||"-"}</small></td>`;
                } else {
                    rowHTML += `<td><b class="text-primary">${d.rataRata||0}</b></td>`;
                }
                tabelBody.innerHTML += `<tr>${rowHTML}</tr>`;
            }
        });

        if(!hasData) tabelBody.innerHTML = `<tr><td colspan='12' class='text-center'>Belum ada data ${jenisDitampilkan}</td></tr>`;
    } catch (error) {
        tabelBody.innerHTML = `<tr><td colspan='12' class='text-center text-danger'>Gagal memuat: ${error.message}</td></tr>`;
    }
}
