// ======================================================
// app.js (KODE LENGKAP - JURNAL, PERANGKAT, PENILAIAN, PRESENSI)
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DATABASE SISWA ---
const dataMurid = {
    "XI (Fisika)": [{"nama": "Abel Pratama Katili", "gender": "P"}, {"nama": "Adeliani Putri R. Agu", "gender": "P"}, {"nama": "Anastasya Said", "gender": "P"}, {"nama": "Andika Pratama Latoini", "gender": "L"}, {"nama": "Cindra H. Mohamad", "gender": "P"}, {"nama": "Dea Ananda Nusi", "gender": "P"}, {"nama": "Dhea Ananda Putri Sadapu", "gender": "P"}, {"nama": "Dimas Saputra R. Antu", "gender": "L"}, {"nama": "Dwi Rangga B. Yahya", "gender": "L"}, {"nama": "Elsawati M. Alinti", "gender": "P"}, {"nama": "Farel Mahmud", "gender": "L"}, {"nama": "Fatmah Igirisa", "gender": "P"}, {"nama": "Fauzan R. Rahman", "gender": "L"}, {"nama": "Grelis R. Sapiun", "gender": "P"}, {"nama": "Hamzah R. Ibrahim", "gender": "L"}, {"nama": "Ismail H. Mantali", "gender": "L"}, {"nama": "Ismail Usman", "gender": "L"}, {"nama": "Moh. Riski Ahmad", "gender": "L"}, {"nama": "Moh. Rivaldo Arbie", "gender": "L"}, {"nama": "Mohamad Aslammun R. Hemeto", "gender": "L"}, {"nama": "Mohammad Azwar Ahmad", "gender": "L"}, {"nama": "Muhamad Chaidar Ali", "gender": "L"}, {"nama": "Muhamad Syahrul Thalib", "gender": "L"}, {"nama": "Muhamad Husin", "gender": "L"}, {"nama": "Nabila Pumulo", "gender": "P"}, {"nama": "Nikita Umar", "gender": "P"}, {"nama": "Nuraini A. Yusuf", "gender": "P"}, {"nama": "Parel C. Pasilia", "gender": "L"}, {"nama": "Rofik Adrianto Katili", "gender": "L"}, {"nama": "Silva Talib", "gender": "P"}, {"nama": "Sulistia Y. Kaharu", "gender": "P"}, {"nama": "Syahlan Zulkifli Mamu", "gender": "L"}, {"nama": "Syahril Naha", "gender": "L"}, {"nama": "Ummi Salam M. Toka", "gender": "P"}, {"nama": "Valentino E. Karim", "gender": "L"}], 
    "XII (Fisika)": [{"nama": "Afdan R. Dami", "gender": "L"}, {"nama": "Almelia Nasim", "gender": "P"}, {"nama": "Aprilia Dwi Putri Arbie", "gender": "P"}, {"nama": "Arjun Ishak", "gender": "L"}, {"nama": "Dimas Prasetyo Hasim", "gender": "L"}, {"nama": "Elsa S. Gani", "gender": "P"}, {"nama": "Falen A. Djuko", "gender": "P"}, {"nama": "Gabriela S. Rahman", "gender": "P"}, {"nama": "Imel Sunge", "gender": "P"}, {"nama": "Irma A. Hamsia", "gender": "P"}, {"nama": "Mohamad Andika A. Gani", "gender": "L"}, {"nama": "Mohamad Rafki R. Nani", "gender": "L"}, {"nama": "Mohamad Riskiaditya Abdullah", "gender": "L"}, {"nama": "Nelva Anindhita H. Adam", "gender": "P"}, {"nama": "Nurhiya J. Katili", "gender": "P"}, {"nama": "Putri Anggun Ma'ruf", "gender": "P"}, {"nama": "Refli I. Yunus", "gender": "L"}, {"nama": "Rehan A. Salilama", "gender": "L"}, {"nama": "Rendi Husain", "gender": "L"}, {"nama": "Salwa Januriska Dunggio", "gender": "P"}, {"nama": "Syahril Aimanullah A. Singgu", "gender": "L"}, {"nama": "Tiyas Yolanda S. Isima", "gender": "P"}], 
    "X - A (Informatika)": [{"nama": "Abdul Fadil Keku", "gender": "L"}, {"nama": "Adelia Y. Yunus", "gender": "P"}, {"nama": "Ain R. Dami", "gender": "P"}, {"nama": "Allvaro Anugrah F. Rahim", "gender": "L"}, {"nama": "Aprilia J. Igirisa", "gender": "P"}, {"nama": "Chairul Royyan Irwan B. Tiro", "gender": "L"}, {"nama": "Kevin Pratama Akuba", "gender": "L"}, {"nama": "Nabil Adam", "gender": "L"}, {"nama": "Meyke Siswati G. Mohamad", "gender": "P"}, {"nama": "Moh. Fauzan M. Halid", "gender": "L"}, {"nama": "Moh. Rifky Adytia Napu", "gender": "L"}, {"nama": "Nurlela H. Umar", "gender": "P"}, {"nama": "Nurmawati G. Mohamad", "gender": "P"}, {"nama": "Rifki S. Salam", "gender": "L"}, {"nama": "Shaparil R. Dami", "gender": "L"}, {"nama": "Shelan M. Alinti", "gender": "P"}, {"nama": "Siti Nur Alisa H. Berahim", "gender": "P"}, {"nama": "Siti Sabrina J. Ahmad", "gender": "P"}, {"nama": "Tesya L. Aliasa", "gender": "P"}, {"nama": "Tiyo Prasetyo Hantuli", "gender": "L"}], 
    "X - B (Informatika)": [{"nama": "Aca S. Napi", "gender": "P"}, {"nama": "Alham Hadji", "gender": "L"}, {"nama": "Alya Usman", "gender": "P"}, {"nama": "Aryandi R. Yunus", "gender": "L"}, {"nama": "Asraf Jailani P. Hasan", "gender": "L"}, {"nama": "Ayusetyaningsih R. Ismail", "gender": "P"}, {"nama": "Fadil Rahman Pateda", "gender": "L"}, {"nama": "Jihan Akuba", "gender": "L"}, {"nama": "Mohamad Atfal A. Ismail", "gender": "L"}, {"nama": "Mohamad Farhan Pontoh", "gender": "L"}, {"nama": "Nada N. Aminu", "gender": "P"}, {"nama": "Najwa Y. Yunus", "gender": "P"}, {"nama": "Nurvita D. Husain", "gender": "P"}, {"nama": "Refan R. Tantu", "gender": "L"}, {"nama": "Taufik Y. Rahman", "gender": "L"}, {"nama": "Triyanto Kutei", "gender": "L"}, {"nama": "Shelin M. Alinti", "gender": "P"}, {"nama": "Sri Susanti U. Napu", "gender": "P"}, {"nama": "Suci Ibrahim", "gender": "P"}, {"nama": "Yusni Ma'ruf", "gender": "P"}]
};

