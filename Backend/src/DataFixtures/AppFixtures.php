<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Property;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Création d'un host
        $host = new User();

        $host->setName('Jean Dupont');
        $host->setPicture('host.jpg');
        $host->setRole('owner');
        $host->setEmail('jean@test.com');
        $host->setPasswordHash('password');

        $manager->persist($host);


        // Première propriété
        $property = new Property();

        $property->setTitle('Maison avec piscine');
        $property->setSlug('maison-avec-piscine');
        $property->setDescription(
            'Belle maison de vacances avec piscine.'
        );
        $property->setCover('villa.jpg');
        $property->setLocation('Paris');
        $property->setPricePerNight(120);
        $property->setRatingAvg(4.8);
        $property->setRatingsCount(25);

        $property->setHost($host);

        $manager->persist($property);



        // Deuxième propriété
        $property2 = new Property();

        $property2->setTitle('Appartement centre ville');
        $property2->setSlug('appartement-centre-ville');
        $property2->setDescription(
            'Appartement moderne proche des commerces.'
        );
        $property2->setCover('appartement.jpg');
        $property2->setLocation('Lyon');
        $property2->setPricePerNight(80);
        $property2->setRatingAvg(4.5);
        $property2->setRatingsCount(12);

        $property2->setHost($host);

        $manager->persist($property2);



        $manager->flush();
    }
}