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

// --- DATABASE SISWA OTOMATIS ---
const dataMurid = {
    "XI (Fisika)": [{"nama": "Abel Pratama Katili", "gender": "P"}, {"nama": "Adeliani Putri R. Agu", "gender": "P"}, {"nama": "Anastasya Said", "gender": "P"}, {"nama": "Andika Pratama Latoini", "gender": "L"}, {"nama": "Cindra H. Mohamad", "gender": "P"}, {"nama": "Dea Ananda Nusi", "gender": "P"}, {"nama": "Dhea Ananda Putri Sadapu", "gender": "P"}, {"nama": "Dimas Saputra R. Antu", "gender": "L"}, {"nama": "Dwi Rangga B. Yahya", "gender": "L"}, {"nama": "Elsawati M. Alinti", "gender": "P"}, {"nama": "Farel Mahmud", "gender": "L"}, {"nama": "Fatmah Igirisa", "gender": "P"}, {"nama": "Fauzan R. Rahman", "gender": "L"}, {"nama": "Grelis R. Sapiun", "gender": "P"}, {"nama": "Hamzah R. Ibrahim", "gender": "L"}, {"nama": "Ismail H. Mantali", "gender": "L"}, {"nama": "Ismail Usman", "gender": "L"}, {"nama": "Moh. Riski Ahmad", "gender": "L"}, {"nama": "Moh. Rivaldo Arbie", "gender": "L"}, {"nama": "Mohamad Aslammun R. Hemeto", "gender": "L"}, {"nama": "Mohammad Azwar Ahmad", "gender": "L"}, {"nama": "Muhamad Chaidar Ali", "gender": "L"}, {"nama": "Muhamad Syahrul Thalib", "gender": "L"}, {"nama": "Muhamad Husin", "gender": "L"}, {"nama": "Nabila Pumulo", "gender": "P"}, {"nama": "Nikita Umar", "gender": "P"}, {"nama": "Nuraini A. Yusuf", "gender": "P"}, {"nama": "Parel C. Pasilia", "gender": "L"}, {"nama": "Rofik Adrianto Katili", "gender": "L"}, {"nama": "Silva Talib", "gender": "P"}, {"nama": "Sulistia Y. Kaharu", "gender": "P"}, {"nama": "Syahlan Zulkifli Mamu", "gender": "L"}, {"nama": "Syahril Naha", "gender": "L"}, {"nama": "Ummi Salam M. Toka", "gender": "P"}, {"nama": "Valentino E. Karim", "gender": "L"}], 
    "XII (Fisika)": [{"nama": "Afdan R. Dami", "gender": "L"}, {"nama": "Almelia Nasim", "gender": "P"}, {"nama": "Aprilia Dwi Putri Arbie", "gender": "P"}, {"nama": "Arjun Ishak", "gender": "L"}, {"nama": "Dimas Prasetyo Hasim", "gender": "L"}, {"nama": "Elsa S. Gani", "gender": "P"}, {"nama": "Falen A. Djuko", "gender": "P"}, {"nama": "Gabriela S. Rahman", "gender": "P"}, {"nama": "Imel Sunge", "gender": "P"}, {"nama": "Irma A. Hamsia", "gender": "P"}, {"nama": "Mohamad Andika A. Gani", "gender": "L"}, {"nama": "Mohamad Rafki R. Nani", "gender": "L"}, {"nama": "Mohamad Riskiaditya Abdullah", "gender": "L"}, {"nama": "Nelva Anindhita H. Adam", "gender": "P"}, {"nama": "Nurhiya J. Katili", "gender": "P"}, {"nama": "Putri Anggun Ma'ruf", "gender": "P"}, {"nama": "Refli I. Yunus", "gender": "L"}, {"nama": "Rehan A. Salilama", "gender": "L"}, {"nama": "Rendi Husain", "gender": "L"}, {"nama": "Salwa Januriska Dunggio", "gender": "P"}, {"nama": "Syahril Aimanullah A. Singgu", "gender": "L"}, {"nama": "Tiyas Yolanda S. Isima", "gender": "P"}], 
    "X - A (Informatika)": [{"nama": "Abdul Fadil Keku", "gender": "L"}, {"nama": "Adelia Y. Yunus", "gender": "P"}, {"nama": "Ain R. Dami", "gender": "P"}, {"nama": "Allvaro Anugrah F. Rahim", "gender": "L"}, {"nama": "Aprilia J. Igirisa", "gender": "P"}, {"nama": "Chairul Royyan Irwan B. Tiro", "gender": "L"}, {"nama": "Kevin Pratama Akuba", "gender": "L"}, {"nama": "Nabil Adam", "gender": "L"}, {"nama": "Meyke Siswati G. Mohamad", "gender": "P"}, {"nama": "Moh. Fauzan M. Halid", "gender": "L"}, {"nama": "Moh. Rifky Adytia Napu", "gender": "L"}, {"nama": "Nurlela H. Umar", "gender": "P"}, {"nama": "Nurmawati G. Mohamad", "gender": "P"}, {"nama": "Rifki S. Salam", "gender": "L"}, {"nama": "Shaparil R. Dami", "gender": "L"}, {"nama": "Shelan M. Alinti", "gender": "P"}, {"nama": "Siti Nur Alisa H. Berahim", "gender": "P"}, {"nama": "Siti Sabrina J. Ahmad", "gender": "P"}, {"nama": "Tesya L. Aliasa", "gender": "P"}, {"nama": "Tiyo Prasetyo Hantuli", "gender": "L"}], 
    "X - B (Informatika)": [{"nama": "Aca S. Napi", "gender": "P"}, {"nama": "Alham Hadji", "gender": "L"}, {"nama": "Alya Usman", "gender": "P"}, {"nama": "Aryandi R. Yunus", "gender": "L"}, {"nama": "Asraf Jailani P. Hasan", "gender": "L"}, {"nama": "Ayusetyaningsih R. Ismail", "gender": "P"}, {"nama": "Fadil Rahman Pateda", "gender": "L"}, {"nama": "Jihan Akuba", "gender": "L"}, {"nama": "Mohamad Atfal A. Ismail", "gender": "L"}, {"nama": "Mohamad Farhan Pontoh", "gender": "L"}, {"nama": "Nada N. Aminu", "gender": "P"}, {"nama": "Najwa Y. Yunus", "gender": "P"}, {"nama": "Nurvita D. Husain", "gender": "P"}, {"nama": "Refan R. Tantu", "gender": "L"}, {"nama": "Taufik Y. Rahman", "gender": "L"}, {"nama": "Triyanto Kutei", "gender": "L"}, {"nama": "Shelin M. Alinti", "gender": "P"}, {"nama": "Sri Susanti U. Napu", "gender": "P"}, {"nama": "Suci Ibrahim", "gender": "P"}, {"nama": "Yusni Ma'ruf", "gender": "P"}]
};