// ==========================================
// 2. LOGIKA AUTENTIKASI
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
        if(document.getElementById("kontenPresensi")) document.getElementById("kontenPresensi").classList.remove("hidden");
        
        if(document.getElementById("tabelJurnalData")) muatJurnal();
        if(document.getElementById("listPerangkat")) muatPerangkat();
        if(document.getElementById("tabelNilaiData")) muatPenilaian();
        if(document.getElementById("tabelPresensiData")) muatPresensi();
    } else {
        if(!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/" && !window.location.pathname.endsWith("administrasi-guru/")) {
            window.location.href = "index.html";
        }
    }
});

const formLogin = document.getElementById("formLogin");
if(formLogin) formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById("emailLogin").value, document.getElementById("passLogin").value)
        .then(() => alert("Login Berhasil!"))
        .catch((err) => alert("Login Gagal: " + err.message));
});

const btnLogout = document.getElementById("btnLogout");
if(btnLogout) btnLogout.addEventListener("click", () => signOut(auth).then(() => window.location.href = "index.html"));

// ==========================================
// 3. JURNAL MENGAJAR (LENGKAP: CRUD & EXPORT)
// ==========================================
const formJurnal = document.getElementById("formJurnal");
let datasetJurnal = []; 

if(formJurnal) {
    formJurnal.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btnSimpanJurnal");
        btn.innerText = "Menyimpan...";
        
        const data = {
            tanggal: document.getElementById("jurnalTanggal").value,
            waktu: document.getElementById("jurnalWaktu").value, // Tambahan Fitur Waktu
            kelas: document.getElementById("jurnalKelas").value,
            mapel: document.getElementById("jurnalMapel").value,
            materi: document.getElementById("jurnalMateri").value,
            keterangan: document.getElementById("jurnalKeterangan").value,
            kegiatan: document.getElementById("jurnalKegiatan").value,
            masalah: document.getElementById("jurnalMasalah").value,
            tindakLanjut: document.getElementById("jurnalTindakLanjut").value,
            timestamp: serverTimestamp()
        };

        try {
            const editId = document.getElementById("editJurnalId").value;
            if(editId) {
                await updateDoc(doc(db, "jurnal_mengajar", editId), data);
                alert("Jurnal berhasil diperbarui!");
            } else {
                await addDoc(collection(db, "jurnal_mengajar"), data);
                alert("Jurnal berhasil disimpan!");
            }
            formJurnal.reset();
            document.getElementById("editJurnalId").value = "";
            btn.innerText = "Simpan Jurnal";
            btn.classList.replace("btn-warning", "btn-primary");
            muatJurnal();
        } catch (error) {
            alert("Error: " + error.message);
            btn.innerText = "Coba Lagi";
        }
    });
}

