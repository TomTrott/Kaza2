<?php
namespace App\Mapper;
use App\DTO\PropertyResponse;
use App\Entity\Property;

/** Transforme une Entity Doctrine en objet utilisable par l'API */
class PropertyMapper
{

    /** Convertit une Property Entity vers un PropertyResponse DTO */
    public function map(Property $property): PropertyResponse
    {
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
            $property->getPricePerNight()
        );
    }
}