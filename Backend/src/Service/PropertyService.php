<?php

namespace App\Service;
use App\Mapper\PropertyMapper;
use App\Entity\Property;
use App\Entity\User;
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

    public function list(): array
    {
        // Récupère toutes les propriétés depuis la base
        $properties = $this->properties->findAll();


        // Transforme chaque Entity Property en DTO utilisable par l'API
        return array_map(
            fn(Property $property) => $this->mapper->map($property),
            $properties
        );
    }

    public function get(int $id): ?Property
    {
        return $this->properties->find($id);
    }

    public function create(array $data): Property
    {
        if (empty($data['title'])) {
            throw new \RuntimeException('title is required', 400);
        }

        $host = null;

        if (!empty($data['host_id'])) {
            $host = $this->users->find($data['host_id']);
        }

        if (!$host && !empty($data['host']['name'])) {

            $host = $this->users->findOneBy([
                'name' => $data['host']['name']
            ]);

            if (!$host) {

                $host = new User();
                $host->setName($data['host']['name']);
                $host->setPicture($data['host']['picture'] ?? null);
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

        $property = new Property();

        // L'id est généré automatiquement par Doctrine

        $property->setTitle($data['title']);
        $property->setSlug($this->generateUniqueSlug($data['title']));
        $property->setDescription($data['description'] ?? null);
        $property->setCover($data['cover'] ?? null);
        $property->setLocation($data['location'] ?? '');

        $price = isset($data['price_per_night'])
            ? (int) $data['price_per_night']
            : 80;

        if ($price <= 0) {
            $price = 80;
        }

        $property->setPricePerNight($price);
        $property->setHost($host);

        $this->em->persist($property);
        $this->em->flush();

        return $property;
    }

    public function update(int $id, array $data): Property
    {
        $property = $this->properties->find($id);

        if (!$property) {
            throw new \RuntimeException("Property not found", 404);
        }

        if (isset($data['title'])) {
            $property->setTitle($data['title']);
            $property->setSlug(
                $this->generateUniqueSlug(
                    $data['title'],
                    $property->getId()
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

            $price = (int) $data['price_per_night'];

            if ($price > 0) {
                $property->setPricePerNight($price);
            }
        }

        $this->em->flush();

        return $property;
    }

    public function delete(int $id): void
    {
        $property = $this->properties->find($id);

        if (!$property) {
            throw new \RuntimeException("Property not found", 404);
        }

        $this->em->remove($property);
        $this->em->flush();
    }

    private function slugify(string $text): string
    {
        $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        return trim($text, '-');
    }

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