// Fitur Filter Bulan Jurnal
const filterBulanJurnal = document.getElementById("filterBulanJurnal");
if(filterBulanJurnal) {
    const now = new Date();
    const defaultMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
    filterBulanJurnal.value = defaultMonth; 
    filterBulanJurnal.addEventListener("change", muatJurnal);
}

async function muatJurnal() {
    const tb = document.getElementById("tabelJurnalData");
    if(!tb) return;
    tb.innerHTML = "<tr><td colspan='10' class='text-center'>Memuat data...</td></tr>";
    
    let bulanPilih = "";
    if(filterBulanJurnal) bulanPilih = filterBulanJurnal.value; 

    try {
        const qs = await getDocs(query(collection(db, "jurnal_mengajar"), orderBy("tanggal", "desc")));
        tb.innerHTML = "";
        datasetJurnal = [];
        let count = 0;
        
        qs.forEach((docSnap) => {
            const d = docSnap.data();
            d.id = docSnap.id;
            
            if(bulanPilih && d.tanggal) {
                if(d.tanggal.substring(0, 7) !== bulanPilih) return;
            }
            
            datasetJurnal.push(d);
            count++;
            
            tb.innerHTML += `
                <tr>
                    <td class="text-nowrap text-center fw-bold">${d.tanggal || "-"}</td>
                    <td class="text-nowrap text-center text-primary fw-bold"><small>${d.waktu || "-"}</small></td>
                    <td class="text-center"><small>${d.kelas || "-"}</small></td>
                    <td class="text-center"><small>${d.mapel || "-"}</small></td>
                    <td><small>${d.materi || "-"}</small></td>
                    <td><small>${d.keterangan || "-"}</small></td>
                    <td><small>${d.kegiatan || "-"}</small></td>
                    <td><small>${d.masalah || "-"}</small></td>
                    <td><small>${d.tindakLanjut || "-"}</small></td>
                    <td class="kolom-aksi-jurnal text-center">
                        <div class="btn-group-vertical btn-group-sm gap-1 w-100">
                            <button class="btn btn-warning btn-edit-jurnal text-dark fw-bold w-100" data-id="${d.id}">Edit</button>
                            <button class="btn btn-danger btn-hapus-jurnal w-100" data-id="${d.id}">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        if(count === 0) tb.innerHTML = "<tr><td colspan='10' class='text-center'>Tidak ada catatan jurnal di bulan ini.</td></tr>";
    } catch (e) { 
        tb.innerHTML = "<tr><td colspan='10' class='text-center text-danger'>Gagal memuat</td></tr>"; 
    }
}

const tBodyJurnal = document.getElementById("tabelJurnalData");
if(tBodyJurnal) {
    tBodyJurnal.addEventListener("click", async (e) => {
        if(e.target.classList.contains("btn-hapus-jurnal")) {
            if(confirm("Apakah Bapak yakin ingin menghapus catatan jurnal ini?")) {
                e.target.innerText = "...";
                await deleteDoc(doc(db, "jurnal_mengajar", e.target.dataset.id));
                muatJurnal();
            }
        }
        if(e.target.classList.contains("btn-edit-jurnal")) {
            const d = datasetJurnal.find(x => x.id === e.target.dataset.id);
            if(d) {
                document.getElementById("editJurnalId").value = d.id;
                document.getElementById("jurnalTanggal").value = d.tanggal || "";
                document.getElementById("jurnalWaktu").value = d.waktu || ""; // Load Data Waktu
                document.getElementById("jurnalKelas").value = d.kelas || "";
                document.getElementById("jurnalMapel").value = d.mapel || "";
                document.getElementById("jurnalMateri").value = d.materi || "";
                document.getElementById("jurnalKeterangan").value = d.keterangan || "";
                document.getElementById("jurnalKegiatan").value = d.kegiatan || "";
                document.getElementById("jurnalMasalah").value = d.masalah || "";
                document.getElementById("jurnalTindakLanjut").value = d.tindakLanjut || "";
                
                const btn = document.getElementById("btnSimpanJurnal");
                btn.innerText = "Update Jurnal";
                btn.classList.replace("btn-primary", "btn-warning");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

const btnExpJurnalExcel = document.getElementById("btnExportJurnalExcel");
if(btnExpJurnalExcel) {
    btnExpJurnalExcel.addEventListener("click", () => { 
        const tc = document.getElementById("tabelExportJurnal").cloneNode(true); 
        tc.querySelectorAll("tr").forEach(r => { const c = r.querySelector(".kolom-aksi-jurnal"); if(c) r.removeChild(c); }); 
        const namaFile = "Rekap_Jurnal_" + (document.getElementById("filterBulanJurnal").value || "Semua") + ".xlsx";
        XLSX.writeFile(XLSX.utils.table_to_book(tc, {sheet: "Jurnal Mengajar"}), namaFile); 
    });
}

const btnExpJurnalPDF = document.getElementById("btnExportJurnalPDF");
if(btnExpJurnalPDF) {
    btnExpJurnalPDF.addEventListener("click", () => {
        const sa = document.querySelectorAll(".kolom-aksi-jurnal"); 
        sa.forEach(c => c.style.display = "none");
        
        const namaFile = "Rekap_Jurnal_" + (document.getElementById("filterBulanJurnal").value || "Semua") + ".pdf";
        const opt = {
            margin: 0.3,
            filename: namaFile,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'legal', orientation: 'landscape' } 
        };
        
        html2pdf().set(opt).from(document.getElementById("areaCetakJurnal")).save().then(() => {
            sa.forEach(c => c.style.display = "");
        });
    });
}

// ==========================================
// 4. PERANGKAT PEMBELAJARAN
// ==========================================
const formPerangkat = document.getElementById("formPerangkat");
if(formPerangkat) formPerangkat.addEventListener("submit", async (e) => {
    e.preventDefault(); document.getElementById("btnUploadFile").innerText = "Menyimpan...";
    try {
        await addDoc(collection(db, "arsip_perangkat"), { nama: document.getElementById("namaFile").value, url: document.getElementById("linkDrive").value, timestamp: serverTimestamp() }); alert("Tersimpan!"); formPerangkat.reset(); muatPerangkat();
    } catch (e) { alert("Error: " + e.message); } document.getElementById("btnUploadFile").innerText = "Simpan Data";
});

async function muatPerangkat() {
    const ls = document.getElementById("listPerangkat"); if(!ls) return;
    try {
        const qs = await getDocs(query(collection(db, "arsip_perangkat"), orderBy("timestamp", "desc"))); ls.innerHTML = "";
        qs.forEach((doc) => { const d = doc.data(); ls.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">${d.nama} <a href="${d.url}" target="_blank" class="btn btn-sm btn-outline-success">Buka</a></li>`; });
    } catch (e) { ls.innerHTML = "<li class='text-danger'>Gagal memuat</li>"; }
}

