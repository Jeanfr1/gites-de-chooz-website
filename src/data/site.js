// Facts shared by every language (numbers, links, photos). All wording lives in src/i18n/<locale>.js.
// Sources: 07-integracao (kit V3), 11-brief-v2/DEMANDES-SOPHIE.md (Sophie, 18/10/2026) and the public
// listings checked on 19/10/2026 (Gîtes de France, Airbnb, Booking).
//
// TODO(gites): Sophie to confirm — key hand-over, bins location, owner contact for the gîtes,
// Le Grain d'Amour times (Gîtes de France only gives them after booking), pool access for
// Chez Suzanne / Au Petit Bouchon guests, exterior photos (Drive files not shared), mentions légales.

export const LOCALES = ['fr', 'en', 'de', 'es', 'nl', 'pl', 'tr'];
export const DEFAULT_LOCALE = 'fr';

export const brand = { name: 'So Dream' };

// Photo helper: `kind` drives the translated alt text (src/i18n -> photoKinds).
const gdf = (key, kind) => ({ key, kind });
const sd = (gite, n, kind) => ({ key: `sd-${gite}-${n}`, src: `10-photos-so-dream/${gite}/Z62_${n}.jpg`, kind });
// A photo Sophie sent another way (file name given in full).
const own = (gite, file, key, kind) => ({ key: `sd-${gite}-${key}`, src: `10-photos-so-dream/${gite}/${file}`, kind });

