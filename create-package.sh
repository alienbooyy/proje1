#!/bin/bash

# Script to create a deployment package for end users
# This creates a zip file ready for distribution

set -e

echo "=== Creating Deployment Package ==="

# Build the executable if not present
if [ ! -f "dist/proje1-pos.exe" ]; then
    echo "Building executable..."
    npm run build
fi

# Create package directory
PACKAGE_DIR="proje1-pos-package"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "Copying files..."

# Copy necessary files
cp dist/proje1-pos.exe "$PACKAGE_DIR/"
cp config.json "$PACKAGE_DIR/"
cp -r public "$PACKAGE_DIR/"

# Create a README for end users
cat > "$PACKAGE_DIR/KULLANIM.txt" << 'EOF'
RESTAURANT POS SİSTEMİ
======================

KURULUM:
--------
1. Bu klasörün tamamını istediğiniz bir konuma kopyalayın
2. Klasör içeriği:
   - proje1-pos.exe (Ana program)
   - config.json (Ayarlar dosyası)
   - public/ (Web arayüzü dosyaları)

KULLANIM:
---------
1. "proje1-pos.exe" dosyasına çift tıklayın
2. Bir konsol penceresi açılacak ve "POS server running..." mesajını göreceksiniz
3. Web tarayıcınızı açın ve şu adrese gidin: http://localhost:3000
4. Programı kapatmak için konsol penceresini kapatın

İLK ÇALIŞTIRMA:
---------------
- İlk çalıştırmada otomatik olarak "data" klasörü oluşturulacaktır
- Veritabanı dosyası bu klasörde saklanır
- Tüm verileriniz bu klasörde güvenle saklanır

AYARLAR:
--------
config.json dosyasını düzenleyerek:
- Admin şifresini değiştirebilirsiniz (varsayılan: admin123)
- Sunucu portunu değiştirebilirsiniz (varsayılan: 3000)
- Yazıcı ayarlarını yapabilirsiniz

SORUN GİDERME:
--------------
- Program çalışmıyorsa: Başka bir programın 3000 portunu kullanmadığından emin olun
- Virüs uyarısı alıyorsanız: Program güvenlidir, güvenlik yazılımınıza istisna ekleyin
- Verileri yedeklemek için: "data" klasörünü yedekleyin

DESTEK:
-------
Herhangi bir sorun için lütfen sistem yöneticinize başvurun.

Bu yazılım tamamen offline çalışır ve internet bağlantısı gerektirmez.
EOF

# Create zip file
VERSION=$(grep -oP '"version":\s*"\K[^"]+' package.json || echo "0.1.0")
ZIP_NAME="proje1-pos-v${VERSION}.zip"
echo "Creating zip file: $ZIP_NAME"

if command -v zip &> /dev/null; then
    zip -r "$ZIP_NAME" "$PACKAGE_DIR"
    echo "✓ Package created: $ZIP_NAME"
else
    echo "Warning: 'zip' command not found. Package folder created: $PACKAGE_DIR"
    echo "Please manually zip the folder or install zip command."
fi

echo ""
echo "=== Deployment Package Ready ==="
echo "Contents:"
echo "  - proje1-pos.exe (54MB)"
echo "  - config.json"
echo "  - public/ folder"
echo "  - KULLANIM.txt (User instructions)"
echo ""
echo "You can now distribute: $ZIP_NAME"
