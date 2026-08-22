-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 22, 2026 at 02:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'admin',
  `phone` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `role`, `phone`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Restaurant Admin', 'programmer.emad7867@gmail.com', 'admin', '+8801712345678', NULL, '$2y$12$X6XKVvAAhLM0NQfkyd6jDOiF6LYawT73SkckYXwNYtPOh8VDb1Mee', 'tOuphBdxvGOUPTASjAipJqEmWtuk9mFy6m2z0Cbr9vhxUJZi50YqvF4jdmhd', '2026-08-16 14:36:31', '2026-08-21 21:12:15');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'brand_name', 'KUDOS', '2026-08-16 14:36:31', '2026-08-21 17:55:51'),
(2, 'brand_logo', '/uploads/branding/brand_logo_1787334951.png', '2026-08-16 14:36:31', '2026-08-21 17:55:51'),
(3, 'brand_icon', '/uploads/branding/brand_icon_1787334951.png', '2026-08-16 14:36:31', '2026-08-21 17:55:51'),
(4, 'tagline', 'Exquisite Culinary Excellence & Artisan Cuisine', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(5, 'about_text', 'Welcome to KUDOS. Founded in 2026, we take pride in serving farm-to-table artisan dishes, freshly prepared by master chefs using premium local ingredients.', '2026-08-16 14:36:31', '2026-08-21 23:02:18'),
(6, 'phone', '+8801712345678', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(7, 'email', 'contact@legourmetbistro.com', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(8, 'notification_email', 'programmer.emad7867@gmail.com', '2026-08-16 14:36:31', '2026-08-21 22:22:13'),
(9, 'address', '889 Midnight Ave, Suite B, Downtown District', '2026-08-16 14:36:31', '2026-08-21 17:53:20'),
(10, 'opening_hours', 'Saturday - Wednesday: 8:00 PM - 4:00 AM\r\nThursday - Friday (Peak Nights): 8:00 PM - 6:00 AM', '2026-08-16 14:36:31', '2026-08-21 17:55:51'),
(11, 'default_currency', '৳', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(12, 'tax_percentage', '5.0', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(13, 'low_stock_threshold_default', '5', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(14, 'google_maps_embed', '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.045610815777!2d90.4132!3d23.7915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzI5LjQiTiA5MMKwMjQnNDcuNSJF!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd\" width=\"100%\" height=\"300\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\"></iframe>', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(15, 'social_facebook', 'https://facebook.com', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(16, 'social_instagram', 'https://instagram.com', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(17, 'social_twitter', 'https://twitter.com', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(18, 'terms_conditions', '1. Prices include applicable government taxes unless specified otherwise. 2. Please notify staff of food allergies before ordering.', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(19, 'privacy_policy', 'We treat all customer billing and contact information with strict privacy and never share data with third parties.', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(20, 'footer_text', '© 2026 Le Gourmet Bistro. All Rights Reserved.', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(21, 'expiry_warning_threshold', '80', '2026-08-19 15:41:34', '2026-08-19 15:41:34'),
(22, 'week_start_day', 'saturday', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(23, 'enable_whatsapp', '1', '2026-08-21 17:53:20', '2026-08-21 18:04:50'),
(24, 'whatsapp_number', '+8801700000000', '2026-08-21 17:55:51', '2026-08-21 17:55:51'),
(25, 'header_white_logo', '1', '2026-08-21 23:53:26', '2026-08-21 23:59:24'),
(26, 'brand_logo_dark', '/uploads/branding/brand_logo_dark_1787356790.png', '2026-08-21 23:58:55', '2026-08-21 23:59:50');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','leave','half_day') NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `module` varchar(255) NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `module`, `ip_address`, `details`, `created_at`) VALUES
(1, 1, 'Restaurant Admin', 'Updated application settings and brand logo/icon assets', 'settings', '127.0.0.1', NULL, '2026-08-16 14:50:03'),
(2, 1, 'Restaurant Admin', 'Created sale invoice INV-20260816-9819 total: 65.63', 'sales', '127.0.0.1', NULL, '2026-08-16 15:12:09'),
(3, 1, 'Restaurant Admin', 'Updated menu item: Artisan Margherita Pizza', 'menu', '127.0.0.1', NULL, '2026-08-16 15:28:01'),
(4, 1, 'Restaurant Admin', 'Updated menu item: Double Cheeseburger', 'menu', '127.0.0.1', NULL, '2026-08-16 15:29:08'),
(5, 1, 'Restaurant Admin', 'Updated menu item: Double Espresso', 'menu', '127.0.0.1', NULL, '2026-08-16 15:29:47'),
(6, 1, 'Restaurant Admin', 'Updated menu item: Gourmet Chicken Burger', 'menu', '127.0.0.1', NULL, '2026-08-16 15:30:15'),
(7, 1, 'Restaurant Admin', 'Updated menu item: Double Espresso', 'menu', '127.0.0.1', NULL, '2026-08-16 15:30:37'),
(8, 1, 'Restaurant Admin', 'Updated menu item: Gourmet Chicken Burger', 'menu', '127.0.0.1', NULL, '2026-08-16 15:30:57'),
(9, 1, 'Restaurant Admin', 'Created sale invoice INV-20260816-0541 total: 787.5', 'sales', '127.0.0.1', NULL, '2026-08-16 15:35:07'),
(10, 1, 'Restaurant Admin', 'Updated inventory item: All-Purpose Flour', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:48:24'),
(11, 1, 'Restaurant Admin', 'Updated inventory item: Arabica Coffee Beans', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:48:37'),
(12, 1, 'Restaurant Admin', 'Updated inventory item: Chicken Breast', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:50:24'),
(13, 1, 'Restaurant Admin', 'Updated inventory item: Cooking Olive Oil', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:50:33'),
(14, 1, 'Restaurant Admin', 'Updated inventory item: Fresh Tomatoes', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:50:48'),
(15, 1, 'Restaurant Admin', 'Updated inventory item: Mozzarella Cheese', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:50:58'),
(16, 1, 'Restaurant Admin', 'Updated inventory item: Prime Ground Beef', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:51:05'),
(17, 1, 'Restaurant Admin', 'Updated inventory item: Takeaway Food Box', 'inventory', '127.0.0.1', NULL, '2026-08-17 11:51:17'),
(18, 1, 'Restaurant Admin', 'Created menu item: Test Pizza', 'menu', '127.0.0.1', NULL, '2026-08-17 12:14:27'),
(19, 1, 'Restaurant Admin', 'Updated menu item: Artisan Margherita Pizza', 'menu', '127.0.0.1', NULL, '2026-08-17 17:49:40'),
(20, 1, 'Restaurant Admin', 'Updated menu item: Artisan Margherita Pizza', 'menu', '127.0.0.1', NULL, '2026-08-17 17:49:49'),
(21, 1, 'Restaurant Admin', 'Generated salary for Maria Santos (2026-08) net pay: 600', 'employees', '127.0.0.1', NULL, '2026-08-17 18:04:10'),
(22, 1, 'Restaurant Admin', 'Updated employee profile: Maria Santos', 'employees', '127.0.0.1', NULL, '2026-08-17 18:11:37'),
(23, 1, 'Restaurant Admin', 'Generated salary for Chef Alex Rivers (2026-08) net pay: 1200', 'employees', '127.0.0.1', NULL, '2026-08-17 18:13:40'),
(24, 1, 'Restaurant Admin', 'Deleted salary voucher for Chef Alex Rivers (2026-08)', 'employees', '127.0.0.1', NULL, '2026-08-17 18:19:22'),
(25, 1, 'Restaurant Admin', 'Updated salary voucher for Chef Alex Rivers (2026-08) net pay: 1300', 'employees', '127.0.0.1', NULL, '2026-08-17 18:19:31'),
(26, 1, 'Restaurant Admin', 'Adjusted stock for Chicken Breast: in 10 kg', 'inventory', '127.0.0.1', NULL, '2026-08-17 18:48:25'),
(27, 1, 'Restaurant Admin', 'Adjusted stock for Chicken Breast: in 1.7 kg', 'inventory', '127.0.0.1', NULL, '2026-08-17 18:48:56'),
(28, 1, 'Restaurant Admin', 'Adjusted stock for Chicken Breast: in 1.4 kg', 'inventory', '127.0.0.1', NULL, '2026-08-17 18:49:18'),
(29, 1, 'Restaurant Admin', 'Adjusted stock for Chicken Breast: in 3 kg', 'inventory', '127.0.0.1', NULL, '2026-08-17 18:53:19'),
(30, 1, 'Restaurant Admin', 'Adjusted stock for Fresh Tomatoes: in 0.4 kg', 'inventory', '127.0.0.1', NULL, '2026-08-17 18:58:13'),
(31, 1, 'Restaurant Admin', 'Updated recipe ingredients for Test Pizza', 'menu', '127.0.0.1', NULL, '2026-08-17 19:03:00'),
(32, 1, 'Restaurant Admin', 'Recorded expense: Outlet Rent (5000)', 'expenses', '127.0.0.1', NULL, '2026-08-17 19:33:50'),
(33, 1, 'Restaurant Admin', 'Created menu category: Soft Drinks', 'categories', '127.0.0.1', NULL, '2026-08-17 19:42:27'),
(34, 1, 'Restaurant Admin', 'Sent Daily Closing Summary Email to admin@legourmetbistro.com', 'settings', '127.0.0.1', NULL, '2026-08-17 19:47:04'),
(35, 1, 'Restaurant Admin', 'Updated supplier: Fresh Farm Meats Co.', 'suppliers', '127.0.0.1', NULL, '2026-08-19 15:29:21'),
(36, 1, 'Restaurant Admin', 'Recorded purchase order PO-20260819-683 for total 290', 'purchases', '127.0.0.1', NULL, '2026-08-19 15:35:03'),
(37, 1, 'Restaurant Admin', 'Updated Purchase Order PO-20260816-001', 'purchases', '127.0.0.1', NULL, '2026-08-20 05:58:19'),
(38, 1, 'Restaurant Admin', 'Updated Purchase Order PO-20260819-683', 'purchases', '127.0.0.1', NULL, '2026-08-20 05:59:09'),
(39, 1, 'Restaurant Admin', 'Updated application settings and brand logo/icon assets', 'settings', '127.0.0.1', NULL, '2026-08-20 06:34:24'),
(40, 1, 'Restaurant Admin', 'Updated application settings and brand logo/icon assets', 'settings', '127.0.0.1', NULL, '2026-08-20 06:38:46'),
(41, 1, 'Restaurant Admin', 'Updated application settings and brand logo/icon assets', 'settings', '127.0.0.1', NULL, '2026-08-20 06:38:55'),
(42, 1, 'Restaurant Admin', 'Updated expense category: Electricity, Gas & Water', 'categories', '127.0.0.1', NULL, '2026-08-21 14:13:43'),
(43, 1, 'Restaurant Admin', 'Updated menu item: Test Pizza', 'menu', '127.0.0.1', NULL, '2026-08-21 16:00:14'),
(44, 1, 'Restaurant Admin', 'Updated menu item: Double Espresso', 'menu', '127.0.0.1', NULL, '2026-08-21 16:00:28'),
(45, 1, 'Restaurant Admin', 'Updated menu item: Double Cheeseburger', 'menu', '127.0.0.1', NULL, '2026-08-21 16:00:40'),
(46, 1, 'Restaurant Admin', 'Created sale invoice INV-20260821-2338 total: 257.5', 'sales', '127.0.0.1', NULL, '2026-08-21 16:20:35'),
(47, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 17:55:51'),
(48, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 18:04:30'),
(49, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 18:04:50'),
(50, 1, 'Restaurant Admin', 'Deleted menu item: Artisan Margherita Pizza', 'menu', '127.0.0.1', NULL, '2026-08-21 21:05:34'),
(51, 1, 'Restaurant Admin', 'Updated menu item: Double Cheeseburger', 'menu', '127.0.0.1', NULL, '2026-08-21 21:06:02'),
(52, 1, 'Restaurant Admin', 'Deleted menu item: Double Cheeseburger', 'menu', '127.0.0.1', NULL, '2026-08-21 21:06:16'),
(53, 1, 'Restaurant Admin', 'Deleted menu item: Double Espresso', 'menu', '127.0.0.1', NULL, '2026-08-21 21:06:24'),
(54, 1, 'Restaurant Admin', 'Deleted menu item: Gourmet Chicken Burger', 'menu', '127.0.0.1', NULL, '2026-08-21 21:06:29'),
(55, 1, 'Restaurant Admin', 'Dispatched profile_update OTP verification code to programmer.emad7867@gmail.com', 'security', '127.0.0.1', NULL, '2026-08-21 21:08:53'),
(56, 1, 'Restaurant Admin', 'Updated admin profile information', 'settings', '127.0.0.1', NULL, '2026-08-21 21:09:31'),
(57, 1, 'Restaurant Admin', 'Dispatched password_update OTP verification code to programmer.emad7867@gmail.com', 'security', '127.0.0.1', NULL, '2026-08-21 21:11:46'),
(58, 1, 'Restaurant Admin', 'Updated admin password credentials', 'security', '127.0.0.1', NULL, '2026-08-21 21:12:15'),
(59, 1, 'Restaurant Admin', 'Dispatched profile_update OTP verification code to programmer.emad7867@gmail.com', 'security', '127.0.0.1', NULL, '2026-08-21 21:12:29'),
(60, 1, 'Restaurant Admin', 'Updated Purchase Order PO-20260816-001', 'purchases', '127.0.0.1', NULL, '2026-08-21 21:32:44'),
(61, 1, 'Restaurant Admin', 'Created new customer review for John Doe', 'reviews', '127.0.0.1', NULL, '2026-08-21 21:35:20'),
(62, 1, 'Restaurant Admin', 'Updated customer review for John Doe', 'reviews', '127.0.0.1', NULL, '2026-08-21 21:35:36'),
(63, 1, 'Restaurant Admin', 'Created sale invoice INV-20260822-6596 total: 945', 'sales', '127.0.0.1', NULL, '2026-08-21 21:59:51'),
(64, 1, 'Restaurant Admin', 'Updated menu item: Artisan Margherita Pizza', 'menu', '127.0.0.1', NULL, '2026-08-21 22:16:36'),
(65, 1, 'Restaurant Admin', 'Updated expense: August Restaurant Electricity Bill', 'expenses', '127.0.0.1', NULL, '2026-08-21 22:17:25'),
(66, 1, 'Restaurant Admin', 'Updated expense: August Restaurant Electricity Bill', 'expenses', '127.0.0.1', NULL, '2026-08-21 22:18:28'),
(67, 1, 'Restaurant Admin', 'Sent Daily Closing Summary Email to admin@legourmetbistro.com', 'reports', '127.0.0.1', NULL, '2026-08-21 22:19:14'),
(68, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 22:22:13'),
(69, 1, 'Restaurant Admin', 'Updated expense: August Restaurant Electricity Bill', 'expenses', '127.0.0.1', NULL, '2026-08-21 22:23:13'),
(70, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 23:02:18'),
(71, 1, 'Restaurant Admin', 'Created sale invoice INV-20260822-4621 total: 682.5', 'sales', '127.0.0.1', NULL, '2026-08-21 23:07:00'),
(72, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 23:53:26'),
(73, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 23:58:55'),
(74, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 23:59:24'),
(75, 1, 'Restaurant Admin', 'Updated application settings, week start day (saturday) and operating hours', 'settings', '127.0.0.1', NULL, '2026-08-21 23:59:50');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('admin_otp_1_profile_update', 'a:2:{s:3:\"otp\";s:6:\"685382\";s:10:\"created_at\";i:1787346745;}', 1787347345),
('admin_otp_cooldown_1_profile_update', 'i:1787346805;', 1787346805);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('inventory','menu','expense') NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Vegetables & Produce', 'inventory', 'Fresh garden produce', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 'Meat & Poultry', 'inventory', 'Beef, chicken, lamb', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(3, 'Dairy & Cheese', 'inventory', 'Milk, butter, mozzarella, cream', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(4, 'Dry Goods & Grains', 'inventory', 'Flour, rice, spices, oil', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(5, 'Beverages & Coffee', 'inventory', 'Coffee beans, syrup, soft drinks', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(6, 'Packaging & Supplies', 'inventory', 'Boxes, cups, napkins', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(7, 'Appetizers & Starters', 'menu', 'Light savory starters', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(8, 'Chef Main Courses', 'menu', 'Signature main dishes', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(9, 'Artisan Desserts', 'menu', 'Sweet treats', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(10, 'Handcrafted Beverages', 'menu', 'Hot coffee & cold drinks', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(11, 'Rent & Facility', 'expense', NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(12, 'Electricity, Gas & Water', 'expense', 'We will store monthly this kind of specific bills in it only.', '2026-08-16 14:36:31', '2026-08-21 14:13:43'),
(13, 'Internet & Phone', 'expense', NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(14, 'Marketing & Promotions', 'expense', NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(15, 'Equipment Repairs', 'expense', NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(16, 'Miscellaneous', 'expense', NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(17, 'Soft Drinks', 'menu', 'Soft Drinks items will stay here', '2026-08-17 19:42:27', '2026-08-17 19:42:27'),
(18, 'Vegetables & Produce', 'inventory', 'Fresh garden produce', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(19, 'Meat & Poultry', 'inventory', 'Beef, chicken, lamb', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(20, 'Dairy & Cheese', 'inventory', 'Milk, butter, mozzarella, cream', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(21, 'Dry Goods & Grains', 'inventory', 'Flour, rice, spices, oil', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(22, 'Beverages & Coffee', 'inventory', 'Coffee beans, syrup, soft drinks', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(23, 'Packaging & Supplies', 'inventory', 'Boxes, cups, napkins', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(24, 'Appetizers & Starters', 'menu', 'Light savory starters', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(25, 'Chef Main Courses', 'menu', 'Signature main dishes', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(26, 'Artisan Desserts', 'menu', 'Sweet treats', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(27, 'Handcrafted Beverages', 'menu', 'Hot coffee & cold drinks', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(28, 'Rent & Facility', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(29, 'Electricity, Gas & Water', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(30, 'Internet & Phone', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(31, 'Marketing & Promotions', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(32, 'Equipment Repairs', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(33, 'Miscellaneous', 'expense', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `role_title` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `base_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `role_title`, `phone`, `email`, `address`, `joining_date`, `base_salary`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Chef Alex Rivers', 'Head Chef', '+8801799999999', 'alex@legourmetbistro.com', NULL, '2024-01-15', 1200.00, 'active', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 'Maria Santos', 'Lead Server', '+8801788888888', NULL, NULL, '2026-07-26', 600.00, 'active', '2026-08-16 14:36:31', '2026-08-17 18:11:37'),
(3, 'Maria Santos', 'Lead Server', '+8801788888888', 'maria@legourmetbistro.com', NULL, '2024-06-01', 600.00, 'active', '2026-08-21 17:55:24', '2026-08-21 17:55:24');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'cash',
  `reference_no` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `title`, `category_id`, `amount`, `expense_date`, `payment_method`, `reference_no`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'August Restaurant Electricity Bill', 12, 240.00, '2026-08-15', 'bKash', 'UTIL-8822', 'Additional notes', 1, '2026-08-16 14:36:31', '2026-08-21 22:23:13'),
(2, 'Outlet Rent', 11, 5000.00, '2026-08-17', 'cash', NULL, NULL, 1, '2026-08-17 19:33:50', '2026-08-17 19:33:50');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `unit` varchar(255) NOT NULL DEFAULT 'kg',
  `current_stock` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_stock_threshold` decimal(12,2) NOT NULL DEFAULT 5.00,
  `cost_per_unit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `name`, `sku`, `category_id`, `unit`, `current_stock`, `min_stock_threshold`, `cost_per_unit`, `expiry_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Chicken Breast', 'ING-001', 2, 'kg', 40.00, 5.00, 650.00, '2026-08-20', NULL, '2026-08-16 14:36:31', '2026-08-17 18:53:19'),
(2, 'Prime Ground Beef', 'ING-002', 2, 'kg', 18.00, 4.00, 90.00, '2026-08-19', NULL, '2026-08-16 14:36:31', '2026-08-17 11:51:05'),
(3, 'Fresh Tomatoes', 'ING-003', 1, 'kg', 15.00, 3.00, 180.00, '2026-08-21', 'Updated', '2026-08-16 14:36:31', '2026-08-17 18:58:13'),
(4, 'Mozzarella Cheese', 'ING-004', 3, 'kg', 10.00, 2.00, 80.00, '2026-08-29', NULL, '2026-08-16 14:36:31', '2026-08-17 11:50:58'),
(5, 'All-Purpose Flour', 'ING-005', 4, 'kg', 41.00, 10.00, 110.00, NULL, NULL, '2026-08-16 14:36:31', '2026-08-19 15:35:03'),
(6, 'Cooking Olive Oil', 'ING-006', 4, 'l', 30.00, 5.00, 400.00, NULL, NULL, '2026-08-16 14:36:31', '2026-08-17 11:50:33'),
(7, 'Arabica Coffee Beans', 'ING-007', 5, 'kg', 9.00, 2.00, 180.00, NULL, NULL, '2026-08-16 14:36:31', '2026-08-19 15:35:03'),
(8, 'Takeaway Food Box', 'SUP-001', 6, 'piece', 150.00, 30.00, 10.00, NULL, NULL, '2026-08-16 14:36:31', '2026-08-17 11:51:17'),
(9, 'Chicken Breast', 'ING-001', 19, 'kg', 25.50, 5.00, 6.50, '2026-08-26', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(10, 'Prime Ground Beef', 'ING-002', 19, 'kg', 18.00, 4.00, 9.00, '2026-08-25', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(11, 'Fresh Tomatoes', 'ING-003', 18, 'kg', 15.00, 3.00, 1.80, '2026-08-27', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(12, 'Mozzarella Cheese', 'ING-004', 20, 'kg', 10.00, 2.00, 8.00, '2026-09-04', NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(13, 'All-Purpose Flour', 'ING-005', 21, 'kg', 40.00, 10.00, 1.10, NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(14, 'Cooking Olive Oil', 'ING-006', 21, 'l', 30.00, 5.00, 4.50, NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(15, 'Arabica Coffee Beans', 'ING-007', 22, 'kg', 8.00, 2.00, 18.00, NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(16, 'Takeaway Food Box', 'SUP-001', 23, 'piece', 150.00, 30.00, 0.25, NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `inventory_item_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('in','out','wastage','return','sale_deduction','adjustment') NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `cost_per_unit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `inventory_item_id`, `type`, `quantity`, `unit`, `cost_per_unit`, `reference_type`, `reference_id`, `notes`, `created_at`) VALUES
(1, 1, 'sale_deduction', 1.00, 'kg', 6.50, 'Order', 2, 'Sale INV-20260816-9819 - Dish: Gourmet Chicken Burger', '2026-08-16 15:12:09'),
(2, 3, 'sale_deduction', 0.25, 'kg', 1.80, 'Order', 2, 'Sale INV-20260816-9819 - Dish: Gourmet Chicken Burger', '2026-08-16 15:12:09'),
(3, 1, 'sale_deduction', 0.60, 'kg', 6.50, 'Order', 3, 'Sale INV-20260816-0541 - Dish: Gourmet Chicken Burger', '2026-08-16 15:35:07'),
(4, 3, 'sale_deduction', 0.15, 'kg', 1.80, 'Order', 3, 'Sale INV-20260816-0541 - Dish: Gourmet Chicken Burger', '2026-08-16 15:35:07'),
(5, 1, 'in', 10.00, 'kg', 650.00, NULL, NULL, 'Purchase placed again', '2026-08-17 18:48:25'),
(6, 1, 'in', 1.70, 'kg', 650.00, NULL, NULL, 'purchase', '2026-08-17 18:48:56'),
(7, 1, 'in', 1.40, 'kg', 650.00, NULL, NULL, 'purchased', '2026-08-17 18:49:18'),
(8, 1, 'in', 3.00, 'kg', 650.00, NULL, NULL, 'Dummy note', '2026-08-17 18:53:19'),
(9, 3, 'in', 0.40, 'kg', 180.00, NULL, NULL, 'Updated', '2026-08-17 18:58:13'),
(10, 5, 'in', 1.00, 'kg', 110.00, 'Purchase', 2, 'Purchase PO-20260819-683', '2026-08-19 15:35:03'),
(11, 7, 'in', 1.00, 'kg', 180.00, 'Purchase', 2, 'Purchase PO-20260819-683', '2026-08-19 15:35:03');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `category_id`, `description`, `details`, `price`, `image_path`, `is_available`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 'Gourmet Chicken Burger', 8, 'Grilled seasoned chicken patty, lettuce, tomato, house sauce on brioche bun.', '<h2>Special Recipe</h2><p>Marinated for 12 hours.</p>', 250.00, '/uploads/dishes/dish_1786894215_6a81d78794904.jpg', 1, 1, '2026-08-16 14:36:31', '2026-08-21 15:58:55'),
(2, 'Artisan Margherita Pizza', 8, 'Wood-fired crust, San Marzano tomato sauce, fresh mozzarella & basil.', 'Great Food', 650.00, '/uploads/dishes/dish_1786894081_6a81d70166c6b.jpg', 1, 1, '2026-08-16 14:36:31', '2026-08-21 22:16:36'),
(3, 'Double Cheeseburger', 8, 'Two ground beef patties, melted mozzarella cheese, pickles & special glaze.', 'Two ground beef patties, melted mozzarella cheese, pickles &amp; special glaze.', 350.00, '/uploads/dishes/dish_1786894148_6a81d74447962.webp', 1, 1, '2026-08-16 14:36:31', '2026-08-21 16:00:40'),
(4, 'Double Espresso', 10, 'Rich, aromatic double shot of 100% Arabica roast beans.', 'Rich, aromatic double shot of 100% Arabica roast beans.&nbsp;', 300.00, '/uploads/dishes/dish_1786894187_6a81d76b3a263.webp', 1, 0, '2026-08-16 14:36:31', '2026-08-21 16:00:28'),
(5, 'Test Pizza', 7, 'This is a tasty pizza', 'This is a tasty <b>pizza </b>This is a <i>tasty </i>pizza This is a tasty pizza', 100.00, '/uploads/dishes/dish_1786968867_6a82fb233a8ad.jpg', 1, 0, '2026-08-17 12:14:27', '2026-08-21 16:00:14');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_16_000000_create_restaurant_inventory_tables', 1),
(5, '2026_08_17_000000_remove_cost_price_from_menu_items_table', 2),
(6, '2026_08_20_000000_update_purchases_and_settings_schema', 3),
(7, '2026_08_21_000000_add_details_to_menu_items_table', 4),
(8, '2026_08_21_100000_create_reviews_table', 5);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `order_type` enum('dine_in','takeaway','delivery') NOT NULL DEFAULT 'dine_in',
  `table_number` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('cash','card','bkash','nagad','other') NOT NULL DEFAULT 'cash',
  `payment_status` enum('paid','pending','cancelled') NOT NULL DEFAULT 'paid',
  `transaction_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `order_type`, `table_number`, `customer_name`, `customer_phone`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `payment_method`, `payment_status`, `transaction_id`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'INV-20260816-0001', 'dine_in', 'T-04', 'John Doe', NULL, 26.50, 1.33, 0.00, 27.83, 'card', 'paid', 'TXN-998811', NULL, 1, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 'INV-20260816-9819', 'dine_in', 'Table 1', NULL, NULL, 62.50, 3.13, 0.00, 65.63, 'cash', 'paid', NULL, NULL, 1, '2026-08-16 15:12:09', '2026-08-16 15:12:09'),
(3, 'INV-20260816-0541', 'dine_in', 'Table 1', NULL, NULL, 750.00, 37.50, 0.00, 787.50, 'bkash', 'paid', NULL, NULL, 1, '2026-08-16 15:35:07', '2026-08-16 15:35:07'),
(4, 'INV-20260821-2338', 'takeaway', 'Table 1', NULL, NULL, 250.00, 12.50, 5.00, 257.50, 'cash', 'paid', NULL, NULL, 1, '2026-08-21 16:20:35', '2026-08-21 16:20:35'),
(5, 'INV-20260822-6596', 'dine_in', 'Table 1', NULL, NULL, 900.00, 45.00, 0.00, 945.00, 'cash', 'paid', NULL, NULL, 1, '2026-08-21 21:59:51', '2026-08-21 21:59:51'),
(6, 'INV-20260822-4621', 'dine_in', 'Table 5', NULL, NULL, 650.00, 32.50, 0.00, 682.50, 'cash', 'paid', NULL, NULL, 1, '2026-08-21 23:07:00', '2026-08-21 23:07:00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `menu_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `item_name`, `quantity`, `unit_price`, `total_price`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Gourmet Chicken Burger', 1, 12.50, 12.50, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 1, 2, 'Artisan Margherita Pizza', 1, 14.00, 14.00, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(3, 2, 1, 'Gourmet Chicken Burger', 5, 12.50, 62.50, '2026-08-16 15:12:09', '2026-08-16 15:12:09'),
(4, 3, 1, 'Gourmet Chicken Burger', 3, 250.00, 750.00, '2026-08-16 15:35:07', '2026-08-16 15:35:07'),
(5, 4, 1, 'Gourmet Chicken Burger', 1, 250.00, 250.00, '2026-08-21 16:20:35', '2026-08-21 16:20:35'),
(6, 5, 1, 'Gourmet Chicken Burger', 1, 250.00, 250.00, '2026-08-21 21:59:51', '2026-08-21 21:59:51'),
(7, 5, 2, 'Artisan Margherita Pizza', 1, 650.00, 650.00, '2026-08-21 21:59:51', '2026-08-21 21:59:51'),
(8, 6, 4, 'Double Espresso', 1, 300.00, 300.00, '2026-08-21 23:07:00', '2026-08-21 23:07:00'),
(9, 6, 3, 'Double Cheeseburger', 1, 350.00, 350.00, '2026-08-21 23:07:00', '2026-08-21 23:07:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_number` varchar(255) NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `supplier_name_text` varchar(255) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `status` enum('draft','pending','approved','received') NOT NULL DEFAULT 'received',
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `purchase_number`, `supplier_id`, `supplier_name_text`, `purchase_date`, `status`, `total_amount`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'PO-20260816-001', 3, NULL, '2026-08-19', 'received', 390.00, 'Weekly poultry delivery', 1, '2026-08-16 14:36:31', '2026-08-21 21:32:44'),
(2, 'PO-20260819-683', 3, NULL, '2026-08-16', 'received', 290.00, NULL, 1, '2026-08-19 15:35:03', '2026-08-20 05:59:09');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_name` varchar(255) DEFAULT NULL,
  `inventory_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `used_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(255) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `ingredient_name`, `inventory_item_id`, `quantity`, `used_amount`, `unit`, `unit_price`, `total_price`, `expiry_date`, `created_at`, `updated_at`) VALUES
(5, 2, 'Fresh Meat', NULL, 1.00, 0.00, 'kg', 110.00, 110.00, NULL, '2026-08-20 05:59:09', '2026-08-20 05:59:09'),
(6, 2, 'Fresh Potatos', NULL, 1.00, 0.00, 'kg', 180.00, 180.00, NULL, '2026-08-20 05:59:09', '2026-08-20 05:59:09'),
(8, 1, 'Chicken', NULL, 30.00, 20.00, 'kg', 6.50, 195.00, '2026-08-21', '2026-08-21 21:32:44', '2026-08-21 21:32:44'),
(9, 1, 'Potato', NULL, 30.00, 0.00, 'kg', 6.50, 195.00, '2026-08-27', '2026-08-21 21:32:44', '2026-08-21 21:32:44');

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `menu_item_id` bigint(20) UNSIGNED NOT NULL,
  `inventory_item_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `menu_item_id`, `inventory_item_id`, `quantity`, `unit`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 200.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 1, 3, 50.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(3, 2, 5, 250.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(4, 2, 4, 150.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(5, 2, 3, 100.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(6, 3, 2, 250.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(7, 3, 4, 80.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(8, 4, 7, 18.00, 'g', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(9, 5, 1, 1.00, 'kg', '2026-08-17 19:03:00', '2026-08-17 19:03:00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_title` varchar(255) DEFAULT NULL,
  `avatar_initials` varchar(10) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `comment` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `customer_name`, `customer_title`, `avatar_initials`, `avatar_url`, `rating`, `comment`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'John D.', 'Verified Diner • Night Owl', 'JD', NULL, 5, 'The best burger I\'ve had at 3 AM. It doesn\'t feel like regular fast food—it feels like a complete gastronomic event. Fresh, piping hot, and full of rich flavor.', 1, 1, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(2, 'Sarah M.', 'Verified Diner • Creative Director', 'SM', NULL, 5, 'Finally, a restaurant that takes delivery and midnight recipes seriously. The truffle fries were still crispy and the brioche burger buns were toasted to perfection.', 1, 2, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(3, 'Tanvir Ahmed', 'VIP Lounge Member', 'TA', NULL, 5, 'The Wagyu Smash Burger paired with their secret sauce is legendary. Delivered in 14 minutes with thermal lock packaging intact. Truly impressive speed and quality.', 1, 3, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(4, 'Elena Rostova', 'Food & Lifestyle Critic', 'ER', NULL, 5, 'An after-hours atmosphere unlike any other in the city. The ambient neon aesthetic, pulsating beats, and artisanal culinary recipes make this our team\'s midnight headquarters.', 1, 4, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(5, 'Rashid Karim', 'Tech Founder • Midnight Diner', 'RK', NULL, 4, 'Exceptional artisan pizza crust with authentic charred edges. Delivery was slightly delayed during peak Friday midnight rush, but the flavor was 100% worth every single minute.', 1, 5, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(6, 'Ayesha Siddiqua', 'Verified Gourmet Foodie', 'AS', NULL, 5, 'The Smoked Brisket Sandwich with spicy chimichurri sauce is an absolute masterpiece. You can tell they use prime aged cuts and real hickory smoke.', 1, 6, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(7, 'Marcus Vance', 'Music Producer', 'MV', NULL, 5, 'Ordered for our late-night studio session at 2:30 AM. Everything was piping hot, beautifully presented, and energized the entire crew. Unbeatable nocturnal service.', 1, 7, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(8, 'Nabila Chowdhury', 'Regular Patron', 'NC', NULL, 5, 'The physical lounge is stunning and the WhatsApp ordering process is seamless. The Korean Glazed Chicken wings have just the right amount of fiery sweetness.', 1, 8, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(9, 'David Sterling', 'Executive Chef Enthusiast', 'DS', NULL, 5, 'The attention to detail in their recipes is second to none. Perfectly balanced marinades, high heat sear marks, and gourmet ingredients that elevate midnight fast food.', 1, 9, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(10, 'Zubair Hossain', 'Elite Syndicate Member', 'ZH', NULL, 5, 'Membership perks are real—priority dispatch routing, exclusive off-menu tastings, and reserved table seating. The gold standard for night owls in Dhaka.', 1, 10, '2026-08-21 17:55:24', '2026-08-21 17:55:24'),
(11, 'John Doe', 'Verified Diner • Night Owl', 'JO', NULL, 5, 'The restaurant has a great environment and food is too good. Overall 9/10 in rating.', 1, 0, '2026-08-21 21:35:20', '2026-08-21 21:35:36');

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `month_year` varchar(255) NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `bonus` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deduction` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_pay` decimal(12,2) NOT NULL,
  `payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'paid',
  `payment_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `salaries`
--

INSERT INTO `salaries` (`id`, `employee_id`, `month_year`, `base_salary`, `bonus`, `deduction`, `net_pay`, `payment_status`, `payment_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-08', 1200.00, 100.00, 0.00, 1300.00, 'paid', '2026-07-31', NULL, '2026-08-16 14:36:31', '2026-08-17 18:19:31'),
(2, 2, '2026-08', 600.00, 0.00, 0.00, 600.00, 'paid', '2026-08-17', NULL, '2026-08-17 18:04:10', '2026-08-17 18:04:10'),
(4, 1, '2026-07', 1200.00, 100.00, 0.00, 1300.00, 'paid', '2026-08-01', NULL, '2026-08-21 17:55:24', '2026-08-21 17:55:24');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('iPBJ5ySwzuD2Ihb6Vja5RquFwTixlL3eomnl089W', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoialdwaUFDTGg4U3J0S3VNVllxazJHNGNUYmoweXVBdjlMdUdTaTN0TCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1787356794),
('SGUAHQT7ny6BBfzICWVSTfjbjjA9LWvNucl5PVSl', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYzhFNlJubzRPRUxMMWxBTlh2c3VQWVJWeUt4bHYzTlpFZWQ0emFINCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1787353415);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Local City Bazar Vendor', 'Rahim Miah', '+8801811111111', NULL, NULL, 'Daily local market fresh vegetables purchase', '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(2, 'Fresh Farm Meats Co.', 'Tariq Hassan', '+8801822222222', 'sales@freshfarmmeats.com', 'Dummy', NULL, '2026-08-16 14:36:31', '2026-08-19 15:29:21'),
(3, 'Golden Dairy Products', 'Salma Begum', '+8801833333333', NULL, NULL, NULL, '2026-08-16 14:36:31', '2026-08-16 14:36:31'),
(4, 'Local City Bazar Vendor', 'Rahim Miah', '+8801811111111', NULL, NULL, 'Daily local market fresh vegetables purchase', '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(5, 'Fresh Farm Meats Co.', 'Tariq Hassan', '+8801822222222', 'sales@freshfarmmeats.com', NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20'),
(6, 'Golden Dairy Products', 'Salma Begum', '+8801833333333', NULL, NULL, NULL, '2026-08-21 17:53:20', '2026-08-21 17:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_settings_key_unique` (`key`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_logs_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_category_id_foreign` (`category_id`),
  ADD KEY `expenses_created_by_foreign` (`created_by`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_items_category_id_foreign` (`category_id`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_movements_inventory_item_id_foreign` (`inventory_item_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_items_category_id_foreign` (`category_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_created_by_foreign` (`created_by`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_menu_item_id_foreign` (`menu_item_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchases_purchase_number_unique` (`purchase_number`),
  ADD KEY `purchases_supplier_id_foreign` (`supplier_id`),
  ADD KEY `purchases_created_by_foreign` (`created_by`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_items_purchase_id_foreign` (`purchase_id`),
  ADD KEY `purchase_items_inventory_item_id_foreign` (`inventory_item_id`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipes_menu_item_id_foreign` (`menu_item_id`),
  ADD KEY `recipes_inventory_item_id_foreign` (`inventory_item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salaries_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `inventory_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_inventory_item_id_foreign` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchases_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_inventory_item_id_foreign` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `recipes_inventory_item_id_foreign` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipes_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `salaries`
--
ALTER TABLE `salaries`
  ADD CONSTRAINT `salaries_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
