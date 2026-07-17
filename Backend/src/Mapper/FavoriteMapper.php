<?php

namespace App\Mapper;


use App\DTO\FavoriteResponse;
use App\Entity\Favorite;

// Mapper pour transformer un objet Favorite en DTO FavoriteResponse
class FavoriteMapper
{

    public function map(Favorite $favorite): FavoriteResponse
    {
        $property = $favorite->getProperty();


        return new FavoriteResponse(
            $favorite->getId(),

            $property->getId(),

            $property->getTitle(),

            $property->getCover(),

            $property->getLocation(),

            $property->getPricePerNight()
        );
    }
}