<?php

namespace App\Entity;

use App\Repository\PropertyTagRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: PropertyTagRepository::class)]
#[ORM\Table(name: 'property_tags')]
class PropertyTag
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property:detail'])]
    private string $name;

    #[ORM\ManyToOne(inversedBy: 'tags')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Property $property = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getProperty(): ?Property
    {
        return $this->property;
    }

    public function setProperty(?Property $property): static
    {
        $this->property = $property;
        return $this;
    }
}