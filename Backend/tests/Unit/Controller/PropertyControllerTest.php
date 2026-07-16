<?php
namespace App\Tests\Unit\Controller;
use App\Entity\Property;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PropertyControllerTest extends WebTestCase
{

protected function setUp(): void
{
    parent::setUp();

    static::createClient();

    $em = static::getContainer()->get(EntityManagerInterface::class);

    $connection = $em->getConnection();

    $connection->executeStatement('DELETE FROM properties');
    $connection->executeStatement('DELETE FROM users');
}

    private function createProperty(): Property
{
    $container = static::getContainer();
    $entityManager = $container->get(EntityManagerInterface::class);

    $user = new User();
    $user->setName('Test Host');
    $user->setEmail(uniqid().'@test.com');
    $user->setRole('owner');
    $user->setPicture(null);

    $entityManager->persist($user);

    $property = new Property();

    $property
        ->setTitle('Maison Test '.uniqid())
        ->setSlug('maison-test-'.uniqid())
        ->setLocation('Paris')
        ->setCover('test.jpg')
        ->setPricePerNight(100)
        ->setHost($user);

    $entityManager->persist($property);
    $entityManager->flush();

    return $property;
}

    public function testListReturnsPropertiesForFrontend(): void
    {
        $client = static::getClient();

        $this->createProperty();

        $client->request(
            'GET',
            '/api/properties'
        );

        $this->assertResponseIsSuccessful();
        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );

        $this->assertIsArray($data);
    }

    public function testListReturnsArray(): void
    {
        $client = static::getClient();

        $client->request(
            'GET',
            '/api/properties'
        );

        $this->assertResponseIsSuccessful();

        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );

        $this->assertIsArray($data);
    }

    public function testCreateProperty(): void
    {
        $client = static::getClient();

        $client->request(
            'POST',
            '/api/properties',
            [],
            [],
            [
                'CONTENT_TYPE'=>'application/json'
            ],
            json_encode([

                'title'=>'Nouvelle Maison',

                'location'=>'Bordeaux',

                'cover'=>'bordeaux.jpg',

                'price_per_night'=>150,

                'host'=>[
                    'name'=>'Host Test',
                    'picture'=>null
                ]

            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );

        $this->assertSame(
            'Nouvelle Maison',
            $data['title']
        );
    }
    public function testUpdateProperty(): void
    {
        $client = static::getClient();;

        $property = $this->createProperty();
        $client->request(
            'PUT',
            '/api/properties/'.$property->getId(),
            [],
            [],
            [
                'CONTENT_TYPE'=>'application/json'
            ],
            json_encode([
                'title'=>'Maison Modifiée'
            ])
        );

        $this->assertResponseIsSuccessful();

        $data=json_decode(
            $client->getResponse()->getContent(),
            true
        );

        $this->assertSame(
            'Maison Modifiée',
            $data['title']
        );
    }

    public function testDeleteProperty(): void
    {
        $client = static::getClient();


        $property = $this->createProperty();


        $client->request(
            'DELETE',
            '/api/properties/'.$property->getId()
        );

        $this->assertResponseStatusCodeSame(204);
    }

}