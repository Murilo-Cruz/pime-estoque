-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           11.8.9-MariaDB - MariaDB Server
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para db_estoque_pime
CREATE DATABASE IF NOT EXISTS `db_estoque_pime` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `db_estoque_pime`;

-- Copiando estrutura para tabela db_estoque_pime.emitente
CREATE TABLE IF NOT EXISTS `emitente` (
  `id_emitente` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nom_emitente` varchar(150) NOT NULL,
  `des_documento` varchar(18) DEFAULT NULL COMMENT 'CPF ou CNPJ',
  `des_telefone` varchar(20) DEFAULT NULL,
  `des_email` varchar(150) DEFAULT NULL,
  `idc_tipo` enum('CLIENTE','FORNECEDOR','AMBOS') NOT NULL,
  PRIMARY KEY (`id_emitente`),
  KEY `idx_emitente_tipo` (`idc_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.estoque_entrada
CREATE TABLE IF NOT EXISTS `estoque_entrada` (
  `id_estoque_entrada` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_fornecedor` int(10) unsigned NOT NULL COMMENT 'FK para emitente (tipo FORNECEDOR ou AMBOS)',
  `id_usuario` int(10) unsigned NOT NULL,
  `dat_entrada` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_estoque_entrada`),
  KEY `fk_entrada_fornecedor` (`id_fornecedor`),
  KEY `fk_entrada_usuario` (`id_usuario`),
  CONSTRAINT `fk_entrada_fornecedor` FOREIGN KEY (`id_fornecedor`) REFERENCES `emitente` (`id_emitente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_entrada_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.item_estoque_entrada
CREATE TABLE IF NOT EXISTS `item_estoque_entrada` (
  `id_item_estoque_entrada` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_estoque_entrada` int(10) unsigned NOT NULL,
  `id_produto` int(10) unsigned NOT NULL,
  `qtd_item` int(11) NOT NULL,
  `vlr_uni` decimal(10,2) NOT NULL COMMENT 'Custo unitario desta compra',
  PRIMARY KEY (`id_item_estoque_entrada`),
  KEY `fk_iee_entrada` (`id_estoque_entrada`),
  KEY `fk_iee_produto` (`id_produto`),
  CONSTRAINT `fk_iee_entrada` FOREIGN KEY (`id_estoque_entrada`) REFERENCES `estoque_entrada` (`id_estoque_entrada`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_iee_produto` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`) ON UPDATE CASCADE,
  CONSTRAINT `ck_iee_qtd` CHECK (`qtd_item` > 0),
  CONSTRAINT `ck_iee_vlr` CHECK (`vlr_uni` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.pedido_venda
CREATE TABLE IF NOT EXISTS `pedido_venda` (
  `id_pedido_venda` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cliente` int(10) unsigned NOT NULL COMMENT 'FK para emitente (tipo CLIENTE ou AMBOS)',
  `id_usuario` int(10) unsigned NOT NULL,
  `dat_pedido` datetime NOT NULL DEFAULT current_timestamp(),
  `idc_status` enum('EM_PREPARACAO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'EM_PREPARACAO',
  `vlr_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_pedido_venda`),
  KEY `idx_pedido_data` (`dat_pedido`),
  KEY `fk_pedido_cliente` (`id_cliente`),
  KEY `fk_pedido_usuario` (`id_usuario`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `emitente` (`id_emitente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.pedido_venda_item
CREATE TABLE IF NOT EXISTS `pedido_venda_item` (
  `id_pedido_vend_item` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_pedido` int(10) unsigned NOT NULL,
  `id_produto` int(10) unsigned NOT NULL,
  `qtd_item` int(11) NOT NULL,
  `vlr_preco_uni` decimal(10,2) NOT NULL COMMENT 'Preco praticado na venda (snapshot)',
  `vlr_custo_uni` decimal(10,2) NOT NULL COMMENT 'Custo medio no momento da venda (snapshot)',
  PRIMARY KEY (`id_pedido_vend_item`),
  KEY `fk_pvi_pedido` (`id_pedido`),
  KEY `fk_pvi_produto` (`id_produto`),
  CONSTRAINT `fk_pvi_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido_venda` (`id_pedido_venda`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pvi_produto` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`) ON UPDATE CASCADE,
  CONSTRAINT `ck_pvi_qtd` CHECK (`qtd_item` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.produto
CREATE TABLE IF NOT EXISTS `produto` (
  `id_produto` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nom_produto` varchar(150) NOT NULL,
  `key_produto` varchar(50) NOT NULL COMMENT 'SKU / codigo interno',
  `vlr_venda` decimal(10,2) NOT NULL DEFAULT 0.00,
  `vlr_custo_medio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `qtd_estoque` int(11) NOT NULL DEFAULT 0,
  `qtd_min_estoque` int(11) NOT NULL DEFAULT 0,
  `idc_status` enum('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
  PRIMARY KEY (`id_produto`),
  UNIQUE KEY `uk_produto_key` (`key_produto`),
  CONSTRAINT `ck_produto_vlr_venda` CHECK (`vlr_venda` >= 0),
  CONSTRAINT `ck_produto_vlr_custo` CHECK (`vlr_custo_medio` >= 0),
  CONSTRAINT `ck_produto_qtd_estoque` CHECK (`qtd_estoque` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela db_estoque_pime.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nom_usuario` varchar(100) NOT NULL,
  `des_email` varchar(150) NOT NULL,
  `des_password` varchar(255) NOT NULL COMMENT 'Hash da senha (bcrypt/argon2), nunca o texto original',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuario_email` (`des_email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportação de dados foi desmarcado.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
