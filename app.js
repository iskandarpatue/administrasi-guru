// ======================================================
// app.js (KODE LENGKAP - BESERTA FITUR EXPORT EXCEL & PDF)
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
if(formLogin) formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, document.getElementById("emailLogin").value, document.getElementById("passLogin").value)
        .then(() => alert("Login Berhasil!"))
        .catch((err) => alert("Login Gagal: " + err.message));
});

const btnLogout = document.getElementById("btnLogout");
if(btnLogout) btnLogout.addEventListener("click", () => signOut(auth).then(() => window.location.href = "index.html"));

// ==========================================
// 3. JURNAL MENGAJAR 
// ==========================================
const formJurnal = document.getElementById("formJurnal");
if(formJurnal) formJurnal.addEventListener("submit", async (e) => {
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
        alert("Jurnal tersimpan!"); formJurnal.reset(); muatJurnal();
    } catch (e) { alert("Error: " + e.message); }
    document.getElementById("btnSimpanJurnal").innerText = "Simpan Jurnal";
});

async function muatJurnal() {
    const tb = document.getElementById("tabelJurnalData");
    if(!tb) return;
    tb.innerHTML = "<tr><td colspan='8'>Memuat...</td></tr>";
    try {
        const qs = await getDocs(query(collection(db, "jurnal_mengajar"), orderBy("tanggal", "desc")));
        tb.innerHTML = "";
        qs.forEach((doc) => {
            const d = doc.data();
            tb.innerHTML += `<tr><td>${d.tanggal||"-"}</td><td>${d.kelas||"-"}</td><td>${d.mapel||"-"}</td><td>${d.materi||"-"}</td><td>${d.keterangan||"-"}</td><td>${d.kegiatan||"-"}</td><td>${d.masalah||"-"}</td><td>${d.tindakLanjut||"-"}</td></tr>`;
        });
    } catch (e) { tb.innerHTML = "<tr><td colspan='8'>Gagal memuat</td></tr>"; }
}

// ==========================================
// 4. PERANGKAT PEMBELAJARAN
// ==========================================
const formPerangkat = document.getElementById("formPerangkat");
if(formPerangkat) formPerangkat.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnUploadFile");
    btn.innerText = "Menyimpan..."; btn.disabled = true;
    try {
        await addDoc(collection(db, "arsip_perangkat"), {
            nama: document.getElementById("namaFile").value, url: document.getElementById("linkDrive").value, timestamp: serverTimestamp()
        });
        alert("Tersimpan!"); formPerangkat.reset(); muatPerangkat();
    } catch (e) { alert("Error: " + e.message); }
    btn.innerText = "Simpan Data"; btn.disabled = false;
});

async function muatPerangkat() {
    const ls = document.getElementById("listPerangkat");
    if(!ls) return;
    try {
        const qs = await getDocs(query(collection(db, "arsip_perangkat"), orderBy("timestamp", "desc")));
        ls.innerHTML = "";
        qs.forEach((doc) => {
            const d = doc.data();
            ls.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">${d.nama} <a href="${d.url}" target="_blank" class="btn btn-sm btn-outline-success">Buka Dokumen</a></li>`;
        });
    } catch (e) { ls.innerHTML = "<li class='text-danger'>Gagal memuat</li>"; }
}

// ==========================================
// 5. LOGIKA PENILAIAN SISWA
// ==========================================
const formPenilaian = document.getElementById("formPenilaian");
const jenisPenilaian = document.getElementById("jenisPenilaian");
const filterJenisPenilaian = document.getElementById("filterJenisPenilaian");
const inputJumlahTP = document.getElementById("jumlahTP");
const wadahTP = document.getElementById("wadahTP");
const grupCatatan = document.getElementById("grupCatatan");