// ==========================================
// 5. PENILAIAN SISWA
// ==========================================
const formPenilaian = document.getElementById("formPenilaian");
const nilaiKelas = document.getElementById("nilaiKelas"); const nilaiNama = document.getElementById("nilaiNama"); const nilaiGender = document.getElementById("nilaiGender");
if(nilaiKelas && nilaiNama) {
    nilaiKelas.addEventListener("change", (e) => {
        const k = e.target.value; nilaiNama.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>'; if(nilaiGender) nilaiGender.value = "";
        if(k && dataMurid[k]) { dataMurid[k].forEach((s, idx) => nilaiNama.innerHTML += `<option value="${idx}">${s.nama}</option>`); }
    });
    nilaiNama.addEventListener("change", (e) => {
        const k = nilaiKelas.value; const idx = e.target.value; if(idx !== "" && nilaiGender) nilaiGender.value = dataMurid[k][idx].gender;
    });
}
function renderTPInputs() {
    const wadahTP = document.getElementById("wadahTP"); if(!wadahTP) return;
    const jumlah = parseInt(document.getElementById("jumlahTP").value) || 7; const isSumatif = document.getElementById("jenisPenilaian").value === "Sumatif";
    wadahTP.innerHTML = "";
    for(let i=1; i<=jumlah; i++) {
        const type = isSumatif ? "number" : "text"; const attrs = isSumatif ? 'max="100" min="0"' : '';
        wadahTP.innerHTML += `<div class="col-4 col-md-3"><input type="${type}" ${attrs} class="form-control form-control-sm tp-input border-info" id="tp${i}" placeholder="TP ${i}"></div>`;
    }
    isSumatif ? document.getElementById("grupCatatan").classList.add("hidden") : document.getElementById("grupCatatan").classList.remove("hidden");
}
if(document.getElementById("jumlahTP")) { document.getElementById("jumlahTP").addEventListener("change", renderTPInputs); document.getElementById("jenisPenilaian").addEventListener("change", renderTPInputs); renderTPInputs(); }
if(document.getElementById("filterJenisPenilaian")) document.getElementById("filterJenisPenilaian").addEventListener("change", muatPenilaian);

