<?php
namespace App\Tests\Unit\Service;
use App\Entity\Favorite;
use App\Entity\Property;
use App\Entity\User;
use App\Repository\FavoriteRepository;
use App\Repository\PropertyRepository;
use App\Service\FavoriteService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class FavoriteServiceTest extends KernelTestCase
{
    // Service à tester
    private FavoriteService $service;

    /** Initialise le noyau Symfony et nettoie les tables de la base de données */
    protected function setUp(): void
    {
        // Démarre le noyau Symfony
        self::bootKernel();

        // Récupère le service FavoriteService depuis le conteneur
        $this->service = static::getContainer()
            ->get(FavoriteService::class);

        // Récupère l'EntityManager pour interagir avec la base de données
        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        $connection = $em->getConnection();

        // Nettoie les tables pour éviter les interférences entre les tests
        $connection->executeStatement(
            'DELETE FROM favorites'
        );

        $connection->executeStatement(
            'DELETE FROM properties'
        );

        $connection->executeStatement(
            'DELETE FROM users'
        );
    }

    /**Crée un utilisateur de test avec un rôle "client"*/
    private function createUser(): User
    {
        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        $user = new User();

        $user
            ->setName('Client Test')
            ->setEmail(uniqid().'@test.com') // Email unique pour éviter les conflits
            ->setRole('client');

        $em->persist($user);
        $em->flush();

        return $user;
    }

    /** Crée une propriété de test avec un hôte (utilisateur de rôle "owner")*/
    private function createProperty(): Property
    {
        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        // Crée un hôte pour la propriété
        $host = new User();

        $host
            ->setName('Host Test')
            ->setEmail(uniqid().'@host.com')
            ->setRole('owner');

        $em->persist($host);

        // Crée la propriété
        $property = new Property();

        $property
            ->setTitle('Maison Test')
            ->setSlug('maison-test-'.uniqid()) // Slug unique
            ->setLocation('Paris')
            ->setCover('test.jpg')
            ->setPricePerNight(100)
            ->setHost($host);

        $em->persist($property);
        $em->flush();

        return $property;
    }

    /** Test l'ajout d'un favori pour un utilisateur et une propriété*/
    public function testAddFavorite(): void
    {
        $user = $this->createUser();
        $property = $this->createProperty();

        // Appelle la méthode add du service
        $result = $this->service->add(
            $user,
            $property->getId()
        );

        // Vérifie que le résultat contient un ID
        $this->assertArrayHasKey(
            'id',
            $result
        );

        // Vérifie que l'ID de la propriété dans le résultat correspond à celui de la propriété créée
        $this->assertEquals(
            $property->getId(),
            $result['propertyId']
        );
    }

    /** Test l'ajout d'un favori avec une propriété introuvable*/
    public function testAddFavoritePropertyNotFound(): void
    {
        $user = $this->createUser();

        // Attend une exception RuntimeException
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionCode(404);

        // Appelle la méthode add avec un ID de propriété inexistant
        $this->service->add(
            $user,
            9999
        );
    }

    /** Test l'ajout d'un favori en double*/
    public function testAddFavoriteDuplicate(): void
    {
        $user = $this->createUser();
        $property = $this->createProperty();

        // Ajoute une première fois le favori
        $this->service->add(
            $user,
            $property->getId()
        );

        // Attend une exception RuntimeException pour un doublon
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionCode(409);

        // Tente d'ajouter à nouveau le même favori
        $this->service->add(
            $user,
            $property->getId()
        );
    }

    /**
     * Test la liste des favoris d'un utilisateur  */
    public function testListFavorites(): void
    {
        $user = $this->createUser();
        $property = $this->createProperty();

        // Ajoute un favori
        $this->service->add(
            $user,
            $property->getId()
        );

        // Récupère la liste des favoris
        $result = $this->service->list($user);

        // Vérifie que la liste contient un élément
        $this->assertCount(
            1,
            $result
        );

        // Vérifie que l'ID de la propriété dans la liste correspond à celui de la propriété créée
        $this->assertEquals(
            $property->getId(),
            $result[0]['property']['id']
        );
    }

    /** Test la suppression d'un favori Vérifie que la liste des favoris est vide après suppression. */
    public function testRemoveFavorite(): void
    {
        $user = $this->createUser();
        $property = $this->createProperty();

        // Ajoute un favori
        $this->service->add(
            $user,
            $property->getId()
        );

        // Supprime le favori
        $this->service->remove(
            $user,
            $property->getId()
        );

        // Récupère la liste des favoris
        $result = $this->service->list($user);

        // Vérifie que la liste est vide
        $this->assertCount(
            0,
            $result
        );
    }

    /** Test la suppression d'un favori introuvable Vérifie qu'une exception RuntimeException est levée avec le code 404.*/
    public function testRemoveFavoriteNotFound(): void
    {
        $user = $this->createUser();

        // Attend une exception RuntimeException
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionCode(404);

        // Tente de supprimer un favori avec un ID de propriété inexistant
        $this->service->remove(
            $user,
            9999
        );
    }
}