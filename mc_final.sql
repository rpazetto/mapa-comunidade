-- MySQL dump 10.13  Distrib 8.0.41, for FreeBSD14.2 (amd64)
--
-- Host: localhost    Database: mapa_comunidade
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;

--
-- GTID state at the beginning of the backup 
--


--
-- Current Database: `mapa_comunidade`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mapa_comunidade` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `mapa_comunidade`;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('partido_politico','igreja','clube','associacao','empresa','familia','amigos','projeto','comite','outros') NOT NULL,
  `description` text,
  `leader_person_id` varchar(36) DEFAULT NULL,
  `meeting_frequency` varchar(100) DEFAULT NULL,
  `meeting_location` text,
  `is_active` tinyint(1) DEFAULT '1',
  `member_count` int DEFAULT '0',
  `influence_level` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `leader_person_id` (`leader_person_id`),
  KEY `idx_group_type` (`type`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`leader_person_id`) REFERENCES `people` (`id`) ON DELETE SET NULL,
  CONSTRAINT `groups_chk_1` CHECK (((`influence_level` >= 1) and (`influence_level` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interactions`
--

DROP TABLE IF EXISTS `interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interactions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `person_id` varchar(36) NOT NULL,
  `type` enum('encontro','ligacao','mensagem','email','reuniao','evento') NOT NULL,
  `date` datetime NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `outcome` text,
  `next_action` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_person_date` (`person_id`,`date`),
  KEY `idx_date` (`date`),
  CONSTRAINT `interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interactions_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interactions`
--

