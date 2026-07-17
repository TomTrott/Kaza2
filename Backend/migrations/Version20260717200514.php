<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260717200514 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__users AS SELECT id, name, picture, role, email, password_hash, reset_token, reset_expires FROM users');
        $this->addSql('DROP TABLE users');
        $this->addSql('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(255) NOT NULL, picture VARCHAR(255) DEFAULT NULL, role VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, reset_token VARCHAR(255) DEFAULT NULL, reset_expires INTEGER DEFAULT NULL)');
        $this->addSql('INSERT INTO users (id, name, picture, role, email, password_hash, reset_token, reset_expires) SELECT id, name, picture, role, email, password_hash, reset_token, reset_expires FROM __temp__users');
        $this->addSql('DROP TABLE __temp__users');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__users AS SELECT id, name, picture, role, email, password_hash, reset_token, reset_expires FROM users');
        $this->addSql('DROP TABLE users');
        $this->addSql('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(255) NOT NULL, picture VARCHAR(255) DEFAULT NULL, role VARCHAR(50) NOT NULL, email VARCHAR(255) DEFAULT NULL, password_hash VARCHAR(255) DEFAULT NULL, reset_token VARCHAR(255) DEFAULT NULL, reset_expires INTEGER DEFAULT NULL)');
        $this->addSql('INSERT INTO users (id, name, picture, role, email, password_hash, reset_token, reset_expires) SELECT id, name, picture, role, email, password_hash, reset_token, reset_expires FROM __temp__users');
        $this->addSql('DROP TABLE __temp__users');
    }
}