export const gites = [
  {
    id: 'grain',
    slug: 'le-grain-damour',
    name: 'Le Grain d’Amour',
    number: '01',
    capacity: 2,
    bedrooms: 1,
    area: 55,
    sharedGardenPool: true,
    booking: [
      { platform: 'gdf', ref: '08G430', url: 'https://www.gites-de-france.com/fr/grand-est/ardennes/le-grain-damour-08g430' },
    ],
    // Gîtes de France communicates the times after booking — not published.
    times: null,
    features: ['wifi', 'aircon', 'kitchen', 'bedroomUpstairs', 'gardenPool'],
    // Lead photo chosen by Sophie (WhatsApp 21/10/2026, cut from her message: ~830 px wide).
    // TODO(gites): swap for the original camera file when she shares the remaining exterior photos.
    card: 'sd-grain-piscine',
    photos: [
      own('grain', 'WA_piscine.jpg', 'piscine', 'pool'),
      sd('exterieur', '8683', 'terrace'),
      sd('grain', '8659', 'living'),
      sd('grain', '8661', 'kitchen'),
      sd('grain', '8675', 'bedroom'),
      sd('grain', '8663-HDR', 'kitchen'),
      sd('grain', '8678', 'atticBedroom'),
      sd('grain', '8681', 'bathroom'),
      sd('grain', '8674', 'view'),
      sd('grain', '8671', 'poolView'),
      sd('grain', '8670', 'detail'),
      sd('grain', '8676', 'bedroom'),
      sd('grain', '8677', 'bedroom'),
      sd('grain', '8679', 'atticBedroom'),
      sd('grain', '8680', 'bedroom'),
      sd('grain', '8682', 'bathroom'),
      sd('grain', '8672', 'poolView'),
      gdf('grain-photo7-430', 'garden'),
      gdf('grain-photo8-430', 'pool'),
      gdf('grain-photo10-430', 'aerial'),
    ],
  },
  {
    id: 'brasserie',
    slug: 'la-brasserie',
    name: 'La Brasserie',
    number: '02',
    capacity: 12,
    bedrooms: 5,
    area: 240,
    sharedGardenPool: true,
    booking: [
      { platform: 'gdf', ref: '08G339', url: 'https://www.gites-de-france-ardennes.com/location-vacances-Gite-Chooz-08G339.html' },
    ],
    times: { arrival: '16:00', arrivalUntil: '18:00', departure: '10:00' }, // Airbnb listing rooms/52766277
    features: ['wifi', 'livingRoom', 'fiveBedrooms', 'viewMeuse', 'kidsArea', 'babyGear'],
    card: 'brasserie-photo-339',
    photos: [
      gdf('brasserie-photo-339', 'exterior'),
      sd('brasserie', '8703', 'dining'),
      sd('brasserie', '8713', 'living'),
      sd('brasserie', '8704-HDR', 'kitchen'),
      sd('brasserie', '8716', 'living'),
      sd('brasserie', '8717', 'bedroom'),
      sd('brasserie', '8722', 'mezzanine'),
      sd('brasserie', '8714', 'bar'),
      sd('brasserie', '8720', 'bedroom'),
      sd('brasserie', '8723', 'mezzanine'),
      sd('brasserie', '8727', 'familyBedroom'),
      sd('brasserie', '8729', 'atticBedroom'),
      sd('brasserie', '8730', 'atticBedroom'),
      sd('brasserie', '8731', 'bedroom'),
      sd('brasserie', '8753-HDR', 'bedroom'),
      sd('brasserie', '8754', 'singleBedroom'),
      sd('brasserie', '8721', 'bathroom'),
      sd('brasserie', '8725', 'bathroom'),
      sd('brasserie', '8732', 'bathroom'),
      sd('brasserie', '8715', 'stairs'),
      sd('brasserie', '8711', 'detail'),
      gdf('brasserie-photo11-339', 'terrace'),
      gdf('brasserie-photo12-339', 'terrace'),
      gdf('brasserie-photo10-339', 'aerial'),
    ],
  },
  {
    id: 'suzanne',
    slug: 'chez-suzanne',
    name: 'Chez Suzanne',
    number: '03',
    capacity: 8,
    bedrooms: 4,
    area: 100,
    sharedGardenPool: false,
    booking: [
      { platform: 'gdf', ref: '08G466', url: 'https://www.gites-de-france.com/fr/grand-est/ardennes/chez-suzanne-08g466' },
      { platform: 'booking', url: 'https://www.booking.com/hotel/fr/chez-suzanne-chooz.fr.html' },
      { platform: 'airbnb', url: 'https://www.airbnb.fr/rooms/43855290' },
    ],
    // Airbnb: arrival 16:00–20:00, departure before 10:00. Booking shows 16:00–19:00 / 09:30–11:30.
    times: { arrival: '16:00', arrivalUntil: '20:00', departure: '10:00', variesByPlatform: true },
    features: ['wifi', 'privateBathrooms', 'allInclusive', 'village'],
    card: 'sd-suzanne-8759',
    photos: [
      sd('suzanne', '8759', 'living'),
      sd('suzanne', '8757', 'dining'),
      sd('suzanne', '8758', 'kitchen'),
      sd('suzanne', '8760', 'bedroom'),
      sd('suzanne', '8762', 'bedroom'),
      sd('suzanne', '8765', 'bedroom'),
      sd('suzanne', '8766', 'atticBedroom'),
      sd('suzanne', '8761', 'bedroom'),
      sd('suzanne', '8767', 'atticBedroom'),
      sd('suzanne', '8769', 'bathroom'),
      sd('suzanne', '8756', 'detail'),
    ],
  },
  {
    id: 'bouchon',
    slug: 'au-petit-bouchon',
    name: 'Au Petit Bouchon',
    number: '04',
    capacity: 4,
    bedrooms: 2,
    area: null,
    sharedGardenPool: false,
    booking: [
      { platform: 'airbnb', url: 'https://www.airbnb.fr/rooms/1442187832227866709' },
    ],
    times: { arrival: '16:00', arrivalUntil: '20:00', departure: '10:00' }, // Airbnb
    features: ['wifi', 'allInclusive', 'terrace', 'workspace', 'parking'],
    card: 'sd-petit-bouchon-8787',
    photos: [
      sd('petit-bouchon', '8787', 'terrace'),
      sd('petit-bouchon', '8772', 'living'),
      sd('petit-bouchon', '8771', 'kitchen'),
      sd('petit-bouchon', '8777-HDR', 'bedroom'),
      sd('petit-bouchon', '8773', 'bedroom'),
      sd('petit-bouchon', '8788', 'terrace'),
      sd('petit-bouchon', '8774', 'bedroom'),
      sd('petit-bouchon', '8786', 'bedroom'),
      sd('petit-bouchon', '8776', 'bathroom'),
      sd('petit-bouchon', '8784', 'bathroom'),
    ],
  },
];