let datasetPenilaian = [];
if(formPenilaian) formPenilaian.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = document.getElementById("btnSimpanNilai"); btn.innerText = "Menyimpan...";
    const jenis = document.getElementById("jenisPenilaian").value; const jumlahTP = parseInt(document.getElementById("jumlahTP").value) || 7;
    const data = { kelas: document.getElementById("nilaiKelas").value, nama: nilaiNama.options[nilaiNama.selectedIndex].text, gender: document.getElementById("nilaiGender").value, jenis: jenis, jumlahTP: jumlahTP, timestamp: serverTimestamp() };
    for(let i=1; i<=jumlahTP; i++) data[`tp${i}`] = document.getElementById(`tp${i}`) ? document.getElementById(`tp${i}`).value : "";
    if(jenis === "Formatif") { let tk = 0; for(let i=1; i<=jumlahTP; i++) if(data[`tp${i}`].trim()!=="") tk++; data.jumlahTerkumpul = tk; data.catatan = document.getElementById("nilaiCatatan").value; } 
    else { let tot = 0, count = 0; for(let i=1; i<=jumlahTP; i++) { let v = parseFloat(data[`tp${i}`]); if(!isNaN(v)){tot+=v; count++;} } data.rataRata = count > 0 ? (tot / count).toFixed(1) : 0; }
    try {
        const editId = document.getElementById("editDocId").value;
        if(editId) { await updateDoc(doc(db, "penilaian_siswa", editId), data); alert("Diperbarui!"); } else { await addDoc(collection(db, "penilaian_siswa"), data); alert("Tersimpan!"); }
        formPenilaian.reset(); document.getElementById("editDocId").value = ""; btn.innerText = "Simpan Penilaian"; btn.classList.replace("btn-warning", "btn-info"); nilaiNama.innerHTML = '<option value="">-- Pilih Kelas Dulu --</option>'; renderTPInputs(); muatPenilaian();
    } catch (e) { alert("Error: " + e.message); btn.innerText = "Coba Lagi"; }
});

