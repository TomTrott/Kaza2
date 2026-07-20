<?php

namespace App\Service;

use App\DTO\PropertyResponse;
use App\Entity\Property;
use App\Entity\User;
use App\Mapper\PropertyMapper;
use App\Repository\PropertyRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;


class PropertyService
{
    public function __construct(
        private EntityManagerInterface $em,
        private PropertyRepository $properties,
        private UserRepository $users,
        private PropertyMapper $mapper
    ) {
    }

    // Liste toutes les propriétés, mappées en DTO
    public function list(): array
    {
        $properties = $this->properties->findAllWithRelations();

        return array_map(
            fn(Property $property)
                => $this->mapper->map($property),
            $properties
        );
    }

    // Récupère une seule propriété par son id
    public function get(int $id): ?Property
    {
        return $this->properties->find($id);
    }

    // Mappe une seule propriété en DTO
    public function map(Property $property): PropertyResponse
    {
        return $this->mapper->map($property);
    }

    // Crée une nouvelle propriété (avec récupération ou création de l'hôte)
    public function create(array $data): Property
    {
        if (
    empty($data['title']) ||
    trim($data['title']) === ''
) {
            throw new \RuntimeException('title is required', 400);
        }

        $host = null;

if (!empty($data['host_id'])) {

    $host = $this->users->find($data['host_id']);

} elseif (!empty($data['host']['name'])) {

    $host = $this->users->findOneBy([
        'name' => $data['host']['name']
    ]);

    if (!$host) {

        $host = new User();

        $host->setName($data['host']['name']);
        $host->setPicture(
            $data['host']['picture'] ?? null
        );
        $host->setRole('owner');

        $this->em->persist($host);
    }
}

if (!$host) {
    throw new \RuntimeException(
        'host_id or host{name,picture} is required',
        400
    );
}

        if (!$host) {
            throw new \RuntimeException(
                'host_id or host{name,picture} is required',
                400
            );
        }

        $property = new Property();

        // L'id est généré automatiquement par Doctrine

        $property->setTitle($data['title']);
        $property->setSlug($this->generateUniqueSlug($data['title']));
        $property->setDescription($data['description'] ?? null);
        $property->setCover($data['cover'] ?? null);
        $property->setLocation($data['location'] ?? '');

        // Prix par défaut à 80 si absent ou invalide
        $price = filter_var(
    $data['price_per_night'] ?? 80,
    FILTER_VALIDATE_INT
);

if ($price === false || $price <= 0) {
    $price = 80;
}

        $property->setPricePerNight($price);
        $property->setHost($host);

        $this->em->persist($property);
        $this->em->flush();

        return $property;
    }

    // Met à jour une propriété existante (champ par champ, seulement s'il est fourni)
    public function update(int $id, array $data): Property
    {
        $property = $this->properties->find($id);

        if (!$property) {
            throw new \RuntimeException("Property not found", 404);
        }

        if (
    isset($data['title']) &&
    trim($data['title']) !== ''
) {
            $property->setTitle($data['title']);
            $property->setSlug(
                $this->generateUniqueSlug(
                    $data['title'],
                    $property->getId() // exclut la propriété elle-même du contrôle d'unicité
                )
            );
        }

        if (array_key_exists('description', $data)) {
            $property->setDescription($data['description']);
        }

        if (array_key_exists('cover', $data)) {
            $property->setCover($data['cover']);
        }

        if (array_key_exists('location', $data)) {
            $property->setLocation($data['location']);
        }

        if (isset($data['price_per_night'])) {

            $price = filter_var(
    $data['price_per_night'],
    FILTER_VALIDATE_INT
);

if ($price !== false && $price > 0) {
    $property->setPricePerNight($price);
}
        }

        $this->em->flush();

        return $property;
    }

    // Supprime une propriété
    public function delete(int $id): void
    {
        $property = $this->properties->find($id);

        if (!$property) {
            throw new \RuntimeException("Property not found", 404);
        }

        $this->em->remove($property);
        $this->em->flush();
    }

    // Transforme un titre en slug propre (minuscules, sans accents, tirets)
    private function slugify(string $text): string
    {
        $text = iconv('UTF-8', 'ASCII//TRANSLIT/IGNORE', $text);
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        return trim($text, '-');
    }

    // Génère un slug unique, en ajoutant un suffixe numérique si besoin (-2, -3, ...)
    private function generateUniqueSlug(
        string $title,
        ?int $excludeId = null
    ): string {

        $base = $this->slugify($title);
        $slug = $base;
        $i = 2;

        while (true) {

            $existing = $this->properties->findOneBy([
                'slug' => $slug
            ]);

            if (
                !$existing ||
                ($excludeId !== null && $existing->getId() === $excludeId)
            ) {
                return $slug;
            }

            $slug = $base . '-' . $i;
            $i++;
        }
    }
}