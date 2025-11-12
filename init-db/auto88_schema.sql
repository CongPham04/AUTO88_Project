-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: car_sales_db
-- ------------------------------------------------------
-- Server version	9.1.0

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

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `account_id` varchar(36) NOT NULL,
  `create_at` datetime(6) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  `status` enum('ACTIVE','BANNED','INACTIVE') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `uk_accounts_username` (`username`),
  UNIQUE KEY `uk_accounts_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('0a0cac99-c182-43ab-8cdc-b9ce1bb11e99','2025-10-08 17:13:59.187393','newadmin777@example.com','$2a$10$tu/wdngC.XYjCeB8dHXLMOfaCCO1K2W5Zk6tOAeU85s2scb1qsTo2','ADMIN','ACTIVE','2025-10-08 17:13:59.187393','newadmin777'),('2212b656-05bc-4065-ab76-3021621e9208','2025-10-11 22:20:37.918829',NULL,'$2a$10$YVUf2P/lLlJqR8YsGaZ1huJI9wHDQ8YcjCgH2hat9qrz4ZIhiqCVu','USER','ACTIVE','2025-10-11 22:20:37.918829','Lò văn tèn'),('26db8794-9a42-481d-8674-0f582e8d880a','2025-10-01 16:15:27.068148',NULL,'$2a$10$AzquBZUgAtZGRCavTKyQMOkEFxNfJJHHoJ3880mJLwm.Q0EKboen.','USER','ACTIVE','2025-10-01 16:15:27.068148','cong'),('2a8903ce-64d3-4af6-a5ca-20a34a0523e0','2025-10-11 18:49:37.347978','124@gmail.vn','$2a$10$JHIdc2aIHR4Jfik.bCN6aehhss2wi94luzAG6VZeMSWPIr4D2f2Nq','ADMIN','ACTIVE','2025-10-12 02:02:07.839818','admin'),('2ffefe7a-18d2-4f54-9cc3-81220b972147','2025-10-08 16:36:27.462621','testadmin888@example.com','$2a$10$Vd8o06dTvwRre99NksHZyeuTshUQsNEoj5P9xW3enAWCcHQr/qCT2','ADMIN','ACTIVE','2025-10-08 18:12:06.646814','testadmin888'),('4a679774-240a-4c6f-b759-6b40fd1f6182','2025-10-11 22:22:00.802415','he@gmail.com','$2a$10$MRo6N0arYTK3ehEus/yei.zRK/6tUTsbKhOoVBNeslX/IS1vFfvEm','USER','ACTIVE','2025-10-12 03:07:50.702836','123'),('549676f4-3f85-499e-8129-5e67201799ac','2025-10-08 14:55:23.950892',NULL,'$2a$10$m8AAl4HtCEDtsQfldp5t7.yT7rAK6oFX4Re6na545w4i6PN5.1Q.O','USER','ACTIVE','2025-10-08 14:55:23.950892','hello'),('5d489875-4098-4308-a171-963b6d83b40f','2025-10-08 16:24:15.118244','test999@example.com','$2a$10$/FZQt5nPc9WgHDcQxCHePOUtp312VSTmSAPtReMH4imEdZXCJtXUa','USER','ACTIVE','2025-10-08 16:24:15.118244','testuser999'),('65e1d309-3b21-42fa-90ea-a55287e5464e','2025-10-08 16:27:09.391086','be2nv@yahoo.com','$2a$10$Vx8PiPO2CpWYU38y4hfML.MtWa6IgK/CAGfB1lH5tUlJkmAwZVvve','USER','ACTIVE','2025-10-08 16:27:09.391086','nghia1'),('75762dfc-d9ce-4213-b18b-4a1a0b34c121','2025-11-12 00:06:58.846045','congphamdz20047@gmail.com','$2a$10$i5EIDALCohBodI.yx4kmqec1Ug51AEwsWtO3ucaOQKOtPt9AxQkKq','USER','ACTIVE','2025-11-12 00:08:52.668181','hihi'),('78fe9284-62c5-4f2b-8d30-56195f735793','2025-10-11 20:48:51.592618','phamcong@gmail.com','$2a$10$xuxsKhFhKTk1fvHm9nhxLujkRp5Mq3rUkw.hgftmEu7BqAmri.olC','USER','ACTIVE','2025-10-14 21:41:55.211419','diu555555'),('a078fad0-4cf0-4da0-af8f-3084bde240fb','2025-10-08 16:27:48.292032','nghia@cg.com','$2a$10$2QchUcJ3CX81GOUbHPE5QuR.MFmY0kcaPzMr4xotJY4YiZUKQj7va','USER','ACTIVE','2025-10-08 16:27:48.292032','nghia2'),('e5679266-0db2-4edc-8dd9-0b353fbd4787','2025-10-08 21:00:47.304583','1312321@gmail','$2a$10$HREGLDF2kiwsGljycztw6uAZmlaZ5AqU3lAuqy0QELpGNHme2a9ay','USER','INACTIVE','2025-10-12 04:06:13.922515','Helloguy'),('eb32b06a-ed02-4ca9-a6c0-a08d75171feb','2025-10-13 21:25:08.975266','qeqwe@gmailaf.com','$2a$10$unqh0xqsUDSe1g9FYb6oN.3Mc2f13kWlOvIww9BhckrYHq2.BrYmq','USER','ACTIVE','2025-10-13 21:25:08.975266','qqqqqqq'),('ef3974e5-8944-4c0c-b9d4-80923266a444','2025-10-08 18:18:04.168247','123@gmail.com','$2a$10$wICSHjlEBPJ6HGZNcqq5LO//.n0dUldVXz.oTAE2slQspO/qvBUka','ADMIN','ACTIVE','2025-10-08 18:18:04.168247','1111'),('f7ed26c6-2cd6-4d67-acb7-4c3fd8b2b152','2025-10-11 18:10:28.803182','congphamdz2004@gmail.com','$2a$10$j1AJn0XViBbS/TainJGIleHkZZDLzUnF6gMx6g4HomAYGgwcgGRCq','ADMIN','ACTIVE','2025-10-11 18:10:28.803182','admin6666');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car_details`
