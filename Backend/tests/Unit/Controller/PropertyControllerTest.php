<?php


namespace App\Tests\Unit\Controller;


use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;


/**
 * Tests du contrôleur PropertyController.
 *
 * Vérifie que l'API retourne correctement
 * les propriétés utilisées par le frontend.
 */
class PropertyControllerTest extends WebTestCase
{

    /**
     * Test : L'endpoint GET /api/properties
     * doit retourner une liste de propriétés.
     */
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


    /**
     * Test : Si l'API répond sans propriété,
     * elle doit retourner un tableau JSON.
     */
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
}