const dataMurid = {
    "XI (Fisika)": [{"nama": "Abel Pratama Katili", "gender": "P"}, {"nama": "Adeliani Putri R. Agu", "gender": "P"}, {"nama": "Anastasya Said", "gender": "P"}, {"nama": "Andika Pratama Latoini", "gender": "L"}, {"nama": "Cindra H. Mohamad", "gender": "P"}, {"nama": "Dea Ananda Nusi", "gender": "P"}, {"nama": "Dhea Ananda Putri Sadapu", "gender": "P"}, {"nama": "Dimas Saputra R. Antu", "gender": "L"}, {"nama": "Dwi Rangga B. Yahya", "gender": "L"}, {"nama": "Elsawati M. Alinti", "gender": "P"}, {"nama": "Farel Mahmud", "gender": "L"}, {"nama": "Fatmah Igirisa", "gender": "P"}, {"nama": "Fauzan R. Rahman", "gender": "L"}, {"nama": "Grelis R. Sapiun", "gender": "P"}, {"nama": "Hamzah R. Ibrahim", "gender": "L"}, {"nama": "Ismail H. Mantali", "gender": "L"}, {"nama": "Ismail Usman", "gender": "L"}, {"nama": "Moh. Riski Ahmad", "gender": "L"}, {"nama": "Moh. Rivaldo Arbie", "gender": "L"}, {"nama": "Mohamad Aslammun R. Hemeto", "gender": "L"}, {"nama": "Mohammad Azwar Ahmad", "gender": "L"}, {"nama": "Muhamad Chaidar Ali", "gender": "L"}, {"nama": "Muhamad Syahrul Thalib", "gender": "L"}, {"nama": "Muhamad Husin", "gender": "L"}, {"nama": "Nabila Pumulo", "gender": "P"}, {"nama": "Nikita Umar", "gender": "P"}, {"nama": "Nuraini A. Yusuf", "gender": "P"}, {"nama": "Parel C. Pasilia", "gender": "L"}, {"nama": "Rofik Adrianto Katili", "gender": "L"}, {"nama": "Silva Talib", "gender": "P"}, {"nama": "Sulistia Y. Kaharu", "gender": "P"}, {"nama": "Syahlan Zulkifli Mamu", "gender": "L"}, {"nama": "Syahril Naha", "gender": "L"}, {"nama": "Ummi Salam M. Toka", "gender": "P"}, {"nama": "Valentino E. Karim", "gender": "L"}], 
    "XII (Fisika)": [{"nama": "Afdan R. Dami", "gender": "L"}, {"nama": "Almelia Nasim", "gender": "P"}, {"nama": "Aprilia Dwi Putri Arbie", "gender": "P"}, {"nama": "Arjun Ishak", "gender": "L"}, {"nama": "Dimas Prasetyo Hasim", "gender": "L"}, {"nama": "Elsa S. Gani", "gender": "P"}, {"nama": "Falen A. Djuko", "gender": "P"}, {"nama": "Gabriela S. Rahman", "gender": "P"}, {"nama": "Imel Sunge", "gender": "P"}, {"nama": "Irma A. Hamsia", "gender": "P"}, {"nama": "Mohamad Andika A. Gani", "gender": "L"}, {"nama": "Mohamad Rafki R. Nani", "gender": "L"}, {"nama": "Mohamad Riskiaditya Abdullah", "gender": "L"}, {"nama": "Nelva Anindhita H. Adam", "gender": "P"}, {"nama": "Nurhiya J. Katili", "gender": "P"}, {"nama": "Putri Anggun Ma'ruf", "gender": "P"}, {"nama": "Refli I. Yunus", "gender": "L"}, {"nama": "Rehan A. Salilama", "gender": "L"}, {"nama": "Rendi Husain", "gender": "L"}, {"nama": "Salwa Januriska Dunggio", "gender": "P"}, {"nama": "Syahril Aimanullah A. Singgu", "gender": "L"}, {"nama": "Tiyas Yolanda S. Isima", "gender": "P"}], 
    "X - A (Informatika)": [{"nama": "Abdul Fadil Keku", "gender": "L"}, {"nama": "Adelia Y. Yunus", "gender": "P"}, {"nama": "Ain R. Dami", "gender": "P"}, {"nama": "Allvaro Anugrah F. Rahim", "gender": "L"}, {"nama": "Aprilia J. Igirisa", "gender": "P"}, {"nama": "Chairul Royyan Irwan B. Tiro", "gender": "L"}, {"nama": "Kevin Pratama Akuba", "gender": "L"}, {"nama": "Nabil Adam", "gender": "L"}, {"nama": "Meyke Siswati G. Mohamad", "gender": "P"}, {"nama": "Moh. Fauzan M. Halid", "gender": "L"}, {"nama": "Moh. Rifky Adytia Napu", "gender": "L"}, {"nama": "Nurlela H. Umar", "gender": "P"}, {"nama": "Nurmawati G. Mohamad", "gender": "P"}, {"nama": "Rifki S. Salam", "gender": "L"}, {"nama": "Shaparil R. Dami", "gender": "L"}, {"nama": "Shelan M. Alinti", "gender": "P"}, {"nama": "Siti Nur Alisa H. Berahim", "gender": "P"}, {"nama": "Siti Sabrina J. Ahmad", "gender": "P"}, {"nama": "Tesya L. Aliasa", "gender": "P"}, {"nama": "Tiyo Prasetyo Hantuli", "gender": "L"}], 
    "X - B (Informatika)": [{"nama": "Aca S. Napi", "gender": "P"}, {"nama": "Alham Hadji", "gender": "L"}, {"nama": "Alya Usman", "gender": "P"}, {"nama": "Aryandi R. Yunus", "gender": "L"}, {"nama": "Asraf Jailani P. Hasan", "gender": "L"}, {"nama": "Ayusetyaningsih R. Ismail", "gender": "P"}, {"nama": "Fadil Rahman Pateda", "gender": "L"}, {"nama": "Jihan Akuba", "gender": "L"}, {"nama": "Mohamad Atfal A. Ismail", "gender": "L"}, {"nama": "Mohamad Farhan Pontoh", "gender": "L"}, {"nama": "Nada N. Aminu", "gender": "P"}, {"nama": "Najwa Y. Yunus", "gender": "P"}, {"nama": "Nurvita D. Husain", "gender": "P"}, {"nama": "Refan R. Tantu", "gender": "L"}, {"nama": "Taufik Y. Rahman", "gender": "L"}, {"nama": "Triyanto Kutei", "gender": "L"}, {"nama": "Shelin M. Alinti", "gender": "P"}, {"nama": "Sri Susanti U. Napu", "gender": "P"}, {"nama": "Suci Ibrahim", "gender": "P"}, {"nama": "Yusni Ma'ruf", "gender": "P"}]
};

