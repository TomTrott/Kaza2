<?php

namespace App\Repository;

use App\Entity\Property;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PropertyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Property::class);
    }

    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByHost(int $hostId): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.host = :host')
            ->setParameter('host', $hostId)
            ->orderBy('p.id', 'DESC')
            ->getQuery()
            ->getResult();
    }
}