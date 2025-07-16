-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 10, 2025 at 01:19 PM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u576433449_star_pwa`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessment_results`
--

CREATE TABLE `assessment_results` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `passage_id` int(11) NOT NULL,
  `assessed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `accuracy` float NOT NULL,
  `reading_level` varchar(50) DEFAULT NULL,
  `level` varchar(50) NOT NULL,
  `level1_score` int(11) NOT NULL DEFAULT 0,
  `level2_score` int(11) NOT NULL DEFAULT 0,
  `level3_score` int(11) NOT NULL DEFAULT 0,
  `level4_score` int(11) NOT NULL DEFAULT 0,
  `total_score` int(11) NOT NULL DEFAULT 0,
  `max_score` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_results`
--

INSERT INTO `assessment_results` (`id`, `student_id`, `passage_id`, `assessed_at`, `accuracy`, `reading_level`, `level`, `level1_score`, `level2_score`, `level3_score`, `level4_score`, `total_score`, `max_score`) VALUES
(628, 8, 1, '2025-07-06 13:06:39', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(629, 8, 1, '2025-07-06 13:45:01', 25, 'Level 1', 'Level 1', 10, 0, 0, 0, 10, 40),
(630, 8, 1, '2025-07-06 13:45:08', 25, 'Level 1', 'Level 1', 10, 0, 0, 0, 10, 40),
(631, 8, 1, '2025-07-06 13:45:13', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(632, 8, 1, '2025-07-06 13:47:08', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(633, 8, 1, '2025-07-06 13:47:37', 37.5, 'Level 1', 'Level 2', 10, 5, 0, 0, 15, 40),
(634, 8, 1, '2025-07-06 13:47:45', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(635, 8, 1, '2025-07-06 13:47:49', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(636, 8, 1, '2025-07-06 13:51:06', 72.5, 'Level 2', 'Level 3', 10, 10, 9, 0, 29, 40),
(637, 24, 1, '2025-07-06 14:55:05', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(638, 24, 1, '2025-07-06 14:55:28', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(639, 24, 1, '2025-07-06 14:56:31', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(640, 8, 1, '2025-07-06 15:04:55', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(641, 24, 1, '2025-07-06 15:11:01', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(642, 24, 1, '2025-07-06 15:40:45', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(643, 8, 1, '2025-07-07 00:52:20', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(644, 8, 1, '2025-07-07 01:11:21', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(645, 8, 1, '2025-07-07 01:11:21', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(646, 8, 1, '2025-07-07 01:11:24', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(647, 8, 1, '2025-07-07 01:35:43', 20, 'Level 1', 'Level 1', 8, 0, 0, 0, 8, 40),
(648, 8, 1, '2025-07-07 01:35:51', 20, 'Level 1', 'Level 1', 8, 0, 0, 0, 8, 40),
(649, 8, 1, '2025-07-07 01:37:35', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(650, 8, 1, '2025-07-07 01:39:51', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(651, 8, 1, '2025-07-07 01:39:51', 42.5, 'Level 1', 'Level 2', 10, 7, 0, 0, 17, 40),
(652, 8, 1, '2025-07-07 01:42:00', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(653, 8, 1, '2025-07-07 01:47:05', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(654, 8, 1, '2025-07-07 01:47:14', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(655, 8, 1, '2025-07-07 03:54:49', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(656, 8, 1, '2025-07-07 03:55:11', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(657, 8, 1, '2025-07-07 03:55:41', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(658, 8, 1, '2025-07-07 04:00:58', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(659, 8, 1, '2025-07-07 04:01:15', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(660, 23, 1, '2025-07-07 10:01:57', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(661, 23, 1, '2025-07-07 10:02:53', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(662, 23, 1, '2025-07-07 10:03:39', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(663, 23, 1, '2025-07-07 10:04:13', 80, 'Level 3', 'Level 4', 10, 10, 10, 2, 32, 40),
(664, 23, 1, '2025-07-07 10:04:14', 80, 'Level 3', 'Level 3', 10, 10, 10, 2, 32, 40),
(665, 8, 1, '2025-07-07 10:32:39', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(666, 8, 1, '2025-07-07 10:32:44', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(667, 27, 1, '2025-07-07 12:03:56', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(668, 27, 1, '2025-07-07 12:04:37', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(669, 27, 1, '2025-07-07 12:05:31', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(670, 27, 1, '2025-07-07 12:07:31', 100, 'Level 4', 'Level 4', 10, 10, 10, 10, 40, 40),
(671, 27, 1, '2025-07-07 12:07:32', 100, 'Level 4', 'Level 4', 10, 10, 10, 10, 40, 40),
(672, 8, 1, '2025-07-07 15:30:46', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(673, 8, 1, '2025-07-07 15:30:51', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(674, 8, 1, '2025-07-07 19:27:54', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(675, 8, 1, '2025-07-07 19:27:57', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(676, 8, 1, '2025-07-07 19:28:00', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(677, 8, 1, '2025-07-08 02:02:40', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(678, 8, 1, '2025-07-08 02:04:57', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(679, 8, 1, '2025-07-08 03:51:23', 75, 'Level 3', 'Level 4', 10, 10, 10, 0, 30, 40),
(680, 8, 1, '2025-07-08 10:31:36', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(681, 8, 1, '2025-07-08 10:31:39', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40),
(682, 8, 1, '2025-07-09 18:07:16', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(683, 8, 1, '2025-07-09 20:33:20', 25, 'Level 1', 'Level 2', 10, 0, 0, 0, 10, 40),
(684, 8, 1, '2025-07-09 20:33:35', 50, 'Level 2', 'Level 3', 10, 10, 0, 0, 20, 40);

-- --------------------------------------------------------

--
-- Table structure for table `passages`
--

CREATE TABLE `passages` (
  `id` int(11) NOT NULL,
  `level` varchar(50) NOT NULL,
  `text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `passages`
--

INSERT INTO `passages` (`id`, `level`, `text`) VALUES
(1, 'level1', 'Sample passage text for Level 1...'),
(2, 'level2', 'Sample passage text for Level 2...'),
(3, 'level3', 'Sample passage text for Level 3...'),
(4, 'level4', 'Sample passage text for Level 4...');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `record_id` varchar(20) DEFAULT NULL,
  `user_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `grade_level` varchar(20) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Teacher','Student') NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `record_id`, `user_id`, `first_name`, `middle_name`, `surname`, `gender`, `birthday`, `age`, `grade_level`, `email`, `password_hash`, `role`, `teacher_id`, `student_id`, `created_at`, `is_deleted`, `updated_at`) VALUES
(1, 'ADM-1', 'ADM-1', 'ADMIN-1', 'ADM-1', 'ADM-1', NULL, NULL, NULL, NULL, '', '$2y$10$eMvnVz9eLuqueu6rEN8qTu7Ng028YShbu0yJgtCJq145G7yiZ5XQ6', 'Admin', NULL, NULL, '2025-06-26 16:03:28', 0, NULL),
(5, 'TCR-1', 'TCR-1', 'Juan', 'Dela', 'Cruz', NULL, NULL, NULL, NULL, 'JuanDC@gmail.com', '$2y$10$.TuVJbQ7G.H5sCO0gWe17e0S3URq4IHXLUGPCLr6BkO4v7xnY//Ie', 'Teacher', NULL, NULL, '2025-06-27 07:10:39', 0, NULL),
(8, 'STD-1', 'STD-1', 'John', 'The', 'Cruz', NULL, NULL, NULL, NULL, 'JuanDC@gmail.com', '$2y$10$gtp5NhjItLie6BUOu8K4uunfhEFVtgcSSCCMPc8kxEKxrLNvtqtRK', 'Student', 5, '', '2025-06-27 07:44:39', 0, NULL),
(22, 'STD-14', 'STD-14', 'ROSEO MARIELLE', 'JUMBAS', 'SONA', NULL, NULL, NULL, NULL, 'roseomarielles@gmail.com', '$2y$10$6kcYhDaqCxI9M8jr/oX2O.DyeyephQYvgijJjogg7jvH3q6UhpDjG', 'Student', 5, '', '2025-07-06 06:10:31', 0, NULL),
(23, NULL, 'STD-27', 'Andrei Micko', NULL, 'Colinares', NULL, NULL, NULL, NULL, 'amcolinares@gmail.com', '$2y$10$UY6jzbSyDzf012yuoRd.3uEuv5jgD5j0Kz.TFDFH0iV.XG2AAcyZO', 'Student', 5, NULL, '2025-07-06 06:56:53', 0, NULL),
(24, 'STD-24', 'STD-24', 'TEST', 'TEST', 'TEST', 'Male', '1111-01-01', 18, '12', 'test@gmail.com', '$2y$10$VZmStbnz3m.VZKNnVgrHU.cApPLFjvZK/QpsGQzXYpsfa4.3wdrgu', 'Student', 5, NULL, '2025-07-06 12:52:12', 1, '2025-07-06 12:59:11'),
(25, 'STD-66', 'STD-66', 'Ledif', 'Pryce', 'Rye', NULL, NULL, NULL, NULL, 'markpryce15@gmail.com', '$2y$10$GCbRorUI79Yxs0r6WAYcwObBc9nZAmxiXWKmKNpYRW0W3Q7r/erQq', 'Student', 5, NULL, '2025-07-07 07:39:13', 0, NULL),
(26, 'TCR-2', 'TCR-2', 'Arwin Jayson', 'Aringo', 'Villa', NULL, NULL, NULL, NULL, 'villa.aj13@gmail.com', '$2y$10$UkCAiBRZ6J17WW2iAEMoQeWDMY7bZTg/25.JfZqOWSX/MmWVHqyIS', 'Teacher', NULL, NULL, '2025-07-07 11:57:53', 0, NULL),
(27, 'STD-28', 'STD-28', 'Daniel', 'Kwan', 'Thompson', NULL, NULL, NULL, NULL, 'kwan@gmail.com', '$2y$10$TbXxCXzzpxZOqXpaFG5vqeqwGWyAsjb32SuhwbMw23en1UuyP3J8q', 'Student', 26, NULL, '2025-07-07 12:01:09', 0, NULL),
(28, 'TCR-3', 'TCR-3', 'Renz', NULL, 'Kevin', NULL, NULL, NULL, NULL, 'dqwdadasdaASd@gmail.com', '$2y$10$BjRRX5SuNDUh6Yj9HtB7cewW4vmOyD0pktqduT3jAzaaazp2cPEeG', 'Teacher', NULL, NULL, '2025-07-07 15:09:54', 1, '2025-07-07 15:10:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessment_results`
--
ALTER TABLE `assessment_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `passage_id` (`passage_id`);

--
-- Indexes for table `passages`
--
ALTER TABLE `passages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assessment_results`
--
ALTER TABLE `assessment_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=685;

--
-- AUTO_INCREMENT for table `passages`
--
ALTER TABLE `passages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessment_results`
--
ALTER TABLE `assessment_results`
  ADD CONSTRAINT `assessment_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessment_results_ibfk_2` FOREIGN KEY (`passage_id`) REFERENCES `passages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
