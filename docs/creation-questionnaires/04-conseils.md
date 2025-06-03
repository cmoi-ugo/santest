# Conseils personnalisés

Ce guide explique comment créer des recommandations personnalisées selon les scores obtenus dans chaque dimension. Cette fonctionnalité permet d'offrir des conseils adaptés à chaque participant.

## Objectif des conseils

Les conseils permettent d'afficher des recommandations personnalisées selon les scores obtenus dans chaque dimension.

**Exemple :** Pour la dimension "Stress professionnel" :  
- Score 0-30% : "Votre niveau de stress est bas" (Information)  
- Score 31-70% : "Attention aux signes de stress" (Avertissement)  
- Score 71-100% : "Stress élevé (Danger)  

## Accéder aux conseils

1. Dans l'onglet **"Dimensions"**, cliquez sur la **flèche** d'expansion d'une dimension

<img src="screenshots/creation-questionnaires/21-expand-dimension.png" alt="Expansion d'une dimension" class="large">

La section **"Conseils pour [Nom de la dimension]"** apparaît :

<img src="screenshots/creation-questionnaires/22-advice-section.png" alt="Section conseils d'une dimension" class="large">

## Créer un conseil

2. Cliquez sur **"Ajouter un conseil"**

### Formulaire de conseil

<img src="screenshots/creation-questionnaires/23-advice-form.png" alt="Formulaire de création de conseil" class="large">

3. Configurez le conseil :
   - **Score minimum** : Score à partir duquel le conseil s'affiche
   - **Score maximum** : Score jusqu'auquel le conseil s'affiche
   - **Niveau** : Importance du conseil (Information, Avertissement, Danger)
   - **Titre** : Titre du conseil affiché à l'utilisateur
   - **Conseil** : Texte détaillé de la recommandation

### Exemples de configuration

**Pour une dimension "Dépendance au tabac" :**

**Conseil 1 - Faible dépendance :**
```
Score minimum : 0
Score maximum : 30
Niveau : Information
Titre : "Dépendance faible"
Conseil : "Votre dépendance au tabac semble limitée. C'est le moment idéal pour arrêter définitivement."
```

**Conseil 2 - Dépendance modérée :**
```
Score minimum : 31
Score maximum : 70
Niveau : Avertissement
Titre : "Dépendance modérée"
Conseil : "Vous présentez des signes de dépendance. Considérez l'aide d'un professionnel de santé."
```

**Conseil 3 - Forte dépendance :**
```
Score minimum : 71
Score maximum : 100
Niveau : Danger
Titre : "Dépendance élevée"
Conseil : "Votre dépendance est importante. Consultez rapidement un médecin ou un tabacologue."
```

4. Cliquez sur **"Ajouter"** pour enregistrer

### Niveaux d'importance

Les trois niveaux disponibles ont des codes couleur différents :

- **Information** (Bleu) : Conseils généraux, situations normales
- **Avertissement** (Orange) : Situations à surveiller, recommandations préventives
- **Danger** (Rouge) : Situations préoccupantes, action immédiate recommandée

## Visualisation des conseils

Les conseils créés s'affichent sous forme de cartes colorées :

<img src="screenshots/creation-questionnaires/24-advice-cards.png" alt="Cartes des conseils avec codes couleur" class="large">

### Gestion des conseils

**Pour chaque conseil, vous pouvez :**

#### Modifier (✏️)
- **Éditer tous les paramètres** : scores, titre, texte, niveau
- **Ajuster les seuils** selon vos besoins

#### Supprimer (🗑️)
- **Confirmation demandée** avant suppression
- **Action définitive**

!!! warning "Attention aux chevauchements"
    Évitez que les plages de scores se chevauchent. L'application vérifie automatiquement et vous avertit en cas de conflit.

## Bonnes pratiques

### Répartition des scores

**Recommandation standard :**  
- **0-33%** : Niveau bas (Information)  
- **34-66%** : Niveau modéré (Avertissement)  
- **67-100%** : Niveau élevé (Danger)  

### Rédaction efficace

!!! tip "Pour des conseils pertinents"
    - **Soyez constructif** : Proposez des actions concrètes d'amélioration
    - **Adaptez le ton** : Encourageant pour les bons scores, bienveillant pour les faibles
    - **Restez spécifique** : Donnez des recommandations précises et actionables
    - **Évitez l'alarmisme** : Même pour les niveaux "Danger", restez rassurant

### Exemples de conseils bien rédigés

**Niveau Information :**
```
Titre : "Excellent équilibre"
Conseil : "Félicitations ! Votre niveau de stress semble bien maîtrisé. 
Continuez vos bonnes habitudes : activité physique régulière, 
temps de détente et sommeil de qualité."
```

**Niveau Avertissement :**
```
Titre : "Vigilance recommandée"
Conseil : "Vous montrez des signes de stress modéré. Prenez du temps 
pour vous : 15 minutes de relaxation par jour, activité physique 
3 fois par semaine. N'hésitez pas à en parler à un proche."
```

**Niveau Danger :**
```
Titre : "Accompagnement conseillé"
Conseil : "Votre niveau de stress est préoccupant et peut affecter 
votre santé. Des solutions existent pour vous aider à retrouver un équilibre."
```

## Prochaines étapes

### Navigation rapide

- **Continuer :** [Finalisation →](05-finalisation.md)
- **Retour :** [Dimensions](03-dimensions.md)

---

**Parfait !** Vos conseils personnalisés sont configurés. Passons à [la finalisation](05-finalisation.md) pour tester et publier votre questionnaire ! 💡