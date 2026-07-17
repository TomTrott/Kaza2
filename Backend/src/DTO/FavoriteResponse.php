<?php

namespace App\DTO;
// Objet utilisé pour envoyer les données d'un favori au frontend.

class FavoriteResponse
{
    public function __construct(
        public int $id,
        public int $propertyId,
        public string $title,
        public ?string $cover,
        public string $location,
        public int $pricePerNight
    ) {
    }
}