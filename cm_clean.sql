-- MySQL dump 10.13  Distrib 8.0.41, for FreeBSD14.2 (amd64)
--
-- Host: localhost    Database: community_mapper
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
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--


--
-- Current Database: `community_mapper`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `community_mapper` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `community_mapper`;

--
-- Table structure for table `media_participants`
--

DROP TABLE IF EXISTS `media_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `media_id` int NOT NULL,
  `participant_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_participants` (`media_id`),
  CONSTRAINT `media_participants_ibfk_1` FOREIGN KEY (`media_id`) REFERENCES `person_media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_participants`
--

LOCK TABLES `media_participants` WRITE;
/*!40000 ALTER TABLE `media_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_tags`
--

DROP TABLE IF EXISTS `media_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `media_id` int NOT NULL,
  `tag` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_tags` (`media_id`),
  KEY `idx_tag` (`tag`),
  CONSTRAINT `media_tags_ibfk_1` FOREIGN KEY (`media_id`) REFERENCES `person_media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_tags`
--

LOCK TABLES `media_tags` WRITE;
/*!40000 ALTER TABLE `media_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `party_affiliates`
--

DROP TABLE IF EXISTS `party_affiliates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `party_affiliates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city` varchar(100) NOT NULL,
  `state` varchar(2) DEFAULT 'RS',
  `party` varchar(50) NOT NULL,
  `age_group` varchar(50) DEFAULT NULL,
  `count` int NOT NULL DEFAULT '0',
  `total_by_party` int DEFAULT '0',
  `reference_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city_party` (`city`,`party`),
  KEY `idx_party` (`party`),
  KEY `idx_age_group` (`age_group`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `party_affiliates`
--

LOCK TABLES `party_affiliates` WRITE;
/*!40000 ALTER TABLE `party_affiliates` DISABLE KEYS */;
INSERT INTO `party_affiliates` VALUES (1,'GRAMADO','RS','PP',NULL,0,3045,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(2,'GRAMADO','RS','MDB',NULL,0,876,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(3,'GRAMADO','RS','PSDB',NULL,0,678,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(4,'GRAMADO','RS','PRD',NULL,0,332,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(5,'GRAMADO','RS','PDT',NULL,0,323,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(6,'GRAMADO','RS','REPUBLICANOS',NULL,0,241,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(7,'GRAMADO','RS','UNIÃO',NULL,0,235,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(8,'GRAMADO','RS','PL',NULL,0,180,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(9,'GRAMADO','RS','PSD',NULL,0,164,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(10,'GRAMADO','RS','PT',NULL,0,164,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(11,'GRAMADO','RS','PODE',NULL,0,125,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(12,'GRAMADO','RS','PSB',NULL,0,112,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(13,'GRAMADO','RS','DC',NULL,0,74,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(14,'GRAMADO','RS','PCdoB',NULL,0,72,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(15,'GRAMADO','RS','AGIR',NULL,0,41,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(16,'GRAMADO','RS','PV',NULL,0,40,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(17,'GRAMADO','RS','NOVO',NULL,0,19,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(18,'GRAMADO','RS','CIDADANIA',NULL,0,15,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(19,'GRAMADO','RS','PSOL',NULL,0,11,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(20,'GRAMADO','RS','REDE',NULL,0,7,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(21,'GRAMADO','RS','SOLIDARIEDADE',NULL,0,7,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(22,'GRAMADO','RS','AVANTE',NULL,0,3,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(23,'GRAMADO','RS','MOBILIZA',NULL,0,3,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(24,'GRAMADO','RS','PCO',NULL,0,1,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(25,'GRAMADO','RS','PMB',NULL,0,1,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(26,'GRAMADO','RS','PRTB',NULL,0,1,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(27,'GRAMADO','RS','UP',NULL,0,1,'2024-10-04','2025-06-16 23:57:01','2025-06-16 23:57:01'),(28,'GRAMADO','RS','MDB','16 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(29,'GRAMADO','RS','PP','16 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(30,'GRAMADO','RS','PL','17 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(31,'GRAMADO','RS','PP','17 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(32,'GRAMADO','RS','NOVO','18 a 20 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(33,'GRAMADO','RS','PL','18 a 20 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(34,'GRAMADO','RS','PODE','18 a 20 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(35,'GRAMADO','RS','PP','18 a 20 anos',49,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(36,'GRAMADO','RS','AGIR','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(37,'GRAMADO','RS','DC','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(38,'GRAMADO','RS','MDB','21 a 24 anos',8,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(39,'GRAMADO','RS','NOVO','21 a 24 anos',4,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(40,'GRAMADO','RS','PCdoB','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(41,'GRAMADO','RS','PDT','21 a 24 anos',4,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(42,'GRAMADO','RS','PL','21 a 24 anos',7,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(43,'GRAMADO','RS','PODE','21 a 24 anos',5,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(44,'GRAMADO','RS','PP','21 a 24 anos',68,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(45,'GRAMADO','RS','PRD','21 a 24 anos',5,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(46,'GRAMADO','RS','PSB','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(47,'GRAMADO','RS','PSD','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(48,'GRAMADO','RS','PSDB','21 a 24 anos',9,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(49,'GRAMADO','RS','PSOL','21 a 24 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(50,'GRAMADO','RS','PT','21 a 24 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(51,'GRAMADO','RS','REPUBLICANOS','21 a 24 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(52,'GRAMADO','RS','UNIÃO','21 a 24 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(53,'GRAMADO','RS','AGIR','25 a 34 anos',6,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(54,'GRAMADO','RS','AVANTE','25 a 34 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(55,'GRAMADO','RS','CIDADANIA','25 a 34 anos',5,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(56,'GRAMADO','RS','DC','25 a 34 anos',14,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(57,'GRAMADO','RS','MDB','25 a 34 anos',87,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(58,'GRAMADO','RS','MOBILIZA','25 a 34 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(59,'GRAMADO','RS','NOVO','25 a 34 anos',9,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(60,'GRAMADO','RS','PCdoB','25 a 34 anos',12,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(61,'GRAMADO','RS','PDT','25 a 34 anos',22,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(62,'GRAMADO','RS','PL','25 a 34 anos',29,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(63,'GRAMADO','RS','PODE','25 a 34 anos',18,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(64,'GRAMADO','RS','PP','25 a 34 anos',445,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(65,'GRAMADO','RS','PRD','25 a 34 anos',29,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(66,'GRAMADO','RS','PSB','25 a 34 anos',12,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(67,'GRAMADO','RS','PSD','25 a 34 anos',11,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(68,'GRAMADO','RS','PSDB','25 a 34 anos',69,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(69,'GRAMADO','RS','PSOL','25 a 34 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(70,'GRAMADO','RS','PT','25 a 34 anos',17,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(71,'GRAMADO','RS','PV','25 a 34 anos',5,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(72,'GRAMADO','RS','REDE','25 a 34 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(73,'GRAMADO','RS','REPUBLICANOS','25 a 34 anos',21,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(74,'GRAMADO','RS','SOLIDARIEDADE','25 a 34 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(75,'GRAMADO','RS','UNIÃO','25 a 34 anos',13,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(76,'GRAMADO','RS','AGIR','35 a 44 anos',11,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(77,'GRAMADO','RS','CIDADANIA','35 a 44 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(78,'GRAMADO','RS','DC','35 a 44 anos',17,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(79,'GRAMADO','RS','MDB','35 a 44 anos',186,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(80,'GRAMADO','RS','MOBILIZA','35 a 44 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(81,'GRAMADO','RS','NOVO','35 a 44 anos',4,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(82,'GRAMADO','RS','PCdoB','35 a 44 anos',15,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(83,'GRAMADO','RS','PDT','35 a 44 anos',64,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(84,'GRAMADO','RS','PL','35 a 44 anos',39,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(85,'GRAMADO','RS','PMB','35 a 44 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(86,'GRAMADO','RS','PODE','35 a 44 anos',29,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(87,'GRAMADO','RS','PP','35 a 44 anos',869,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(88,'GRAMADO','RS','PRD','35 a 44 anos',67,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(89,'GRAMADO','RS','PSB','35 a 44 anos',24,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(90,'GRAMADO','RS','PSD','35 a 44 anos',30,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(91,'GRAMADO','RS','PSDB','35 a 44 anos',135,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(92,'GRAMADO','RS','PSOL','35 a 44 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(93,'GRAMADO','RS','PT','35 a 44 anos',29,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(94,'GRAMADO','RS','PV','35 a 44 anos',12,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(95,'GRAMADO','RS','REDE','35 a 44 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(96,'GRAMADO','RS','REPUBLICANOS','35 a 44 anos',46,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(97,'GRAMADO','RS','SOLIDARIEDADE','35 a 44 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(98,'GRAMADO','RS','UNIÃO','35 a 44 anos',45,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(99,'GRAMADO','RS','AGIR','45 a 59 anos',17,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(100,'GRAMADO','RS','AVANTE','45 a 59 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(101,'GRAMADO','RS','CIDADANIA','45 a 59 anos',4,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(102,'GRAMADO','RS','DC','45 a 59 anos',27,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(103,'GRAMADO','RS','MDB','45 a 59 anos',336,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(104,'GRAMADO','RS','NOVO','45 a 59 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(105,'GRAMADO','RS','PCdoB','45 a 59 anos',29,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(106,'GRAMADO','RS','PCO','45 a 59 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(107,'GRAMADO','RS','PDT','45 a 59 anos',127,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(108,'GRAMADO','RS','PL','45 a 59 anos',56,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(109,'GRAMADO','RS','PODE','45 a 59 anos',45,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(110,'GRAMADO','RS','PP','45 a 59 anos',1177,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(111,'GRAMADO','RS','PRD','45 a 59 anos',124,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(112,'GRAMADO','RS','PRTB','45 a 59 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(113,'GRAMADO','RS','PSB','45 a 59 anos',44,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(114,'GRAMADO','RS','PSD','45 a 59 anos',68,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(115,'GRAMADO','RS','PSDB','45 a 59 anos',268,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(116,'GRAMADO','RS','PSOL','45 a 59 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(117,'GRAMADO','RS','PT','45 a 59 anos',68,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(118,'GRAMADO','RS','PV','45 a 59 anos',12,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(119,'GRAMADO','RS','REDE','45 a 59 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(120,'GRAMADO','RS','REPUBLICANOS','45 a 59 anos',89,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(121,'GRAMADO','RS','SOLIDARIEDADE','45 a 59 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(122,'GRAMADO','RS','UNIÃO','45 a 59 anos',95,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(123,'GRAMADO','RS','UP','45 a 59 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(124,'GRAMADO','RS','AGIR','60 a 69 anos',6,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(125,'GRAMADO','RS','CIDADANIA','60 a 69 anos',3,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(126,'GRAMADO','RS','DC','60 a 69 anos',10,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(127,'GRAMADO','RS','MDB','60 a 69 anos',222,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(128,'GRAMADO','RS','MOBILIZA','60 a 69 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(129,'GRAMADO','RS','PCdoB','60 a 69 anos',13,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(130,'GRAMADO','RS','PDT','60 a 69 anos',89,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(131,'GRAMADO','RS','PL','60 a 69 anos',33,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(132,'GRAMADO','RS','PODE','60 a 69 anos',25,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(133,'GRAMADO','RS','PP','60 a 69 anos',336,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(134,'GRAMADO','RS','PRD','60 a 69 anos',86,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(135,'GRAMADO','RS','PSB','60 a 69 anos',23,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(136,'GRAMADO','RS','PSD','60 a 69 anos',37,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(137,'GRAMADO','RS','PSDB','60 a 69 anos',123,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(138,'GRAMADO','RS','PSOL','60 a 69 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(139,'GRAMADO','RS','PT','60 a 69 anos',38,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(140,'GRAMADO','RS','PV','60 a 69 anos',9,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(141,'GRAMADO','RS','REDE','60 a 69 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(142,'GRAMADO','RS','REPUBLICANOS','60 a 69 anos',64,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(143,'GRAMADO','RS','SOLIDARIEDADE','60 a 69 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(144,'GRAMADO','RS','UNIÃO','60 a 69 anos',53,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(145,'GRAMADO','RS','DC','70 a 79 anos',5,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(146,'GRAMADO','RS','MDB','70 a 79 anos',113,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(147,'GRAMADO','RS','PCdoB','70 a 79 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(148,'GRAMADO','RS','PDT','70 a 79 anos',47,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(149,'GRAMADO','RS','PL','70 a 79 anos',15,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(150,'GRAMADO','RS','PODE','70 a 79 anos',6,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(151,'GRAMADO','RS','PP','70 a 79 anos',184,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(152,'GRAMADO','RS','PRD','70 a 79 anos',36,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(153,'GRAMADO','RS','PSB','70 a 79 anos',8,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(154,'GRAMADO','RS','PSD','70 a 79 anos',15,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(155,'GRAMADO','RS','PSDB','70 a 79 anos',63,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(156,'GRAMADO','RS','PT','70 a 79 anos',7,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(157,'GRAMADO','RS','PV','70 a 79 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(158,'GRAMADO','RS','REPUBLICANOS','70 a 79 anos',15,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(159,'GRAMADO','RS','UNIÃO','70 a 79 anos',25,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(160,'GRAMADO','RS','MDB','Superior a 79 anos',23,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(161,'GRAMADO','RS','PDT','Superior a 79 anos',10,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(162,'GRAMADO','RS','PL','Superior a 79 anos',6,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(163,'GRAMADO','RS','PP','Superior a 79 anos',80,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(164,'GRAMADO','RS','PRD','Superior a 79 anos',10,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(165,'GRAMADO','RS','PSD','Superior a 79 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(166,'GRAMADO','RS','PSDB','Superior a 79 anos',11,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(167,'GRAMADO','RS','PT','Superior a 79 anos',1,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(168,'GRAMADO','RS','REPUBLICANOS','Superior a 79 anos',4,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24'),(169,'GRAMADO','RS','UNIÃO','Superior a 79 anos',2,0,'2024-10-04','2025-06-17 00:14:24','2025-06-17 00:14:24');
/*!40000 ALTER TABLE `party_affiliates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `people` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('M','F','N') DEFAULT 'N',
  `context` varchar(50) DEFAULT NULL,
  `proximity` varchar(50) DEFAULT NULL,
  `importance` int DEFAULT '3',
  `trust_level` int DEFAULT '3',
  `influence_level` int DEFAULT '3',
  `occupation` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `professional_class` varchar(255) DEFAULT NULL,
  `education_level` enum('fundamental','medio','superior','pos_graduacao') DEFAULT NULL,
  `income_range` enum('ate_2k','2k_5k','5k_10k','10k_20k','acima_20k') DEFAULT NULL,
  `political_party` varchar(100) DEFAULT NULL,
  `political_position` enum('esquerda','centro_esquerda','centro','centro_direita','direita') DEFAULT NULL,
  `is_candidate` tinyint(1) DEFAULT '0',
  `is_elected` tinyint(1) DEFAULT '0',
  `political_role` varchar(255) DEFAULT NULL,
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
  `photo_url` varchar(500) DEFAULT NULL COMMENT 'URL da foto da pessoa',
  `last_contact` date DEFAULT NULL,
  `contact_frequency` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `neighborhood` varchar(100) DEFAULT NULL COMMENT 'Bairro da pessoa',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_context` (`context`),
  KEY `idx_proximity` (`proximity`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
INSERT INTO `people` VALUES (1,9,'Rodrigo de Oliveira Pazetto','Pazetto',NULL,'N','institucional','nucleo',5,5,5,'Médico Oftalmologista','Clínica Oftalmológica','Diretor Médico','saude_medicina',NULL,NULL,'NOVO',NULL,1,0,'Coordenador Político','(54) 3286-0530','(54) 99102-1681','pazetto@gmail.com',NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,'Usuário principal do sistema - Coordenador político',NULL,NULL,NULL,'2025-06-22 15:46:24','2025-06-22 15:46:24','Centro'),(2,8,'Bruno Irion Coletto','Bruno',NULL,'N','institucional','nucleo',5,3,3,'Advogado','Pons e Colleto','diretor e professor','direito_justica',NULL,NULL,'PP',NULL,0,0,NULL,NULL,'54 89971234','bruno@exemplo.com',NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_2_1750602222788.webp',NULL,'daily','2025-06-16 22:03:49','2025-06-22 23:19:40','Condominio Lagos de Gramado'),(4,8,'Felipe Prawer Peccin','Felipe',NULL,'N','institucional','nucleo',5,3,3,'Empresário','Grupo Casa','CEO','hospitalidade_alimentacao',NULL,NULL,'NOVO',NULL,0,0,NULL,NULL,'54 999057055',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_4_1750602253351.webp',NULL,'weekly','2025-06-17 15:21:24','2025-06-22 23:23:10','Condomínio Residencial Aspen Mountain'),(5,8,'Georgeana Deppe','Gica',NULL,'N','institucional','nucleo',5,3,3,'Professor de Ensino Médio','Marista','Professora','educacao_pesquisa',NULL,NULL,'NOVO',NULL,0,0,NULL,NULL,'54 91799801',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_5_1750602649266.jpeg',NULL,'weekly','2025-06-17 15:29:42','2025-06-22 14:30:49',NULL),(7,8,'Miguel Soria','Miguel',NULL,'N','institucional','nucleo',5,3,3,'Engenheiro Civil','Comitê Brasileiro de Barragens - CBDB','Presidente','engenharia_arquitetura',NULL,NULL,'NOVO',NULL,0,0,NULL,NULL,'54 99914261',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_7_1750602273266.jpeg',NULL,'weekly','2025-06-19 22:50:52','2025-06-22 23:24:27','Condomínio Residencial Aspen Mountain'),(8,8,'Luiz Guilherme Steffens','Pio',NULL,'N','institucional','nucleo',5,3,3,'Advogado','Dambros Associados','Socio Diretor','direito_justica',NULL,NULL,'NOVO',NULL,0,0,NULL,NULL,'54 84323136',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_8_1750602207667.webp',NULL,'weekly','2025-06-19 22:52:03','2025-06-22 14:23:27',NULL),(9,8,'Ricardo Raymundi','Raymundi',NULL,'N','profissional','terceiro',3,3,3,'Médico Clínico Geral',NULL,'Dietor','saude_medicina',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_9_1750602662467.webp',NULL,'quarterly','2025-06-20 12:23:13','2025-06-22 14:31:02',NULL),(10,8,'Bernardo Tomazelli','Bernardo',NULL,'N','institucional','segundo',4,3,3,'Engenheiro Civil','Tomazelli Engenharia','Diretor','engenharia_arquitetura',NULL,NULL,NULL,NULL,0,0,NULL,NULL,'54 984057445',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_10_1750601278114.webp',NULL,NULL,'2025-06-20 12:43:21','2025-06-22 14:07:58',NULL),(11,8,'Josiano Schmidt','Josiano',NULL,'N','institucional','segundo',4,3,3,'Empresário','Catherine, DiPietro, Malbek','Diretor','hospitalidade_alimentacao',NULL,NULL,NULL,NULL,0,0,NULL,NULL,'54 981140200',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_11_1750601394859.webp',NULL,NULL,'2025-06-20 12:55:10','2025-06-22 23:24:13','Condomínio Buena Vista'),(12,8,'Pedro Andreis ','Pedrão',NULL,'N','institucional','segundo',4,3,3,'Empresário','Nonno MIo, Circolo Trentino','Presidente','hospitalidade_alimentacao',NULL,NULL,NULL,NULL,0,0,NULL,NULL,'54 9998 8753',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_12_1750601348313.webp',NULL,NULL,'2025-06-20 13:01:04','2025-06-22 14:09:08',NULL),(13,8,'Felipe Fiorezze','Felipe',NULL,'N','institucional','segundo',4,3,3,'Empresário','Convention Bureau','Presidente','hospitalidade_alimentacao',NULL,NULL,NULL,NULL,0,0,NULL,NULL,'54 99638494',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_13_1750602234231.webp',NULL,NULL,'2025-06-20 13:04:16','2025-06-22 14:23:54',NULL),(14,8,'Carol Fiorezze','Carol',NULL,'N','social','quarto',4,3,3,'Empresário','Fiorezze Hoteis','Diretora','hospitalidade_alimentacao',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_14_1750601564035.webp',NULL,'yearly','2025-06-20 13:07:08','2025-06-22 14:12:44',NULL),(15,8,'Jorge Maldaner','Jorge',NULL,'N','institucional','segundo',4,3,3,'Contador','MDR Gestao','Diretor','administracao_negocios',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_15_1750601336698.webp',NULL,'weekly','2025-06-20 13:08:45','2025-06-22 14:08:56',NULL),(16,8,'Carla Reckers','Dra Carla',NULL,'N','profissional','terceiro',3,3,3,'Médico Anestesista','HASM','Medica','saude_medicina',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_16_1750602591082.webp',NULL,'monthly','2025-06-20 13:17:32','2025-06-22 23:19:57','Condomínio Saint Morit'),(17,8,'Marcus Maihub','Marcus',NULL,'N','social','quarto',3,3,3,'Empresário',NULL,'Diretor','tecnologia_informatica',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_17_1750602935936.jpeg',NULL,NULL,'2025-06-20 13:18:45','2025-06-22 14:35:36',NULL),(18,8,'Daniel ','Professor Daniel',NULL,'N','politico','primeiro',4,3,3,'Professor de Ensino Médio',NULL,NULL,'educacao_pesquisa',NULL,NULL,'PSDB',NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_18_1750601448065.webp',NULL,NULL,'2025-06-20 13:20:30','2025-06-22 23:23:29','Piratini'),(19,8,'Alexandre Moroso','Moroso',NULL,'N','social','nucleo',5,3,3,'Empresário','Sierra','Diretor','comercio_exterior',NULL,NULL,'NOVO',NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_19_1750601267303.webp',NULL,NULL,'2025-06-20 13:24:42','2025-06-22 14:07:47','Saint Moritz'),(20,8,'Celso Fiorezze','Celso',NULL,'N','politico','primeiro',4,3,3,'Empresário','Fiorezze Hoteis','Diretor','hospitalidade_alimentacao',NULL,NULL,'PSDB',NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_20_1750601464298.webp',NULL,NULL,'2025-06-20 13:27:47','2025-06-22 14:11:04',NULL),(21,8,'Domingos Muller','Domi',NULL,'N','social','terceiro',3,3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_21_1750602603483.webp',NULL,'quarterly','2025-06-20 13:30:02','2025-06-22 14:30:03',NULL),(22,8,'Cristiano Berti','Cris Berti',NULL,'N','social','segundo',4,3,3,'Empresário','Villa Berti','Diretor','religiao_espiritualidade',NULL,NULL,NULL,NULL,0,0,NULL,NULL,'54 98111 5355',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_22_1750601476668.webp','2025-06-23','monthly','2025-06-20 21:43:35','2025-06-23 00:47:27','Condomínio O Bosque'),(23,8,'Francisco Rafael Carniel','Rafa Carniel',NULL,'N','institucional','terceiro',4,3,3,'Analista de Business Intelligence','Unboxing','Diretor','hospitalidade_alimentacao',NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_23_1750601414731.webp',NULL,'monthly','2025-06-20 21:45:55','2025-06-22 14:10:14',NULL),(24,8,'Volnei Desian','Volnei da Saúde',NULL,'N','politico','primeiro',3,3,3,'Servidor Público Municipal',NULL,NULL,'saude_medicina',NULL,NULL,'PP',NULL,0,0,NULL,NULL,'54 96375307',NULL,NULL,'Gramado','RS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/photos/person_24_1750602307106.webp',NULL,NULL,'2025-06-21 11:54:51','2025-06-22 14:25:07',NULL);
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_media`
--

