CREATE DATABASE IF NOT EXISTS teste;

USE teste;

CREATE TABLE USERS(
id int auto_increment primary key,
name varchar(100) not null,
username varchar(100) not null unique,
email varchar(100) not null unique,
telefone varchar(15),
password varchar(20) not null);
