// Single source of truth for every fact shown on the site.
// Sources: 07-integracao/dados.json (checked 2026-10-11) and 06-roteiros/CONTEUDO-FR.md / SO-ZEN.md.
// Rendered into the HTML at build time (vite.config.js) so the site works without JavaScript.
//
// TODO(gites): confirm with the owner — brand name (provisional), arrival/departure times,
// keys, bins location and collection days, Wi-Fi hand-over, pool rules, owner contact.
// TODO(gites): gîtes 3 and 4 stay out of the site until their records exist (no empty cards).

export const brand = {
  name: 'Les Gîtes de Chooz',
  tagline: 'Ardennes · Bords de Meuse',
  concept: 'La parenthèse verte',
  place: 'Chooz · Ardennes · Bords de Meuse',
};

const photo = (gite, file, alt) => ({
  key: `${gite}-${file.replace(/\.jpg$/, '').replace(/_.*$/, '')}`,
  file,
  alt,
});

export const gites = [
  {
    id: 'grain',
    slug: 'le-grain-damour',
    name: 'Le Grain d’Amour',
    reference: '08G430',
    number: '01',
    capacity: 2,
    bedrooms: 1,
    area: 55,
    tagline: 'Une échappée à deux.',
    description: 'Une maison indépendante au cœur d’un jardin partagé, pour savourer les Ardennes à deux.',
    bookingUrl: 'https://www.gites-de-france.com/fr/grand-est/ardennes/le-grain-damour-08g430',
    features: ['Wi-Fi', 'Cuisine et séjour', 'Chambre à l’étage', 'Jardin et piscine partagés'],
    energy: 'Charges et chauffage inclus selon la fiche de réservation. Évitez de chauffer avec les fenêtres ouvertes.',
    pets: 'Un animal autorisé selon la fiche de réservation.',
    linen: 'Linge et ménage inclus selon la fiche de réservation.',
    compare: { energy: 'Charges et chauffage inclus', pets: 'Un animal', linen: 'Linge et ménage inclus' },
    // first six = selection of dados.json; the rest of the official gallery follows
    photos: [
      photo('grain', 'photo-430_800_1067.jpg', 'La maison en bois et pierre du Grain d’Amour, sa terrasse et la piscine partagée'),
      photo('grain', 'photo13-430_800_1067.jpg', 'Le salon : canapé, fauteuil à bascule et mur en pierre'),
      photo('grain', 'photo6-430_800_600.jpg', 'La salle d’eau avec douche, habillée de bois'),
      photo('grain', 'photo15-430_800_1067.jpg', 'La cuisine équipée et la table à manger'),
      photo('grain', 'photo11-430_800_1067.jpg', 'La chambre à l’étage, sous la charpente en bois'),
      photo('grain', 'photo10-430_800_1201.jpg', 'Vue d’ensemble : la maison, la pelouse et la piscine'),
      photo('grain', 'photo12-430_800_1067.jpg', 'Le séjour et son coin repas, ouverts sur le jardin'),
      photo('grain', 'photo14-430_800_1067.jpg', 'La pièce de vie, l’escalier vers la chambre et le coin salon'),
      photo('grain', 'photo7-430_800_1067.jpg', 'Le jardin et la piscine, face aux collines'),
      photo('grain', 'photo8-430_800_1067.jpg', 'La piscine entre graminées et tournesols'),
      photo('grain', 'photo9-430_800_1067.jpg', 'La piscine et le jardin fleuri'),
    ],
  },
  {
    id: 'brasserie',
    slug: 'la-brasserie',
    name: 'La Brasserie',
    reference: '08G339',
    number: '02',
    capacity: 12,
    bedrooms: 5,
    area: 240,
    tagline: 'Le bonheur de se retrouver.',
    description: 'De généreux espaces de vie, une terrasse et la vallée de la Meuse pour les retrouvailles en famille ou entre amis.',
    bookingUrl: 'https://www.gites-de-france-ardennes.com/location-vacances-Gite-Chooz-08G339.html',
    features: ['Wi-Fi', 'Grande pièce de vie', '5 chambres', 'Vue Meuse et forêt'],
    energy: 'Charges non comprises. Les conditions de chauffage et d’électricité sont détaillées sur votre fiche de réservation. Évitez de chauffer fenêtres ouvertes.',
    pets: 'Deux animaux au maximum selon la fiche de réservation.',
    linen: 'Le linge de lit et de toilette peut faire l’objet de prestations supplémentaires. Vérifiez votre réservation.',
    compare: { energy: 'Charges non comprises', pets: 'Deux animaux au maximum', linen: 'Linge en option' },
    photos: [
      photo('brasserie', 'photo-339_800_1093.jpg', 'La Brasserie : façade en pierre, terrasse surélevée et jardin fleuri'),
      photo('brasserie', 'photo1-339_800_1422.jpg', 'La grande table sous les poutres et la cuisine ouverte'),
      photo('brasserie', 'photo4-339_800_1422.jpg', 'La pièce de vie : cheminée, table et escalier'),
      photo('brasserie', 'photo7-339_800_1422.jpg', 'Une chambre avec lit double en fer forgé'),
      photo('brasserie', 'photo24-339_800_1422.jpg', 'Une chambre mansardée avec lit double et lit bébé'),
      photo('brasserie', 'photo11-339_800_1067.jpg', 'La terrasse couverte sous la plateforme, tables et ping-pong'),
      photo('brasserie', 'photo2-339_800_1422.jpg', 'La cuisine avec îlot et la salle à manger'),
      photo('brasserie', 'photo3-339_800_1422.jpg', 'Le salon et ses grands canapés'),
      photo('brasserie', 'photo5-339_800_1422.jpg', 'Le salon vu depuis l’étage'),
      photo('brasserie', 'photo12-339_800_1201.jpg', 'La terrasse en bois, sa table et la vue sur la vallée'),
      photo('brasserie', 'photo10-339_800_1201.jpg', 'Vue sur le jardin, la piscine partagée et les collines'),
      photo('brasserie', 'photo6-339_800_1422.jpg', 'Une chambre avec lit double et mur en briques'),
      photo('brasserie', 'photo15-339_800_1422.jpg', 'Une chambre avec tête de lit en bois'),
      photo('brasserie', 'photo16-339_800_1422.jpg', 'Une chambre avec lit double et fauteuil'),
      photo('brasserie', 'photo18-339_800_1422.jpg', 'Une chambre avec grande armoire ancienne'),
      photo('brasserie', 'photo19-339_800_1422.jpg', 'Une chambre avec tête de lit sculptée'),
      photo('brasserie', 'photo21-339_800_1422.jpg', 'Une chambre mansardée avec lit double'),
      photo('brasserie', 'photo22-339_800_1422.jpg', 'Une chambre avec lit simple et lit bébé'),
      photo('brasserie', 'photo20-339_800_450.jpg', 'Une chambre avec lit simple'),
      photo('brasserie', 'photo8-339_800_1422.jpg', 'Une salle d’eau avec douche et vasque'),
      photo('brasserie', 'photo17-339_800_1422.jpg', 'Une salle d’eau avec douche, vasque et WC'),
      photo('brasserie', 'photo9-339_800_450.jpg', 'Une salle d’eau avec douche'),
      photo('brasserie', 'photo23-339_800_450.jpg', 'Une salle d’eau avec douche'),
    ],
  },
];

