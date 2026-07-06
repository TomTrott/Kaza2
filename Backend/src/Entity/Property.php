<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'properties')]
class Property
{
    #[ORM\Id]
    #[ORM\Column(length: 20)]
    #[Groups(['property'])]
    private ?string $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property'])]
    private string $title;

    #[ORM\Column(length: 255)]
    #[Groups(['property'])]
    private string $slug;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['property'])]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['property'])]
    private ?string $cover = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property'])]
    private string $location;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'properties')]
    #[ORM\JoinColumn(name: 'host_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['property'])]
    private ?User $host = null;

    #[ORM\Column(name: 'rating_avg', nullable: true)]
    #[Groups(['property'])]
    private ?float $ratingAvg = 0;

    #[ORM\Column(name: 'ratings_count')]
    #[Groups(['property'])]
    private int $ratingsCount = 0;

    #[ORM\Column(name: 'price_per_night')]
    #[Groups(['property'])]
    private int $pricePerNight = 80;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getCover(): ?string
    {
        return $this->cover;
    }

    public function setCover(?string $cover): static
    {
        $this->cover = $cover;
        return $this;
    }

    public function getLocation(): string
    {
        return $this->location;
    }

    public function setLocation(string $location): static
    {
        $this->location = $location;
        return $this;
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

    public function getRatingAvg(): ?float
    {
        return $this->ratingAvg;
    }

    public function setRatingAvg(?float $ratingAvg): static
    {
        $this->ratingAvg = $ratingAvg;
        return $this;
    }

    public function getRatingsCount(): int
    {
        return $this->ratingsCount;
    }

    public function setRatingsCount(int $ratingsCount): static
    {
        $this->ratingsCount = $ratingsCount;
        return $this;
    }

    public function getPricePerNight(): int
    {
        return $this->pricePerNight;
    }

    public function setPricePerNight(int $pricePerNight): static
    {
        $this->pricePerNight = $pricePerNight;
        return $this;
    }
}
