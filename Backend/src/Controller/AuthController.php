<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'app_auth_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwt
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (
            empty($data['name']) ||
            empty($data['email']) ||
            empty($data['password'])
        ) {
            return $this->json([
                'error' => 'Tous les champs sont obligatoires.'
            ], 400);
        }

        if ($users->findByEmail($data['email'])) {
            return $this->json([
                'error' => 'Cet email est déjà utilisé.'
            ], 409);
        }

        $user = new User();

        $user
            ->setName(trim($data['name']))
            ->setEmail(strtolower(trim($data['email'])))
            ->setRole('client')
            ->setPasswordHash(
                $hasher->hashPassword($user, $data['password'])
            );

        $em->persist($user);
        $em->flush();

        return $this->json([
            'token' => $jwt->create($user),
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'picture' => $user->getPicture(),
                'role' => $user->getRole()
            ]
        ], 201);
    }

    #[Route('/login', name: 'app_auth_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwt
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (
            empty($data['email']) ||
            empty($data['password'])
        ) {
            return $this->json([
                'error' => 'Email et mot de passe requis.'
            ], 400);
        }

        $user = $users->findByEmail($data['email']);

        if (
            !$user ||
            !$hasher->isPasswordValid($user, $data['password'])
        ) {
            return $this->json([
                'error' => 'Email ou mot de passe incorrect.'
            ], 401);
        }

        return $this->json([
            'token' => $jwt->create($user),
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'picture' => $user->getPicture(),
                'role' => $user->getRole()
            ]
        ]);
    }
}