async function muatPenilaian() {
    const tb = document.getElementById("tabelNilaiData"); const th = document.getElementById("headerTabelNilai"); if(!tb) return;
    const jd = document.getElementById("filterJenisPenilaian").value; tb.innerHTML = `<tr><td colspan='15'>Memuat...</td></tr>`;
    try {
        const qs = await getDocs(query(collection(db, "penilaian_siswa"), orderBy("timestamp", "desc")));
        datasetPenilaian = []; let maxTP = 1; let hasData = false;
        qs.forEach((doc) => { const d = doc.data(); if(d.jenis === jd) { hasData = true; d.id = doc.id; datasetPenilaian.push(d); if(d.jumlahTP > maxTP) maxTP = d.jumlahTP; } });
        let hHTML = `<tr><th>Nama</th><th>L/P</th><th>Kelas</th>`; for(let i=1; i<=maxTP; i++) hHTML += `<th>TP${i}</th>`; hHTML += jd === "Formatif" ? `<th>Jml</th><th>Catatan</th><th class="kolom-aksi">Aksi</th></tr>` : `<th>Rata</th><th class="kolom-aksi">Aksi</th></tr>`; th.innerHTML = hHTML; tb.innerHTML = "";
        if(!hasData) { tb.innerHTML = `<tr><td colspan='15'>Kosong</td></tr>`; return; }
        datasetPenilaian.forEach(d => {
            let rHTML = `<td><div class="text-start text-nowrap">${d.nama}</div></td><td>${d.gender}</td><td><small>${d.kelas}</small></td>`;
            for(let i=1; i<=maxTP; i++) rHTML += `<td>${d[`tp${i}`] || "-"}</td>`;
            rHTML += jd === "Formatif" ? `<td><b>${d.jumlahTerkumpul||0}</b></td><td><small>${d.catatan||"-"}</small></td>` : `<td><b class="text-info">${d.rataRata||0}</b></td>`;
            rHTML += `<td class="kolom-aksi"><div class="btn-group btn-group-sm"><button class="btn btn-warning btn-edit text-dark fw-bold" data-id="${d.id}">Edit</button><button class="btn btn-danger btn-hapus" data-id="${d.id}">Hapus</button></div></td>`; tb.innerHTML += `<tr>${rHTML}</tr>`;
        });
    } catch (e) { tb.innerHTML = `<tr><td colspan='15'>Gagal memuat</td></tr>`; }
}

