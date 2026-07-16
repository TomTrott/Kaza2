<?php
namespace App\Tests\Unit\Controller;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/** Tests du contrôleur PropertyController.
 *  Vérifie que les endpoints API répondent correctement.
 */
class PropertyControllerTest extends WebTestCase
{
    /** L'endpoint GET /api/properties doit retourner une liste de propriétés.*/
    public function testListReturnsPropertiesForFrontend(): void
    {
        // Création d'un client Symfony
        $client = static::createClient();

        // Appel réel de l'API
        $client->request(
            'GET',
            '/api/properties'
        );
        // Vérifie que la réponse HTTP est correcte
        $this->assertResponseIsSuccessful();
        // Vérifie que la réponse est du JSON
        $this->assertResponseHeaderSame(
            'content-type',
            'application/json'
        );
        // Récupération des données JSON
        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );
        // Vérifie que la réponse est un tableau
        $this->assertIsArray($data);
    }

    /** Si l'API répond sans propriété,elle doit retourner un tableau JSON*/
    public function testListReturnsArray(): void
    {
        // Création du client Symfony
        $client = static::createClient();

        // Appel de l'endpoint
        $client->request(
            'GET',
            '/api/properties'
        );

        // Vérifie que Symfony répond correctement
        $this->assertResponseIsSuccessful();

        // Transforme la réponse JSON
        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );

        // Vérifie le format attendu par le frontend
        $this->assertIsArray($data);
    }

    /** Test : La création d'une propriété doit retourner une réponse HTTP correcte.*/
    public function testCreateProperty(): void
    {
        // Création du client Symfony
        $client = static::createClient();

        // Envoi d'une requête POST vers l'API
        $client->request(
            'POST',
            '/api/properties',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json'
            ],
            json_encode([
                'title' => 'Maison Test',
                'location' => 'Paris',
                'cover' => 'test.jpg',
                'price_per_night' => 100,
                'host' => [
                    'name' => 'Test Host',
                    'picture' => null
                ]
            ])
        );

        // Vérifie que la création fonctionne
        $this->assertResponseStatusCodeSame(201);

        // Vérifie que la réponse est du JSON
        $this->assertResponseHeaderSame(
            'content-type',
            'application/json'
        );
        // Récupération de la réponse
        $data = json_decode(
            $client->getResponse()->getContent(),
            true
        );
        // Vérifie que le titre est bien retourné
        $this->assertSame(
            'Maison Test',
            $data['title']
        );
    }

    /** Test : La modification d'une propriété doit retourner la propriété modifiée. */
    public function testUpdateProperty(): void
{
    // Création du client Symfony
    $client = static::createClient();

    // Création d'une propriété de test
    $client->request(
        'POST',
        '/api/properties',
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json'
        ],
        json_encode([
            'title' => 'Maison Avant',
            'location' => 'Paris',
            'price_per_night' => 100,
            'host' => [
                'name' => 'Test Host Update'
            ]
        ])
    );

    // Récupération de la réponse
    $property = json_decode(
        $client->getResponse()->getContent(),
        true
    );

    $id = $property['id'];

    // Modification de la propriété créée
    $client->request(
        'PUT',
        '/api/properties/' . $id,
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json'
        ],
        json_encode([
            'title' => 'Maison Modifiée'
        ])
    );

    // Vérifie que la modification fonctionne
    $this->assertResponseIsSuccessful();

    $data = json_decode(
        $client->getResponse()->getContent(),
        true
    );

    // Vérifie le nouveau titre
    $this->assertSame(
        'Maison Modifiée',
        $data['title']
    );
}


    /** Test : La suppression d'une propriété doit retourner un code HTTP 204.*/
    public function testDeleteProperty(): void
{
    // Création du client Symfony
    $client = static::createClient();

    // Création d'une propriété temporaire
    $client->request(
        'POST',
        '/api/properties',
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json'
        ],
        json_encode([
            'title' => 'Maison Suppression',
            'location' => 'Paris',
            'price_per_night' => 90,
            'host' => [
                'name' => 'Test Host Delete'
            ]
        ])
    );

    $property = json_decode(
        $client->getResponse()->getContent(),
        true
    );

    $id = $property['id'];

    // Suppression de la propriété créée
    $client->request(
        'DELETE',
        '/api/properties/' . $id
    );

    // Vérifie que la suppression fonctionne
    $this->assertResponseStatusCodeSame(204);
}
}