export const platforms = {
  gdf: { name: 'Gîtes de France' },
  booking: { name: 'Booking.com' },
  airbnb: { name: 'Airbnb' },
};

// Carnet: 8 points. `scope: 'pool'` only for the gîtes with the shared garden and pool.
export const carnet = [
  { id: 'wifi', n: '01', icon: 'wifi' },
  { id: 'tri', n: '02', icon: 'recycle' },
  { id: 'energy', n: '03', icon: 'leaf', perGite: 'energy' },
  { id: 'respect', n: '04', icon: 'heart' },
  { id: 'pool', n: '05', icon: 'waves', scope: 'pool' },
  { id: 'petsLinen', n: '06', icon: 'paw', perGite: ['pets', 'linen'] },
  { id: 'times', n: '07', icon: 'key' },
  { id: 'palmeraie', n: '08', icon: 'sparkle' },
];

// Tri guide — rebuilt from the local sorting posters Sophie sent.
export const tri = [
  { id: 'packaging', tone: 'sun', items: 13 },
  { id: 'glass', tone: 'sage', items: 6 },
  { id: 'compost', tone: 'leaf', items: 9 },
  { id: 'household', tone: 'stone', items: 7 },
  { id: 'dump', tone: 'brass', items: 6 },
];

export const departureChecklist = 7;