const tBody = document.getElementById("tabelNilaiData");
if(tBody) tBody.addEventListener("click", async (e) => {
    if(e.target.classList.contains("btn-hapus")) { if(confirm("Hapus data ini?")) { e.target.innerText = "..."; await deleteDoc(doc(db, "penilaian_siswa", e.target.dataset.id)); muatPenilaian(); } }
    if(e.target.classList.contains("btn-edit")) {
        const dataEdit = datasetPenilaian.find(d => d.id === e.target.dataset.id);
        if(dataEdit) {
            document.getElementById("editDocId").value = dataEdit.id; document.getElementById("jenisPenilaian").value = dataEdit.jenis; document.getElementById("nilaiKelas").value = dataEdit.kelas; document.getElementById("nilaiKelas").dispatchEvent(new Event('change'));
            setTimeout(() => { const opt = Array.from(document.getElementById("nilaiNama").options).find(o => o.text === dataEdit.nama); if(opt) document.getElementById("nilaiNama").value = opt.value; document.getElementById("nilaiGender").value = dataEdit.gender; }, 500);
            document.getElementById("jumlahTP").value = dataEdit.jumlahTP || 7; renderTPInputs();
            for(let i=1; i<=(dataEdit.jumlahTP || 7); i++) if(document.getElementById(`tp${i}`)) document.getElementById(`tp${i}`).value = dataEdit[`tp${i}`] || "";
            if(dataEdit.jenis === "Formatif") document.getElementById("nilaiCatatan").value = dataEdit.catatan || "";
            document.getElementById("btnSimpanNilai").innerText = "Update"; window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

const btnExpExcel = document.getElementById("btnExportExcel");
if(btnExpExcel) btnExpExcel.addEventListener("click", () => { const tc = document.getElementById("tabelExport").cloneNode(true); tc.querySelectorAll("tr").forEach(r => { const c = r.querySelector(".kolom-aksi"); if(c) r.removeChild(c); }); XLSX.writeFile(XLSX.utils.table_to_book(tc, {sheet: "Rekap"}), "Rekap_Nilai.xlsx"); });
const btnExpPDF = document.getElementById("btnExportPDF");
if(btnExpPDF) btnExpPDF.addEventListener("click", () => {
    const sa = document.querySelectorAll(".kolom-aksi"); sa.forEach(c => c.style.display = "none");
    html2pdf().set({margin: 0.3, filename: 'Rekap_Nilai.pdf', jsPDF: { orientation: 'landscape' }}).from(document.getElementById("areaCetakTabel")).save().then(() => sa.forEach(c => c.style.display = ""));
});

// ==========================================
// 7. LOGIKA PRESENSI SISWA (BARU)
// ==========================================
const presensiKelas = document.getElementById("presensiKelas");
const wadahDaftarSiswa = document.getElementById("wadahDaftarSiswa");

if(presensiKelas && wadahDaftarSiswa) {
    // Saat kelas dipilih, generate list nama + dropdown status
    presensiKelas.addEventListener("change", (e) => {
        const k = e.target.value;
        if(k && dataMurid[k]) {
            wadahDaftarSiswa.innerHTML = "";
            dataMurid[k].forEach((s, idx) => {
                wadahDaftarSiswa.innerHTML += `
                    <tr>
                        <td class="align-middle fw-bold text-nowrap"><small>${s.nama}</small></td>
                        <td>
                            <select class="form-select form-select-sm status-kehadiran" data-nama="${s.nama}" style="width: 80px;">
                                <option value="H" class="text-success fw-bold" selected>Hadir</option>
                                <option value="S" class="text-primary fw-bold">Sakit</option>
                                <option value="I" class="text-warning fw-bold">Izin</option>
                                <option value="A" class="text-danger fw-bold">Alpa</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        } else {
            wadahDaftarSiswa.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Pilih kelas untuk memunculkan nama.</td></tr>`;
        }
    });
}

const formPresensi = document.getElementById("formPresensi");
if(formPresensi) {
    formPresensi.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btnSimpanPresensi");
        btn.innerText = "Menyimpan..."; btn.disabled = true;
        
        let hadir = 0, sakit = 0, izin = 0, alpa = 0;
        let detailSiswa = [];
        
        // Ambil semua status dari tabel
        const selects = document.querySelectorAll(".status-kehadiran");
        selects.forEach(sel => {
            const val = sel.value;
            if(val === "H") hadir++; else if(val === "S") sakit++; else if(val === "I") izin++; else if(val === "A") alpa++;
            detailSiswa.push({ nama: sel.dataset.nama, status: val });
        });

        if(detailSiswa.length === 0) {
            alert("Pilih kelas terlebih dahulu!"); btn.innerText = "Simpan Presensi"; btn.disabled = false; return;
        }

        try {
            await addDoc(collection(db, "presensi_siswa"), {
                tanggal: document.getElementById("presensiTanggal").value,
                kelas: document.getElementById("presensiKelas").value,
                materi: document.getElementById("presensiMateri").value,
                jmlHadir: hadir, jmlSakit: sakit, jmlIzin: izin, jmlAlpa: alpa,
                detail: detailSiswa,
                timestamp: serverTimestamp()
            });
            alert("Presensi berhasil disimpan!");
            formPresensi.reset();
            wadahDaftarSiswa.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Pilih kelas untuk memunculkan nama.</td></tr>`;
            muatPresensi();
        } catch (error) {
            alert("Gagal menyimpan presensi: " + error.message);
        }
        btn.innerText = "Simpan Presensi"; btn.disabled = false;
    });
}

async function muatPresensi() {
    const tb = document.getElementById("tabelPresensiData");
    if(!tb) return;
    tb.innerHTML = `<tr><td colspan='8' class='text-center'>Memuat data...</td></tr>`;
    
    try {
        const qs = await getDocs(query(collection(db, "presensi_siswa"), orderBy("tanggal", "desc")));
        tb.innerHTML = "";
        let count = 0;
        qs.forEach((doc) => {
            const d = doc.data();
            count++;
            tb.innerHTML += `
                <tr>
                    <td class="text-nowrap">${d.tanggal}</td>
                    <td><small>${d.kelas}</small></td>
                    <td><small>${d.materi}</small></td>
                    <td class="text-success fw-bold">${d.jmlHadir}</td>
                    <td class="text-primary fw-bold">${d.jmlSakit}</td>
                    <td class="text-warning fw-bold">${d.jmlIzin}</td>
                    <td class="text-danger fw-bold">${d.jmlAlpa}</td>
                    <td class="kolom-aksi-presensi">
                        <button class="btn btn-sm btn-danger btn-hapus-presensi" data-id="${doc.id}">X</button>
                    </td>
                </tr>
            `;
        });
        if(count === 0) tb.innerHTML = `<tr><td colspan='8' class='text-center'>Belum ada data presensi</td></tr>`;
    } catch (error) {
        tb.innerHTML = `<tr><td colspan='8' class='text-center text-danger'>Gagal memuat: ${error.message}</td></tr>`;
    }
}

// Hapus Data Presensi
if(document.getElementById("tabelPresensiData")) {
    document.getElementById("tabelPresensiData").addEventListener("click", async (e) => {
        if(e.target.classList.contains("btn-hapus-presensi")) {
            if(confirm("Apakah Bapak yakin ingin menghapus data presensi ini?")) {
                e.target.innerText = "...";
                await deleteDoc(doc(db, "presensi_siswa", e.target.dataset.id));
                muatPresensi();
            }
        }
    });
}

// Export Presensi
const btnExpPresensiExcel = document.getElementById("btnExportPresensiExcel");
if(btnExpPresensiExcel) btnExpPresensiExcel.addEventListener("click", () => { const tc = document.getElementById("tabelExportPresensi").cloneNode(true); tc.querySelectorAll("tr").forEach(r => { const c = r.querySelector(".kolom-aksi-presensi"); if(c) r.removeChild(c); }); XLSX.writeFile(XLSX.utils.table_to_book(tc, {sheet: "Rekap"}), "Rekap_Presensi.xlsx"); });

const btnExpPresensiPDF = document.getElementById("btnExportPresensiPDF");
if(btnExpPresensiPDF) btnExpPresensiPDF.addEventListener("click", () => {
    const sa = document.querySelectorAll(".kolom-aksi-presensi"); sa.forEach(c => c.style.display = "none");
    html2pdf().set({margin: 0.3, filename: 'Rekap_Presensi.pdf'}).from(document.getElementById("areaCetakPresensi")).save().then(() => sa.forEach(c => c.style.display = ""));
});
