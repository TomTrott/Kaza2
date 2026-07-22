Feature: Création d'une propriété par un utilisateur connecté
  En tant qu'utilisateur connecté
  Je veux pouvoir créer une propriété
  Afin de la proposer à la location

  Background:
    Given un utilisateur existe avec l'email "host@test.com" et le mot de passe "password123"
    And je suis connecté avec l'email "host@test.com" et le mot de passe "password123"

  Scenario: Création réussie d'une propriété
    When je crée une propriété avec les données suivantes:
      | title           | Villa Test    |
      | location        | Bordeaux      |
      | cover           | bordeaux.jpg  |
      | price_per_night | 150           |
    Then la réponse devrait avoir le statut 201
    And le champ JSON "title" devrait valoir "Villa Test"

  Scenario: Refus si non authentifié
    Given je ne suis pas connecté
    When je crée une propriété avec les données suivantes:
      | title           | Sans Auth |
      | location        | Lyon      |
      | cover           | x.jpg     |
      | price_per_night | 90        |
    Then la réponse devrait avoir le statut 401