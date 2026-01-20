# Restaurant POS System (Offline)

Yerel ağda çalışan, tam özellikli restoran POS sistemi.

## 🎯 Özellikler

### Frontend (Touch-Friendly & Responsive)
- **Masalar**: Görsel masa durumu gösterimi (boş: yeşil, dolu: kırmızı)
- **Ürün Yönetimi**: Ürün ekleme/silme ve fiyat yönetimi
- **Sipariş Yönetimi**: Tablet/web üzerinden sipariş oluşturma
- **Gün Sonu Raporu**: Tarih aralığına göre gelir raporları ve Excel export
- **Stok Yönetimi**: Hammadde stok takibi
- **Reçete Yönetimi**: Ürünlere malzeme bağlama
- **Analitik**: En çok satan ürünler, karlılık analizi
- **Masa Yönetimi**: Masa ekleme/silme/yeniden adlandırma/birleştirme
- **Admin Paneli**: Şifre korumalı yönetim paneli

### Backend (Node.js + SQLite)
- RESTful API endpoints
- Tam offline destek
- SQLite yerel veritabanı
- Activity logging (tüm işlemler kaydedilir)
- Termal yazıcı desteği (USB)
- Excel export desteği

### Thermal Printer Integration
- İki adet terminal yazıcı yapılandırması (mutfak, fırın)
- USB üzerinden doğrudan yazdırma
- Sipariş fişi otomatik oluşturma

## 💻 Sistem Gereksinimleri

### Windows Executable İçin
- **İşletim Sistemi**: Windows 7 veya üstü (64-bit)
- **Disk Alanı**: En az 100MB boş alan
- **RAM**: En az 512MB
- **Ağ**: Yerel ağ erişimi (isteğe bağlı, çoklu cihaz kullanımı için)
- **Ek Yazılım**: Gerekli değil (Node.js dahildir)

### Geliştirici Kurulumu İçin
- **İşletim Sistemi**: Windows, Linux, veya macOS
- **Node.js**: v14 veya üstü
- **npm**: v6 veya üstü
- **Disk Alanı**: En az 200MB (node_modules dahil)

## 🚀 Kurulum

### Yöntem 1: Windows Executable (Önerilen - Kolay Kullanım)

En basit kullanım için hazır `.exe` dosyasını kullanın:

1. **Executable'ı İndirin**: Releases sayfasından `pos-system-dist.zip` dosyasını indirin
2. **Çıkartın**: ZIP dosyasını bir klasöre çıkartın
3. **Çalıştırın**: `pos-system.exe` dosyasına çift tıklayın
4. **Tarayıcı**: `http://localhost:3000` adresini açın

**Avantajlar:**
- Node.js kurulumu gerektirmez
- Tek tıkla çalışır
- Non-teknik kullanıcılar için ideal

**Detaylı kullanım talimatları için dağıtım paketindeki `README.txt` dosyasına bakın.**

### Yöntem 2: Geliştirici Kurulumu (Kaynak Koddan)

Geliştirme veya özelleştirme için:

**Gereksinimler:**
- Node.js v14+
- npm veya yarn

**Adımlar:**

```bash
# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm start
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

### Yöntem 3: Executable'ı Kendiniz Oluşturun

Executable'ı kaynak koddan kendiniz oluşturabilirsiniz:

```bash
# Bağımlılıkları yükle
npm install

# Executable oluştur
npm run build

