# Dimensions de scoring

Ce guide explique comment créer un système de scoring avancé avec des dimensions personnalisées. Cette fonctionnalité optionnelle permet d'analyser les réponses selon différents critères et de calculer des scores automatiquement.

## Comprendre les dimensions

### Qu'est-ce qu'une dimension ?

Les dimensions permettent d'analyser les réponses selon différents critères et de calculer des scores personnalisés.

**Exemple :** Pour un questionnaire de bien-être, vous pourriez créer les dimensions :  
- Stress physique (questions 1, 3, 5)  
- Stress émotionnel (questions 2, 4, 6)  
- Qualité du sommeil (questions 7, 8, 9)  

### Fonctionnement du scoring

1. **Chaque réponse** peut être associée à un ou plusieurs scores
2. **Les points s'accumulent** selon les choix du participant
3. **Un pourcentage** est calculé automatiquement pour chaque dimension
4. **Des conseils personnalisés** peuvent être affichés selon ce pourcentage

## Créer des dimensions

1. Cliquez sur l'onglet **"Dimensions"**

<img src="/screenshots/creation-questionnaires/15-dimensions-tab.png" alt="Onglet Dimensions" class="large">

2. Cliquez sur **"Ajouter une dimension"**

<img src="/screenshots/creation-questionnaires/16-add-dimension.png" alt="Bouton Ajouter une dimension" class="medium">

### Formulaire de dimension

<img src="/screenshots/creation-questionnaires/17-dimension-form.png" alt="Formulaire de création de dimension" class="large">

3. Remplissez les informations :
   - **Nom** : Titre de la dimension (obligatoire)
   - **Description** : Explication de ce que mesure cette dimension (optionnel)

**Exemples de dimensions :**

**Pour un questionnaire de dépendance au tabac :**  
- Nom : "Dépendance physique"  
- Description : "Évalue les signes de dépendance physique à la nicotine"  

**Pour un questionnaire de stress :**  
- Nom : "Stress professionnel"  
- Description : "Mesure le niveau de stress lié au travail"  

4. Cliquez sur **"Ajouter"** pour créer la dimension

## Lier les questions aux dimensions

Une fois les dimensions créées, vous pouvez associer chaque réponse à un score :

5. Retournez dans l'onglet **"Questions"**

6. Cliquez sur l'icône **paramètres** ⚙️ d'une question

La section **"Liaison avec les dimensions"** apparaît :

<img src="/screenshots/creation-questionnaires/18-dimension-linking.png" alt="Interface de liaison avec les dimensions" class="large">

7. Cliquez sur **"Ajouter une règle de scoring"**

### Configuration du scoring

<img src="/screenshots/creation-questionnaires/19-scoring-form.png" alt="Formulaire de règle de scoring" class="large">

8. Configurez la règle :
   - **Dimension** : Choisissez la dimension concernée
   - **Réponse** : Sélectionnez quelle réponse déclenche le score
   - **Score** : Définissez le nombre de points attribués

**Exemple de configuration :**
```
Si la réponse "Oui, quotidiennement" est sélectionnée 
→ +5 points en "Dépendance physique"

Si la réponse "Jamais" est sélectionnée 
→ +0 points en "Dépendance physique"
```

9. Cliquez sur **"Ajouter"** pour enregistrer la règle

### Tableau récapitulatif

Les règles créées s'affichent dans un tableau :

<img src="/screenshots/creation-questionnaires/20-scoring-rules-table.png" alt="Tableau des règles de scoring" class="large">

!!! tip "Conseil de scoring"
    Utilisez une échelle cohérente (ex: 0-5 points par question) pour faciliter l'interprétation des résultats.

## Bonnes pratiques

### Organisation des dimensions

- **3-5 dimensions maximum** : Trop de dimensions complexifient l'analyse
- **Équilibrez les questions** : Répartissez équitablement entre dimensions
- **Scoring cohérent** : Utilisez une échelle de points similaire pour toutes les dimensions

### Exemples d'attribution de points

**Pour une échelle de satisfaction (1-5) :**
```
1 (Très insatisfait) → 0 points
2 (Insatisfait) → 1 point
3 (Neutre) → 2 points
4 (Satisfait) → 3 points
5 (Très satisfait) → 4 points
```

**Pour une question Oui/Non sur un problème :**
```
Oui → 2 points (problème identifié)
Non → 0 points (pas de problème)
```

## Prochaines étapes

### Navigation rapide

- **Continuer :** [Conseils personnalisés →](04-conseils.md)
- **Retour :** [Gestion des questions](02-questions.md)
- **Finaliser :** [Finalisation](05-finalisation.md)

---

**Excellent !** Votre système de scoring est configuré. Passons aux [conseils personnalisés](04-conseils.md) pour guider vos utilisateurs selon leurs résultats ! 🎯