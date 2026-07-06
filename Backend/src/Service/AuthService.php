<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $users,
        private UserPasswordHasherInterface $hasher,
        private JWTTokenManagerInterface $jwt
    ) {
    }

    public function register(array $data): array
    {
        if (empty($data['name'])) {
            throw new \Exception('name is required',400);
        }

        if (empty($data['email'])) {
            throw new \Exception('email is required',400);
        }

        if (empty($data['password']) || strlen($data['password']) < 6) {
            throw new \Exception('password must be at least 6 characters',400);
        }

        if ($this->users->findOneBy(['email'=>$data['email']])) {
            throw new \Exception('email already registered',409);
        }

        $user = new User();

        $user->setName($data['name']);
        $user->setEmail($data['email']);
        $user->setPicture($data['picture'] ?? null);
        $user->setRole($data['role'] ?? 'client');

        $user->setPasswordHash(
            $this->hasher->hashPassword($user,$data['password'])
        );

        $this->em->persist($user);
        $this->em->flush();

        return [
            'token'=>$this->jwt->create($user),
            'user'=>[
                'id'=>$user->getId(),
                'name'=>$user->getName(),
                'email'=>$user->getEmail(),
                'picture'=>$user->getPicture(),
                'role'=>$user->getRole(),
            ]
        ];
    }

    public function login(User $user): array
    {
        return [
            'token'=>$this->jwt->create($user),
            'user'=>[
                'id'=>$user->getId(),
                'name'=>$user->getName(),
                'email'=>$user->getEmail(),
                'picture'=>$user->getPicture(),
                'role'=>$user->getRole(),
            ]
        ];
    }

    public function requestPasswordReset(array $data): array
    {
        if (empty($data['email'])) {
            throw new \Exception('email is required',400);
        }

        $user = $this->users->findOneBy([
            'email'=>$data['email']
        ]);

        if ($user) {

            $user->setResetToken(bin2hex(random_bytes(32)));
            $user->setResetExpires(time()+3600);

            $this->em->flush();
        }

        return [
            'ok'=>true,
            'message'=>'If the email exists, a reset link has been sent.'
        ];
    }

    public function resetPassword(array $data): array
    {
        if (empty($data['token']) || empty($data['password'])) {
            throw new \Exception('token and password are required',400);
        }

        $user = $this->users->findOneBy([
            'resetToken'=>$data['token']
        ]);

        if (!$user || $user->getResetExpires() < time()) {
            throw new \Exception('invalid or expired token',400);
        }

        $user->setPasswordHash(
            $this->hasher->hashPassword($user,$data['password'])
        );

        $user->setResetToken(null);
        $user->setResetExpires(null);

        $this->em->flush();

        return [
            'ok'=>true
        ];
    }
}