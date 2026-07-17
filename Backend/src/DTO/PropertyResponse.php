<?php

namespace App\DTO;

/**
 * Objet utilisé pour envoyer les données d'une propriété au frontend.
 */
class PropertyResponse
{
    public function __construct(
        public ?int $id,
        public string $title,
        public ?string $cover,
        public string $location,
        public int $pricePerNight,
        public ?string $description = null,
        /** @var string[] */
        public array $pictures = [],
        /** @var string[] */
        public array $equipments = [],
        /** @var string[] */
        public array $tags = [],
        public ?float $ratingAvg = null,
        public ?HostResponse $host = null,
    ) {
    }
}