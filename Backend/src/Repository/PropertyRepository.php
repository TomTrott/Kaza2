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

    // Charge toutes les propriétés avec leurs relations en une seule requête (évite le N+1)
    public function findAllWithRelations(): array
    {
        return $this->createQueryBuilder('p')
            ->addSelect('h', 'pic', 'eq', 't')
            ->leftJoin('p.host', 'h')
            ->leftJoin('p.pictures', 'pic')
            ->leftJoin('p.equipments', 'eq')
            ->leftJoin('p.tags', 't')
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