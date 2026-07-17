<?php
namespace App\Controller;
use App\Service\FavoriteService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/favorites')]
class FavoriteController extends AbstractController
{
    public function __construct(
        private FavoriteService $service
    ) {
    }

    // Liste les favoris de l'utilisateur connecté (via le token JWT)
    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json(
            $this->service->list($user)
        );
    }

    // Ajoute une propriété aux favoris de l'utilisateur connecté
    #[Route('/{propertyId}', methods: ['POST'])]
    public function add(int $propertyId): JsonResponse
    {
        try {
            $user = $this->getUser();

            $favorite = $this->service->add(
                $user,
                $propertyId
            );

            return $this->json(
                $favorite,
                201
            );

        } catch (\Throwable $e) {

            // Le code de l'exception sert de code HTTP (404, 409, etc.)
            return $this->json(
                [
                    'error' => $e->getMessage()
                ],
                $e->getCode() ?: 500
            );
        }
    }

    // Retire une propriété des favoris de l'utilisateur connecté
    #[Route('/{propertyId}', methods: ['DELETE'])]
    public function remove(int $propertyId): JsonResponse
    {
        try {
            $user = $this->getUser();

            $this->service->remove(
                $user,
                $propertyId
            );

            return new JsonResponse(
                null,
                204
            );

        } catch (\Throwable $e) {


            return $this->json(
                [
                    'error' => $e->getMessage()
                ],
                $e->getCode() ?: 500
            );
        }
    }
}