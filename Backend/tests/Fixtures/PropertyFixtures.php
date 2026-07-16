<?php

namespace App\Tests\Fixtures;

use App\Entity\Property;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class PropertyFixtures
{
    public static function createProperty(EntityManagerInterface $em): Property
    {
        // Création du host
        $user = new User();
        $user->setName('Test Host');
        $user->setPicture(null);
        $user->setRole('owner');

        $em->persist($user);


        // Création de la propriété
        $property = new Property();

        $property->setTitle('Maison Test');
        $property->setSlug('maison-test');
        $property->setDescription('Une maison de test');
        $property->setCover('test.jpg');
        $property->setLocation('Paris');
        $property->setPricePerNight(100);
        $property->setHost($user);


        $em->persist($property);

        $em->flush();


        return $property;
    }
}