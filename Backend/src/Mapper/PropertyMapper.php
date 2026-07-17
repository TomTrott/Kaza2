<?php
namespace App\Mapper;

use App\DTO\HostResponse;
use App\DTO\PropertyResponse;
use App\Entity\Property;

/** Transforme une Entity Doctrine en objet utilisable par l'API */
class PropertyMapper
{

    /** Convertit une Property Entity vers un PropertyResponse DTO */
    public function map(Property $property): PropertyResponse
    {
        $host = $property->getHost();

        return new PropertyResponse(

            // Identifiant de la propriété
            $property->getId(),

            // Titre de l'annonce
            $property->getTitle(),

            // Image principale
            $property->getCover(),

            // Localisation
            $property->getLocation(),

            // Prix par nuit
            $property->getPricePerNight(),

            // Description complète
            $property->getDescription(),

            // Galerie d'images (tableau de strings)
            array_map(
                fn($picture) => $picture->getUrl(),
                $property->getPictures()->toArray()
            ),

            // Équipements (tableau de strings)
            array_map(
                fn($equipment) => $equipment->getName(),
                $property->getEquipments()->toArray()
            ),

            // Tags / catégories (tableau de strings)
            array_map(
                fn($tag) => $tag->getName(),
                $property->getTags()->toArray()
            ),

            // Note moyenne
            $property->getRatingAvg(),

            // Hôte (id, name, picture)
            $host ? new HostResponse(
                $host->getId(),
                $host->getName(),
                $host->getPicture()
            ) : null
        );
    }
}