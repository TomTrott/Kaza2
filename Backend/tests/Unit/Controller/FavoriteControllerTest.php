<?php
namespace App\Tests\Unit\Controller;
use App\Entity\Property;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

class FavoriteControllerTest extends WebTestCase
{
    // Client HTTP unique, créé une seule fois dans setUp()
    private KernelBrowser $client;

    protected function setUp(): void
    {
        parent::setUp();

        // Boote le kernel une seule fois pour tout le test
        $this->client = static::createClient();

        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        $connection = $em->getConnection();

        // Nettoyage de la base avant chaque test
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

    // Crée un utilisateur "client" de test
    private function createUser(): User
    {
        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        $user = new User();

        $user
            ->setName('Client Test')
            ->setEmail(uniqid().'@client.com') // email unique pour éviter les doublons
            ->setRole('client');

        $em->persist($user);

        $em->flush();

        return $user;
    }

    // Crée une propriété de test, avec son hôte associé
    private function createProperty(): Property
    {
        $em = static::getContainer()
            ->get(EntityManagerInterface::class);

        // L'hôte propriétaire du bien
        $host = new User();
        $host
            ->setName('Host Test')
            ->setEmail(uniqid().'@host.com')
            ->setRole('owner');

        $em->persist($host);

        $property = new Property();

        $property
            ->setTitle('Maison '.uniqid())
            ->setSlug('maison-'.uniqid()) // slug unique lui aussi
            ->setLocation('Paris')
            ->setCover('test.jpg')
            ->setPricePerNight(100)
            ->setHost($host);

        $em->persist($property);

        $em->flush();

        return $property;
    }

    // Crée un utilisateur et l'authentifie via un token JWT
    private function authenticate(KernelBrowser $client): User
    {
        $user = $this->createUser();

        $jwtManager = static::getContainer()
            ->get(JWTTokenManagerInterface::class);

        // Génère un vrai token JWT pour cet utilisateur
        $token = $jwtManager->create($user);

        // Ajoute le header Authorization à toutes les requêtes du client
        $client->setServerParameter(
            'HTTP_Authorization',
            'Bearer '.$token
        );

        return $user;
    }

    // Vérifie qu'on peut ajouter une propriété aux favoris (201 attendu)
    public function testAddFavorite(): void
    {
        $client = $this->client;
        $this->authenticate($client);
        $property = $this->createProperty();

        $client->request(
            'POST',
            '/api/favorites/'.$property->getId()
        );

        $this->assertResponseStatusCodeSame(201);
    }

    // Vérifie que la liste des favoris contient bien l'élément ajouté
    public function testListFavorites(): void
    {
        $client = $this->client;

        $this->authenticate($client);

        $property = $this->createProperty();

        // On ajoute d'abord un favori
        $client->request(
            'POST',
            '/api/favorites/'.$property->getId()
        );

        // Puis on récupère la liste
        $client->request(
            'GET',
            '/api/favorites'
        );

        $this->assertResponseIsSuccessful();

        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );

        $this->assertIsArray($data);

        // On s'attend à exactement 1 favori
        $this->assertCount(
            1,
            $data
        );
    }

    // Vérifie qu'on peut supprimer un favori existant (204 attendu)
    public function testRemoveFavorite(): void
    {
        $client = $this->client;

        $this->authenticate($client);

        $property = $this->createProperty();

        // Ajout puis suppression du même favori
        $client->request(
            'POST',
            '/api/favorites/'.$property->getId()
        );

        $client->request(
            'DELETE',
            '/api/favorites/'.$property->getId()
        );

        $this->assertResponseStatusCodeSame(204);
    }

    public function testCannotAddFavoriteTwice(): void
    {
        $client = $this->client;

        $this->authenticate($client);

        $property = $this->createProperty();

        // Premier ajout du favori
        $client->request(
            'POST',
        '/api/favorites/'.$property->getId()
    );

        $this->assertResponseStatusCodeSame(201);

        // Deuxième ajout du même favori
        $client->request(
            'POST',
            '/api/favorites/'.$property->getId()
        );

        $this->assertResponseStatusCodeSame(409);
    }

    // Vérifie que la suppression d'un favori inexistant renvoie 404
    public function testFavoriteNotFound(): void
    {
        $client = $this->client;

        $this->authenticate($client);

        $client->request(
            'DELETE',
            '/api/favorites/9999' // id qui n'existe pas
        );

        $this->assertResponseStatusCodeSame(404);
    }

}