const nilaiKelas = document.getElementById("nilaiKelas");
const nilaiNama = document.getElementById("nilaiNama");
const nilaiGender = document.getElementById("nilaiGender");

// Event: Saat kelas dipilih, daftar nama otomatis muncul
if(nilaiKelas && nilaiNama) {
    nilaiKelas.addEventListener("change", (e) => {
        const kelasPilihan = e.target.value;
        nilaiNama.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
        nilaiGender.value = "";
        
        if(kelasPilihan && dataMurid[kelasPilihan]) {
            dataMurid[kelasPilihan].forEach((siswa, index) => {
                nilaiNama.innerHTML += `<option value="${index}">${siswa.nama}</option>`;
            });
        } else {
            nilaiNama.innerHTML = '<option value="">-- Pilih Kelas Dulu --</option>';
        }
    });

    // Event: Saat nama dipilih, L/P otomatis terisi
    nilaiNama.addEventListener("change", (e) => {
        const kelasPilihan = nilaiKelas.value;
        const indexSiswa = e.target.value;
        if(indexSiswa !== "") {
            nilaiGender.value = dataMurid[kelasPilihan][indexSiswa].gender;
        } else {
            nilaiGender.value = "";
        }
    });
}
// --- AKHIR DATABASE SISWA ---
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
            nama: nilaiNama.options[nilaiNama.selectedIndex].text,
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
