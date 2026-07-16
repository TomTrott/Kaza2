<?php
namespace App\Tests\Unit\Service;
use App\DTO\PropertyResponse;
use App\Entity\Property;
use App\Mapper\PropertyMapper;
use App\Repository\PropertyRepository;
use App\Repository\UserRepository;
use App\Service\PropertyService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

/** Tests unitaires du service PropertyService.
 *  J'utilise des mocks pour simuler les repositories.
 */
class PropertyServiceTest extends TestCase
{
    /** Test : Quand le repository retourne plusieurs propriétés,
     *  le service doit retourner ces propriétés sous forme de DTO.
     */
    public function testListReturnsAllProperties(): void
    {
        // Faux PropertyRepository
        $repository = $this->createMock(PropertyRepository::class);

       // Création de deux propriétés fictives
        $property1 = new Property();

        $property1
            ->setId(1)
            ->setTitle('Maison Paris')
            ->setCover('paris.jpg')
            ->setLocation('Paris')
            ->setPricePerNight(120);

        $property2 = new Property();

        $property2
            ->setId(2)
            ->setTitle('Villa Bordeaux')
            ->setCover('bordeaux.jpg')
            ->setLocation('Bordeaux')
            ->setPricePerNight(200);

        // Indique que findAll() doit être appelé une seule fois
        // et retourner nos deux propriétés
        $repository
            ->expects($this->once())
            ->method('findAll')
            ->willReturn([
                $property1,
                $property2
            ]);

        // Création du service avec les dépendances simulées
        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        // On appelle la méthode que l'on veut tester
        $properties = $service->list();

        // Vérifie qu'il y a bien deux propriétés retournées
        $this->assertCount(2, $properties);

        // Vérifie que les données sont correctes
        $this->assertSame(
            'Maison Paris',
            $properties[0]->title
        );

        $this->assertSame(
            'Villa Bordeaux',
            $properties[1]->title
        );
    }
    /** Test : Si aucune propriété existe,
     *  le service doit retourner un tableau vide.
     */
    public function testListReturnsEmptyArrayWhenNoProperties(): void
    {
        // Création d'un repository simulé
        $repository = $this->createMock(PropertyRepository::class);

        // Le repository retourne une liste vide
        $repository
            ->expects($this->once())
            ->method('findAll')
            ->willReturn([]);

        // Création du service
        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        // Appel de la méthode list()
        $properties = $service->list();

        // Vérifie que le résultat est bien un tableau
        $this->assertIsArray($properties);

        // Vérifie que le tableau est vide
        $this->assertEmpty($properties);
    }

    /** Vérifie que les informations nécessaires pour afficher une carte de propriété 
     *  sont bien retournées sous le bon format pour le frontend.
     */
    public function testListReturnsPropertyDataForFrontend(): void
    {
        // Création d'un repository simulé
        $repository = $this->createMock(PropertyRepository::class);

        // Création d'une propriété fictive
        $property = new Property();

        // On prépare les données utilisées
        // par la carte frontend
        $property
            ->setId(1)
            ->setTitle('Maison Paris')
            ->setCover('paris.jpg')
            ->setLocation('Paris')
            ->setPricePerNight(150);

        // Le repository retournera cette propriété
        $repository
            ->method('findAll')
            ->willReturn([
                $property
            ]);

        // Création du service
        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        // Appel du service
        $properties = $service->list();

        // Vérification des données nécessaires
        // pour afficher une PropertyCard
        $this->assertInstanceOf(
            PropertyResponse::class,
            $properties[0]
        );

        $this->assertSame(
            'Maison Paris',
            $properties[0]->title
        );

        $this->assertSame(
            'paris.jpg',
            $properties[0]->cover
        );

        $this->assertSame(
            'Paris',
            $properties[0]->location
        );

        $this->assertSame(
            150,
            $properties[0]->pricePerNight
        );
    }
}