// ======================================================
// app.js (KODE LENGKAP - JURNAL, PERANGKAT, & PENILAIAN DINAMIS)
// ======================================================

// Perhatikan ada tambahan doc, deleteDoc, dan updateDoc di baris ini
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
        signOut(auth).then(() => window.location.href = "index.html");
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
// 4. LOGIKA PERANGKAT PEMBELAJARAN
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
// 5. LOGIKA PENILAIAN SISWA & DATABASE MURID
// ==========================================
const formPenilaian = document.getElementById("formPenilaian");
const jenisPenilaian = document.getElementById("jenisPenilaian");
const filterJenisPenilaian = document.getElementById("filterJenisPenilaian");
const inputJumlahTP = document.getElementById("jumlahTP");
const wadahTP = document.getElementById("wadahTP");
const grupCatatan = document.getElementById("grupCatatan");

// --- DATABASE SISWA ---
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
        const kelas = e.target.value;
        nilaiNama.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
        if(nilaiGender) nilaiGender.value = "";
        if(kelas && dataMurid[kelas]) {
            dataMurid[kelas].forEach((siswa, idx) => {
                nilaiNama.innerHTML += `<option value="${idx}">${siswa.nama}</option>`;
            });
        }
    });

    nilaiNama.addEventListener("change", (e) => {
        const kelas = nilaiKelas.value;
        const idx = e.target.value;
        if(idx !== "" && nilaiGender) {
            nilaiGender.value = dataMurid[kelas][idx].gender;
        }
    });
}

// --- FUNGSI RENDER INPUT TP DINAMIS ---
function renderTPInputs() {
    if(!wadahTP) return;
    const jumlah = parseInt(inputJumlahTP.value) || 7;
    const isSumatif = jenisPenilaian.value === "Sumatif";
    wadahTP.innerHTML = "";
    
    for(let i=1; i<=jumlah; i++) {
        const type = isSumatif ? "number" : "text";
        const attrs = isSumatif ? 'max="100" min="0"' : '';
        wadahTP.innerHTML += `
            <div class="col-4 col-md-3">
                <input type="${type}" ${attrs} class="form-control form-control-sm tp-input border-info" id="tp${i}" placeholder="TP ${i}">
            </div>
        `;
    }
    
    if(isSumatif) {
        grupCatatan.classList.add("hidden");
    } else {
        grupCatatan.classList.remove("hidden");
    }
}

if(inputJumlahTP && jenisPenilaian) {
    inputJumlahTP.addEventListener("change", renderTPInputs);
    jenisPenilaian.addEventListener("change", renderTPInputs);
    renderTPInputs(); // Panggil pertama kali
}

if(filterJenisPenilaian) {
    filterJenisPenilaian.addEventListener("change", muatPenilaian);
}

// --- SIMPAN / UPDATE DATA ---
if(formPenilaian) {
    formPenilaian.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btnSimpan = document.getElementById("btnSimpanNilai");
        btnSimpan.innerText = "Menyimpan...";
        
        const jenis = jenisPenilaian.value;
        const jumlahTP = parseInt(inputJumlahTP.value) || 7;
        
        const data = {
            kelas: document.getElementById("nilaiKelas").value,
            nama: nilaiNama.options[nilaiNama.selectedIndex].text,
            gender: document.getElementById("nilaiGender").value,
            jenis: jenis,
            jumlahTP: jumlahTP,
            timestamp: serverTimestamp()
        };

        // Ambil nilai dari TP yang digenerate
        for(let i=1; i<=jumlahTP; i++) {
            data[`tp${i}`] = document.getElementById(`tp${i}`) ? document.getElementById(`tp${i}`).value : "";
        }

        if(jenis === "Formatif") {
            let terkumpul = 0;
            for(let i=1; i<=jumlahTP; i++) { if(data[`tp${i}`].trim() !== "") terkumpul++; }
            data.jumlahTerkumpul = terkumpul;
            data.catatan = document.getElementById("nilaiCatatan").value;
        } else {
            let total = 0, count = 0;
            for(let i=1; i<=jumlahTP; i++) { 
                let val = parseFloat(data[`tp${i}`]);
                if(!isNaN(val)) { total += val; count++; } 
            }
            data.rataRata = count > 0 ? (total / count).toFixed(1) : 0; 
        }

        try {
            const editId = document.getElementById("editDocId").value;
            if(editId) {
                // Proses Edit/Update
                await updateDoc(doc(db, "penilaian_siswa", editId), data);
                alert("Data Penilaian berhasil diperbarui!");
            } else {
                // Proses Tambah Baru
                await addDoc(collection(db, "penilaian_siswa"), data);
                alert("Data Penilaian berhasil disimpan!");
            }
            
            // Reset Form kembali ke mode Tambah
            formPenilaian.reset();
            document.getElementById("editDocId").value = "";
            btnSimpan.innerText = "Simpan Penilaian";
            btnSimpan.classList.replace("btn-warning", "btn-info");
            nilaiNama.innerHTML = '<option value="">-- Pilih Kelas Dulu --</option>';
            renderTPInputs();
            muatPenilaian();
        } catch (error) {
            alert("Gagal menyimpan data: " + error.message);
            btnSimpan.innerText = "Coba Lagi";
        }
    });
}

// --- TABEL DAN TOMBOL AKSI ---
let datasetPenilaian = []; // State untuk menampung data sementara

