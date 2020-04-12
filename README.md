
> Pour visualiser correctement ce README, vous pouvez accéder au projet disponible sur [Github](https://github.com/FekihTaoufik/miage-iot-tp2).
> 
> Un serveur mqtt a été mis en place sur l'adresse mqtt.miage-iot.tk . Il est accessible sans identifiants.

## Démarrage rapide

Nous avons hébergé notre propre application sur un VPS personnel.

Il vous suffit de téléverser le code source contenu dans le dossier `/esp32` sur votre ESP32.


Et rendez vous sur le site [www.miage-iot.tk](https://miage-iot.tk).

Passez a la partie `Le fonctionnement de l'application` tout en bas.

## Démarrage en localhost
### 0. Les prérequis

Vous aurez besoin de :
- [Node js](https://nodejs.org/en/)
- [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)
- Votre ESP32

## Pour faire marcher en local
### 1. Lancez le serveur

```
cd /serveur

npm install 

node main.js
```
> Vous pouvez configurer des constantes du serveur en modifiant le fichier `serveur/config.js` 

### 2. Lancez le client
L'application client est faite avec `vue-js` et la librairie de composants `vuetify`.

Vous pouvez trouver toute ce qui vous intéresse dans le fichier "/client/src/App.vue"
```
cd /client

npm install

npm run serve
```
### 4. Consultez l'adresse http://localhost:8080/ pour accéder a l'interface client.


## Le fonctionnement de l'application

Vous allez pouvoir voir les 2 graphiques + un tableau d'utilisateurs que vous pouvez alerter.

Et le plus intéressant c'est que vous pouvez rejoindre la flotte d'objets avec un nom et une adresse Mac .

L'ESP alerté va pouvoir répondre (éteindre la LED) quand la luminosité est à 0 (mettez votre doigt sur le détecteur).

Vous allez pouvoir voir une dialog qui s'affiche sur l'application disant que les personnes qui ont alerté ont bien répondu que tout va bien (vous pouvez alerter plusieurs personnes en même temps)

Il vous faut avant tout téléverser le code sur votre ESP et ça devrait être bon .