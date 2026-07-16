<?php
namespace App\Tests\Unit\Service;
use App\DTO\PropertyResponse;
use App\Entity\Property;
use App\Entity\User;
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

    /** Test : Quand le repository retourne plusieurs propriétés,le service doit retourner ces propriétés sous forme de DTO.
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

        // Le repository retourne nos deux propriétés
        $repository
            ->expects($this->once())
            ->method('findAll')
            ->willReturn([
                $property1,
                $property2
            ]);

        // Création du service
        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        // Appel de la méthode list()
        $properties = $service->list();

        // Vérifie qu'il y a bien deux propriétés retournées
        $this->assertCount(2, $properties);
        // Vérifie les données retournées
        $this->assertSame(
            'Maison Paris',
            $properties[0]->title
        );
        $this->assertSame(
            'Villa Bordeaux',
            $properties[1]->title
        );
    }

    /** Test : Si aucune propriété existe, le service doit retourner un tableau vide.
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

        // Vérifie que le résultat est un tableau
        $this->assertIsArray($properties);

        // Vérifie que le tableau est vide
        $this->assertEmpty($properties);
    }

    /** Vérifie que les informations nécessaires pour afficher une carte de propriété sont bien retournées sous le bon format pour le frontend.
     */
    public function testListReturnsPropertyDataForFrontend(): void
    {
        // Création d'un repository simulé
        $repository = $this->createMock(PropertyRepository::class);

        // Création d'une propriété fictive
        $property = new Property();
        // Données utilisées par la carte frontend
        $property
            ->setId(1)
            ->setTitle('Maison Paris')
            ->setCover('paris.jpg')
            ->setLocation('Paris')
            ->setPricePerNight(150);

        $repository
            ->method('findAll')
            ->willReturn([
                $property
            ]);

        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $properties = $service->list();

        // Vérifie que le service retourne un DTO
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

    /** Test : Création d'une propriété avec un host existant. Le service doit enregistrer la propriété.*/
    public function testCreatePropertyWithExistingHost(): void
    {
        // Repository utilisateur simulé
        $users = $this->createMock(UserRepository::class);

        // Faux utilisateur existant
        $host = new User();

        $users
            ->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($host);

        // EntityManager simulé
        $em = $this->createMock(EntityManagerInterface::class);

        $em
            ->expects($this->once())
            ->method('persist');

        $em
            ->expects($this->once())
            ->method('flush');

        $repository = $this->createMock(PropertyRepository::class);

        $repository
            ->method('findOneBy')
            ->willReturn(null);

        $service = new PropertyService(
            $em,
            $repository,
            $users,
            new PropertyMapper()
        );

        $property = $service->create([
            'title' => 'Maison Paris',
            'host_id' => 1,
            'location' => 'Paris',
            'price_per_night' => 120
        ]);

        // Vérifie les données créées
        $this->assertSame(
            'Maison Paris',
            $property->getTitle()
        );
    }

    /** Test : La création sans titre doit provoquer une erreur. */
    public function testCreatePropertyWithoutTitleThrowsException(): void
    {
        $this->expectException(\RuntimeException::class);

        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(PropertyRepository::class),
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $service->create([]);
    }

    /** Test : Modification d'une propriété existante. */
    public function testUpdatePropertyChangesData(): void
    {
        $property = new Property();

        $property
            ->setId(1)
            ->setTitle('Ancien titre');

        $repository = $this->createMock(PropertyRepository::class);
        $repository
            ->method('find')
            ->with(1)
            ->willReturn($property);

        $repository
            ->method('findOneBy')
            ->willReturn(null);

        $em = $this->createMock(EntityManagerInterface::class);

        $em
            ->expects($this->once())
            ->method('flush');

        $service = new PropertyService(
            $em,
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $updated = $service->update(1, [
            'title' => 'Nouveau titre'
        ]);

        $this->assertSame(
            'Nouveau titre',
            $updated->getTitle()
        );
    }

    /** Test : Update d'une propriété inexistante.*/
    public function testUpdatePropertyNotFoundThrowsException(): void
    {
        $this->expectException(\RuntimeException::class);
        $repository = $this->createMock(PropertyRepository::class);
        $repository
            ->method('find')
            ->willReturn(null);

        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $service->update(10, [
            'title' => 'Test'
        ]);
    }

    /** Test : Suppression d'une propriété existante. */
    public function testDeleteProperty(): void
    {
        $property = new Property();
        $repository = $this->createMock(PropertyRepository::class);
        $repository
            ->method('find')
            ->with(1)
            ->willReturn($property);

        $em = $this->createMock(EntityManagerInterface::class);
        $em
            ->expects($this->once())
            ->method('remove');

        $em
            ->expects($this->once())
            ->method('flush');

        $service = new PropertyService(
            $em,
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $service->delete(1);
        $this->assertTrue(true);
    }

    /** Test : Suppression d'une propriété inexistante.*/
    public function testDeletePropertyNotFoundThrowsException(): void
    {
        $this->expectException(\RuntimeException::class);

        $repository = $this->createMock(PropertyRepository::class);

        $repository
            ->method('find')
            ->willReturn(null);

        $service = new PropertyService(
            $this->createMock(EntityManagerInterface::class),
            $repository,
            $this->createMock(UserRepository::class),
            new PropertyMapper()
        );

        $service->delete(99);
    }
}