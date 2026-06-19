// ============================================
// 🔑 KONFIGURASI SUPABASE - GANTI PUNYA KAMU!
// ============================================
const SUPABASE_URL = 'https://ougsceqliaagvxetpdh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__Ckmf6vno1h_9xm3UTpexg_b3Orv6FQ'; 

// ============================================
// 🚀 INISIALISASI SUPABASE (HANYA SEKALI!)
// ============================================
console.log('🚀 Memulai aplikasi...');
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase client siap!');

// ============================================
// 📦 AMBIL SEMUA ELEMENT HTML
// ============================================
const mainPage = document.getElementById('mainPage');
const registerPage = document.getElementById('registerPage');
const joinBtn = document.getElementById('joinButton');
const backBtn = document.getElementById('backButton');
const form = document.getElementById('registerForm');
const bubbleContainer = document.getElementById('bubbleContainer');
const modal = document.getElementById('profileModal');
const profileDetail = document.getElementById('profileDetail');
const closeModalBtn = document.getElementById('closeModal');

// ============================================
// 🖱️ TOMBOL JOIN
// ============================================
joinBtn.addEventListener('click', function() {
    console.log('🟢 Tombol JOIN diklik!');
    mainPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
});

// ============================================
// 🖱️ TOMBOL BACK
// ============================================
backBtn.addEventListener('click', function() {
    console.log('🔵 Tombol BACK diklik!');
    registerPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
});

// ============================================
// 🔄 CONDITIONAL FORM
// ============================================
document.getElementById('kesibukan').addEventListener('change', function() {
    const sekolah = document.getElementById('sekolahFields');
    const kuliah = document.getElementById('kuliahFields');

    sekolah.classList.remove('show');
    kuliah.classList.remove('show');

    if (this.value === 'Sekolah') {
        sekolah.classList.add('show');
        document.getElementById('namaSekolah').required = true;
        document.getElementById('kelas').required = true;
        document.getElementById('namaKampus').required = false;
        document.getElementById('jurusan').required = false;
    } else if (this.value === 'Kuliah') {
        kuliah.classList.add('show');
        document.getElementById('namaSekolah').required = false;
        document.getElementById('kelas').required = false;
        document.getElementById('namaKampus').required = true;
        document.getElementById('jurusan').required = true;
    } else {
        document.getElementById('namaSekolah').required = false;
        document.getElementById('kelas').required = false;
        document.getElementById('namaKampus').required = false;
        document.getElementById('jurusan').required = false;
    }
});

// ============================================
// 📝 PROSES REGISTRASI
// ============================================
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('🟢 Form disubmit!');

    try {
        const nama = document.getElementById('nama').value;
        const umur = parseInt(document.getElementById('umur').value);
        const domisili = document.getElementById('domisili').value;
        const kesibukan = document.getElementById('kesibukan').value;
        const wishlist = document.getElementById('wishlist').value;
        const bubbleWarna = document.getElementById('bubbleWarna').value;

        let namaSekolah = null, kelas = null, namaKampus = null, jurusan = null;
        if (kesibukan === 'Sekolah') {
            namaSekolah = document.getElementById('namaSekolah').value;
            kelas = document.getElementById('kelas').value;
        } else if (kesibukan === 'Kuliah') {
            namaKampus = document.getElementById('namaKampus').value;
            jurusan = document.getElementById('jurusan').value;
        }

        // 📸 UPLOAD FOTO
        const fileInput = document.getElementById('fotoProfile');
        let fotoUrl = null;

        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const ext = file.name.split('.').pop();
            const fileName = Date.now() + '.' + ext;

            const { error: uploadErr } = await supabase.storage
                .from('foto-profile')
                .upload('public/' + fileName, file);

            if (uploadErr) {
                alert('Gagal upload foto! Pastikan bucket "foto-profile" sudah dibuat.');
                return;
            }

            const { data: urlData } = supabase.storage
                .from('foto-profile')
                .getPublicUrl('public/' + fileName);

            fotoUrl = urlData.publicUrl;
        }

        // 🔐 REGISTRASI USER
        const email = prompt('📧 Masukkan email untuk login:');
        const password = prompt('🔑 Buat password (minimal 6 karakter):');

        if (!email || !password) {
            alert('Email dan password wajib diisi!');
            return;
        }

        const { data: user, error: signErr } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (signErr) {
            alert('Gagal daftar! ' + signErr.message);
            return;
        }

        // 💾 SIMPAN PROFILE
        const { error: insertErr } = await supabase
            .from('profiles')
            .insert({
                id: user.user.id,
                nama: nama,
                umur: umur,
                domisili: domisili,
                kesibukan: kesibukan,
                nama_sekolah: namaSekolah,
                kelas: kelas,
                nama_kampus: namaKampus,
                jurusan: jurusan,
                wishlist: wishlist,
                foto_url: fotoUrl,
                bubble_warna: bubbleWarna
            });

        if (insertErr) {
            alert('Gagal menyimpan profile! ' + insertErr.message);
            return;
        }

        alert('🎉 SELAMAT! Bubble-mu berhasil dibuat!');

        registerPage.classList.add('hidden');
        mainPage.classList.remove('hidden');

        form.reset();
        document.getElementById('sekolahFields').classList.remove('show');
        document.getElementById('kuliahFields').classList.remove('show');

        loadBubbles();

    } catch (err) {
        console.error('❌ ERROR:', err);
        alert('Terjadi error: ' + err.message);
    }
});