const nilaiKelas = document.getElementById("nilaiKelas");
const nilaiNama = document.getElementById("nilaiNama");
const nilaiGender = document.getElementById("nilaiGender");

if(nilaiKelas && nilaiNama) {
    nilaiKelas.addEventListener("change", (e) => {
        const k = e.target.value;
        nilaiNama.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
        if(nilaiGender) nilaiGender.value = "";
        if(k && dataMurid[k]) { dataMurid[k].forEach((s, idx) => nilaiNama.innerHTML += `<option value="${idx}">${s.nama}</option>`); }
    });
    nilaiNama.addEventListener("change", (e) => {
        const k = nilaiKelas.value; const idx = e.target.value;
        if(idx !== "" && nilaiGender) nilaiGender.value = dataMurid[k][idx].gender;
    });
}

function renderTPInputs() {
    if(!wadahTP) return;
    const jumlah = parseInt(inputJumlahTP.value) || 7;
    const isSumatif = jenisPenilaian.value === "Sumatif";
    wadahTP.innerHTML = "";
    for(let i=1; i<=jumlah; i++) {
        const type = isSumatif ? "number" : "text";
        const attrs = isSumatif ? 'max="100" min="0"' : '';
        wadahTP.innerHTML += `<div class="col-4 col-md-3"><input type="${type}" ${attrs} class="form-control form-control-sm tp-input border-info" id="tp${i}" placeholder="TP ${i}"></div>`;
    }
    isSumatif ? grupCatatan.classList.add("hidden") : grupCatatan.classList.remove("hidden");
}