export const shared = {
  pool: 'Piscine extérieure partagée, chauffée de mai à septembre selon les fiches.',
  garden: 'Le jardin et la piscine sont également accessibles aux propriétaires et à leur chien.',
  wellness: 'Sauna, spa et hammam sur demande, selon disponibilité et avec supplément.',
};

// Carnet de séjour — 8 repères (CONTEUDO-FR.md, study 08-estudo). Per-gîte values come from `gites`.
export const carnet = [
  { n: '01', icon: 'wifi', title: 'Wi-Fi', text: 'Le Wi-Fi est disponible dans votre gîte. Pour le nom du réseau et le mot de passe, demandez les informations à votre hôte.' },
  { n: '02', icon: 'recycle', title: 'Tri et poubelles', text: 'Triez vos déchets et gardez les espaces communs propres. Votre hôte vous indiquera l’emplacement des bacs et les consignes de collecte adaptées au gîte.' },
  { n: '03', icon: 'leaf', title: 'Électricité et chauffage', field: 'energy' },
  { n: '04', icon: 'heart', title: 'Respect des lieux', text: 'Prenez soin du logement et des espaces partagés. Pensez à la tranquillité du voisinage et signalez à votre hôte tout problème rencontré.' },
  { n: '05', icon: 'waves', title: 'Jardin et piscine', text: 'La piscine est partagée et chauffée de mai à septembre selon les fiches. Suivez les consignes communiquées sur place et surveillez les enfants.' },
  { n: '06', icon: 'paw', title: 'Animaux et linge', fields: ['pets', 'linen'] },
  { n: '07', icon: 'key', title: 'Arrivée et départ', text: 'Les horaires, la remise des clés et les consignes de départ vous seront confirmés par votre hôte.' },
  { n: '08', icon: 'sparkle', title: 'Espace bien-être', text: 'Sauna, spa et hammam sont accessibles sur demande, selon les disponibilités des propriétaires et avec supplément. Contactez votre hôte pour les modalités.' },
];

