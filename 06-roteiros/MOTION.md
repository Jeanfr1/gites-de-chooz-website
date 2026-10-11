# Les maisons s’ouvrent sur le paysage · V3

Animation contemplative, sans masquer la réservation ni les informations pratiques.

| Progression | Mouvement | Intention |
| --- | --- | --- |
| 0 % | Plans au repos ; titre et bouton visibles | Comprendre le lieu |
| 20–55 % | La Brasserie monte ; Le Grain d’Amour descend légèrement | Ouvrir les niveaux architecturaux |
| 35–90 % | Le fil laiton se dessine entre les plans | Relier les deux expériences |
| 70–100 % | Transition vers les fiches réelles | Présenter les logements documentés |

Utiliser les deux PNG transparents de `03-hero`, sur le même canevas, et le parcours SVG de l’étude. Les positions et amplitudes sont définies dans `08-estudo/portal.css` ; le déroulement figure dans `07-integracao/timeline.json`. Il s’agit d’un mouvement 2.5D conceptuel, et non d’un plan architectural mesuré ou d’une visite WebGL.

Desktop : hero proche d’une hauteur d’écran, ouverture courte au défilement. Mobile : titre au-dessus de la scène, amplitude réduite et bouton accessible. Ne pas bloquer le défilement. Avec `prefers-reduced-motion`, conserver une scène statique et désactiver le parcours animé.

La galerie utilise un dialogue : Échap ferme, les flèches changent l’image, et le focus revient au bouton d’origine. Les réservations ouvrent la plateforme officielle. La section So Zen conserve des photographies réelles et ne simule pas une séance de yoga animée.
