-- MySQL Script generated by MySQL Workbench
-- Tue Jul  2 19:29:15 2019
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema server
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema server
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `server` DEFAULT CHARACTER SET utf8 ;
USE `server` ;

-- -----------------------------------------------------
-- Table `server`.`description`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`description` (
  `user_id` INT NOT NULL,
  `first_name` VARCHAR(25) NULL,
  `second_name` VARCHAR(25) NULL,
  INDEX `fk_user_description_user_idx` (`user_id` ASC),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_description_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `server`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`form`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`form` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `e-mail` VARCHAR(254) NOT NULL,
  `nickname` VARCHAR(25) NOT NULL,
  `password_hash` CHAR(64) NOT NULL,
  `first_name` VARCHAR(25) NULL,
  `second_name` VARCHAR(25) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`registration`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`registration` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `time` BIGINT(20) NOT NULL,
  `confirm_hash` CHAR(64) NOT NULL,
  `complete` TINYINT NOT NULL DEFAULT 0,
  `form_id` INT NOT NULL,
  PRIMARY KEY (`id`, `form_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `fk_registration_form1_idx` (`form_id` ASC),
  CONSTRAINT `fk_registration_form1`
    FOREIGN KEY (`form_id`)
    REFERENCES `server`.`form` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`session`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`session` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `hash` CHAR(64) NOT NULL,
  `time` BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`, `user_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `fk_session_user1_idx` (`user_id` ASC),
  CONSTRAINT `fk_session_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `server`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`template_test`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`template_test` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `template` MEDIUMBLOB NOT NULL,
  PRIMARY KEY (`id`, `user_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `fk_template_test_task_user1_idx` (`user_id` ASC),
  CONSTRAINT `fk_template_test_task_user10`
    FOREIGN KEY (`user_id`)
    REFERENCES `server`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`template_test_task`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`template_test_task` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `template` MEDIUMBLOB NOT NULL,
  PRIMARY KEY (`id`, `user_id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `fk_template_test_task_user1_idx` (`user_id` ASC),
  CONSTRAINT `fk_template_test_task_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `server`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `server`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `server`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `e-mail` VARCHAR(254) NOT NULL,
  `nickname` VARCHAR(25) NOT NULL,
  `password_hash` CHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `login_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;