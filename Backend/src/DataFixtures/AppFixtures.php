<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Property;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $hasher
    ) {
    }


    public function load(ObjectManager $manager): void
    {
        // Création d'un propriétaire
        $host = new User();

        $host
            ->setName('Jean Dupont')
            ->setEmail('host@kasa.com')
            ->setRole('owner')
            ->setPasswordHash(
                $this->hasher->hashPassword(
                    $host,
                    'password'
                )
            );

        $manager->persist($host);


        // Création des logements
        $properties = [

            [
                'title' => 'Maison moderne avec piscine',
                'slug' => 'maison-moderne-piscine',
                'description' => 'Belle maison moderne avec piscine proche de la mer.',
                'cover' => '/uploads/properties/house1.jpg',
                'location' => 'Nice',
                'price' => 120,
                'rating' => 4.8
            ],

            [
                'title' => 'Appartement cosy centre ville',
                'slug' => 'appartement-cosy-centre',
                'description' => 'Appartement chaleureux au coeur de la ville.',
                'cover' => '/uploads/properties/house2.jpg',
                'location' => 'Paris',
                'price' => 90,
                'rating' => 4.5
            ],

            [
                'title' => 'Villa vue sur mer',
                'slug' => 'villa-vue-mer',
                'description' => 'Villa exceptionnelle avec vue panoramique.',
                'cover' => '/uploads/properties/house3.jpg',
                'location' => 'Marseille',
                'price' => 180,
                'rating' => 4.9
            ],

            [
                'title' => 'Chalet montagne',
                'slug' => 'chalet-montagne',
                'description' => 'Chalet confortable pour les vacances.',
                'cover' => '/uploads/properties/house4.jpg',
                'location' => 'Chamonix',
                'price' => 150,
                'rating' => 4.7
            ]
        ];


        foreach ($properties as $data) {

            $property = new Property();

            $property
                ->setTitle($data['title'])
                ->setSlug($data['slug'])
                ->setDescription($data['description'])
                ->setCover($data['cover'])
                ->setLocation($data['location'])
                ->setPricePerNight($data['price'])
                ->setRatingAvg($data['rating'])
                ->setRatingsCount(20)
                ->setHost($host);

            $manager->persist($property);
        }


        $manager->flush();
    }
}