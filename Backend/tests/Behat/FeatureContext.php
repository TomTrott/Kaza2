<?php

namespace App\Tests\Behat;

use App\Entity\User;
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Assert;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class FeatureContext implements Context
{
    private ?string $token = null;
    private ?Response $lastResponse = null;
    private array $lastResponseData = [];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private KernelBrowser $client
    ) {
    }

    /** @BeforeScenario */
    public function nettoyerLaBase(): void
    {
        $connection = $this->entityManager->getConnection();

        $connection->executeStatement('DELETE FROM properties');
        $connection->executeStatement('DELETE FROM users');
    }

    /**
     * @Given un utilisateur existe avec l'email :email et le mot de passe :password
     */
    public function unUtilisateurExisteAvecEmailEtMotDePasse(string $email, string $password): void
    {
        $user = new User();
        $user->setName('Test Host');
        $user->setEmail($email);
        $user->setRole('owner');
        $user->setPasswordHash(
            $this->passwordHasher->hashPassword($user, $password)
        );

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    /**
     * @Given je suis connecté avec l'email :email et le mot de passe :password
     */
    public function jeSuisConnecteAvec(string $email, string $password): void
    {
        $this->client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
            ])
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);

        Assert::assertArrayHasKey(
            'token',
            $data,
            'Login échoué : '.$this->client->getResponse()->getContent()
        );

        $this->token = $data['token'];
    }

    /**
     * @Given je ne suis pas connecté
     */
    public function jeNeSuisPasConnecte(): void
    {
        $this->token = null;
    }

    /**
     * @When je crée une propriété avec les données suivantes:
     */
    public function jeCreeUnePropriete(TableNode $table): void
    {
        $rows = $table->getRowsHash();

        $payload = [
            'title' => $rows['title'],
            'location' => $rows['location'],
            'cover' => $rows['cover'],
            'price_per_night' => (int) $rows['price_per_night'],
        ];

        $headers = [
            'CONTENT_TYPE' => 'application/json',
        ];

        if ($this->token !== null) {
            $headers['HTTP_AUTHORIZATION'] = 'Bearer '.$this->token;
        }

        $this->client->request(
            'POST',
            '/api/properties',
            [],
            [],
            $headers,
            json_encode($payload)
        );

        $this->lastResponse = $this->client->getResponse();
        $this->lastResponseData = json_decode(
            $this->lastResponse->getContent(),
            true
        ) ?? [];
    }

    /**
     * @Then la réponse devrait avoir le statut :code
     */
    public function laReponseDevraitAvoirLeStatut(int $code): void
    {
        Assert::assertSame(
            $code,
            $this->lastResponse->getStatusCode(),
            $this->lastResponse->getContent()
        );
    }

    /**
     * @Then le champ JSON :field devrait valoir :value
     */
    public function leChampJsonDevraitValoir(string $field, string $value): void
    {
        Assert::assertSame(
            $value,
            (string) ($this->lastResponseData[$field] ?? null)
        );
    }
}