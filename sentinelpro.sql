-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.11.7-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for sentinelpro
DROP DATABASE IF EXISTS `sentinelpro`;
CREATE DATABASE IF NOT EXISTS `sentinelpro` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `sentinelpro`;

-- Dumping structure for table sentinelpro.departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table sentinelpro.departments: ~9 rows (approximately)
DELETE FROM `departments`;
INSERT INTO `departments` (`id`, `name`) VALUES
	(2, 'Accounting'),
	(3, 'Engineering'),
	(7, 'Executive'),
	(4, 'Human Resources'),
	(1, 'IT'),
	(9, 'Legal'),
	(8, 'Maintenance'),
	(6, 'Marketing'),
	(5, 'Sales');

-- Dumping structure for table sentinelpro.kiosk_tokens
DROP TABLE IF EXISTS `kiosk_tokens`;
CREATE TABLE IF NOT EXISTS `kiosk_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table sentinelpro.kiosk_tokens: ~101 rows (approximately)
DELETE FROM `kiosk_tokens`;
INSERT INTO `kiosk_tokens` (`id`, `token`, `created_at`, `expires_at`) VALUES
	(1, 'b8309ff4dd12ae235eb12864046768e7', '2026-02-02 15:19:56', '2026-02-02 20:49:56'),
	(2, '2af8ce22dd309d4b1cee7e3087a7bf81', '2026-02-02 15:21:28', '2026-02-02 20:51:28'),
	(3, '8c0b834f905818f80b862535fd49e747', '2026-02-02 15:27:20', '2026-02-02 20:57:20'),
	(4, '7281173beabfd60307f5ff1a3134e1be', '2026-02-02 15:37:21', '2026-02-02 21:07:21'),
	(5, '50b30d4a78e5ec6b7cd8ddf17de63539', '2026-02-02 16:08:42', '2026-02-02 21:38:42'),
	(6, '29c44dd5cb2d04bb3b8e6a16c77549b0', '2026-02-02 16:20:46', '2026-02-02 21:50:46'),
	(7, 'f390b7770520d4e9301ed5df57c0fd1a', '2026-02-02 17:03:27', '2026-02-02 22:33:27'),
	(8, 'f979665a81b4e5d763f364c5d3e747d2', '2026-02-02 17:06:59', '2026-02-02 22:36:59'),
	(9, 'a673cd0ed0b63cffe2c02ed6eee449e7', '2026-02-02 17:13:27', '2026-02-02 22:43:27'),
	(10, 'fc81bd1ed86b67faa66bee0870bd0f05', '2026-02-02 17:16:59', '2026-02-02 22:46:59'),
	(11, '7b7c261a944387c3f90db14dfb2551ae', '2026-02-02 17:27:00', '2026-02-02 22:57:00'),
	(12, 'aa9c57f74b68eb94570a18a7a2e4c7fb', '2026-02-02 17:37:00', '2026-02-02 23:07:00'),
	(13, '99025ce3fbd2e1d074887450660c4050', '2026-02-02 17:47:00', '2026-02-02 23:17:00'),
	(14, '95e3c689d591f81a27368a1fc3081e64', '2026-02-02 17:57:00', '2026-02-02 23:27:00'),
	(15, '42c388bf9cb0fae229f163a1ee416e05', '2026-02-02 18:07:00', '2026-02-02 23:37:00'),
	(16, '503ac40288498d54e46335c2e8849f6e', '2026-02-02 18:17:00', '2026-02-02 23:47:00'),
	(17, 'a7cc6df12871e878ae0544a2710ca377', '2026-02-02 18:27:01', '2026-02-02 23:57:01'),
	(18, '8f6f95334272d9edb26c6804b05e9a71', '2026-02-02 18:37:01', '2026-02-03 00:07:01'),
	(19, '244aeed557d4c2ac1c6d7f5b6700ae37', '2026-02-02 18:47:01', '2026-02-03 00:17:01'),
	(20, '2da6f3b0c6b77a29ce06ee735aef194d', '2026-02-02 18:57:01', '2026-02-03 00:27:01'),
	(21, '14b683694bf88af6c16ec96a8d546eee', '2026-02-02 19:07:01', '2026-02-03 00:37:01'),
	(22, '84ec9a258aff7f6c347928a7d8e03f01', '2026-02-02 19:17:01', '2026-02-03 00:47:01'),
	(23, 'b9f907916f174a2f174c414a40cc2f16', '2026-02-02 19:27:02', '2026-02-03 00:57:02'),
	(24, '9528377358a25e2e3578e09728d48fd4', '2026-02-02 19:37:02', '2026-02-03 01:07:02'),
	(25, '4141a904b5ae21355b7bb21bd4af1cb3', '2026-02-02 19:47:02', '2026-02-03 01:17:02'),
	(26, '376cd021856866e3a26be98693fce1de', '2026-02-02 19:57:02', '2026-02-03 01:27:02'),
	(27, 'cf6750667045bb87d191aa9bb8f82299', '2026-02-02 20:06:56', '2026-02-03 01:36:56'),
	(28, '92e1ca8f1f5c927ff608d3bd77c8d9ec', '2026-02-02 20:16:56', '2026-02-03 01:46:56'),
	(29, 'e2d33ab6fb4852dfc18ba020d7a3a2a6', '2026-02-02 20:26:56', '2026-02-03 01:56:56'),
	(30, '317aaf8d616bd5da6192949a708ccc64', '2026-02-02 20:36:57', '2026-02-03 02:06:57'),
	(31, 'ca2a5d709a4445e82614627de6474022', '2026-02-02 20:46:57', '2026-02-03 02:16:57'),
	(32, '7a068f309f17c8aad957b5d909527c92', '2026-02-02 20:56:57', '2026-02-03 02:26:57'),
	(33, '96fb5d2a205159749d4e1b38f157ba80', '2026-02-02 21:06:57', '2026-02-03 02:36:57'),
	(34, 'd69c9bc90ac55d315d8fdeebe9a71c5f', '2026-02-02 21:16:57', '2026-02-03 02:46:57'),
	(35, 'b45ad4d20d04c575ea528ba1d1acbe0f', '2026-02-02 21:30:04', '2026-02-03 03:00:04'),
	(36, '0ff74e1acc8bed5fc98a4ae1f2a90500', '2026-02-02 21:40:04', '2026-02-03 03:10:04'),
	(37, '2eda9ca199f099e1249304f91b1c5b4d', '2026-02-02 21:50:04', '2026-02-03 03:20:04'),
	(38, '00ea3a9dc19656de19af33ec3f6dbc74', '2026-02-02 22:00:04', '2026-02-03 03:30:04'),
	(39, 'fbe1712f2164b68227e872323f99b551', '2026-02-02 22:10:04', '2026-02-03 03:40:04'),
	(40, '9a95eda3056c9b273011f2c1e0c243b5', '2026-02-02 22:20:05', '2026-02-03 03:50:05'),
	(41, 'd02ae5aca0e20ce0856a27adbe87ed8d', '2026-02-02 22:30:05', '2026-02-03 04:00:05'),
	(42, '5a51212c752770ae4d1185b6215acd58', '2026-02-02 22:40:13', '2026-02-03 04:10:13'),
	(43, 'f6036e94950185d901f2a162526c5b6c', '2026-02-02 22:50:13', '2026-02-03 04:20:13'),
	(44, '9db8b0f6bf30aa54762998915c5a7e60', '2026-02-02 23:00:13', '2026-02-03 04:30:13'),
	(45, 'ae875e2f3eb20b0276753bf6e46dc6c8', '2026-02-02 23:10:14', '2026-02-03 04:40:14'),
	(46, '5a490278f42edddef1d243babad04f90', '2026-02-02 23:20:14', '2026-02-03 04:50:14'),
	(47, 'c1ade48f56cf34ab54a9cae68c714fd5', '2026-02-02 23:30:14', '2026-02-03 05:00:14'),
	(48, 'e8a5919f2b3c75268d6b8fa286bc9abe', '2026-02-02 23:40:14', '2026-02-03 05:10:14'),
	(49, '3ac1a98884feb79f9e6f25da3ace1a8d', '2026-02-02 23:50:15', '2026-02-03 05:20:15'),
	(50, 'fea03eeb6ef3cfb67ef6deaa2f289bfd', '2026-02-03 00:00:15', '2026-02-03 05:30:15'),
	(51, 'a07b3ee956f6888bbd015ed7508d2050', '2026-02-03 10:37:24', '2026-02-03 16:07:24'),
	(52, 'ed062a358e4d08fa31d01561e8a6f6ba', '2026-02-03 10:47:26', '2026-02-03 16:17:26'),
	(53, '9d6e48a268a129d0532aea23c727c655', '2026-02-03 10:57:26', '2026-02-03 16:27:26'),
	(54, '5789997afa83c38cc0f33d756ef93d34', '2026-02-03 11:07:26', '2026-02-03 16:37:26'),
	(55, '5b2144e987224e6d6f777a3f43dd5da6', '2026-02-03 11:17:26', '2026-02-03 16:47:26'),
	(56, '3e939939c8684204fa8de3b8b0612342', '2026-02-03 11:27:26', '2026-02-03 16:57:26'),
	(57, 'ce28cab3511feb21dae50e1e1b269101', '2026-02-03 11:37:27', '2026-02-03 17:07:27'),
	(58, '5eef669038577ba1080034cf1b4ba598', '2026-02-03 11:47:27', '2026-02-03 17:17:27'),
	(59, '7e4fd9c13007300cb38d3b9bd3eb4a65', '2026-02-03 11:57:27', '2026-02-03 17:27:27'),
	(60, '4f6dde26c16d3189b9718ba475a664ac', '2026-02-03 12:07:27', '2026-02-03 17:37:27'),
	(61, 'd4d82db6098d9410e74c4203f78d14a8', '2026-02-03 12:17:27', '2026-02-03 17:47:27'),
	(62, 'd23690ef71de641ea6c9fbff58301c7a', '2026-02-03 12:27:27', '2026-02-03 17:57:27'),
	(63, 'eb2affaa27955cefafc93bd0777727e6', '2026-02-03 12:37:28', '2026-02-03 18:07:28'),
	(64, '9de9729cebf8a7410185f6514b49a09c', '2026-02-03 12:47:28', '2026-02-03 18:17:28'),
	(65, '59a30a87545003cc0b490e875e0b6103', '2026-02-03 12:57:28', '2026-02-03 18:27:28'),
	(66, '1820af8295a9cbcee6320d8769d6baf1', '2026-02-03 13:07:28', '2026-02-03 18:37:28'),
	(67, '556d2a4d409d448615bd51b4cd925a73', '2026-02-03 13:17:28', '2026-02-03 18:47:28'),
	(68, '43f79a12f657d68d7be80773db622c9f', '2026-02-03 13:27:29', '2026-02-03 18:57:29'),
	(69, '73d1f5c6965aee32124fe039d5c9cad7', '2026-02-03 13:37:29', '2026-02-03 19:07:29'),
	(70, '7bf12b68052d753536f9fd1f57a61b19', '2026-02-03 17:17:36', '2026-02-03 22:47:36'),
	(71, 'baf684f6398bee2e7bf91c6abbbe1122', '2026-02-03 17:27:36', '2026-02-03 22:57:36'),
	(72, '7c3af41a6e64c0c546240b38481a59b3', '2026-02-03 17:37:36', '2026-02-03 23:07:36'),
	(73, '50a2edbd9ab8420be75c76f1313dd96c', '2026-02-03 17:47:37', '2026-02-03 23:17:37'),
	(74, 'c1356e4899c2b9208d1a5dd2d151507a', '2026-02-03 17:57:37', '2026-02-03 23:27:37'),
	(75, '4b9df8acedb47b7688fbe7bc572e21bd', '2026-02-03 18:07:37', '2026-02-03 23:37:37'),
	(76, '63d3abe8bd2925734677ecffb157292f', '2026-02-03 18:17:37', '2026-02-03 23:47:37'),
	(77, '5558a2919a8ced62b4bef469c9a2f847', '2026-02-03 18:27:38', '2026-02-03 23:57:38'),
	(78, 'e71e0d11957c32363b83f3472816a837', '2026-02-03 18:58:54', '2026-02-04 00:28:54'),
	(79, 'ac141b7f7f46c948f2337048ff2ac89d', '2026-02-03 19:08:54', '2026-02-04 00:38:54'),
	(80, '0caf519a36460e599483d88fac24bb57', '2026-02-03 19:18:55', '2026-02-04 00:48:55'),
	(81, 'bd29064c4058b96e6aa749bb1f092b80', '2026-02-03 19:28:55', '2026-02-04 00:58:55'),
	(82, 'e24dffd6b01edcd45f76f9698f3d5b28', '2026-02-03 19:38:55', '2026-02-04 01:08:55'),
	(83, 'a80cb2302a890ca7fa012edb6a6a0eb1', '2026-02-03 19:48:55', '2026-02-04 01:18:55'),
	(84, '472b088c7bcb7fe18da319ae380814cd', '2026-02-03 19:58:55', '2026-02-04 01:28:55'),
	(85, '2b40f509eb25a54385696a7d9111b297', '2026-02-03 20:08:55', '2026-02-04 01:38:55'),
	(86, '16d973cf87a4294d9bde9979890dc29e', '2026-02-03 20:22:19', '2026-02-04 01:52:19'),
	(87, 'b455e801e8670d865372f3211844d484', '2026-02-03 21:41:37', '2026-02-04 03:11:37'),
	(88, '3c6ba16c08e2730b1859551ac697d475', '2026-02-03 21:51:37', '2026-02-04 03:21:37'),
	(89, '6960d4c1ef66c04d162b52f15e9a8798', '2026-02-03 22:12:57', '2026-02-04 03:42:57'),
	(90, 'cc5eec305e8365a3da89803dbee34234', '2026-02-04 10:45:23', '2026-02-04 16:15:23'),
	(91, 'a91bfae8ab67883ffc7d2d790c3db683', '2026-02-04 10:55:25', '2026-02-04 16:25:25'),
	(92, 'bb6185ffd622375d299a754f5276c528', '2026-02-04 11:05:25', '2026-02-04 16:35:25'),
	(93, 'ddca384751ec7d37e91ad9a671b15c6d', '2026-02-04 11:15:25', '2026-02-04 16:45:25'),
	(94, '5e8cf159574c5ebfc19330389226d75c', '2026-02-04 11:25:26', '2026-02-04 16:55:26'),
	(95, '2d69221e0e6cbc1311cb6cdc12f80524', '2026-02-04 11:35:26', '2026-02-04 17:05:26'),
	(96, '783091e5669ac2e4e41494d1a2d65cfb', '2026-02-04 11:45:26', '2026-02-04 17:15:26'),
	(97, 'f5d8eed9acca7db4a509e18cd8fd74c1', '2026-02-04 11:55:26', '2026-02-04 17:25:26'),
	(98, '2e9492b643877f8485285491ee5eddff', '2026-02-04 12:05:27', '2026-02-04 17:35:27'),
	(99, 'ebf78bb70defbc65044da3d6163751ed', '2026-02-04 12:15:27', '2026-02-04 17:45:27'),
	(100, '78c67231d5dfb41c6641a0acfe3520e4', '2026-02-04 12:25:27', '2026-02-04 17:55:27'),
	(101, '527aa29f537434f446146dd057952b23', '2026-02-04 12:35:27', '2026-02-04 18:05:27');

-- Dumping structure for table sentinelpro.settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table sentinelpro.settings: ~7 rows (approximately)
DELETE FROM `settings`;
INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
	(1, 'smtp_host', '', '2026-02-02 15:47:49'),
	(2, 'smtp_port', '', '2026-02-02 15:47:49'),
	(3, 'smtp_user', '', '2026-02-02 15:47:49'),
	(4, 'smtp_pass', '', '2026-02-02 15:47:49'),
	(5, 'sendgrid_api_key', '', '2026-02-02 15:47:49'),
	(6, 'mail_provider', '', '2026-02-02 15:47:49'),
	(7, 'gemini_api_key', 'AIzaSyDahfYatxkYgSxs9H3psc8GCRANdywVPQg', '2026-02-02 15:47:49');

-- Dumping structure for table sentinelpro.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` enum('Admin','Staff') DEFAULT 'Admin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table sentinelpro.users: ~1 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`) VALUES
	(1, 'admin@sentinelpro.com', '$2y$10$wPpm4B4s9LL/T219dti/3OmaW5f9QlIGV21YrauJiOQdVt/Mo38hm', 'admin@sentinelpro.com', 'Admin', '2026-02-02 03:51:29');

