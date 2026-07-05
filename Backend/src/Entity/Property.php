<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'properties')]
class Property
{
    #[ORM\Id]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(length: 255)]
    private string $slug;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $cover = null;

    #[ORM\Column(length: 255)]
    private string $location;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'properties')]
    #[ORM\JoinColumn(name: 'host_id', referencedColumnName: 'id', nullable: false)]
    private ?User $host = null;

    #[ORM\Column(name: 'rating_avg', nullable: true)]
    private ?float $ratingAvg = null;

    #[ORM\Column(name: 'ratings_count')]
    private int $ratingsCount = 0;

    #[ORM\Column(name: 'price_per_night')]
    private int $pricePerNight;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHost(): ?User
    {
        return $this->host;
    }

    public function setHost(?User $host): static
    {
        $this->host = $host;

        return $this;
    }
}