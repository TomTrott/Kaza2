<?php
namespace App\DTO;
/** Objet utilisé pour envoyer les données d'une propriété au frontend.
 * ne renvoie pas directement l'Entity Doctrine. */
class PropertyResponse
{
    public function __construct(
        public int $id,
        public string $title,
        public ?string $cover,
        public string $location,
        public int $pricePerNight,
    ) {}
}