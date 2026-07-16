<?php
namespace App\Tests\Unit\Mapper;
use App\Entity\Property;
use App\Mapper\PropertyMapper;
use PHPUnit\Framework\TestCase;

class PropertyMapperTest extends TestCase
{
    public function testMapPropertyToResponse(): void
    {
        // Arrange
        // Création d'une propriété fictive
        $property = new Property();

        $property
            ->setTitle('Maison Paris')
            ->setCover('paris.jpg')
            ->setLocation('Paris')
            ->setPricePerNight(150);

        // Création du mapper
        $mapper = new PropertyMapper();

        $response = $mapper->map($property);

        $this->assertSame(
            'Maison Paris',
            $response->title
        );

        $this->assertSame(
            'paris.jpg',
            $response->cover
        );

        $this->assertSame(
            'Paris',
            $response->location
        );

        $this->assertSame(
            150,
            $response->pricePerNight
        );
    }
}