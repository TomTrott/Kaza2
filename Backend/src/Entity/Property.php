<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    /**
     * @var Collection<int, PropertyPicture>
     */
    #[ORM\OneToMany(targetEntity: PropertyPicture::class, mappedBy: 'property', orphanRemoval: true)]
    private Collection $pictures;

    /**
     * @var Collection<int, PropertyEquipment>
     */
    #[ORM\OneToMany(targetEntity: PropertyEquipment::class, mappedBy: 'property', orphanRemoval: true)]
    private Collection $equipments;

    /**
     * @var Collection<int, PropertyTag>
     */
    #[ORM\OneToMany(targetEntity: PropertyTag::class, mappedBy: 'property', orphanRemoval: true)]
    private Collection $tags;

    public function __construct()
    {
        $this->pictures = new ArrayCollection();
        $this->equipments = new ArrayCollection();
        $this->tags = new ArrayCollection();
    }

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

    /**
     * @return Collection<int, PropertyPicture>
     */
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
            // set the owning side to null (unless already changed)
            if ($picture->getProperty() === $this) {
                $picture->setProperty(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PropertyEquipment>
     */
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
            // set the owning side to null (unless already changed)
            if ($equipment->getProperty() === $this) {
                $equipment->setProperty(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PropertyTag>
     */
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
            // set the owning side to null (unless already changed)
            if ($tag->getProperty() === $this) {
                $tag->setProperty(null);
            }
        }

        return $this;
    }
}