// ============================================
// 🫧 FUNGSI LOAD BUBBLE
// ============================================
async function loadBubbles() {
    console.log('🔄 Loading bubbles...');

    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) {
            console.error('❌ Load error:', error);
            return;
        }

        bubbleContainer.innerHTML = '';

        if (!profiles || profiles.length === 0) {
            bubbleContainer.innerHTML = '<p class="empty-msg">✨ Belum ada anggota, jadilah yang pertama!</p>';
            return;
        }

        profiles.forEach((p) => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.backgroundColor = p.bubble_warna || '#6366f1';
            bubble.style.animationDelay = (Math.random() * 3 + 1) + 's';

            const foto = p.foto_url
                ? `<img src="${p.foto_url}" alt="Foto ${p.nama}">`
                : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=ffffff&color=6366f1&size=80" alt="Avatar">`;

            bubble.innerHTML = foto + `<span>${p.nama}</span>`;

            bubble.addEventListener('click', function(e) {
                e.stopPropagation();
                this.style.animation = 'none';
                this.offsetHeight;
                const tx = (Math.random() - 0.5) * 400;
                const ty = (Math.random() - 0.5) * 300;
                this.style.setProperty('--tx', tx + 'px');
                this.style.setProperty('--ty', ty + 'px');
                this.classList.add('flying');
                setTimeout(() => {
                    this.classList.remove('flying');
                    this.style.animation = 'floatBubble ' + ((Math.random() * 2) + 3) + 's ease-in-out infinite';
                    this.style.transform = '';
                }, 800);
            });

            bubble.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                showProfile(p);
            });

            bubbleContainer.appendChild(bubble);
        });

        console.log('✅ Bubble berhasil dimuat! Jumlah:', profiles.length);

    } catch (err) {
        console.error('❌ Error loadBubbles:', err);
    }
}

// ============================================
// 👤 FUNGSI SHOW PROFILE
// ============================================
function showProfile(p) {
    console.log('👤 Menampilkan profile:', p.nama);

    let extraInfo = '';
    if (p.kesibukan === 'Sekolah') {
        extraInfo = `
            <p><strong>🏫 Sekolah:</strong> ${p.nama_sekolah || '-'}</p>
            <p><strong>📚 Kelas:</strong> ${p.kelas || '-'}</p>
        `;
    } else if (p.kesibukan === 'Kuliah') {
        extraInfo = `
            <p><strong>🎓 Kampus:</strong> ${p.nama_kampus || '-'}</p>
            <p><strong>📖 Jurusan:</strong> ${p.jurusan || '-'}</p>
        `;
    }

    const foto = p.foto_url
        ? `<img src="${p.foto_url}" alt="Foto ${p.nama}">`
        : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=6366f1&color=fff&size=128" alt="Avatar">`;

    profileDetail.innerHTML = `
        ${foto}
        <h2>${p.nama}</h2>
        <p><strong>🎂 Umur:</strong> ${p.umur} tahun</p>
        <p><strong>📍 Domisili:</strong> ${p.domisili}</p>
        <p><strong>💼 Kesibukan:</strong> ${p.kesibukan}</p>
        ${extraInfo}
        <p><strong>⭐ Wishlist:</strong> ${p.wishlist || 'Tidak ada wishlist'}</p>
    `;

    modal.classList.remove('hidden');
}

// ============================================
// ❌ TUTUP MODAL
// ============================================
closeModalBtn.addEventListener('click', function() {
    modal.classList.add('hidden');
});

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// ============================================
// 🚀 JALANKAN LOAD BUBBLE PERTAMA KALI
// ============================================
loadBubbles();

console.log('✅ Website siap!');