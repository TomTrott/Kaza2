<?php
namespace App\Entity;
use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
#[ORM\Table(name: "favorites")]
// Empêche qu'un même utilisateur ajoute deux fois la même propriété en favori
#[ORM\UniqueConstraint(
    name: "unique_user_property_favorite",
    columns: [
        "user_id",
        "property_id"
    ]
)]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(
        inversedBy: 'favorites'
    )]
    #[ORM\JoinColumn(
        name: "property_id",
        nullable: false,
        onDelete: "CASCADE" // Si la propriété est supprimée, le favori l'est aussi
    )]
    private ?Property $property = null;

    #[ORM\ManyToOne(
        inversedBy: 'favorites'
    )]
    #[ORM\JoinColumn(
        name: "user_id",
        nullable: false,
        onDelete: "CASCADE" // Si l'utilisateur est supprimé, ses favoris aussi
    )]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}