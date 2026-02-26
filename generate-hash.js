/**
 * Admin şifresi için bcrypt hash oluşturma scripti
 * Kullanım: node generate-hash.js "sifreniz"
 *
 * Çıkan hash'i .env.local dosyasındaki ADMIN_PASSWORD_HASH değişkenine yazın.
 */

const bcrypt = require('bcryptjs');
const password = process.argv[2];

if (!password) {
    console.error('Lütfen bir şifre girin: node generate-hash.js "sifreniz"');
    process.exit(1);
}

if (password.length < 8) {
    console.error('Şifre en az 8 karakter olmalıdır.');
    process.exit(1);
}

bcrypt.hash(password, 12).then(hash => {
    console.log('\n✅ Bcrypt hash oluşturuldu:\n');
    console.log(hash);
    console.log('\n.env.local dosyanıza şunu ekleyin:');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
});
