<?php

namespace App\Service;

use App\Entity\Favorite;
use App\Entity\User;
use App\Repository\FavoriteRepository;
use App\Repository\PropertyRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class FavoriteService
{
    public function __construct(
        private EntityManagerInterface $em,
        private FavoriteRepository $favorites,
        private PropertyRepository $properties,
        private UserRepository $users
    ) {
    }

    public function list(): array
    {
        return array_map(
            fn(Favorite $favorite) => [
                'id' => $favorite->getId(),
                'property' => [
                    'id' => $favorite->getProperty()->getId(),
                    'title' => $favorite->getProperty()->getTitle(),
                    'cover' => $favorite->getProperty()->getCover(),
                    'location' => $favorite->getProperty()->getLocation(),
                    'pricePerNight' => $favorite->getProperty()->getPricePerNight()
                ]
            ],
            $this->favorites->findAll()
        );
    }

    public function add(int $propertyId): array
    {
        $property = $this->properties->find($propertyId);

        if (!$property) {
            throw new \RuntimeException('Property not found', 404);
        }

        $user = $this->users->findOneBy([]);

        if (!$user) {
            $user = new User();
            $user->setName('Test User');
            $user->setEmail('test@test.com');
            $user->setRole('user');

            $this->em->persist($user);
        }

        $favorite = $this->favorites->findOneBy([
            'user' => $user,
            'property' => $property
        ]);

        if ($favorite) {
            throw new \RuntimeException('Already favorite', 409);
        }

        $favorite = new Favorite();
        $favorite->setUser($user);
        $favorite->setProperty($property);

        $this->em->persist($favorite);
        $this->em->flush();

        return [
            'id' => $favorite->getId(),
            'propertyId' => $property->getId()
        ];
    }

    public function remove(int $propertyId): void
    {
        $user = $this->users->findOneBy([]);

        if (!$user) {
            throw new \RuntimeException('User not found', 404);
        }

        $favorite = $this->favorites->findOneBy([
            'user' => $user,
            'property' => $propertyId
        ]);

        if (!$favorite) {
            throw new \RuntimeException('Favorite not found', 404);
        }

        $this->em->remove($favorite);
        $this->em->flush();
    }
}