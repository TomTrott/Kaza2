<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Response;


/**
 * Authenticator temporaire.
 * Permet au container Symfony de charger correctement
 * les services pendant les tests.
 */
class JwtAuthenticator extends AbstractAuthenticator
{

    /**
     * Vérifie si cette authentification doit être utilisée.
     */
    public function supports(Request $request): ?bool
    {
        return false;
    }


    /**
     * Création du Passport d'authentification.
     */
    public function authenticate(Request $request): Passport
    {
        return new SelfValidatingPassport(
            new UserBadge('anonymous')
        );
    }


    /**
     * Gestion du succès d'authentification.
     */
    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token,
        string $firewallName
    ): ?Response {
        return null;
    }


    /**
     * Gestion de l'échec d'authentification.
     */
    public function onAuthenticationFailure(
        Request $request,
        AuthenticationException $exception
    ): ?Response {
        return null;
    }
}