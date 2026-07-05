<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $picture = null;

    #[ORM\Column(length: 50)]
    private string $role = 'client';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(name: 'password_hash', length: 255, nullable: true)]
    private ?string $passwordHash = null;

    #[ORM\Column(name: 'reset_token', length: 255, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(name: 'reset_expires', nullable: true)]
    private ?int $resetExpires = null;

    #[ORM\OneToMany(mappedBy: 'host', targetEntity: Property::class)]
    private Collection $properties;

    public function __construct()
    {
        $this->properties = new ArrayCollection();
    }

    // =====================================================
    // Getters & Setters
    // =====================================================

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

    public function getPicture(): ?string
    {
        return $this->picture;
    }

    public function setPicture(?string $picture): static
    {
        $this->picture = $picture;

        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPasswordHash(): ?string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(?string $passwordHash): static
    {
        $this->passwordHash = $passwordHash;

        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): static
    {
        $this->resetToken = $resetToken;

        return $this;
    }

    public function getResetExpires(): ?int
    {
        return $this->resetExpires;
    }

    public function setResetExpires(?int $resetExpires): static
    {
        $this->resetExpires = $resetExpires;

        return $this;
    }

    // =====================================================
    // Relations
    // =====================================================

    public function getProperties(): Collection
    {
        return $this->properties;
    }

    public function addProperty(Property $property): static
    {
        if (!$this->properties->contains($property)) {
            $this->properties->add($property);
            $property->setHost($this);
        }

        return $this;
    }

    public function removeProperty(Property $property): static
    {
        if ($this->properties->removeElement($property)) {
            if ($property->getHost() === $this) {
                $property->setHost(null);
            }
        }

        return $this;
    }

    // =====================================================
    // Symfony Security
    // =====================================================

    public function getUserIdentifier(): string
    {
        return $this->email ?? '';
    }

    public function getPassword(): ?string
    {
        return $this->passwordHash;
    }

    public function getRoles(): array
    {
        $roles = match ($this->role) {
            'admin' => ['ROLE_ADMIN'],
            'owner' => ['ROLE_OWNER'],
            default => ['ROLE_CLIENT'],
        };

        // Toujours garantir ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
        // Aucun champ sensible temporaire
    }
}