if(inputJumlahTP && jenisPenilaian) {
    inputJumlahTP.addEventListener("change", renderTPInputs);
    jenisPenilaian.addEventListener("change", renderTPInputs);
    renderTPInputs();
}

if(filterJenisPenilaian) filterJenisPenilaian.addEventListener("change", muatPenilaian);

if(formPenilaian) {
    formPenilaian.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btnSimpanNilai"); btn.innerText = "Menyimpan...";
        const jenis = jenisPenilaian.value;
        const jumlahTP = parseInt(inputJumlahTP.value) || 7;
        const data = {
            kelas: document.getElementById("nilaiKelas").value, nama: nilaiNama.options[nilaiNama.selectedIndex].text,
            gender: document.getElementById("nilaiGender").value, jenis: jenis, jumlahTP: jumlahTP, timestamp: serverTimestamp()
        };

        for(let i=1; i<=jumlahTP; i++) data[`tp${i}`] = document.getElementById(`tp${i}`) ? document.getElementById(`tp${i}`).value : "";

        if(jenis === "Formatif") {
            let tk = 0; for(let i=1; i<=jumlahTP; i++) if(data[`tp${i}`].trim()!=="") tk++;
            data.jumlahTerkumpul = tk; data.catatan = document.getElementById("nilaiCatatan").value;
        } else {
            let tot = 0, count = 0;
            for(let i=1; i<=jumlahTP; i++) { let v = parseFloat(data[`tp${i}`]); if(!isNaN(v)){tot+=v; count++;} }
            data.rataRata = count > 0 ? (tot / count).toFixed(1) : 0; 
        }

        try {
            const editId = document.getElementById("editDocId").value;
            if(editId) { await updateDoc(doc(db, "penilaian_siswa", editId), data); alert("Diperbarui!"); } 
            else { await addDoc(collection(db, "penilaian_siswa"), data); alert("Tersimpan!"); }
            
            formPenilaian.reset(); document.getElementById("editDocId").value = "";
            btn.innerText = "Simpan Penilaian"; btn.classList.replace("btn-warning", "btn-info");
            nilaiNama.innerHTML = '<option value="">-- Pilih Kelas Dulu --</option>';
            renderTPInputs(); muatPenilaian();
        } catch (e) { alert("Error: " + e.message); btn.innerText = "Coba Lagi"; }
    });
}

let datasetPenilaian = []; 

async function muatPenilaian() {
    const tb = document.getElementById("tabelNilaiData"); const th = document.getElementById("headerTabelNilai");
    if(!tb) return;
    const jd = document.getElementById("filterJenisPenilaian").value;
    tb.innerHTML = `<tr><td colspan='15'>Memuat...</td></tr>`;
    
    try {
        const qs = await getDocs(query(collection(db, "penilaian_siswa"), orderBy("timestamp", "desc")));
        datasetPenilaian = []; let maxTP = 1; let hasData = false;
        qs.forEach((doc) => {
            const d = doc.data();
            if(d.jenis === jd) { hasData = true; d.id = doc.id; datasetPenilaian.push(d); if(d.jumlahTP > maxTP) maxTP = d.jumlahTP; }
        });

        let hHTML = `<tr><th>Nama</th><th>L/P</th><th>Kelas</th>`;
        for(let i=1; i<=maxTP; i++) hHTML += `<th>TP${i}</th>`;
        hHTML += jd === "Formatif" ? `<th>Jml</th><th>Catatan</th><th class="kolom-aksi">Aksi</th></tr>` : `<th>Rata</th><th class="kolom-aksi">Aksi</th></tr>`;
        th.innerHTML = hHTML;

        tb.innerHTML = "";
        if(!hasData) { tb.innerHTML = `<tr><td colspan='15'>Kosong</td></tr>`; return; }

        datasetPenilaian.forEach(d => {
            let rHTML = `<td><div class="text-start text-nowrap">${d.nama}</div></td><td>${d.gender}</td><td><small>${d.kelas}</small></td>`;
            for(let i=1; i<=maxTP; i++) rHTML += `<td>${d[`tp${i}`] || "-"}</td>`;
            rHTML += jd === "Formatif" ? `<td><b>${d.jumlahTerkumpul||0}</b></td><td><small>${d.catatan||"-"}</small></td>` : `<td><b class="text-info">${d.rataRata||0}</b></td>`;
            rHTML += `<td class="kolom-aksi"><div class="btn-group btn-group-sm"><button class="btn btn-warning btn-edit text-dark fw-bold" data-id="${d.id}">Edit</button><button class="btn btn-danger btn-hapus" data-id="${d.id}">Hapus</button></div></td>`;
            tb.innerHTML += `<tr>${rHTML}</tr>`;
        });
    } catch (e) { tb.innerHTML = `<tr><td colspan='15'>Gagal memuat data</td></tr>`; }
}

