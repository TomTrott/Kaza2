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

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json($this->service->list());
    }

    #[Route('/{propertyId}', methods: ['POST'])]
    public function add(int $propertyId): JsonResponse
    {
        try {
            $favorite = $this->service->add($propertyId);

            return $this->json($favorite, 201);
        } catch (\Throwable $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    #[Route('/{propertyId}', methods: ['DELETE'])]
    public function remove(int $propertyId): JsonResponse
    {
        try {
            $this->service->remove($propertyId);

            return new JsonResponse(null, 204);
        } catch (\Throwable $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}