-- ============================================================================
-- Low Coffe - Aplikasi Pemesanan Kopi dan Makanan dengan Dashboard Admin
-- Kelompok 5 - Konsep dan Pengembangan Aplikasi
-- Anggota Kelompok:
-- 1. 240705049 Annisa Sri Mentari
-- 2. 240705090 Syahri Ramadhan
-- 3. 240705103 Putroe Balqis
-- 4. 240705114 Latifah Annum HSB
-- 5. 240705128 Kaisar Nahara Akbar
-- 6. 240705166 Maulana Raju
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `lowcoffe_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lowcoffe_db`;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(25) NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Menu
CREATE TABLE IF NOT EXISTS `menu` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `in_stock` TINYINT(1) DEFAULT 1,
  `popular` TINYINT(1) DEFAULT 0,
  `rating` DECIMAL(3,1) DEFAULT 4.8,
  `sold_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` VARCHAR(50) NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(25) NULL,
  `order_type` ENUM('Dine-in', 'Takeaway') DEFAULT 'Dine-in',
  `table_number` VARCHAR(10) DEFAULT '-',
  `payment_method` VARCHAR(50) DEFAULT 'QRIS',
  `status` ENUM('Baru', 'Diproses', 'Selesai', 'Dibatalkan') DEFAULT 'Baru',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `tax` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Order Items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `menu_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `customization` JSON NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Favorites
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `menu_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_menu_fav` (`user_id`, `menu_id`),
  FOREIGN KEY (`menu_id`) REFERENCES `menu`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `shop_name` VARCHAR(100) NOT NULL DEFAULT 'Low Coffe',
  `tagline` VARCHAR(150) DEFAULT 'premium coffee for you',
  `is_open` TINYINT(1) DEFAULT 1,
  `open_hours` VARCHAR(50) DEFAULT '08:00 - 22:00',
  `address` VARCHAR(255) DEFAULT 'Jl. Teuku Umar No. 45, Banda Aceh',
  `phone` VARCHAR(25) DEFAULT '0811-9876-5432',
  `email` VARCHAR(100) DEFAULT 'kontak@lowcoffe.com',
  `tables_count` INT DEFAULT 20,
  `notification_sound` TINYINT(1) DEFAULT 1,
  `service_tax` DECIMAL(12,2) DEFAULT 2000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `avatar`) VALUES
('usr-1', 'Danesyya Qamrut', 'danesyya.q@email.com', '0812-3456-7890', 'user123', 'customer', '/assets/images/avatar-customer.jpg'),
('usr-2', 'Syahri Ramadhan', 'syahri.ramadhan@lowcoffe.com', '0811-9876-5432', 'admin123', 'admin', '/assets/images/avatar-admin.jpg')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
('kopi', 'Kopi', 'cup-straw'),
('non-kopi', 'Non-Kopi', 'glass-water'),
('makanan', 'Makanan', 'utensils'),
('snack', 'Snack', 'cookie')
ON DUPLICATE KEY UPDATE name=name;
