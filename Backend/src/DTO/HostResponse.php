<?php

namespace App\DTO;

/**
 * Objet représentant l'hôte d'une propriété, imbriqué dans PropertyResponse.
 */
class HostResponse
{
    public function __construct(
        public ?int $id,
        public string $name,
        public ?string $picture = null,
    ) {
    }
}