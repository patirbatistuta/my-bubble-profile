// KONFIGURASI
const SUPABASE_URL = 'https://ougsceqliaagvxetpdh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...'; // GANTI DENGAN PUNYA KAMU!

// DEKLARASI HANYA SATU KALI!
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AMBIL ELEMENT
const mainPage = document.getElementById('mainPage');
const registerPage = document.getElementById('registerPage');
const joinButton = document.getElementById('joinButton');
const backButton = document.getElementById('backButton');
const registerForm = document.getElementById('registerForm');
const bubbleContainer = document.getElementById('bubbleContainer');
const profileModal = document.getElementById('profileModal');
const profileDetail = document.getElementById('profileDetail');
const closeModal = document.querySelector('.close-button');

// TOMBOL JOIN
joinButton.onclick = function() {
    mainPage.style.display = 'none';
    registerPage.style.display = 'block';
};

// TOMBOL BACK
backButton.onclick = function() {
    registerPage.style.display = 'none';
    mainPage.style.display = 'block';
};

// CONDITIONAL FORM
document.getElementById('kesibukan').onchange = function() {
    const sekolahFields = document.getElementById('sekolahFields');
    const kuliahFields = document.getElementById('kuliahFields');
    if (this.value === 'Sekolah') {
        sekolahFields.style.display = 'block';
        kuliahFields.style.display = 'none';
    } else if (this.value === 'Kuliah') {
        sekolahFields.style.display = 'none';
        kuliahFields.style.display = 'block';
    } else {
        sekolahFields.style.display = 'none';
        kuliahFields.style.display = 'none';
    }
};

// REGISTRASI
registerForm.onsubmit = async function(e) {
    e.preventDefault();
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

    const fileInput = document.getElementById('fotoProfile');
    let fotoUrl = null;
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const ext = file.name.split('.').pop();
        const fileName = Date.now() + '.' + ext;
        await supabase.storage.from('foto-profile').upload('public/' + fileName, file);
        const { data: urlData } = supabase.storage.from('foto-profile').getPublicUrl('public/' + fileName);
        fotoUrl = urlData.publicUrl;
    }

    const email = prompt('📧 Masukkan email:');
    const password = prompt('🔑 Buat password (min 6 karakter):');
    if (!email || !password) return alert('Email & password wajib!');

    const { data: user, error: signErr } = await supabase.auth.signUp({ email, password });
    if (signErr) return alert('Gagal daftar: ' + signErr.message);

    const { error: insertErr } = await supabase.from('profiles').insert({
        id: user.user.id, nama, umur, domisili, kesibukan,
        nama_sekolah: namaSekolah, kelas, nama_kampus: namaKampus, jurusan,
        wishlist, foto_url: fotoUrl, bubble_warna: bubbleWarna
    });

    if (insertErr) {
        alert('Gagal simpan: ' + insertErr.message);
    } else {
        alert('🎉 SELAMAT! Bubble berhasil dibuat!');
        registerPage.style.display = 'none';
        mainPage.style.display = 'block';
        loadBubbles();
        registerForm.reset();
    }
};

// LOAD BUBBLE
async function loadBubbles() {
    const { data: profiles } = await supabase.from('profiles').select('*');
    bubbleContainer.innerHTML = '';
    if (!profiles || profiles.length === 0) {
        bubbleContainer.innerHTML = '<p class="empty-message">✨ Belum ada anggota, jadilah yang pertama!</p>';
        return;
    }
    profiles.forEach(p => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.backgroundColor = p.bubble_warna || '#6366f1';
        bubble.style.animationDelay = (Math.random() * 3 + 1) + 's';
        const foto = p.foto_url ? `<img src="${p.foto_url}">` : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=ffffff&color=6366f1&size=80">`;
        bubble.innerHTML = foto + `<span>${p.nama}</span>`;
        bubble.onclick = function() {
            this.style.animation = 'none';
            this.offsetHeight;
            this.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
            this.style.setProperty('--ty', (Math.random() - 0.5) * 300 + 'px');
            this.classList.add('flying');
            setTimeout(() => {
                this.classList.remove('flying');
                this.style.animation = 'floatBubble ' + ((Math.random() * 2) + 3) + 's ease-in-out infinite';
                this.style.transform = '';
            }, 800);
        };
        bubble.ondblclick = function() {
            let extra = '';
            if (p.kesibukan === 'Sekolah') extra = `<p><strong>🏫 Sekolah:</strong> ${p.nama_sekolah || '-'}</p><p><strong>📚 Kelas:</strong> ${p.kelas || '-'}</p>`;
            else if (p.kesibukan === 'Kuliah') extra = `<p><strong>🎓 Kampus:</strong> ${p.nama_kampus || '-'}</p><p><strong>📖 Jurusan:</strong> ${p.jurusan || '-'}</p>`;
            const fotoModal = p.foto_url ? `<img src="${p.foto_url}">` : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=6366f1&color=fff&size=128">`;
            profileDetail.innerHTML = `${fotoModal}<h2>${p.nama}</h2><p><strong>🎂 Umur:</strong> ${p.umur} tahun</p><p><strong>📍 Domisili:</strong> ${p.domisili}</p><p><strong>💼 Kesibukan:</strong> ${p.kesibukan}</p>${extra}<p><strong>⭐ Wishlist:</strong> ${p.wishlist || 'Tidak ada'}</p>`;
            profileModal.style.display = 'flex';
        };
        bubbleContainer.appendChild(bubble);
    });
}

// MODAL
closeModal.onclick = function() { profileModal.style.display = 'none'; };
window.onclick = function(e) { if (e.target === profileModal) profileModal.style.display = 'none'; };

loadBubbles();
console.log('✅ Website siap!');