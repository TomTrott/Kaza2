<?php
namespace App\Service;
use App\Entity\Favorite;
use App\Entity\User;
use App\Repository\FavoriteRepository;
use App\Repository\PropertyRepository;
use Doctrine\ORM\EntityManagerInterface;

class FavoriteService
{
    public function __construct(
        private EntityManagerInterface $em,
        private FavoriteRepository $favorites,
        private PropertyRepository $properties
    ) {
    }

    // Liste uniquement les favoris de l'utilisateur donné
    public function list(User $user): array
    {
        $favorites = $this->favorites->findBy([
            'user' => $user
        ]);

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
            $favorites
        );
    }

    // Ajoute une propriété aux favoris de l'utilisateur donné
    public function add(User $user, int $propertyId): array
    {
        $property = $this->properties->find($propertyId);

        if (!$property) {
            throw new \RuntimeException('Property not found', 404);
        }

        // Vérifie que le favori n'existe pas déjà (en plus de la contrainte SQL)
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

    // Retire une propriété des favoris de l'utilisateur donné
    public function remove(User $user, int $propertyId): void
    {
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