--

DROP TABLE IF EXISTS `car_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car_details` (
  `car_detail_id` bigint NOT NULL,
  `dimensions` varchar(100) NOT NULL,
  `engine` varchar(100) NOT NULL,
  `fuel_consumption` varchar(50) NOT NULL,
  `fuel_type` varchar(30) NOT NULL,
  `horsepower` int NOT NULL,
  `seats` int NOT NULL,
  `torque` int NOT NULL,
  `transmission` varchar(50) NOT NULL,
  `weight` double NOT NULL,
  `car_id` bigint NOT NULL,
  PRIMARY KEY (`car_detail_id`),
  UNIQUE KEY `uk_car_details_car_id` (`car_id`),
  CONSTRAINT `fk_car_details_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car_details`
--

LOCK TABLES `car_details` WRITE;
/*!40000 ALTER TABLE `car_details` DISABLE KEYS */;
INSERT INTO `car_details` VALUES (449873897,'111111111111','111111111111','1.111111111E9','111111111111111111',11111,1111,1111111111,'11111111111111',11111111111,780127),(501067137,'1111111111','1111','1000.0','Nước',111,8,1111,'11111111111',19000,887099),(521945795,'12313131','131231313123','1231313.0','123123',123123,1231,123123213,'123123',123,279779),(728376512,'111','ádasduuuu','11111.0','11',111,111,4444,'11111',1111,147534),(920252030,'11111','111','111.0','ádasd',11,2,12,'6666666',22,129765);
/*!40000 ALTER TABLE `car_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `car_id` bigint NOT NULL,
  `brand` enum('HYUNDAI','MERCEDES','TOYOTA','VINFAST') NOT NULL,
  `category` enum('HATCHBACK','SEDAN','SUV') NOT NULL,
  `color` varchar(30) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `manufacture_year` int NOT NULL,
  `model` varchar(50) NOT NULL,
  `price` decimal(15,3) NOT NULL,
  `status` enum('AVAILABLE','SOLD') DEFAULT NULL,
  PRIMARY KEY (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cars`
--

LOCK TABLES `cars` WRITE;
/*!40000 ALTER TABLE `cars` DISABLE KEYS */;
INSERT INTO `cars` VALUES (108923,'TOYOTA','SUV','BLACK','yyyyyyyyyyyyyyyyyyyyyy','uploads/cars/1762875936802_FM_05570.jpg',2025,'Santafe',14.000,'AVAILABLE'),(129765,'TOYOTA','HATCHBACK','BLACK','6666666666666666666666666','uploads/cars/1760329070411_kia-k3-trang.png',2025,'Sis',111111111.000,'AVAILABLE'),(147534,'MERCEDES','SEDAN','WHITE','New 2025','uploads/cars/1760329087045_accnet.jpg',2025,'C200',400000000.000,'AVAILABLE'),(236730,'TOYOTA','SUV','BLACK','ádafasf','uploads/cars/1762875870171_FM_05877.jpg',2025,'ầ',5555555555.000,'AVAILABLE'),(279779,'TOYOTA','SUV','BLACK','qưeqweqweqweqwe','uploads/cars/1760329106763_vios.jpg',2025,'qưeqweqw',7777.000,'AVAILABLE'),(355303,'TOYOTA','SUV','BLACK','sadasdasdasd','uploads/cars/1762875885895_4E9A4284.jpg',2025,'ádasdasd',30.000,'AVAILABLE'),(658845,'TOYOTA','SUV','BLACK','adfafa','uploads/cars/1762875854141_FM_05553.jpg',2025,'qưeqweqweqweqweqwe',123123.000,'AVAILABLE'),(780127,'VINFAST','SEDAN','BLACK','New 2025','uploads/cars/1759936333426_vios.jpg',2025,'LUX A',2000000000.000,'AVAILABLE'),(887099,'TOYOTA','SUV','BLACK','1111111111111111111111111','uploads/cars/1760280226381_Vios2025.jpg',2025,'11111',1111111.000,'AVAILABLE'),(934084,'TOYOTA','SUV','BLACK','ffffffffffffffffffffffff','uploads/cars/1762875924201_FM_05553.jpg',2025,'qưeqweqweqweqweqwe',21.000,'AVAILABLE'),(997448,'TOYOTA','SUV','BLACK','qưeeeeeeeeeee','uploads/cars/1762875903109_4E9A4284.jpg',2025,'C200',16.000,'AVAILABLE');
/*!40000 ALTER TABLE `cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `news_id` bigint NOT NULL AUTO_INCREMENT,
  `content` mediumtext NOT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `excerpt` varchar(300) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `slug` varchar(200) NOT NULL,
  `status` enum('DRAFT','PUBLISHED') NOT NULL,
  `title` varchar(180) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`news_id`),
  UNIQUE KEY `UKowrieak0v8dvhynft9mxexw15` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (4,'111111111111111111111111111111111111111111111111111111111111','uploads/news/1760276970834_accnet.jpg','2025-10-12 20:49:30.886930','12222222222222',NULL,'12222222222222223','DRAFT','Khuyến Mãi Hấp Dẫn','2025-10-13 11:18:36.890649'),(5,'2211111111111111113','uploads/news/1760276985573_access.jpg','2025-10-12 20:49:45.574213','12222222222222',NULL,'12222222222223','PUBLISHED','31222231','2025-10-12 20:49:45.574213'),(6,'66666666666666666','uploads/news/1760329135809_vios.jpg','2025-10-12 20:50:01.468588','66666666666',NULL,'1231666666666666','PUBLISHED','122222223','2025-10-13 11:18:55.811555'),(7,'jjjjjjjjjjjjjjjj','uploads/news/1760277014954_kia-k3-trang.png','2025-10-12 20:50:14.955731','jjjjjjjjjjjjjjjjj',NULL,'jjjjjjjjjjjjjjjj','PUBLISHED','jjjjjjjjjjjj','2025-10-12 20:50:14.955731'),(8,'jjjjjjjjjjjjjjjjjjj','uploads/news/1760329155611_access.jpg','2025-10-12 20:50:26.400983','jjjjjjjjjjj',NULL,'jjjjjjjjjjjjjjj','PUBLISHED','jjjjjjjjjjjjjjjjjjj','2025-10-13 11:19:15.613407'),(9,'ád','uploads/news/1762876788017_FM_05873.jpg','2025-11-11 22:59:48.025384','ád',NULL,'ád','DRAFT','ádasd','2025-11-11 22:59:48.025384'),(11,'ddđ','uploads/news/1762876818565_FM_05873.jpg','2025-11-11 23:00:18.570064','dddđ',NULL,'dđ','DRAFT','dđ','2025-11-11 23:00:18.570064'),(14,'yyyy','uploads/news/1762876838420_FM_05553.jpg','2025-11-11 23:00:38.427656','ỉtyrty',NULL,'yy','PUBLISHED','dđ','2025-11-11 23:00:38.427656');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `order_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `price` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL,
  `car_id` bigint NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `color_name` enum('BLACK','BLUE','BROWN','GREEN','GREY','ORANGE','RED','SILVER','WHITE','YELLOW') DEFAULT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `fk_order_details_car` (`car_id`),
  KEY `fk_order_details_order` (`order_id`),
  CONSTRAINT `fk_order_details_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`),
  CONSTRAINT `fk_order_details_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (4,2000000000.00,1,780127,'1e21bfb6-d339-4900-8cbb-e82f98c473ae',NULL),(5,111111111.00,1244,129765,'07520ff0-d263-4ac3-baec-213644e86bff','SILVER'),(6,111111111.00,1244,129765,'0ef3961b-0529-43cb-b550-e07bbb433db3','SILVER'),(7,111111111.00,1244,129765,'3673c22b-5289-4a5f-a86f-0d6859f102e4','SILVER'),(8,1111111.00,2,887099,'7553f183-3884-4fcb-b0b0-6b1d6d2d03ac','BLACK'),(9,400000000.00,1,147534,'f9f7ae20-29cf-4e40-9810-986efb911c32','WHITE'),(10,400000000.00,2,147534,'decfa512-a66b-4124-b9ff-1834f9a196c6','WHITE'),(11,400000000.00,1,147534,'9f9ade42-bba9-4a77-aaad-73204ed34398','WHITE'),(12,111111111.00,1,129765,'551324b0-dc59-4ede-9d5d-fde67d00e706','BLACK'),(13,111111111.00,1,129765,'12f0f7cd-893f-4bb4-ae1f-e5586e862c73','BLACK'),(14,400000000.00,1,147534,'27740d59-dcae-44b8-b280-2effef88e29d','WHITE'),(15,7777.00,30,279779,'327421ce-94fe-4758-a73a-51a7f5276b5b','BLACK'),(16,400000000.00,1,147534,'5e1f0e91-336b-43fc-ba15-62309fd27e35','WHITE'),(17,400000000.00,1,147534,'40579bbd-7354-4766-9835-8484a1b49563','WHITE'),(18,400000000.00,1,147534,'b60475dd-157e-4150-b9bd-9316b1af90ff','WHITE'),(19,111111111.00,1,129765,'8c70c3c5-8077-40c8-84c6-91126808cb81','BLACK'),(20,1111111.00,1,887099,'46593c3b-322e-49a9-a3d8-78c157a50fa4','BLACK'),(21,400000000.00,1,147534,'3329a1a5-f7c3-4c92-956d-607b44602ccc','WHITE'),(22,7777.00,1,279779,'13b3d0a7-671f-4efd-9545-6f0208b8d03f','BLACK'),(23,7777.00,1,279779,'ff3f1c94-724c-4c2c-93a5-901c15787fb7','BLACK'),(24,7777.00,1,279779,'d520f587-69ba-44ea-9775-72f484e093a0','BLACK'),(25,400000000.00,1,147534,'ad600b37-0998-400a-b369-c8853284104f','WHITE'),(26,400000000.00,1,147534,'8e278a65-cdb6-488a-955e-c9b0fe1439a7','WHITE'),(27,7777.00,1,279779,'bd01696a-b095-434c-b49e-2b6a793495be','BLACK');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` varchar(36) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `district` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `note` text,
  `order_date` datetime(6) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','DELIVERED','PENDING','SHIPPING') NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `ward` varchar(50) DEFAULT NULL,
  `user_id` varchar(36) NOT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('07520ff0-d263-4ac3-baec-213644e86bff','string','string','2025-10-13 00:37:00.433613','string','string','string','string','2025-10-13 00:37:00.395611','string',1111.00,'CONFIRMED',138222222084.00,9311.83,138222232506.83,'2025-10-13 01:12:45.586406','string','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('0ef3961b-0529-43cb-b550-e07bbb433db3','string','string','2025-10-13 00:37:02.840107','string','string','string','string','2025-10-13 00:37:02.839137','string',1111.00,'CONFIRMED',138222222084.00,9311.83,138222232506.83,'2025-10-13 01:12:45.077838','string','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('12f0f7cd-893f-4bb4-ae1f-e5586e862c73','Nam Định','123124','2025-10-13 02:08:20.487164','1241','dieu@gmail.com','Phạm Diệuu','124','2025-10-13 02:08:20.485185','09141412414',0.00,'CANCELLED',111111111.00,11111111.10,122222222.10,'2025-10-13 02:16:21.287297','1241','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('13b3d0a7-671f-4efd-9545-6f0208b8d03f','Nam Định','uuu','2025-11-11 22:22:26.288671','uuuu','phamcong@gmail.com','11111','uuuu','2025-11-11 22:22:26.288671','09876346346',0.00,'CANCELLED',7777.00,777.70,8554.70,'2025-11-11 22:23:18.248671','uu','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('1e21bfb6-d339-4900-8cbb-e82f98c473ae','123 Đường ABC, Quận Cầu Giấy','HN','2025-10-10 20:44:20.116198','Quận Cầu Giấy','nghia@example.com','Nguyen Van nghia','Giao hàng sau 18h','2025-10-10 20:44:20.106044','0987654321',30000.00,'COMPLETED',2000000000.00,50000.00,2000080000.00,'2025-10-12 15:14:39.451129','Phường Yên Hoà','96482c65-1eaf-4b13-9f5c-2659c08cd92c',NULL),('27740d59-dcae-44b8-b280-2effef88e29d','Nam Định','ád','2025-10-13 02:32:09.653502','áda','dieu@gmail.com','Phạm Diệuu','ád','2025-10-13 02:32:09.648508','09141412414',0.00,'CANCELLED',400000000.00,40000000.00,440000000.00,'2025-10-13 02:32:25.654540','ád','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('327421ce-94fe-4758-a73a-51a7f5276b5b','Nam Định','123','2025-10-13 11:21:25.457009','123','dieu@gmail.com','Phạm Diệuu','123','2025-10-13 11:21:25.457009','09141412414',0.00,'CANCELLED',233310.00,23331.00,256641.00,'2025-10-13 11:21:37.159010','123','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('3329a1a5-f7c3-4c92-956d-607b44602ccc','Nam Định','ggg','2025-11-11 22:21:24.608914','ggg','phamcong@gmail.com','11111','gggg','2025-11-11 22:21:24.608915','09876346346',0.00,'CANCELLED',400000000.00,40000000.00,440000000.00,'2025-11-11 22:22:04.169023','ggg','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('3673c22b-5289-4a5f-a86f-0d6859f102e4','string','string','2025-10-13 00:37:57.140611','string','string','string','string','2025-10-13 00:37:57.139616','string',0.00,'CONFIRMED',138222222084.00,9311.83,138222231395.83,'2025-10-13 01:12:44.362762','string','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('40579bbd-7354-4766-9835-8484a1b49563','Nam Định','13','2025-10-13 21:21:35.247622','123','phamcong@gmail.com','11111','123','2025-10-13 21:21:35.246626','09876346346',0.00,'COMPLETED',400000000.00,40000000.00,440000000.00,'2025-10-13 21:23:42.483372','123','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('46593c3b-322e-49a9-a3d8-78c157a50fa4','Nam Định','ádasd','2025-11-11 22:21:04.356152','ádasd','phamcong@gmail.com','11111','sdấdasd','2025-11-11 22:21:04.355176','09876346346',0.00,'CANCELLED',1111111.00,111111.10,1222222.10,'2025-11-11 22:23:13.548101','áda','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('551324b0-dc59-4ede-9d5d-fde67d00e706','ttttt','123','2025-10-13 01:14:16.281491','14','he@gmail.com','Lò Văn Tèn','1241241','2025-10-13 01:14:16.281492','091231411251',0.00,'CONFIRMED',111111111.00,11111111.10,122222222.10,'2025-10-13 03:39:33.848046','124','266fd4cd-8117-4ac8-8bca-0c465246d30a',NULL),('5e1f0e91-336b-43fc-ba15-62309fd27e35','Nam Định','1312','2025-10-13 21:11:46.152835','1313','phamcong@gmail.com','Phạm Minh Công','123213','2025-10-13 21:11:46.093806','09141412414',0.00,'CANCELLED',400000000.00,40000000.00,440000000.00,'2025-10-13 21:12:19.187720','123','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('7553f183-3884-4fcb-b0b0-6b1d6d2d03ac','Nam Định','ưeq','2025-10-13 01:05:39.167217','qưe','dieu@gmail.com','Phạm Diệuu','qưe','2025-10-13 01:05:39.167217','09141412414',0.00,'CONFIRMED',2222222.00,222222.20,2444444.20,'2025-10-13 01:12:43.661239','qưe','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('8c70c3c5-8077-40c8-84c6-91126808cb81','Nam Định','qweqwe','2025-10-28 15:31:29.551663','qwe','phamcong@gmail.com','11111','qwe','2025-10-28 15:31:29.442309','09876346346',0.00,'CANCELLED',111111111.00,11111111.10,122222222.10,'2025-11-11 21:52:10.856699','qwe','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('8e278a65-cdb6-488a-955e-c9b0fe1439a7','Nam Định','yyyy','2025-11-12 00:01:43.002504','yyyy','phamcong@gmail.com','11111','yyyyy','2025-11-12 00:01:43.002504','09876346346',0.00,'PENDING',400000000.00,40000000.00,440000000.00,'2025-11-12 00:01:43.002504','yyyyy','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('9f9ade42-bba9-4a77-aaad-73204ed34398','Nam Định','666','2025-10-13 01:10:11.267291','666','dieu@gmail.com','Phạm Diệuu','666','2025-10-13 01:10:11.267292','09141412414',0.00,'CONFIRMED',400000000.00,40000000.00,440000000.00,'2025-10-13 01:12:38.144429','66','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('ad600b37-0998-400a-b369-c8853284104f','Nam Định','ád','2025-11-12 00:01:16.639972','ád','phamcong@gmail.com','11111','ád','2025-11-12 00:01:16.639972','09876346346',0.00,'PENDING',400000000.00,40000000.00,440000000.00,'2025-11-12 00:01:16.639972','ád','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('b60475dd-157e-4150-b9bd-9316b1af90ff','Nam Định','12321','2025-10-14 21:42:55.130639','31313','phamcong@gmail.com','11111','1321321','2025-10-14 21:42:55.108642','09876346346',0.00,'CANCELLED',400000000.00,40000000.00,440000000.00,'2025-11-11 21:52:14.530896','1313','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('bd01696a-b095-434c-b49e-2b6a793495be','Nam Định','ooooo','2025-11-12 00:02:56.228880','ooooo','phamcong@gmail.com','11111','oooooo','2025-11-12 00:02:56.227885','09876346346',0.00,'PENDING',7777.00,777.70,8554.70,'2025-11-12 00:02:56.228880','oooo','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('d520f587-69ba-44ea-9775-72f484e093a0','Nam Định','kkkkkkk','2025-11-11 22:30:50.319608','oo','phamcong@gmail.com','11111','oo','2025-11-11 22:30:50.319609','09876346346',0.00,'CANCELLED',7777.00,777.70,8554.70,'2025-11-11 22:43:04.079469','oo','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('decfa512-a66b-4124-b9ff-1834f9a196c6','Nam Định','11','2025-10-13 01:08:17.174313','11111111','dieu@gmail.com','oooooooooo','1111111111111111','2025-10-13 01:08:17.173285','09141412414',0.00,'CONFIRMED',800000000.00,80000000.00,880000000.00,'2025-10-13 01:12:41.479286','111','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('f9f7ae20-29cf-4e40-9810-986efb911c32','Nam Định','iiiii','2025-10-13 01:07:07.874764','iiii','dieu@gmail.com','9999999999','iiiiii','2025-10-13 01:07:07.873751','09141412414',0.00,'CONFIRMED',400000000.00,40000000.00,440000000.00,'2025-10-13 01:12:42.908356','ii','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL),('ff3f1c94-724c-4c2c-93a5-901c15787fb7','Nam Định','hhhh','2025-11-11 22:23:04.386810','hhh','phamcong@gmail.com','11111','hh','2025-11-11 22:23:04.386810','09876346346',0.00,'CANCELLED',7777.00,777.70,8554.70,'2025-11-11 22:43:05.051419','hhh','056dd446-b05e-4893-8e4d-f1fdbffedd34',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` varchar(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_method` enum('BANK_TRANSFER','CASH','CREDIT_CARD','DEBIT_CARD','MOMO','VNPAY') NOT NULL,
  `status` enum('FAILED','PENDING','SUCCESS') NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `UKmf7n8wo2rwrxsd6f3t9ub2mep` (`order_id`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('060b43de-b5f2-4c9b-996c-45177188caed',440000000.00,'2025-11-12 00:01:16.716591',NULL,'CASH','PENDING',NULL,'2025-11-12 00:01:16.716591','ad600b37-0998-400a-b369-c8853284104f'),('0f1f9629-371f-4526-b390-7a34699fc609',8554.70,'2025-11-11 22:23:04.390809',NULL,'CASH','PENDING',NULL,'2025-11-11 22:23:04.390809','ff3f1c94-724c-4c2c-93a5-901c15787fb7'),('0f897843-a789-43bb-8617-12a6690fa4ae',122222222.10,'2025-10-28 15:31:29.869675',NULL,'CASH','PENDING',NULL,'2025-10-28 15:31:29.869675','8c70c3c5-8077-40c8-84c6-91126808cb81'),('140d3f7d-aec6-4ac0-a087-c5f36c67e8a6',440000000.00,'2025-10-13 21:21:35.256622','2025-10-13 21:23:16.599999','CASH','SUCCESS',NULL,'2025-10-13 21:36:36.803753','40579bbd-7354-4766-9835-8484a1b49563'),('1882fa21-dc58-4b0f-97df-ccb010d79ab0',138222231395.83,'2025-10-13 00:37:57.150783',NULL,'BANK_TRANSFER','PENDING',NULL,'2025-10-13 00:37:57.150783','3673c22b-5289-4a5f-a86f-0d6859f102e4'),('18e164dc-31f5-43f1-b173-612e23eb7f3c',138222232506.83,'2025-10-13 00:37:00.540609',NULL,'BANK_TRANSFER','PENDING',NULL,'2025-10-13 00:37:00.540609','07520ff0-d263-4ac3-baec-213644e86bff'),('1ab5c4c1-efd0-4ed3-856e-ee465e4a551d',8554.70,'2025-11-11 22:22:26.293655',NULL,'CASH','PENDING',NULL,'2025-11-11 22:22:26.293655','13b3d0a7-671f-4efd-9545-6f0208b8d03f'),('23d9c674-b14a-4828-9f4d-49f9c299494a',138222232506.83,'2025-10-13 00:37:02.848490',NULL,'BANK_TRANSFER','PENDING',NULL,'2025-10-13 00:37:02.848490','0ef3961b-0529-43cb-b550-e07bbb433db3'),('2a3c97e8-df68-4403-a375-1f3d82238a47',440000000.00,'2025-11-11 22:21:24.614930',NULL,'VNPAY','PENDING',NULL,'2025-11-11 22:21:24.614930','3329a1a5-f7c3-4c92-956d-607b44602ccc'),('2ff44945-34f2-46de-b9c0-d7c6c49f441b',256641.00,'2025-10-13 11:21:25.490477',NULL,'CASH','PENDING',NULL,'2025-10-13 11:21:25.490477','327421ce-94fe-4758-a73a-51a7f5276b5b'),('4f5fdb20-e9b9-49ee-8381-f8483e376aeb',8554.70,'2025-11-12 00:02:56.235880',NULL,'VNPAY','PENDING',NULL,'2025-11-12 00:02:56.235880','bd01696a-b095-434c-b49e-2b6a793495be'),('5f62de1a-537f-4cb2-81df-b47c0de49889',440000000.00,'2025-10-13 02:32:09.676201',NULL,'CASH','PENDING',NULL,'2025-10-13 02:32:09.676201','27740d59-dcae-44b8-b280-2effef88e29d'),('5ffc78fc-37d4-4830-a4b0-925f4de9a2d9',440000000.00,'2025-11-12 00:01:43.007674',NULL,'MOMO','PENDING',NULL,'2025-11-12 00:01:43.007674','8e278a65-cdb6-488a-955e-c9b0fe1439a7'),('702f5a8d-6f19-42a4-a513-4a27c72f7094',440000000.00,'2025-10-13 01:10:11.280332',NULL,'CASH','PENDING',NULL,'2025-10-13 01:10:11.280332','9f9ade42-bba9-4a77-aaad-73204ed34398'),('7752d228-983b-43ad-a4f5-893e4b5170eb',122222222.10,'2025-10-13 02:08:20.501783',NULL,'CASH','FAILED',NULL,'2025-10-13 02:26:16.924496','12f0f7cd-893f-4bb4-ae1f-e5586e862c73'),('8a2a2d09-09e5-4d9e-82e0-8b1cc7eaa8b4',2000080000.00,'2025-10-10 20:44:20.960797','2025-10-10 20:48:26.906295','CREDIT_CARD','FAILED',NULL,'2025-10-12 15:14:42.936086','1e21bfb6-d339-4900-8cbb-e82f98c473ae'),('8d379bf7-fa10-4a07-93b3-a6fe9efba14c',880000000.00,'2025-10-13 01:08:17.181855',NULL,'BANK_TRANSFER','PENDING',NULL,'2025-10-13 01:08:17.181855','decfa512-a66b-4124-b9ff-1834f9a196c6'),('a8979a60-ab00-4531-87a0-3b9f2fdb5e8c',8554.70,'2025-11-11 22:30:50.324576',NULL,'CASH','PENDING',NULL,'2025-11-11 22:30:50.324576','d520f587-69ba-44ea-9775-72f484e093a0'),('b89197a6-7de2-4135-9be1-e294d2d5776f',122222222.10,'2025-10-13 01:14:16.289503',NULL,'CASH','PENDING',NULL,'2025-10-13 01:14:16.289503','551324b0-dc59-4ede-9d5d-fde67d00e706'),('d9cc9528-cb30-40d8-b028-9295f797cbfb',440000000.00,'2025-10-14 21:42:55.190641','2025-10-15 22:45:54.529584','CASH','PENDING',NULL,'2025-10-15 22:45:58.295158','b60475dd-157e-4150-b9bd-9316b1af90ff'),('e510a090-f0be-4eb3-a547-3db1ff41b43b',440000000.00,'2025-10-13 21:11:46.701556',NULL,'VNPAY','PENDING',NULL,'2025-10-13 21:11:46.701556','5e1f0e91-336b-43fc-ba15-62309fd27e35'),('f4e359c7-b493-42be-90fe-a2005aa45e4a',2444444.20,'2025-10-13 01:05:39.183567',NULL,'CASH','PENDING',NULL,'2025-10-13 01:05:39.183567','7553f183-3884-4fcb-b0b0-6b1d6d2d03ac'),('f5644577-a68f-4271-ac93-711369c8124c',1222222.10,'2025-11-11 22:21:04.401162',NULL,'CASH','PENDING',NULL,'2025-11-11 22:21:04.402152','46593c3b-322e-49a9-a3d8-78c157a50fa4'),('fe1147c3-d452-4e81-847a-9240b791a086',440000000.00,'2025-10-13 01:07:07.891895',NULL,'BANK_TRANSFER','PENDING',NULL,'2025-10-13 01:07:07.891895','f9f7ae20-29cf-4e40-9810-986efb911c32');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_cars`
--

DROP TABLE IF EXISTS `promotion_cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_cars` (
  `promotion_id` bigint NOT NULL,
  `car_id` bigint NOT NULL,
  PRIMARY KEY (`promotion_id`,`car_id`),
  KEY `FK4jdgtt51fnlwjb0oe43rsqe1w` (`car_id`),
  CONSTRAINT `FK4jdgtt51fnlwjb0oe43rsqe1w` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`),
  CONSTRAINT `FKa72gpu5qo4a4d6cdw06hlhqh8` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_cars`
--

LOCK TABLES `promotion_cars` WRITE;
/*!40000 ALTER TABLE `promotion_cars` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `promotion_id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `applies_to` enum('BRAND','CAR','CATEGORY','GLOBAL') NOT NULL,
  `description` text,
  `discount_type` enum('FIXED','PERCENT') NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `start_at` datetime(6) NOT NULL,
  `target_brands` json DEFAULT NULL,
  `target_categories` json DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  PRIMARY KEY (`promotion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (2,_binary '','BRAND','\"\\\"\\\\\\\"111\\\\\\\"\\\"\"','PERCENT',111.00,'2025-10-14 13:46:00.000000','2025-09-27 13:46:00.000000','[\"TOYOTA\", \"VINFAST\", \"HYUNDAI\"]','[]','\"\\\"\\\\\\\"111\\\\\\\"\\\"\"'),(3,_binary '\0','GLOBAL','\"\\\"\\\\\\\"\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"54324235235\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"\\\\\\\"\\\"\"','PERCENT',10.00,'2025-10-13 06:58:00.000000','2025-09-01 06:58:00.000000','[]','[]','\"\\\"\\\\\\\"poooooo\\\\\\\"\\\"\"'),(4,_binary '','CAR','\"áda\"','PERCENT',111.00,'2025-10-13 21:15:00.000000','2025-09-28 21:18:00.000000','[]','[]','\"ádas\"');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `account_id` varchar(36) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK1yov8c5ew74vlt8qra6cewq99` (`account_id`),
  UNIQUE KEY `uk_users_phone` (`phone`),
  CONSTRAINT `fk_users_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('009cca13-4605-4e54-9dc7-d60c9e739c47','khu4 yen dinh',NULL,'Phạm Diệuu','MALE','098763463467','75762dfc-d9ce-4213-b18b-4a1a0b34c121','uploads/avatars/1762880862631_FM_05873.jpg'),('056dd446-b05e-4893-8e4d-f1fdbffedd34','Nam Định','1987-04-27','11111','MALE','09876346346','78fe9284-62c5-4f2b-8d30-56195f735793','uploads/avatars/1760364818306_FM_05553.jpg'),('1d440087-be3f-41b6-bdfd-99dd39a0887a','12312','2025-09-29','Pham Guy','FEMALE','09124124114','e5679266-0db2-4edc-8dd9-0b353fbd4787','uploads/avatars/1760212671978_refined_IMG_20230306_090502_1.jpg'),('266fd4cd-8117-4ac8-8bca-0c465246d30a','ttttt','2025-09-29','Lò Văn Tèn','MALE','091231411251','4a679774-240a-4c6f-b759-6b40fd1f6182','uploads/avatars/1760213502629_z5736904516302_7bff5814dfce1b1c42f74808e98090ae.jpg'),('96482c65-1eaf-4b13-9f5c-2659c08cd92c','asdasd','1993-12-11','pham tuan nghia-v2','MALE','0393939393','a078fad0-4cf0-4da0-af8f-3084bde240fb',NULL),('a61bcd67-b5bd-43fe-a969-7dbf420963c6',NULL,'1990-01-15','Test User 999','MALE','0987654999','5d489875-4098-4308-a171-963b6d83b40f',NULL),('c2289c1c-00e6-4ea0-9b4d-e89607927c30','Hà Nội, Việt Nam','1990-01-01','Administrator','MALE','1900123123','2a8903ce-64d3-4af6-a5ca-20a34a0523e0','uploads/avatars/1760213611531_z6442293770199_f0e9f5684126440718c9753ed0fcc4e9.jpg'),('e8b7a8bd-5205-4ab4-a449-5407abe4239f','mmmmm','1990-01-15','Test Admin 888','MALE','0987654888','2ffefe7a-18d2-4f54-9cc3-81220b972147',NULL),('fecae4c7-1c6e-400b-b396-d5991d67d3b9','rrrrrrr','2025-09-30','Phạm Minh Côngggg','MALE','0929687284','f7ed26c6-2cd6-4d67-acb7-4c3fd8b2b152',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'car_sales_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-13  2:43:15
