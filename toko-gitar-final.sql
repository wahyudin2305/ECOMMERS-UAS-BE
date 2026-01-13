-- =============================================
-- DATA TOKO GITAR - SQL Import File (FINAL)
-- Sesuai struktur database db_ecommerce
-- =============================================

-- Matikan foreign key check
SET FOREIGN_KEY_CHECKS = 0;

-- Hapus data lama
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;

-- Reset auto increment
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- Nyalakan kembali foreign key check
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- KATEGORI
-- Struktur: id, name, slug, image, created_at, updated_at
-- =============================================
INSERT INTO categories (id, name, slug, image, created_at, updated_at) VALUES
(1, 'Gitar Akustik', 'gitar-akustik', '/uploads/categories/gitar-akustik.jpg', NOW(), NOW()),
(2, 'Gitar Elektrik', 'gitar-elektrik', '/uploads/categories/gitar-elektrik.jpg', NOW(), NOW()),
(3, 'Bass', 'bass', '/uploads/categories/bass.jpg', NOW(), NOW()),
(4, 'Amplifier', 'amplifier', '/uploads/categories/amplifier.jpg', NOW(), NOW()),
(5, 'Aksesoris', 'aksesoris', '/uploads/categories/aksesoris.jpg', NOW(), NOW()),
(6, 'Efek Gitar', 'efek-gitar', '/uploads/categories/efek-gitar.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - GITAR AKUSTIK
-- Struktur: id, name, description, price, stock, weight, category_id, image, created_at, updated_at
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Yamaha F310', 'Gitar akustik terlaris untuk pemula. Body dreadnought dengan top spruce dan back/side meranti. Suara jernih dan nyaman dimainkan.', 1500000.00, 25, 2100, 1, '/uploads/products/yamaha-f310.jpg', NOW(), NOW()),
('Yamaha FG800', 'Gitar akustik solid top dengan suara lebih kaya. Cocok untuk pemain intermediate. Top solid spruce, back/side nato.', 2800000.00, 15, 2200, 1, '/uploads/products/yamaha-fg800.jpg', NOW(), NOW()),
('Cort AD810', 'Gitar akustik budget-friendly dengan kualitas baik. Body dreadnought, top spruce laminate, suara bright dan jelas.', 1200000.00, 30, 2000, 1, '/uploads/products/cort-ad810.jpg', NOW(), NOW()),
('Taylor 114ce', 'Gitar akustik elektrik premium dengan layered walnut back/sides dan solid Sitka spruce top. Dilengkapi preamp ES2.', 15000000.00, 5, 2300, 1, '/uploads/products/taylor-114ce.jpg', NOW(), NOW()),
('Martin D-28', 'Gitar akustik legendaris dengan solid Sitka spruce top dan East Indian rosewood back/sides. Standar industri.', 45000000.00, 3, 2400, 1, '/uploads/products/martin-d28.jpg', NOW(), NOW()),
('Ibanez V50NJP', 'Paket gitar akustik lengkap untuk pemula. Termasuk tas, strap, tuner, pick, dan senar cadangan.', 1400000.00, 20, 3000, 1, '/uploads/products/ibanez-v50njp.jpg', NOW(), NOW()),
('Epiphone DR-100', 'Gitar akustik dengan select spruce top dan mahogany body. Desain klasik dengan harga terjangkau.', 1600000.00, 18, 2100, 1, '/uploads/products/epiphone-dr100.jpg', NOW(), NOW()),
('Takamine GD20-NS', 'Gitar akustik dengan solid cedar top untuk suara hangat dan mellow. Cocok untuk fingerstyle.', 3500000.00, 10, 2200, 1, '/uploads/products/takamine-gd20.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - GITAR ELEKTRIK
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Fender Player Stratocaster', 'Gitar elektrik ikonik dengan 3 single-coil pickup, 5-way switch, dan tremolo bridge. Maple neck dengan pau ferro fingerboard.', 14000000.00, 8, 3500, 2, '/uploads/products/fender-player-strat.jpg', NOW(), NOW()),
('Gibson Les Paul Standard 50s', 'Gitar elektrik klasik dengan Burstbucker humbucker pickups dan mahogany body dengan maple top. Suara tebal dan sustain panjang.', 38000000.00, 4, 4000, 2, '/uploads/products/gibson-lp-standard.jpg', NOW(), NOW()),
('Ibanez RG450DX', 'Gitar elektrik untuk metal dan shred. HSH pickup configuration, Edge tremolo, dan wizard neck profile.', 6500000.00, 12, 3200, 2, '/uploads/products/ibanez-rg450dx.jpg', NOW(), NOW()),
('Epiphone Les Paul Standard', 'Versi affordable dari Gibson Les Paul. ProBucker humbucker pickups dengan coil-splitting. Mahogany body, maple top.', 6000000.00, 15, 3800, 2, '/uploads/products/epiphone-lp-standard.jpg', NOW(), NOW()),
('Squier Classic Vibe 50s Strat', 'Gitar elektrik vintage style dengan harga terjangkau. Alnico single-coil pickups, vintage-style tremolo.', 5500000.00, 10, 3400, 2, '/uploads/products/squier-cv-50s-strat.jpg', NOW(), NOW()),
('PRS SE Custom 24', 'Gitar elektrik versatile dengan 85/15 S humbucker pickups, tremolo bridge, dan 24 fret. Cocok untuk berbagai genre.', 12000000.00, 7, 3600, 2, '/uploads/products/prs-se-custom24.jpg', NOW(), NOW()),
('ESP LTD EC-256', 'Gitar elektrik single-cutaway dengan ESP designed humbucker. Mahogany body, roasted jatoba fingerboard.', 5000000.00, 14, 3700, 2, '/uploads/products/esp-ltd-ec256.jpg', NOW(), NOW()),
('Jackson Dinky JS22', 'Gitar elektrik untuk metal dengan dual high-output humbuckers dan compound radius fingerboard.', 3200000.00, 18, 3300, 2, '/uploads/products/jackson-dinky-js22.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - BASS
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Fender Player Jazz Bass', 'Bass elektrik klasik dengan dual single-coil pickups untuk suara bright dan punchy. Alder body, maple neck.', 14500000.00, 6, 4200, 3, '/uploads/products/fender-player-jazz.jpg', NOW(), NOW()),
('Ibanez GSR200', 'Bass elektrik untuk pemula dengan Phat II EQ, split-coil pickup, dan slim neck. Nyaman untuk tangan kecil.', 3500000.00, 15, 3800, 3, '/uploads/products/ibanez-gsr200.jpg', NOW(), NOW()),
('Squier Affinity Precision Bass', 'Bass elektrik P-Bass style dengan harga terjangkau. Split single-coil pickup, C-shape neck profile.', 3800000.00, 12, 4000, 3, '/uploads/products/squier-affinity-pbass.jpg', NOW(), NOW()),
('Yamaha TRBX304', 'Bass elektrik active 4-string dengan Performance EQ dan solid mahogany body. Tone versatile.', 5500000.00, 10, 4100, 3, '/uploads/products/yamaha-trbx304.jpg', NOW(), NOW()),
('Sterling by Music Man StingRay', 'Bass dengan signature humbucker pickup dan 3-band active EQ. Suara agresif dan powerful.', 8500000.00, 8, 4300, 3, '/uploads/products/sterling-stingray.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - AMPLIFIER
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Fender Frontman 10G', 'Ampli gitar 10 watt untuk latihan di rumah. Clean dan overdrive channel, aux input, headphone jack.', 900000.00, 25, 4500, 4, '/uploads/products/fender-frontman-10g.jpg', NOW(), NOW()),
('Marshall MG15G', 'Ampli gitar 15 watt dengan Marshall tone yang ikonik. Clean dan overdrive channel, MP3 input.', 1800000.00, 18, 6000, 4, '/uploads/products/marshall-mg15g.jpg', NOW(), NOW()),
('Boss Katana 50 MkII', 'Ampli gitar 50 watt dengan 5 amp characters dan built-in Boss effects. Cocok untuk latihan dan gig kecil.', 4200000.00, 12, 11000, 4, '/uploads/products/boss-katana-50.jpg', NOW(), NOW()),
('Fender Champion 40', 'Ampli gitar 40 watt dengan berbagai amp voicing dan built-in effects. 2 channel, aux input.', 3500000.00, 10, 9500, 4, '/uploads/products/fender-champion-40.jpg', NOW(), NOW()),
('Orange Crush 20RT', 'Ampli gitar 20 watt dengan reverb dan tuner built-in. Orange signature tone yang crunchy.', 2800000.00, 14, 7500, 4, '/uploads/products/orange-crush-20rt.jpg', NOW(), NOW()),
('Hartke HD25', 'Ampli bass 25 watt combo dengan HyDrive speaker. Cocok untuk latihan bass di rumah.', 2500000.00, 15, 8000, 4, '/uploads/products/hartke-hd25.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - AKSESORIS
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Elixir Nanoweb Acoustic', 'Senar gitar akustik dengan coating anti karat. Gauge 12-53, bright tone, tahan lama.', 250000.00, 50, 50, 5, '/uploads/products/elixir-nanoweb-acoustic.jpg', NOW(), NOW()),
('Ernie Ball Regular Slinky', 'Senar gitar elektrik populer. Nickel wound, gauge 10-46, balanced tone untuk berbagai genre.', 95000.00, 80, 50, 5, '/uploads/products/ernieball-regular-slinky.jpg', NOW(), NOW()),
('Dunlop Tortex Pick 0.88mm', 'Pick gitar standar industri. Ketebalan 0.88mm (hijau), grip yang bagus, isi 12pcs.', 60000.00, 100, 20, 5, '/uploads/products/dunlop-tortex-088.jpg', NOW(), NOW()),
('Kyser Quick-Change Capo', 'Capo gitar akustik dengan spring action. Mudah dipasang dan dilepas, tidak merusak neck.', 350000.00, 30, 100, 5, '/uploads/products/kyser-capo.jpg', NOW(), NOW()),
('Korg GA-2 Guitar Tuner', 'Tuner gitar dan bass digital. Compact, akurat, battery life panjang.', 180000.00, 40, 80, 5, '/uploads/products/korg-ga2-tuner.jpg', NOW(), NOW()),
('Fender Vintage Strap', 'Strap gitar vintage style dengan bahan tweed. Adjustable length, cocok untuk gitar dan bass.', 450000.00, 25, 150, 5, '/uploads/products/fender-vintage-strap.jpg', NOW(), NOW()),
('Planet Waves Guitar Polish', 'Cairan pembersih gitar untuk body dan hardware. Tidak merusak finish, membuat gitar berkilau.', 120000.00, 35, 200, 5, '/uploads/products/planetwaves-polish.jpg', NOW(), NOW()),
('Hercules GS414B Guitar Stand', 'Stand gitar dengan Auto Grip System. Kokoh, foldable, cocok untuk gitar akustik dan elektrik.', 650000.00, 20, 2500, 5, '/uploads/products/hercules-gs414b.jpg', NOW(), NOW());

-- =============================================
-- PRODUK - EFEK GITAR
-- =============================================
INSERT INTO products (name, description, price, stock, weight, category_id, image, created_at, updated_at) VALUES
('Boss DS-1 Distortion', 'Pedal distortion legendaris yang digunakan banyak gitaris pro. Kontrol Level, Tone, Dist.', 850000.00, 20, 400, 6, '/uploads/products/boss-ds1.jpg', NOW(), NOW()),
('Ibanez Tube Screamer TS9', 'Pedal overdrive klasik untuk boost dan warm overdrive. Standar industri untuk blues dan rock.', 1500000.00, 15, 400, 6, '/uploads/products/ibanez-ts9.jpg', NOW(), NOW()),
('Boss CH-1 Super Chorus', 'Pedal chorus dengan suara jernih dan shimmer. Cocok untuk clean tone dan ballad.', 1200000.00, 12, 400, 6, '/uploads/products/boss-ch1-chorus.jpg', NOW(), NOW()),
('TC Electronic Flashback 2 Delay', 'Pedal delay dengan berbagai tipe delay, looper, dan MASH footswitch.', 2200000.00, 10, 450, 6, '/uploads/products/tc-flashback2.jpg', NOW(), NOW()),
('Electro-Harmonix Big Muff Pi', 'Pedal fuzz/distortion ikonik dengan sustain panjang. Digunakan oleh banyak gitaris legendaris.', 1400000.00, 14, 500, 6, '/uploads/products/ehx-bigmuff.jpg', NOW(), NOW()),
('Boss ME-80 Multi-Effects', 'Multi efek gitar dengan kontrol knob langsung tanpa menu. 8 efek simultan, amp modeling, looper.', 4500000.00, 8, 2900, 6, '/uploads/products/boss-me80.jpg', NOW(), NOW()),
('Line 6 HX Stomp', 'Multi efek compact dengan HX amp dan efek modeling. 6 efek simultan, impulse response loader.', 9500000.00, 6, 900, 6, '/uploads/products/line6-hx-stomp.jpg', NOW(), NOW());

-- =============================================
-- SELESAI! Total: 6 Kategori, 38 Produk
-- =============================================