DROP TABLE IF EXISTS `person_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('audio','video','mindmap','document','image','meeting') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `file_url` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT '0',
  `is_favorite` tinyint(1) DEFAULT '0',
  `transcript` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_person_media` (`person_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`date`),
  CONSTRAINT `person_media_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_media_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_media`
--

LOCK TABLES `person_media` WRITE;
/*!40000 ALTER TABLE `person_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_relationships`
--

DROP TABLE IF EXISTS `person_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_relationships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_a_id` int NOT NULL,
  `person_b_id` int NOT NULL,
  `relationship_type` varchar(50) NOT NULL,
  `strength` int DEFAULT '3',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`person_a_id`,`person_b_id`),
  KEY `person_b_id` (`person_b_id`),
  CONSTRAINT `person_relationships_ibfk_1` FOREIGN KEY (`person_a_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_relationships_ibfk_2` FOREIGN KEY (`person_b_id`) REFERENCES `people` (`id`) ON DELETE CASCADE,
  CONSTRAINT `no_self_relationship` CHECK ((`person_a_id` <> `person_b_id`)),
  CONSTRAINT `ordered_ids` CHECK ((`person_a_id` < `person_b_id`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_relationships`
--

LOCK TABLES `person_relationships` WRITE;
/*!40000 ALTER TABLE `person_relationships` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_per_user` (`user_id`,`name`),
  KEY `idx_user_tags` (`user_id`),
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
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,'admin@example.com','$2b$10$G4bmquofBWKTnGxU3GDBAuQdmwVSuaNwwnu0mX53I3EAPLHggNOAu','Admin','2025-06-16 15:38:03','2025-06-20 16:14:51'),(9,'super.admin@mapacomunidade.com','$2b$10$kokUZeEbhx1Ge0CewC624eO3hExv8Q1JSlLgXHO6z4lGtAb1UlqUK','Super Administrador','2025-06-20 14:35:44','2025-06-20 22:42:15'),(10,'gerente.sistema@comunidademapa.org','$2b$10$BsCM5r.wJ5.xhIoTA32ObecXkOIuGbzWi8/BpQMiqX0JC7WTTkA5y','Gerente do Sistema','2025-06-20 14:37:19','2025-06-20 22:42:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'community_mapper'
--

--
-- Dumping routines for database 'community_mapper'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-04  7:53:31
