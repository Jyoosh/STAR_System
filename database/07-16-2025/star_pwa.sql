-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2025 at 12:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `star_pwa`
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
  `level1_score` int(11) DEFAULT NULL,
  `level2_score` int(11) DEFAULT NULL,
  `level3_score` int(11) DEFAULT NULL,
  `level4_score` int(11) DEFAULT NULL,
  `total_score` int(11) NOT NULL DEFAULT 0,
  `max_score` int(11) NOT NULL DEFAULT 0,
  `assessment_type` varchar(50) DEFAULT 'Without Speech Defect'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_results`
--

INSERT INTO `assessment_results` (`id`, `student_id`, `passage_id`, `assessed_at`, `accuracy`, `reading_level`, `level`, `level1_score`, `level2_score`, `level3_score`, `level4_score`, `total_score`, `max_score`, `assessment_type`) VALUES
(815, 8, 1, '2025-07-16 10:15:12', 25, 'Level 2', 'Level 2', 10, 0, 0, 0, 10, 40, 'Without Speech Defect'),
(816, 8, 1, '2025-07-16 10:15:40', 25, 'Level 2', 'Level 2', 10, 0, 0, 0, 10, 40, 'With Speech Defect'),
(821, 8, 1, '2025-07-16 18:24:46', 25, 'Level 2', 'Level 2', 10, 0, 0, 0, 10, 40, 'Without Speech Defect');

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
(8, 'STD-1', 'STD-1', 'John', 'The', 'Cruz', 'Male', '1111-01-01', 22, '9000', 'JuanDC@gmail.com', '$2y$10$gtp5NhjItLie6BUOu8K4uunfhEFVtgcSSCCMPc8kxEKxrLNvtqtRK', 'Student', 5, '', '2025-06-27 07:44:39', 0, '2025-07-16 09:46:48'),
(22, 'STD-14', 'STD-14', 'ROSEO MARIELLE', 'JUMBAS', 'SONA', NULL, NULL, NULL, NULL, 'roseomarielles@gmail.com', '$2y$10$6kcYhDaqCxI9M8jr/oX2O.DyeyephQYvgijJjogg7jvH3q6UhpDjG', 'Student', 5, '', '2025-07-06 06:10:31', 0, NULL),
(23, NULL, 'STD-27', 'Andrei Micko', NULL, 'Colinares', NULL, NULL, NULL, NULL, 'amcolinares@gmail.com', '$2y$10$UY6jzbSyDzf012yuoRd.3uEuv5jgD5j0Kz.TFDFH0iV.XG2AAcyZO', 'Student', 5, NULL, '2025-07-06 06:56:53', 0, NULL),
(24, 'STD-24', 'STD-24', 'TEST', 'TEST', 'TEST', 'Male', '1111-01-01', 18, '12', 'test@gmail.com', '$2y$10$VZmStbnz3m.VZKNnVgrHU.cApPLFjvZK/QpsGQzXYpsfa4.3wdrgu', 'Student', 5, NULL, '2025-07-06 12:52:12', 1, '2025-07-06 12:59:11'),
(25, 'STD-66', 'STD-66', 'Ledif', 'Pryce', 'Rye', NULL, NULL, NULL, NULL, 'markpryce15@gmail.com', '$2y$10$GCbRorUI79Yxs0r6WAYcwObBc9nZAmxiXWKmKNpYRW0W3Q7r/erQq', 'Student', 5, NULL, '2025-07-07 07:39:13', 0, NULL),
(26, 'TCR-2', 'TCR-2', 'Arwin Jayson', 'Aringo', 'Villa', NULL, NULL, NULL, NULL, 'villa.aj13@gmail.com', '$2y$10$UkCAiBRZ6J17WW2iAEMoQeWDMY7bZTg/25.JfZqOWSX/MmWVHqyIS', 'Teacher', NULL, NULL, '2025-07-07 11:57:53', 0, NULL),
(27, 'STD-28', 'STD-28', 'Daniel', 'Kwan', 'Thompson', NULL, NULL, NULL, NULL, 'kwan@gmail.com', '$2y$10$TbXxCXzzpxZOqXpaFG5vqeqwGWyAsjb32SuhwbMw23en1UuyP3J8q', 'Student', 26, NULL, '2025-07-07 12:01:09', 0, NULL),
(28, 'TCR-3', 'TCR-3', 'Renz', NULL, 'Kevin', NULL, NULL, NULL, NULL, 'dqwdadasdaASd@gmail.com', '$2y$10$BjRRX5SuNDUh6Yj9HtB7cewW4vmOyD0pktqduT3jAzaaazp2cPEeG', 'Teacher', NULL, NULL, '2025-07-07 15:09:54', 1, '2025-07-07 15:10:32'),
(42, 'STD-42', 'STD-42', 'test', 'test', 'test', 'Male', '2002-12-12', 22, '12', 'STD-42@placeholder.com', '$2y$10$xfBS4yelLD3c9PqmtqY1SeFyaqM.q2OBUCTBVup2j/S2o0eO.Oqam', 'Student', 5, NULL, '2025-07-16 10:10:03', 0, NULL);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=822;

--
-- AUTO_INCREMENT for table `passages`
--
ALTER TABLE `passages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

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
