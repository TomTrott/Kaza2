<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['property'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property'])]
    private string $name;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['property'])]
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

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Favorite::class, orphanRemoval: true)]
    private Collection $favorites;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Rating::class, orphanRemoval: true)]
    private Collection $ratings;

    #[ORM\OneToMany(mappedBy: 'sender', targetEntity: Message::class)]
    private Collection $messages;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: Conversation::class)]
    private Collection $ownedConversations;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Conversation::class)]
    private Collection $clientConversations;

    public function __construct()
    {
        $this->properties = new ArrayCollection();
        $this->favorites = new ArrayCollection();
        $this->ratings = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->ownedConversations = new ArrayCollection();
        $this->clientConversations = new ArrayCollection();
    }

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

        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
    }

    /**
     * @return Collection<int, Favorite>
     */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(Favorite $favorite): static
    {
        if (!$this->favorites->contains($favorite)) {
            $this->favorites->add($favorite);
            $favorite->setUser($this);
        }

        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite)) {
            // set the owning side to null (unless already changed)
            if ($favorite->getUser() === $this) {
                $favorite->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Rating>
     */
    public function getRatings(): Collection
    {
        return $this->ratings;
    }

    public function addRating(Rating $rating): static
    {
        if (!$this->ratings->contains($rating)) {
            $this->ratings->add($rating);
            $rating->setUser($this);
        }

        return $this;
    }

    public function removeRating(Rating $rating): static
    {
        if ($this->ratings->removeElement($rating)) {
            // set the owning side to null (unless already changed)
            if ($rating->getUser() === $this) {
                $rating->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getOwnedConversations(): Collection
    {
        return $this->ownedConversations;
    }

    public function addOwnedConversation(Conversation $ownedConversation): static
    {
        if (!$this->ownedConversations->contains($ownedConversation)) {
            $this->ownedConversations->add($ownedConversation);
            $ownedConversation->setOwner($this);
        }

        return $this;
    }

    public function removeOwnedConversation(Conversation $ownedConversation): static
    {
        if ($this->ownedConversations->removeElement($ownedConversation)) {
            // set the owning side to null (unless already changed)
            if ($ownedConversation->getOwner() === $this) {
                $ownedConversation->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getClientConversations(): Collection
    {
        return $this->clientConversations;
    }

    public function addClientConversation(Conversation $clientConversation): static
    {
        if (!$this->clientConversations->contains($clientConversation)) {
            $this->clientConversations->add($clientConversation);
            $clientConversation->setClient($this);
        }

        return $this;
    }

    public function removeClientConversation(Conversation $clientConversation): static
    {
        if ($this->clientConversations->removeElement($clientConversation)) {
            // set the owning side to null (unless already changed)
            if ($clientConversation->getClient() === $this) {
                $clientConversation->setClient(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setSender($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getSender() === $this) {
                $message->setSender(null);
            }
        }

        return $this;
    }
}
