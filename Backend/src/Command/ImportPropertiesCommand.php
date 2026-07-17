<?php

namespace App\Command;

use App\Entity\Property;
use App\Entity\PropertyEquipment;
use App\Entity\PropertyPicture;
use App\Entity\PropertyTag;
use App\Entity\User;
use App\Repository\PropertyRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(
    name: 'app:import-properties',
    description: 'Importe les logements mockés depuis data/properties.json dans la base',
)]
class ImportPropertiesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private PropertyRepository $properties,
        private UserRepository $users,
        #[Autowire('%kernel.project_dir%')]
        private string $projectDir
    ) {
        parent::__construct();
    }

    // ... le reste de la classe ne change pas

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $path = $this->projectDir . '/data/properties.json';

        if (!file_exists($path)) {
            $io->error("Fichier introuvable : $path");
            return Command::FAILURE;
        }

        $data = json_decode(file_get_contents($path), true);

        if (!is_array($data)) {
            $io->error('JSON invalide ou vide.');
            return Command::FAILURE;
        }

        $created = 0;
        $skipped = 0;

        foreach ($data as $item) {

            $title = $item['title'] ?? null;

            if (!$title) {
                continue;
            }

            // Évite les doublons si la commande est relancée plusieurs fois
            $slug = $this->slugify($title);
            $existing = $this->properties->findOneBy(['slug' => $slug]);

            if ($existing) {
                $skipped++;
                continue;
            }

            // Récupère ou crée l'hôte
            $hostData = $item['host'] ?? [];
            $hostName = $hostData['name'] ?? 'Hôte inconnu';

            $host = $this->users->findOneBy(['name' => $hostName]);

            if (!$host) {
                $host = new User();
                $host->setName($hostName);
                $host->setPicture($hostData['picture'] ?? null);
                $host->setRole('owner');
                $host->setEmail($this->slugify($hostName) . '@kasa.mock');
                $host->setPasswordHash('!'); // compte non connectable, données mockées uniquement

                $this->em->persist($host);
            }

            // Crée la propriété
            $property = new Property();
            $property->setTitle($title);
            $property->setSlug($this->generateUniqueSlug($slug));
            $property->setDescription($item['description'] ?? null);
            $property->setCover($item['cover'] ?? null);
            $property->setLocation($item['location'] ?? '');
            $property->setPricePerNight(80);
            $property->setHost($host);

            $rating = isset($item['rating']) ? (float) $item['rating'] : null;
            $property->setRatingAvg($rating);
            $property->setRatingsCount($rating !== null ? 1 : 0);

            $this->em->persist($property);

            // Images
            foreach (($item['pictures'] ?? []) as $url) {
                $picture = new PropertyPicture();
                $picture->setUrl($url);
                $picture->setProperty($property);
                $this->em->persist($picture);
            }

            // Équipements
            foreach (($item['equipments'] ?? []) as $name) {
                $equipment = new PropertyEquipment();
                $equipment->setName($name);
                $equipment->setProperty($property);
                $this->em->persist($equipment);
            }

            // Tags
            foreach (($item['tags'] ?? []) as $name) {
                $tag = new PropertyTag();
                $tag->setName($name);
                $tag->setProperty($property);
                $this->em->persist($tag);
            }

            $created++;
        }

        $this->em->flush();

        $io->success("Import terminé : $created logement(s) créé(s), $skipped ignoré(s) (déjà existants).");

        return Command::SUCCESS;
    }

    private function slugify(string $text): string
    {
        $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        return trim($text, '-');
    }

    private function generateUniqueSlug(string $base): string
    {
        $slug = $base;
        $i = 2;

        while ($this->properties->findOneBy(['slug' => $slug])) {
            $slug = $base . '-' . $i;
            $i++;
        }

        return $slug;
    }
}