// Bonnes adresses (Sophie's list, links resolved 19/10/2026). Presqu'île de Chooz removed at her request.
// `kind` is translated (i18n -> placeKinds).
export const placeCategories = ['all', 'bakery', 'restaurant', 'shopping', 'health', 'activity', 'hike', 'visit', 'town'];
export const places = [
  { cat: 'bakery', name: 'Boulangerie Lopes', town: 'Chooz', kind: 'bakery', url: 'https://www.facebook.com/lechequecadeaulapointe/videos/1241361537858567/', inVillage: true },
  { cat: 'bakery', name: 'Boulangerie Pâte à Choux', town: 'Vireux-Wallerand', kind: 'bakery', url: 'https://www.facebook.com/p/Boulangerie-p%C3%A2te-%C3%A0-choux-100057602732749/' },
  { cat: 'bakery', name: 'Aux Délices de la Tour', town: 'Givet', kind: 'bakery', url: 'https://www.facebook.com/p/Boulangerie-aux-D%C3%A9lices-de-la-Tour-100063563829141/' },
  { cat: 'bakery', name: 'Au Pétrin 1900', town: 'Vireux-Molhain', kind: 'bakery', url: 'https://www.facebook.com/Petrinmilleneufcent/' },
  { cat: 'bakery', name: 'Pâtisserie Léval', town: 'Givet', kind: 'pastry', url: 'https://www.valdardennetourisme.com/commerce-service/boulangerie-patisserie-leval/' },
  { cat: 'restaurant', name: 'Auberge de la Voûte', town: 'Chooz', kind: 'inn', url: 'https://www.facebook.com/aubergedelavoutechooz/', inVillage: true },
  { cat: 'restaurant', name: 'Maison Baudoin', town: 'Givet', kind: 'regional', url: 'https://www.valdardennetourisme.com/restaurant/restaurant-maison-baudoin/' },
  { cat: 'restaurant', name: 'Les Mouettes', town: 'Givet', kind: 'brasserie', url: 'https://www.facebook.com/mouettesgivet/' },
  { cat: 'restaurant', name: 'L’Olivo', town: 'Givet', kind: 'italian', url: 'https://www.facebook.com/p/LOlivo-61554948454172/' },
  { cat: 'restaurant', name: 'Casa Mia', town: 'Givet', kind: 'restaurant', url: 'https://www.facebook.com/p/Restaurant-Casa-Mia-61577481585781/' },
  { cat: 'shopping', name: 'Intermarché Rives d’Europe', town: 'Givet', kind: 'supermarket', url: 'https://www.facebook.com/CentreCommercialIntermarcheRivesdEurope/' },
  { cat: 'shopping', name: 'Intermarché', town: 'Vireux-Molhain', kind: 'supermarket', url: 'https://www.facebook.com/intermarchevireux/' },
  { cat: 'shopping', name: 'Lidl · Netto · Aldi', town: 'Givet', kind: 'discount' },
  { cat: 'health', name: 'Pharmacie de la Marine', town: 'Givet', kind: 'pharmacy', url: 'https://www.facebook.com/pharmaciedelamarinegivet/' },
  { cat: 'health', name: 'Pharmacie de l’Europe', town: 'Givet', kind: 'pharmacy', url: 'https://www.facebook.com/p/Pharmacie-de-lEurope-Givet-100057335114110/' },
  { cat: 'health', name: 'Maison de Santé de la Pointe', town: 'Givet', kind: 'clinic', url: 'https://www.facebook.com/p/Maison-de-Sant%C3%A9-de-la-Pointe-Givet-61570037294521/' },
  { cat: 'activity', name: 'Captain d’Ô Douce', town: 'Givet', kind: 'boats', url: 'https://www.valdardennetourisme.com/sports-loisirs/captain-do-douce/' },
  { cat: 'activity', name: 'La Voie Verte', town: 'Chooz', kind: 'greenway', url: 'https://www.valdardennetourisme.com/incontournables-du-val-dardenne/villes-et-villages/chooz/', inVillage: true },
  { cat: 'activity', name: 'La Brasserie — Escape Room', town: 'Aubrives', kind: 'escape', url: 'https://www.labrasserie-aubrives.fr/' },
  // The four waymarked trails of the village (board at Chooz + chooz.com, Sophie 21/10/2026).
  { cat: 'hike', name: 'Le chemin des Crêtes', town: 'Chooz', kind: 'hike', trail: { n: 1, color: 'blue', km: 5, h: 1, m: 30, up: 170 }, url: 'https://www.chooz.com/parcours-ndeg1-bleu-le-chemin-des-cretes', inVillage: true },
  { cat: 'hike', name: 'Le tour de Chooz par l’écluse', town: 'Chooz', kind: 'hike', trail: { n: 2, color: 'yellow', km: 6.5, h: 1, m: 30, up: 100 }, url: 'https://www.chooz.com/parcours-ndeg2-jaune-le-tour-de-chooz-par-lecluse', inVillage: true },
  { cat: 'hike', name: 'Promenade dans les bois', town: 'Chooz', kind: 'hike', trail: { n: 3, color: 'red', km: 3.5, h: 1, m: 5, up: 180 }, url: 'https://www.chooz.com/parcours-ndeg3-rouge-promenade-dans-les-bois', inVillage: true },
  { cat: 'hike', name: 'En bordure de Landrichamps et Charnois', town: 'Chooz', kind: 'hike', trail: { n: 4, color: 'violet', km: 6.7, h: 1, m: 30, up: 160 }, url: 'https://www.chooz.com/parcours-ndeg4-violet-en-bordure-de-landrichamps-et-charnois', inVillage: true },
  { cat: 'visit', name: 'Office de tourisme', town: '10 quai des Fours · Givet', kind: 'tourism', url: 'https://www.valdardennetourisme.com/mon-sejour/pratique/loffice-de-tourisme/' },
  { cat: 'visit', name: 'Fort de Charlemont', town: 'Givet', kind: 'fort', url: 'https://www.charlemont.fr/' },
  { cat: 'visit', name: 'Grottes de Nichet', town: 'Fromelennes', kind: 'cave', url: 'https://www.fromelennes.fr/grottes-de-nichet' },
  { cat: 'visit', name: 'Écomusée du Viroin', town: 'Treignes (BE)', kind: 'museum', url: 'https://www.ecomuseeduviroin.be/' },
  { cat: 'visit', name: 'États d’Ânes', town: 'Treignes (BE)', kind: 'donkeys', url: 'https://www.facebook.com/etatsdanes/' },
  { cat: 'town', name: 'Dinant', country: 'BE', kind: 'town', url: 'https://www.dinant-tourisme.com/' },
  { cat: 'town', name: 'Namur', country: 'BE', kind: 'town', url: 'https://www.namurtourisme.be/' },
  { cat: 'town', name: 'Charleville-Mézières', town: 'Ardennes', kind: 'town', url: 'https://charleville-sedan-tourisme.fr/' },
];