export const outingCategories = [
  { id: 'all', label: 'Toutes les envies' },
  { id: 'nature', label: 'Nature' },
  { id: 'visites', label: 'Visites' },
  { id: 'gourmand', label: 'À savourer' },
];

export const outings = [
  { n: '01', category: 'nature', name: 'La Meuse à votre rythme', where: 'Chooz', text: 'À pied ou à vélo, découvrez la Voie Verte et le paysage des bords de Meuse.', url: 'https://www.valdardennetourisme.com/incontournables-du-val-dardenne/villes-et-villages/chooz/', label: 'Découvrir la balade' },
  { n: '02', category: 'visites', name: 'Fort de Charlemont', where: 'Givet', text: 'Un lieu d’histoire et des activités à découvrir au-dessus de la Meuse.', url: 'https://www.charlemont.fr/', label: 'Préparer ma visite' },
  { n: '03', category: 'gourmand', name: 'Pâtisserie Léval', where: '2 place Carnot · Givet', text: 'Une adresse pour les douceurs, le pain et une pause au salon de thé.', url: 'https://www.valdardennetourisme.com/commerce-service/boulangerie-patisserie-leval/', label: 'Voir l’adresse' },
  { n: '04', category: 'gourmand', name: 'Presqu’île de Chooz', where: 'Chooz', text: 'Une suggestion de restaurant dans le village. Consultez les formules et disponibilités auprès de l’établissement.', url: 'https://www.ile-chooz.com/presentation/restauration.html', label: 'Découvrir le restaurant' },
];

// TODO(gites): So Zen — dates, prices and how to sign up are asked to So Zen directly (none invented).
// TODO(gites): the So Zen illustration is a stock image that still carries the source's watermarks;
// replace it with the licensed original (or So Zen's own artwork) before the public launch.
export const sozen = {
  name: 'So Zen',
  facebookUrl: 'https://www.facebook.com/people/So-Zen/61578057072575/',
  phone: '06 21 11 43 58',
  phoneHref: 'tel:+33621114358',
  address: 'Rue Tony · Chooz',
  logo: '01-identidade/so-zen-logo-transparente.png',
  photos: [
    {
      key: 'sozen-yoga-01',
      source: '05-secoes/so-zen/yoga-terrasse-01.png',
      region: { left: 0, top: 670, width: 946, height: 708 },
      alt: 'Un moment de yoga et de relaxation sur la terrasse des gîtes',
    },
    {
      key: 'sozen-yoga-02',
      source: '05-secoes/so-zen/yoga-terrasse-02.png',
      region: { left: 0, top: 710, width: 946, height: 628 },
      alt: 'Les participants allongés sur leurs tapis, sous la terrasse couverte',
    },
  ],
};

export const nav = [
  { id: 'gites', label: 'Les gîtes', href: '/gites/' },
  { id: 'sejour', label: 'Votre séjour', href: '/sejour/' },
  { id: 'explorer', label: 'Explorer', href: '/explorer/' },
  { id: 'sozen', label: 'So Zen', href: '/so-zen/' },
];
