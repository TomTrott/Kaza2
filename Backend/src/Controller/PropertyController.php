<?php

namespace App\Controller;

use App\Repository\PropertyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/properties')]
class PropertyController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(
        PropertyRepository $repository,
        SerializerInterface $serializer
    ): JsonResponse {

        $properties = $repository->findAllOrdered();

        $json = $serializer->serialize(
            $properties,
            'json',
            [
                'ignored_attributes' => ['host']
            ]
        );

        return new JsonResponse(
            $json,
            200,
            [],
            true
        );
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(
        int $id,
        PropertyRepository $repository,
        SerializerInterface $serializer
    ): JsonResponse {

        $property = $repository->find($id);

        if (!$property) {
            return $this->json([
                'error' => 'Property not found'
            ], 404);
        }

        $json = $serializer->serialize(
            $property,
            'json',
            [
                'ignored_attributes' => ['host']
            ]
        );

        return new JsonResponse(
            $json,
            200,
            [],
            true
        );
    }
}