# Dağıtım paketi hazırla
npm run package
```

Bu, `dist/` klasöründe tüm gerekli dosyaları içeren dağıtıma hazır bir paket oluşturur.

**Detaylı build talimatları için `BUILD_README.md` dosyasına bakın.**

## 🔧 Yapılandırma

`config.json` dosyasını düzenleyerek şunları yapılandırabilirsiniz:
- Admin şifresi
- Yazıcı ayarları
- Sunucu portu

```json
{
  "adminPassword": "admin123",
  "printers": {
    "kitchen": {
      "enabled": false,
      "port": "/dev/usb/lp0",
      "name": "Kitchen Printer"
    },
    "bakery": {
      "enabled": false,
      "port": "/dev/usb/lp1",
      "name": "Bakery Printer"
    }
  },
  "serverPort": 3000
}
```

## 📱 Kullanım

### Admin Girişi
1. Sağ üstteki "Admin" butonuna tıklayın
2. Şifreyi girin (varsayılan: `admin123`)
3. Admin özellikleri aktif olur

### Masa Yönetimi
1. Ana ekranda masaları görüntüleyin
2. Boş masalar yeşil, dolu masalar kırmızı
3. Masaya tıklayarak sipariş oluşturun

### Sipariş Alma
1. Masaya tıklayın
2. Ürünleri seçin (her tıklama 1 adet ekler)
3. Ödeme butonuna tıklayarak ödeme alın
4. Yazdır butonu ile fiş yazdırın

### Raporlama
1. "Raporlar" sekmesine gidin
2. Tarih aralığı seçin
3. "Rapor Oluştur" ile özet görün
4. "Excel İndir" ile raporu indirin

## 📊 API Endpoints

### Tables
- `GET /api/tables` - Tüm masaları listele
- `POST /api/tables` - Yeni masa ekle
- `PUT /api/tables/:id` - Masa ismini değiştir
- `DELETE /api/tables/:id` - Masa sil
- `POST /api/tables/:id/merge` - Masaları birleştir

### Products
- `GET /api/products` - Ürünleri listele
- `POST /api/products` - Yeni ürün ekle
- `DELETE /api/products/:id` - Ürün sil

### Orders
- `GET /api/orders` - Siparişleri listele
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders/:id/items` - Sipariş kalemlerini getir
- `POST /api/orders/:id/items` - Sipariş kalemi ekle
- `DELETE /api/orders/:orderId/items/:itemId` - Kalem sil
- `POST /api/orders/:id/close` - Siparişi kapat
- `POST /api/orders/:id/print` - Fişi yazdır

### Payments
- `POST /api/orders/:id/payments` - Ödeme al

### Reports
- `GET /api/reports/summary` - Özet rapor
- `GET /api/reports/products` - Ürün bazlı rapor
- `GET /api/reports/export` - Excel export

### Inventory
- `GET /api/ingredients` - Malzemeleri listele
- `POST /api/ingredients` - Malzeme ekle
- `DELETE /api/ingredients/:id` - Malzeme sil
- `GET /api/stocks` - Stokları listele
- `POST /api/stocks` - Stok güncelle

### Recipes
- `GET /api/recipes/:productId` - Ürün reçetesini getir
- `POST /api/recipes/:productId` - Reçete kalemi ekle
- `DELETE /api/recipes/:productId/:id` - Reçete kalemi sil

### Activity Logs
- `GET /api/logs` - Son aktiviteleri listele

## 🗄️ Veritabanı

SQLite kullanılır ve `data/pos.db` dosyasına yazılır.

### Tablolar
- `tables` - Masalar
- `products` - Ürünler
- `orders` - Siparişler
- `order_items` - Sipariş kalemleri
- `payments` - Ödemeler
- `ingredients` - Malzemeler
- `recipe_items` - Reçete kalemleri
- `stocks` - Stok bilgileri
- `activity_logs` - Aktivite kayıtları

## 🖨️ Yazıcı Yapılandırması

SPENTA thermal printer veya uyumlu USB yazıcılar desteklenir.

1. `config.json` içinde yazıcı portlarını ayarlayın
2. `enabled: true` yapın
3. USB yazıcıları `/dev/usb/lp0` veya `/dev/usb/lp1` üzerinden bağlayın

## 📝 Notlar

- Sistem tamamen offline çalışır
- Tüm veriler yerel SQLite veritabanında saklanır
- Touch-friendly tasarım tablet kullanımı için optimize edilmiştir
- Admin işlemleri şifre ile korunur
- Tüm önemli işlemler activity logs'a kaydedilir

## 🔒 Güvenlik

- Admin paneli şifre ile korunur
- Şifreyi `config.json` dosyasından değiştirin
- Veritabanı dosyası `data/` klasöründe saklanır (git'e commit edilmez)

### Güvenlik Notları

**Önemli**: Bu sistem yerel ağda offline kullanım için tasarlanmıştır.

- **Rate Limiting**: API endpoints'lerde rate limiting bulunmamaktadır. Sistem yerel ağda güvenilir kullanıcılar için tasarlanmıştır.
- **HTTPS**: Yerel kullanım için HTTP kullanılır. Genel ağda kullanım için reverse proxy (nginx/Apache) ile HTTPS yapılandırması önerilir.
- **Şifre Güvenliği**: Admin şifresi config dosyasında düz metin olarak saklanır. Üretim ortamında environment variable kullanımı önerilir.
- **Ağ Erişimi**: Sistemi sadece güvenilir yerel ağda çalıştırın. Firewall kuralları ile dış erişimi engelleyin.

## 📄 Lisans

Bu proje özel kullanım içindir.