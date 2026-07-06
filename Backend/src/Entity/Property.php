<?php

namespace App\Entity;

use App\Repository\PropertyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: PropertyRepository::class)]
#[ORM\Table(name: 'properties')]
class Property
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['property:list', 'property:detail'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property:list', 'property:detail'])]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['property:list', 'property:detail'])]
    private string $slug;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['property:detail'])]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['property:list', 'property:detail'])]
    private ?string $cover = null;

    #[ORM\Column(length: 255)]
    #[Groups(['property:list', 'property:detail'])]
    private string $location;

    #[ORM\ManyToOne(inversedBy: 'properties')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['property:list', 'property:detail'])]
    private ?User $host = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['property:list', 'property:detail'])]
    private ?float $ratingAvg = null;

    #[ORM\Column]
    #[Groups(['property:list', 'property:detail'])]
    private int $ratingsCount = 0;

    #[ORM\Column]
    #[Groups(['property:list', 'property:detail'])]
    private int $pricePerNight = 80;

    #[ORM\OneToMany(
        mappedBy: 'property',
        targetEntity: PropertyPicture::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    #[Groups(['property:detail'])]
    private Collection $pictures;

    #[ORM\OneToMany(
        mappedBy: 'property',
        targetEntity: PropertyEquipment::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    #[Groups(['property:detail'])]
    private Collection $equipments;

    #[ORM\OneToMany(
        mappedBy: 'property',
        targetEntity: PropertyTag::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true
    )]
    #[Groups(['property:detail'])]
    private Collection $tags;

    /**
     * @var Collection<int, Favorite>
     */
    #[ORM\OneToMany(targetEntity: Favorite::class, mappedBy: 'property', orphanRemoval: true)]
    #[Groups(['property:detail'])]
    private Collection $favorites;

    /**
     * @var Collection<int, Rating>
     */
    #[ORM\OneToMany(targetEntity: Rating::class, mappedBy: 'property', orphanRemoval: true)]
    #[Groups(['property:detail'])]
    private Collection $ratings;

    /**
     * @var Collection<int, Conversation>
     */
    #[ORM\OneToMany(targetEntity: Conversation::class, mappedBy: 'property', orphanRemoval: true)]
    #[Groups(['property:detail'])]
    private Collection $conversations;

    public function __construct()
    {
        $this->pictures = new ArrayCollection();
        $this->equipments = new ArrayCollection();
        $this->tags = new ArrayCollection();
        $this->favorites = new ArrayCollection();
        $this->ratings = new ArrayCollection();
        $this->conversations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPictures(): Collection
    {
        return $this->pictures;
    }

    public function addPicture(PropertyPicture $picture): static
    {
        if (!$this->pictures->contains($picture)) {
            $this->pictures->add($picture);
            $picture->setProperty($this);
        }

        return $this;
    }

    public function removePicture(PropertyPicture $picture): static
    {
        if ($this->pictures->removeElement($picture)) {
            if ($picture->getProperty() === $this) {
                $picture->setProperty(null);
            }
        }

        return $this;
    }

    public function getEquipments(): Collection
    {
        return $this->equipments;
    }

    public function addEquipment(PropertyEquipment $equipment): static
    {
        if (!$this->equipments->contains($equipment)) {
            $this->equipments->add($equipment);
            $equipment->setProperty($this);
        }

        return $this;
    }

    public function removeEquipment(PropertyEquipment $equipment): static
    {
        if ($this->equipments->removeElement($equipment)) {
            if ($equipment->getProperty() === $this) {
                $equipment->setProperty(null);
            }
        }

        return $this;
    }

    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(PropertyTag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
            $tag->setProperty($this);
        }

        return $this;
    }

    public function removeTag(PropertyTag $tag): static
    {
        if ($this->tags->removeElement($tag)) {
            if ($tag->getProperty() === $this) {
                $tag->setProperty(null);
            }
        }

        return $this;
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
            $favorite->setProperty($this);
        }

        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite)) {
            if ($favorite->getProperty() === $this) {
                $favorite->setProperty(null);
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
            $rating->setProperty($this);
        }

        return $this;
    }

    public function removeRating(Rating $rating): static
    {
        if ($this->ratings->removeElement($rating)) {
            if ($rating->getProperty() === $this) {
                $rating->setProperty(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getConversations(): Collection
    {
        return $this->conversations;
    }

    public function addConversation(Conversation $conversation): static
    {
        if (!$this->conversations->contains($conversation)) {
            $this->conversations->add($conversation);
            $conversation->setProperty($this);
        }

        return $this;
    }

    public function removeConversation(Conversation $conversation): static
    {
        if ($this->conversations->removeElement($conversation)) {
            if ($conversation->getProperty() === $this) {
                $conversation->setProperty(null);
            }
        }

        return $this;
    }
}