async function muatPenilaian() {
    const tabelBody = document.getElementById("tabelNilaiData");
    const headerTabel = document.getElementById("headerTabelNilai");
    if(!tabelBody) return;
    
    const jenisDitampilkan = document.getElementById("filterJenisPenilaian").value;
    tabelBody.innerHTML = `<tr><td colspan='15' class='text-center'>Memuat data...</td></tr>`;
    
    try {
        const q = query(collection(db, "penilaian_siswa"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        datasetPenilaian = [];
        let maxTP = 1; // Mencari jumlah TP terbanyak untuk membuat header
        let hasData = false;
        
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            if(d.jenis === jenisDitampilkan) {
                hasData = true;
                d.id = doc.id; // Simpan ID untuk fungsi Hapus/Edit
                datasetPenilaian.push(d);
                if(d.jumlahTP > maxTP) maxTP = d.jumlahTP;
            }
        });

        // Buat Header Dinamis
        let headerHTML = `<tr><th>Nama</th><th>L/P</th><th>Kelas</th>`;
        for(let i=1; i<=maxTP; i++) headerHTML += `<th>TP${i}</th>`;
        if(jenisDitampilkan === "Formatif") {
            headerHTML += `<th>Jml</th><th>Catatan</th><th>Aksi</th></tr>`;
        } else {
            headerHTML += `<th>Rata-rata</th><th>Aksi</th></tr>`;
        }
        headerTabel.innerHTML = headerHTML;

        // Buat Baris Tabel
        tabelBody.innerHTML = "";
        if(!hasData) {
            tabelBody.innerHTML = `<tr><td colspan='15' class='text-center'>Belum ada data ${jenisDitampilkan}</td></tr>`;
            return;
        }

        datasetPenilaian.forEach(d => {
            let rowHTML = `<td><div class="text-start text-nowrap">${d.nama}</div></td><td>${d.gender}</td><td><small class="text-nowrap">${d.kelas}</small></td>`;
            for(let i=1; i<=maxTP; i++) {
                rowHTML += `<td>${d[`tp${i}`] || "-"}</td>`;
            }
            if(jenisDitampilkan === "Formatif") {
                rowHTML += `<td><b>${d.jumlahTerkumpul||0}</b></td><td><small>${d.catatan||"-"}</small></td>`;
            } else {
                rowHTML += `<td><b class="text-info">${d.rataRata||0}</b></td>`;
            }
            // Tambahkan Tombol Edit dan Hapus
            rowHTML += `
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-warning btn-edit text-dark fw-bold" data-id="${d.id}">Edit</button>
                        <button class="btn btn-danger btn-hapus" data-id="${d.id}">Hapus</button>
                    </div>
                </td>
            `;
            tabelBody.innerHTML += `<tr>${rowHTML}</tr>`;
        });
    } catch (error) {
        tabelBody.innerHTML = `<tr><td colspan='15' class='text-center text-danger'>Gagal memuat: ${error.message}</td></tr>`;
    }
}

// --- EVENT DELEGATION UNTUK TOMBOL EDIT & HAPUS ---
const tabelBodyPenilaian = document.getElementById("tabelNilaiData");
if(tabelBodyPenilaian) {
    tabelBodyPenilaian.addEventListener("click", async (e) => {
        // Jika Klik Tombol Hapus
        if(e.target.classList.contains("btn-hapus")) {
            const id = e.target.dataset.id;
            if(confirm("Apakah Bapak yakin ingin menghapus data ini?")) {
                e.target.innerText = "Menghapus...";
                await deleteDoc(doc(db, "penilaian_siswa", id));
                muatPenilaian();
            }
        }
        
        // Jika Klik Tombol Edit
        if(e.target.classList.contains("btn-edit")) {
            const id = e.target.dataset.id;
            const dataEdit = datasetPenilaian.find(d => d.id === id);
            if(dataEdit) {
                // 1. Set ID ke form tersembunyi
                document.getElementById("editDocId").value = id;
                
                // 2. Isi Kelas & pancing dropdown nama agar muncul
                document.getElementById("jenisPenilaian").value = dataEdit.jenis;
                document.getElementById("nilaiKelas").value = dataEdit.kelas;
                document.getElementById("nilaiKelas").dispatchEvent(new Event('change'));
                
                // 3. Cari dan set index Nama
                const options = Array.from(document.getElementById("nilaiNama").options);
                const opt = options.find(o => o.text === dataEdit.nama);
                if(opt) document.getElementById("nilaiNama").value = opt.value;
                document.getElementById("nilaiGender").value = dataEdit.gender;
                
                // 4. Set Jumlah TP Dinamis dan pancing input agar muncul
                document.getElementById("jumlahTP").value = dataEdit.jumlahTP || 7;
                renderTPInputs();
                
                // 5. Isi Nilai per TP
                for(let i=1; i<=(dataEdit.jumlahTP || 7); i++) {
                    if(document.getElementById(`tp${i}`)) {
                        document.getElementById(`tp${i}`).value = dataEdit[`tp${i}`] || "";
                    }
                }
                
                // 6. Isi Catatan jika ada
                if(dataEdit.jenis === "Formatif") {
                    document.getElementById("nilaiCatatan").value = dataEdit.catatan || "";
                }
                
                // 7. Ubah Tampilan Tombol Submit
                const btnSimpan = document.getElementById("btnSimpanNilai");
                btnSimpan.innerText = "Update Penilaian";
                btnSimpan.classList.replace("btn-info", "btn-warning");
                
                // 8. Gulir layar ke atas secara otomatis
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}