// Agenda — dated items disappear by themselves once passed (build time + in the browser).
export const agenda = [
  { id: 'four-pain', dates: ['2026-11-14', '2027-02-13', '2027-04-10', '2027-06-12'], place: 'Écomusée du Viroin', town: 'Treignes (BE)', phone: '+32 60 39 96 24', phoneHref: 'tel:+3260399624', price: '9 €' },
  { id: 'marche-producteurs', dates: ['2026-11-07'], place: 'Givet', town: 'Givet', url: 'https://www.valdardennetourisme.com/agenda/marche-des-producteurs/' },
];

// Map of the Meuse (schematic, north up): lat/lon of the towns in the list.
export const mapTowns = [
  { name: 'Charleville-Mézières', lat: 49.7620, lon: 4.7260 },
  { name: 'Vireux', lat: 50.0820, lon: 4.7290 },
  { name: 'Aubrives', lat: 50.1012, lon: 4.7699 },
  { name: 'Treignes', lat: 50.0920, lon: 4.6770 },
  { name: 'Chooz', lat: 50.0954, lon: 4.7975, home: true },
  { name: 'Givet', lat: 50.1385, lon: 4.8256 },
  { name: 'Dinant', lat: 50.2607, lon: 4.9122 },
  { name: 'Namur', lat: 50.4674, lon: 4.8720 },
];
// The river through those towns (schematic course: Nouzonville, Monthermé, Revin, Fumay,
// Vireux, the Chooz loop, Givet, Hastière, Dinant, Yvoir).
export const meuseCourse = [
  [49.762, 4.726], [49.80, 4.745], [49.835, 4.755], [49.865, 4.735], [49.884, 4.731], [49.897, 4.70], [49.92, 4.668],
  [49.94, 4.642], [49.957, 4.668], [49.975, 4.70], [49.99, 4.716], [50.012, 4.708], [50.045, 4.72], [50.082, 4.729],
  [50.101, 4.770], [50.0954, 4.7975], [50.112, 4.815], [50.1385, 4.8256], [50.18, 4.83], [50.216, 4.838],
  [50.24, 4.888], [50.2607, 4.9122], [50.30, 4.893], [50.36, 4.876], [50.4674, 4.872],
];

export const sozen = {
  name: 'So Zen',
  facebookUrl: 'https://www.facebook.com/people/So-Zen/61578057072575/',
  phone: '06 21 11 43 58',
  phoneIntl: '+33 6 21 11 43 58',
  phoneHref: 'tel:+33621114358',
  address: 'Rue Tony · Chooz',
  logo: '01-identidade/so-zen-logo-transparente.png',
  photos: [
    { key: 'sozen-yoga-01', source: '05-secoes/so-zen/yoga-terrasse-01.png', region: { left: 0, top: 670, width: 946, height: 708 }, kind: 'yoga1' },
    { key: 'sozen-yoga-02', source: '05-secoes/so-zen/yoga-terrasse-02.png', region: { left: 0, top: 710, width: 946, height: 628 }, kind: 'yoga2' },
  ],
};

// So Zen calendar (Sophie, 21/10/2026: "j'ai déjà des dates"). One line per date, past dates hide themselves.
// type: yoga | constellation | bougie | noel | other — translated in i18n -> sozen.eventTypes.
// Example: { date: '2026-11-15', start: '10:00', end: '11:30', type: 'yoga', place: 'La Palmeraie' },
// TODO(gites): add Sophie's dates.
export const sozenEvents = [];

// La Palmeraie: contact = So Zen until Sophie confirms (Jean, 19/10/2026).
export const palmeraie = { contact: 'sozen' };

export const routes = [
  { id: 'home', path: '' },
  { id: 'gites', path: 'gites/' },
  ...gites.map((g) => ({ id: `fiche-${g.id}`, path: `gites/${g.slug}/`, gite: g.id })),
  { id: 'sejour', path: 'sejour/' },
  ...gites.map((g) => ({ id: `carnet-${g.id}`, path: `sejour/${g.slug}/`, gite: g.id })),
  { id: 'palmeraie', path: 'palmeraie/' },
  { id: 'adresses', path: 'bonnes-adresses/' },
  { id: 'sozen', path: 'so-zen/' },
];