LOCK TABLES `interactions` WRITE;
/*!40000 ALTER TABLE `interactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `people` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','O','N') DEFAULT 'N',
  `context` enum('residencial','profissional','social','servicos','institucional','politico') NOT NULL,
  `proximity` enum('nucleo','primeiro','segundo','terceiro','periferia') NOT NULL,
  `importance` int DEFAULT '3',
  `trust_level` int DEFAULT '3',
  `influence_level` int DEFAULT '3',
  `occupation` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `professional_class` varchar(100) DEFAULT NULL,
  `education_level` enum('fundamental','medio','superior','pos_graduacao','mestrado','doutorado') DEFAULT NULL,
  `income_range` enum('A','B','C','D','E') DEFAULT NULL,
  `political_party` varchar(50) DEFAULT NULL,
  `political_position` enum('extrema_esquerda','esquerda','centro_esquerda','centro','centro_direita','direita','extrema_direita') DEFAULT NULL,
  `is_candidate` tinyint(1) DEFAULT '0',
  `is_elected` tinyint(1) DEFAULT '0',
  `political_role` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(2) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `notes` text,
  `last_contact` date DEFAULT NULL,
  `contact_frequency` enum('daily','weekly','monthly','quarterly','yearly') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_context` (`context`),
  KEY `idx_proximity` (`proximity`),
  KEY `idx_political_party` (`political_party`),
  KEY `idx_professional_class` (`professional_class`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `people_chk_1` CHECK (((`importance` >= 1) and (`importance` <= 5))),
  CONSTRAINT `people_chk_2` CHECK (((`trust_level` >= 1) and (`trust_level` <= 5))),
  CONSTRAINT `people_chk_3` CHECK (((`influence_level` >= 1) and (`influence_level` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
INSERT INTO `people` VALUES ('781de07f-719c-433b-bbdb-063959b4df83','8cc80a23-4a0d-11f0-b4b5-94de80f3f8fb','Rodrigo de Oliveira Pazetto','digo',NULL,'N','institucional','nucleo',3,3,3,'medico','Gramado Clinica de Olhos','diretor','medico',NULL,NULL,'novo',NULL,0,0,NULL,NULL,'54991021681','pazetto@gmail.com',NULL,'Gramado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1976-08-01','daily','2025-06-15 18:57:41','2025-06-15 18:57:41'),('ca19f256-4e22-11f0-b842-94de80f3f8fb','fe3201ca-4e21-11f0-b842-94de80f3f8fb','Rodrigo de Oliveira Pazetto','digo',NULL,'N','institucional','nucleo',3,3,3,'medico','Gramado Clinica de Olhos','diretor','medico',NULL,NULL,'novo',NULL,0,0,NULL,NULL,'54991021681','pazetto@gmail.com',NULL,'Gramado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1976-08-01','daily','2025-06-20 22:06:17','2025-06-20 22:06:17');
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_groups`
--

DROP TABLE IF EXISTS `person_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_groups` (
  `id` varchar(36) NOT NULL,
  `person_id` varchar(36) NOT NULL,
  `group_id` varchar(36) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `joined_date` date DEFAULT NULL,
  `left_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `influence_in_group` int DEFAULT '3',
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_person_group` (`person_id`,`group_id`),
  KEY `idx_person` (`person_id`),
  KEY `idx_group` (`group_id`),
  CONSTRAINT `person_groups_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_groups_chk_1` CHECK (((`influence_in_group` >= 1) and (`influence_in_group` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_groups`
--

LOCK TABLES `person_groups` WRITE;
/*!40000 ALTER TABLE `person_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `person_network_stats`
--

DROP TABLE IF EXISTS `person_network_stats`;
/*!50001 DROP VIEW IF EXISTS `person_network_stats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `person_network_stats` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `context`,
 1 AS `proximity`,
 1 AS `connections_count`,
 1 AS `groups_count`,
 1 AS `tags_count`,
 1 AS `interactions_count`,
 1 AS `last_interaction`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `person_relationships`
--

DROP TABLE IF EXISTS `person_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_relationships` (
  `id` varchar(36) NOT NULL,
  `person_a_id` varchar(36) NOT NULL,
  `person_b_id` varchar(36) NOT NULL,
  `relationship_type` enum('familiar','amigo','profissional','politico','religioso','vizinho','servico','mentor','adversario') NOT NULL,
  `relationship_subtype` varchar(100) DEFAULT NULL,
  `strength` int DEFAULT '3',
  `started_date` date DEFAULT NULL,
  `ended_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`person_a_id`,`person_b_id`,`relationship_type`),
  KEY `idx_person_a` (`person_a_id`),
  KEY `idx_person_b` (`person_b_id`),
  KEY `idx_relationship_type` (`relationship_type`),
  CONSTRAINT `person_relationships_ibfk_1` FOREIGN KEY (`person_a_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_relationships_ibfk_2` FOREIGN KEY (`person_b_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_relationships_chk_1` CHECK (((`strength` >= 1) and (`strength` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_relationships`
--

LOCK TABLES `person_relationships` WRITE;
/*!40000 ALTER TABLE `person_relationships` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_tags`
--

DROP TABLE IF EXISTS `person_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_tags` (
  `person_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  PRIMARY KEY (`person_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `person_tags_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_tags`
--

LOCK TABLES `person_tags` WRITE;
/*!40000 ALTER TABLE `person_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_user` (`name`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0452af22-4e22-11f0-b842-94de80f3f8fb','gerente.sistema@comunidademapa.org','Gerente do Sistema','$2b$10$BsCM5r.wJ5.xhIoTA32ObecXkOIuGbzWi8/BpQMiqX0JC7WTTkA5y','2025-06-20 22:00:45','2025-06-20 22:00:45'),('8cc80a23-4a0d-11f0-b4b5-94de80f3f8fb','rodrigo@example.com','Rodrigo','$2b$10$.cv0dnfsBGLfNlQZZRtx9.OzsNe45ElN6ROeUZF9.d7o0vltplKva','2025-06-15 17:24:10','2025-06-15 18:28:46'),('fe3201ca-4e21-11f0-b842-94de80f3f8fb','super.admin@mapacomunidade.com','Super Administrador','$2b$10$kokUZeEbhx1Ge0CewC624eO3hExv8Q1JSlLgXHO6z4lGtAb1UlqUK','2025-06-20 22:00:35','2025-06-20 22:00:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'mapa_comunidade'
--

--
-- Dumping routines for database 'mapa_comunidade'
--

--
-- Current Database: `mapa_comunidade`
--

USE `mapa_comunidade`;

--
-- Final view structure for view `person_network_stats`
--

/*!50001 DROP VIEW IF EXISTS `person_network_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`rodrigo`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `person_network_stats` AS select `p`.`id` AS `id`,`p`.`name` AS `name`,`p`.`context` AS `context`,`p`.`proximity` AS `proximity`,count(distinct `pr1`.`person_b_id`) AS `connections_count`,count(distinct `pg`.`group_id`) AS `groups_count`,count(distinct `pt`.`tag_id`) AS `tags_count`,count(distinct `i`.`id`) AS `interactions_count`,max(`i`.`date`) AS `last_interaction` from ((((`people` `p` left join `person_relationships` `pr1` on((`p`.`id` = `pr1`.`person_a_id`))) left join `person_groups` `pg` on(((`p`.`id` = `pg`.`person_id`) and (`pg`.`is_active` = true)))) left join `person_tags` `pt` on((`p`.`id` = `pt`.`person_id`))) left join `interactions` `i` on((`p`.`id` = `i`.`person_id`))) group by `p`.`id`,`p`.`name`,`p`.`context`,`p`.`proximity` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-04  7:53:47