-- Dumping structure for table sentinelpro.visitors
DROP TABLE IF EXISTS `visitors`;
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `id_number` text DEFAULT NULL,
  `vehicle_plate` varchar(50) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive','Scheduled') DEFAULT 'Active',
  `checkin_time` timestamp NULL DEFAULT current_timestamp(),
  `checkout_time` timestamp NULL DEFAULT NULL,
  `visitor_type` varchar(50) DEFAULT 'Visitor',
  `department` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `qr_token` varchar(100) DEFAULT NULL,
  `host_email` varchar(150) DEFAULT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `visit_reason` varchar(100) DEFAULT NULL,
  `visit_reason_other` varchar(255) DEFAULT NULL,
  `signature_data` longtext DEFAULT NULL,
  `nda_accepted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table sentinelpro.visitors: ~51 rows (approximately)
DELETE FROM `visitors`;
INSERT INTO `visitors` (`id`, `first_name`, `last_name`, `email`, `country`, `id_number`, `vehicle_plate`, `photo_path`, `status`, `checkin_time`, `checkout_time`, `visitor_type`, `department`, `floor`, `qr_token`, `host_email`, `scheduled_time`, `visit_reason`, `visit_reason_other`, `signature_data`, `nda_accepted`) VALUES
	(1, 'Robert', 'Hernandez', 'robert.hernandez@example.com', NULL, 'VFcyek4vWXhzdXE5dGQvSUhMZWpwdz09Ojq9TeKjyJTc+FczE5/2i2kz', NULL, NULL, 'Inactive', '2026-01-26 16:16:00', NULL, 'Visitor', 'Executive', '2', 'd95a1a60c3f43e567ca5de72f916568d', 'leads@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(2, 'Jessica', 'Brown', 'jessica.brown@example.com', NULL, 'USs0K1dOYkFSbTlpTXUxR2NTR1dTUT09Ojr28DzFjmvayQg0+eug5ybz', NULL, NULL, 'Inactive', '2026-01-26 20:42:00', NULL, 'Visitor', 'Executive', '3', '416b2c1c495255e028099a9e2cd7a428', 'hr@sentinelpro.com', NULL, 'Interview', NULL, NULL, 0),
	(3, 'William', 'Johnson', 'william.johnson@example.com', NULL, 'cU0wbjBDa0RjNnV0alZKYm1JZjJLQT09OjrtfKJge1t1AA1skqr+ovev', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Legal', '8', 'b1c2c92ba401cafb402819fa4b2e32b2', 'leads@sentinelpro.com', '2026-02-06 09:48:00', 'Maintenance', NULL, NULL, 0),
	(4, 'Barbara', 'Jones', 'barbara.jones@example.com', NULL, 'Q2pwWmV5YXArdWRIK3FsTDJYc2pVZz09Ojq4dDN0UnoEMLmG2J6bhggw', NULL, NULL, 'Inactive', '2026-01-26 14:56:00', NULL, 'Visitor', 'Executive', '8', '86f02587f7edaaf8fc2a8fd614494ff1', 'manager@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(5, 'Jessica', 'Martinez', 'jessica.martinez@example.com', NULL, 'RlRmUUgyV3A5WGRhWFhPQkVVOGFNUT09Ojr9akHujbQozyZwi10nvzDG', NULL, NULL, 'Inactive', '2026-01-27 21:12:00', NULL, 'Visitor', 'Executive', '10', 'f09b0410bdfd242d1768c194d414b27c', 'leads@sentinelpro.com', NULL, 'Interview', NULL, NULL, 0),
	(6, 'Patricia', 'Martinez', 'patricia.martinez@example.com', NULL, 'OWFQdlQ2alR6ZGhISzQwU21ZZVMxZz09OjrjNDYvAWNd5eGRv6mYwSc6', NULL, NULL, 'Inactive', '2026-01-26 21:28:00', NULL, 'Visitor', 'Marketing', '7', '1962a0caf411d3135a99ecb1d9f7365f', 'manager@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(7, 'Susan', 'Gonzalez', 'susan.gonzalez@example.com', NULL, 'RzZRK3gwcW5JNDVhUFcxVHNRazNjUT09Ojp6aFqKGXvl7v/DcduyVlg/', NULL, NULL, 'Active', '2026-01-29 18:48:00', NULL, 'Visitor', 'Legal', '8', 'ab56868c83478e421e6ba46a67565001', 'manager@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(8, 'Robert', 'Davis', 'robert.davis@example.com', NULL, 'NkdBTnVFRHpQWkxBM0pkSDArQWRYUT09OjqqiRcCc5zoYh3odPjCGbuN', NULL, NULL, 'Inactive', '2026-01-26 12:38:00', NULL, 'Visitor', 'Engineering', '7', '0abc7789eeb5b03a2ceb65c5d15f49d7', 'admin@sentinelpro.com', NULL, 'Interview', NULL, NULL, 0),
	(9, 'John', 'Garcia', 'john.garcia@example.com', NULL, 'aEdNNHBTTVpPanBVNWUzMTZFSkpxdz09OjqSGQjcX++BoVhjb2d7V2iC', NULL, NULL, 'Inactive', '2026-02-01 14:48:00', NULL, 'Visitor', 'Marketing', '7', 'cc4d1b35bb34b7e9d87c435cff48f838', 'leads@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(10, 'Mary', 'Lopez', 'mary.lopez@example.com', NULL, 'VVR1NXVzTFdTWlN1YmVoN0NKQmFYUT09Ojo8jKNusKQK/KDBsZyKYmw8', NULL, NULL, 'Active', '2026-01-29 13:51:00', NULL, 'Visitor', 'Legal', '12', '09833d8b248d2265ca62d63ab19cea48', 'hr@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(11, 'James', 'Jones', 'james.jones@example.com', NULL, 'bzhUU2FUbXh2QnBROWd2N0NuQnNqdz09Ojpm45DcIdia5P1WsISAu5KL', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Marketing', '2', 'd502960fcbb3b5f4abb6626448c6f4bd', 'manager@sentinelpro.com', '2026-02-06 11:56:00', 'Maintenance', NULL, NULL, 0),
	(12, 'William', 'Davis', 'william.davis@example.com', NULL, 'dWt0aHdMMW1MYjE5TzNiRUpkakNCUT09OjqyvbA5CtU4gW6+4LKRcTY8', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Human Resources', '9', '1411c69b0c237de4d12550eb87ce9f7a', 'admin@sentinelpro.com', '2026-02-03 14:41:00', 'Courier', NULL, NULL, 0),
	(13, 'Joseph', 'Wilson', 'joseph.wilson@example.com', NULL, 'RXQ4aHBCTmNEWVp6WHBrajdKN0p4dz09Ojraf6JhP2IPjy63yZhkuTI9', NULL, NULL, 'Active', '2026-01-27 12:03:00', NULL, 'Visitor', 'Human Resources', '11', 'aa628c78048dc945333cf4ba5f88fde2', 'manager@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(14, 'David', 'Davis', 'david.davis@example.com', NULL, 'ZUhicG9tNWkwQi9DMlYwVlFzRldsUT09Ojq0CJwz/IvI4+HgxWOnAKfx', NULL, NULL, 'Inactive', '2026-01-28 13:00:00', NULL, 'Visitor', 'Human Resources', '9', '13d11c86e13e5a678b6316bb6d702af0', 'admin@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(15, 'Richard', 'Smith', 'richard.smith@example.com', NULL, 'Z2tSNGxNQ2ZuZXVNOUwxNUZOenlnUT09OjpAb2W4FHvvXyCjVGqX4oKr', NULL, NULL, 'Inactive', '2026-02-02 12:41:00', NULL, 'Visitor', 'Executive', '2', 'd8717ab26bf044ebd53e2f63e5d4e85b', 'manager@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(16, 'Barbara', 'Jones', 'barbara.jones@example.com', NULL, 'UlBYT1B6QzUxM3l1MkhoYXlJY0QyZz09OjplCJDv2h6FB6UXb7Lk4UMQ', NULL, NULL, 'Active', '2026-02-02 21:04:00', NULL, 'Visitor', 'Maintenance', '12', '4f5079a2c09fcff503baec20d7e31991', 'manager@sentinelpro.com', NULL, 'Meeting', NULL, NULL, 0),
	(17, 'Richard', 'Garcia', 'richard.garcia@example.com', NULL, 'amloalBnaWVPWEhqR0t5UVNtVlhQZz09OjpRS0SG570L1xdBuwa1XmUb', NULL, NULL, 'Inactive', '2026-01-29 16:07:00', NULL, 'Visitor', 'Legal', '2', '7f4b8c23cd7a4f6e9c0f3591feed384b', 'leads@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(18, 'Barbara', 'Davis', 'barbara.davis@example.com', NULL, 'aExKZmRYOW13NVhKWkcvZndWeVpCUT09OjoAdxE6K4dgU/7iaPvdSXci', NULL, NULL, 'Inactive', '2026-01-26 21:03:00', NULL, 'Visitor', 'Executive', '7', '9c57a4471f27a718c37d8846c7de165c', 'hr@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(19, 'James', 'Brown', 'james.brown@example.com', NULL, 'ZEltZGw5M1V3T1BuenhnbU1McjFVdz09OjqGOtQetlesZiUrCfvcr1cl', NULL, NULL, 'Inactive', '2026-01-29 15:54:00', NULL, 'Visitor', 'Human Resources', '12', 'db647e4525d828a7ba5e2007fc188e36', 'manager@sentinelpro.com', NULL, 'Meeting', NULL, NULL, 0),
	(20, 'Susan', 'Anderson', 'susan.anderson@example.com', NULL, 'cHdwY093Vzcrd0djU3dmR0ZJRGFaQT09OjpfynkCUrBtdc4Ae8DCOcFZ', NULL, NULL, 'Inactive', '2026-02-02 13:09:00', NULL, 'Visitor', 'Marketing', '10', '7292169d181488b319acd9fa2a675645', 'manager@sentinelpro.com', NULL, 'Meeting', NULL, NULL, 0),
	(21, 'Richard', 'Martinez', 'richard.martinez@example.com', NULL, 'RFJ2R3MwbUM2Z2RYMkR6K0F2eE5tQT09Ojot6NDNgMXx8eayZ322+kZo', NULL, NULL, 'Active', '2026-01-26 13:56:00', NULL, 'Visitor', 'Marketing', '12', '6071a54af3b655628086753361f665e2', 'admin@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(22, 'James', 'Williams', 'james.williams@example.com', NULL, 'anVkSDdNSlo3SWxTaktQbUNVdG5wQT09OjpH+8p21suCObA1DYVi0mLD', NULL, NULL, 'Inactive', '2026-01-28 17:20:00', NULL, 'Visitor', 'Maintenance', '11', 'b0f408769c21f181741960216436783b', 'leads@sentinelpro.com', NULL, 'Interview', NULL, NULL, 0),
	(23, 'Mary', 'Williams', 'mary.williams@example.com', NULL, 'dXBRc3dyaGJ2R0RNSkNBT250eG5yUT09OjoXAuVodYR+aZg+bXKMgV3a', NULL, NULL, 'Active', '2026-01-27 19:58:00', NULL, 'Visitor', 'Legal', '5', '52a76d129569c4b2bcf33fc69f8842f0', 'manager@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(24, 'Richard', 'Hernandez', 'richard.hernandez@example.com', NULL, 'Q0ZCRERUMVpOeUFjWklDSWNrNzJwdz09Ojr9MW8T1/eygkcbycs8RsHW', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Engineering', '1', '122a4731565851aeef1d9a18587e6abf', 'admin@sentinelpro.com', '2026-02-03 16:40:00', 'Sales Pitch', NULL, NULL, 0),
	(25, 'Patricia', 'Martinez', 'patricia.martinez@example.com', NULL, 'T09Ia3grbHJqT1ptYzhkWk13eDVJQT09OjoYAdLGPzUoFSGFCwCY8UFe', NULL, NULL, 'Inactive', '2026-01-30 15:47:00', NULL, 'Visitor', 'Engineering', '4', '64ab25761e5cc59cccad7b8dd6f9086d', 'hr@sentinelpro.com', NULL, 'Meeting', NULL, NULL, 0),
	(26, 'Michael', 'Lopez', 'michael.lopez@example.com', NULL, 'N1U5T2lRUGxET3dQOFdvaGE5ZDY0dz09OjqOoxaEjC2UmZ1C9l6y6Vuq', NULL, NULL, 'Active', '2026-01-30 15:32:00', NULL, 'Visitor', 'Maintenance', '12', 'c50f5ec79e75ed1d033b65c14e1aa5fb', 'admin@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(27, 'Linda', 'Williams', 'linda.williams@example.com', NULL, 'aXFvTVduWUo4TkxzTFQvOTdVVm01UT09OjoFV+acD7QInBtf9QXj24gP', NULL, NULL, 'Active', '2026-01-28 21:28:00', NULL, 'Visitor', 'Legal', '11', 'e171c3713202a36d5c05ee6d06d04d50', 'admin@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(28, 'Richard', 'Thomas', 'richard.thomas@example.com', NULL, 'YktLUHlOaTJyb0U1MWlaQjZVZDlCdz09Ojpfl/cw/1BBEjUHBOpr7Tth', NULL, NULL, 'Active', '2026-02-02 19:10:00', NULL, 'Visitor', 'Executive', '6', 'cbc19a5341393ae464bb30e77f21843c', 'leads@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(29, 'Richard', 'Lopez', 'richard.lopez@example.com', NULL, 'M2hpSkRJZHVQNUwwczZQdk90eUNiUT09OjqrFj4LpBa4B2W0yHNxPyVn', NULL, NULL, 'Inactive', '2026-01-30 17:39:00', NULL, 'Visitor', 'Human Resources', '4', 'd22d75aace2fdbffa01ab643155495d8', 'hr@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(30, 'Barbara', 'Rodriguez', 'barbara.rodriguez@example.com', NULL, 'ckVLTkZPN0RGbC9uT1VUUGZKSlNZQT09Ojo5L9WkYEXfaVRWS4Xx0XeW', NULL, NULL, 'Inactive', '2026-01-26 15:15:00', NULL, 'Visitor', 'Sales', '12', 'db7075fee8385c314f5a00a974849a03', 'leads@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(31, 'James', 'Lopez', 'james.lopez@example.com', NULL, 'RndybmRyWFVhYVhSNHhpakRWK2lQZz09OjoxBowIFnXo13VFOMd4KBNw', NULL, NULL, 'Inactive', '2026-01-28 21:03:00', NULL, 'Visitor', 'Human Resources', '1', 'aa51d8684cd6b410afa9d4fa7240990f', 'manager@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(32, 'Joseph', 'Brown', 'joseph.brown@example.com', NULL, 'V05VOWd3aXNPSW54eWFzNlYyV3pxUT09OjqEanQ6ZBNYC0oLF4DkStJk', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Legal', '10', 'f8a69da0c07fa0d65fde63395b409a94', 'leads@sentinelpro.com', '2026-02-04 13:53:00', 'Meeting', NULL, NULL, 0),
	(33, 'Susan', 'Miller', 'susan.miller@example.com', NULL, 'WXphQjRJaHZRTm90L3V0bE1LcmNJQT09OjrxPGvukIkI1vfwd8rXiewP', NULL, NULL, 'Active', '2026-02-02 17:03:00', NULL, 'Visitor', 'Legal', '12', '2a9041dc50b10dd9ac559c84ead1776e', 'manager@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(34, 'Michael', 'Miller', 'michael.miller@example.com', NULL, 'U2RJRHNnT0ZvNVBtMnhsQWtoK2hDZz09Ojq8IKtUjSvlxdNbRLb5YQb5', NULL, NULL, 'Active', '2026-01-28 20:23:00', NULL, 'Visitor', 'Legal', '1', 'fbd2a63959376ede4109d26e19029628', 'hr@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(35, 'Susan', 'Smith', 'susan.smith@example.com', NULL, 'eTYrOUdvakRnWS9FOVE1cC9WRmVUdz09OjoDlguK70Awo7c5G0Gbdks0', NULL, NULL, 'Active', '2026-01-29 13:21:00', NULL, 'Visitor', 'Human Resources', '12', '562632d1e770e337e370ed8cb377e8fa', 'manager@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(36, 'Richard', 'Martinez', 'richard.martinez@example.com', NULL, 'YnByRFpJaGlEYUxHWjRIS0c2ZldWQT09Ojrh3dRB5yxN44uwIBbynriI', NULL, NULL, 'Inactive', '2026-01-28 21:31:00', NULL, 'Visitor', 'Sales', '11', '716f4cc3c03f7141a045d8a5595b3ce6', 'leads@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(37, 'Barbara', 'Garcia', 'barbara.garcia@example.com', NULL, 'K1VMWndWc0NNK205ZVhBNTBucTkzdz09OjpKbYD7FaTH1Ay0TFTeGAQL', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Marketing', '11', '511affc45cb77a2a4549ba95dc2e6f2f', 'admin@sentinelpro.com', '2026-02-03 14:30:00', 'Sales Pitch', NULL, NULL, 0),
	(38, 'Mary', 'Johnson', 'mary.johnson@example.com', NULL, 'Smc5QlJlR0RaYU5rZW8zeWo3a0FqZz09Ojq0iCTHOMMzYOjF6SC+YLJS', NULL, NULL, 'Inactive', '2026-01-30 18:08:00', NULL, 'Visitor', 'Engineering', '3', 'f3d65ac3f664f7d9cc40f5abc8a59061', 'hr@sentinelpro.com', NULL, 'Meeting', NULL, NULL, 0),
	(39, 'Patricia', 'Anderson', 'patricia.anderson@example.com', NULL, 'QWozampTVjJLVFNzWjhKRXh2OWkvZz09OjoZC+08Cnpqyeo1ExXalkvd', NULL, NULL, 'Inactive', '2026-01-31 16:31:00', NULL, 'Visitor', 'Legal', '1', 'b9435ded9c3b7516acc483f0322e5b68', 'hr@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(40, 'Richard', 'Smith', 'richard.smith@example.com', NULL, 'Y3BpMFJsUzNPNEQ3N21yV0lYV0RVUT09OjqgXtXDA6KOoEqssjSrEq/V', NULL, NULL, 'Inactive', '2026-01-31 12:21:00', NULL, 'Visitor', 'Executive', '4', '8deee36ae12cd03e4f5d5b5bb5d0ca0d', 'manager@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(41, 'Patricia', 'Thomas', 'patricia.thomas@example.com', NULL, 'TDNUR3lJaXRSS2FUUUZVYmFZalFwUT09OjrcnRz3UTNDsOsHs3zjSU/2', NULL, NULL, 'Inactive', '2026-01-27 14:19:00', NULL, 'Visitor', 'Human Resources', '5', '3023c82c6082a9cf05388c066c9cca5b', 'leads@sentinelpro.com', NULL, 'Delivery', NULL, NULL, 0),
	(42, 'Barbara', 'Martinez', 'barbara.martinez@example.com', NULL, 'OEJFUXpYS0tZWXZ1d3dDR1Y5aTlvZz09Ojp843D82+bEqe6UnA66pey5', NULL, NULL, 'Active', '2026-02-01 13:57:00', NULL, 'Visitor', 'Marketing', '3', '352e63a4c0a7828798a017aedd0755aa', 'admin@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(43, 'David', 'Brown', 'david.brown@example.com', NULL, 'L21kVFpoUFFFcGlDV3NLUi9FZUhDQT09OjqVVN30iK5Z57poGpOANqEn', NULL, NULL, 'Inactive', '2026-01-31 21:12:00', NULL, 'Visitor', 'Maintenance', '6', 'fe8b542a85b329ab344201c550acb3c6', 'admin@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(44, 'Michael', 'Hernandez', 'michael.hernandez@example.com', NULL, 'OUU2aFcxMzRoSHFERUZCS0QxOEUwZz09OjpPyGxaEUxU0aFtyA/etp3l', NULL, NULL, 'Inactive', '2026-01-29 16:41:00', NULL, 'Visitor', 'Marketing', '6', 'b78e063331056f001dca3f8350a65155', 'manager@sentinelpro.com', NULL, 'Maintenance', NULL, NULL, 0),
	(45, 'Richard', 'Anderson', 'richard.anderson@example.com', NULL, 'bFJxY1pPVm45TWNGaEJ5a2Y4VkdHdz09Ojoh9rErGC6Xqb+A4XBC/8c8', NULL, NULL, 'Inactive', '2026-01-29 12:09:00', NULL, 'Visitor', 'Maintenance', '3', '5c1d16c78968b3dfa02a59b8b0aab3a3', 'hr@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(46, 'David', 'Davis', 'david.davis@example.com', NULL, 'Q25zdlY0bHBlVG5pY0ZjaFpVQW80dz09OjocHgC2nEYFwZeTqytcwpCB', NULL, NULL, 'Inactive', '2026-01-30 17:18:00', NULL, 'Visitor', 'Maintenance', '9', '1cdd81933f16461c60df4bf9df14e02c', 'admin@sentinelpro.com', NULL, 'Courier', NULL, NULL, 0),
	(47, 'Robert', 'Johnson', 'robert.johnson@example.com', NULL, 'UVJ6dW5NanhSY042ajRzenVKYnpUZz09OjpJRzS46QwrdzUdLdK7Oui/', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Sales', '5', '5ab64025e9a9e0287ddf760e10033f21', 'hr@sentinelpro.com', '2026-02-05 15:12:00', 'Interview', NULL, NULL, 0),
	(48, 'Patricia', 'Miller', 'patricia.miller@example.com', NULL, 'M1dWR3k0dEo3SlZWdHdtbkY5RkZadz09OjoeuosQiXahlpy/qufUex7M', NULL, NULL, 'Active', '2026-01-28 20:02:00', NULL, 'Visitor', 'Executive', '6', 'c62ddca0fd1cf5c3cb05d7453985b4db', 'hr@sentinelpro.com', NULL, 'Sales Pitch', NULL, NULL, 0),
	(49, 'Robert', 'Thomas', 'robert.thomas@example.com', NULL, 'Ukx3YndMOUV4QnVZRFRJU0RQQzV5dz09Ojph3cDhbsJKJfo7c2PnPoHU', NULL, NULL, 'Active', '2026-01-31 19:08:00', NULL, 'Visitor', 'Legal', '9', 'd9594c266992b303b5dad7d212e54e7b', 'manager@sentinelpro.com', NULL, 'Interview', NULL, NULL, 0),
	(50, 'Jessica', 'Smith', 'jessica.smith@example.com', NULL, 'LytRNnpoRzd2UG9BOCtSWjRzMG5MZz09OjqEoTmTrU1340Y+fejRehe5', NULL, NULL, 'Scheduled', NULL, NULL, 'Visitor', 'Sales', '12', '8e0bff856afac2478413fd42df0258c2', 'manager@sentinelpro.com', '2026-02-03 13:41:00', 'Courier', NULL, NULL, 0),
	(51, 'Orin', 'Swanston', 'marcswanston@gmail.com', '', '', '', '', 'Active', '2026-02-02 17:48:23', NULL, 'Visitor', 'IT', '', '0816dd70ba06e95644d7ed3b039a931a', '', NULL, 'Meeting', '', 'data:image/png;base64,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', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
