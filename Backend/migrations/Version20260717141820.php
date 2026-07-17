<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260717141820 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__favorites AS SELECT id, property_id, user_id FROM favorites');
        $this->addSql('DROP TABLE favorites');
        $this->addSql('CREATE TABLE favorites (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, property_id INTEGER NOT NULL, user_id INTEGER NOT NULL, CONSTRAINT FK_E46960F5549213EC FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_E46960F5A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO favorites (id, property_id, user_id) SELECT id, property_id, user_id FROM __temp__favorites');
        $this->addSql('DROP TABLE __temp__favorites');
        $this->addSql('CREATE INDEX IDX_E46960F5A76ED395 ON favorites (user_id)');
        $this->addSql('CREATE INDEX IDX_E46960F5549213EC ON favorites (property_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__favorites AS SELECT id, property_id, user_id FROM favorites');
        $this->addSql('DROP TABLE favorites');
        $this->addSql('CREATE TABLE favorites (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, property_id INTEGER NOT NULL, user_id INTEGER NOT NULL, CONSTRAINT FK_E46960F5549213EC FOREIGN KEY (property_id) REFERENCES properties (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_E46960F5A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO favorites (id, property_id, user_id) SELECT id, property_id, user_id FROM __temp__favorites');
        $this->addSql('DROP TABLE __temp__favorites');
        $this->addSql('CREATE INDEX IDX_E46960F5549213EC ON favorites (property_id)');
        $this->addSql('CREATE INDEX IDX_E46960F5A76ED395 ON favorites (user_id)');
    }
}