const tBody = document.getElementById("tabelNilaiData");
if(tBody) {
    tBody.addEventListener("click", async (e) => {
        if(e.target.classList.contains("btn-hapus")) {
            if(confirm("Hapus data ini?")) {
                e.target.innerText = "..."; await deleteDoc(doc(db, "penilaian_siswa", e.target.dataset.id)); muatPenilaian();
            }
        }
        if(e.target.classList.contains("btn-edit")) {
            const dataEdit = datasetPenilaian.find(d => d.id === e.target.dataset.id);
            if(dataEdit) {
                document.getElementById("editDocId").value = dataEdit.id;
                document.getElementById("jenisPenilaian").value = dataEdit.jenis;
                document.getElementById("nilaiKelas").value = dataEdit.kelas;
                document.getElementById("nilaiKelas").dispatchEvent(new Event('change'));
                const opt = Array.from(document.getElementById("nilaiNama").options).find(o => o.text === dataEdit.nama);
                if(opt) document.getElementById("nilaiNama").value = opt.value;
                document.getElementById("nilaiGender").value = dataEdit.gender;
                document.getElementById("jumlahTP").value = dataEdit.jumlahTP || 7;
                renderTPInputs();
                for(let i=1; i<=(dataEdit.jumlahTP || 7); i++) if(document.getElementById(`tp${i}`)) document.getElementById(`tp${i}`).value = dataEdit[`tp${i}`] || "";
                if(dataEdit.jenis === "Formatif") document.getElementById("nilaiCatatan").value = dataEdit.catatan || "";
                const btn = document.getElementById("btnSimpanNilai"); btn.innerText = "Update Penilaian"; btn.classList.replace("btn-info", "btn-warning");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

// ==========================================
// 6. LOGIKA EXPORT KE EXCEL DAN PDF
// ==========================================
const btnExportExcel = document.getElementById("btnExportExcel");
if(btnExportExcel) {
    btnExportExcel.addEventListener("click", () => {
        const tabelAsli = document.getElementById("tabelExport");
        const tabelCopy = tabelAsli.cloneNode(true);
        // Hapus kolom Aksi sebelum diubah ke Excel
        const rows = tabelCopy.querySelectorAll("tr");
        rows.forEach(row => {
            const aksiCell = row.querySelector(".kolom-aksi");
            if(aksiCell) row.removeChild(aksiCell);
        });
        const wb = XLSX.utils.table_to_book(tabelCopy, {sheet: "Rekap Nilai"});
        XLSX.writeFile(wb, "Rekap_Penilaian.xlsx");
    });
}

const btnExportPDF = document.getElementById("btnExportPDF");
if(btnExportPDF) {
    btnExportPDF.addEventListener("click", () => {
        const element = document.getElementById("areaCetakTabel");
        // Sembunyikan kolom Aksi dari layar sebentar
        const selAksi = document.querySelectorAll(".kolom-aksi");
        selAksi.forEach(cell => cell.style.display = "none");
        
        const opt = {
            margin:       0.3,
            filename:     'Rekap_Penilaian.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            // Kembalikan lagi kolom Aksi setelah PDF selesai terunduh
            selAksi.forEach(cell => cell.style.display = "");
        });
    });
}
