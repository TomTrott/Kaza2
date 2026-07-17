<?php

namespace App\Repository;

use App\Entity\Favorite;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Favorite>
 */
class FavoriteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Favorite::class);
    }

    // Charge les favoris avec la propriété liée en une seule requête (évite le N+1)
    public function findByUserWithProperty(User $user): array
    {
        return $this->createQueryBuilder('f')
            ->addSelect('p')
            ->innerJoin('f.property', 'p')
            ->where('f.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    // Compte rapide des favoris d'un utilisateur (sans charger les propriétés)
    public function countByUser(User $user): int
    {
        return (int) $this->createQueryBuilder('f')
            ->select('COUNT(f.id)')
            ->where('f.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}