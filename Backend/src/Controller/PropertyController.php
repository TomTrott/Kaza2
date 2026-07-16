<?php

namespace App\Controller;

use App\Service\PropertyService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/api/properties')]
class PropertyController extends AbstractController
{
    public function __construct(
        private PropertyService $service
    ) {
    }


    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(
            $this->service->list()
        );
    }


    #[Route('/{id}', methods: ['GET'])]
    public function getById(int $id): JsonResponse
    {
        $property = $this->service->get($id);


        if (!$property) {
            return $this->json([
                'error' => 'Property not found'
            ], 404);
        }


        return $this->json(
            $this->service->map($property)
        );
    }


    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {

            $data = json_decode(
                $request->getContent(),
                true
            );


            $property = $this->service->create($data);


            return $this->json(
                $this->service->map($property),
                201
            );


        } catch (\Throwable $e) {

            return $this->json([
                'error' => $e->getMessage()
            ], 500);

        }
    }


    #[Route('/{id}', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request
    ): JsonResponse
    {
        try {

            $property = $this->service->update(
                $id,
                json_decode(
                    $request->getContent(),
                    true
                )
            );


            return $this->json(
                $this->service->map($property)
            );


        } catch (\Throwable $e) {

            return $this->json([
                'error' => $e->getMessage()
            ], 500);

        }
    }


    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {

            $this->service->delete($id);


            return new JsonResponse(
                null,
                204
            );


        } catch (\Throwable $e) {

            return $this->json([
                'error' => $e->getMessage()
            ], 500);

        }
    }
}