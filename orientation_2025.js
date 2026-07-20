// ============================================================
// GUIDE D'INFORMATION UNIVERSITAIRE 2025-2026 (Licence) - BENIN
// Source officielle : MESRS / DGES - Direction de l'Orientation
// Structure JS pour EduAya Pro - Moteur d'orientation
// ============================================================

const ORIENTATION_META = {
  edition: "2025-2026",
  source: "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESRS/DGES)",
  plateforme: "https://apresmonbac.bj",
  contact: { tel: "(00229) 21 30 53 93", email: "contact.mesrs@gouv.bj", bp: "01 BP 348 Cotonou" },
  reglesImportantes: [
    "Après classement et sélection, les demandes de transfert d'une université à une autre sont irrecevables.",
    "Tout changement de filière conduit à la perte de l'allocation.",
    "Compétences en Maths/PC/SVT nécessaires pour les bacs techniques (DT) et DEAT selon la filière.",
    "Bacheliers étrangers (béninois) : dossier physique pour intégration sur la plateforme.",
    "DEAT année N-1 : résultats exploités pour le classement de l'année N."
  ],
  formuleClassement: "M = (m1*x + m2*y + m3*z) / (x + y + z) — notes des 3 matières fondamentales affectées de leurs coefficients dans la série du bac",
  exemples: [
    "Médecine Bac D : M = (SVT*5 + Math*4 + SPCT*4) / 13",
    "Médecine Bac C : M = (SVT*2 + Math*6 + SPCT*5) / 13"
  ],
  ordreAllocation: ["Bourse", "Partiellement payant / Aide universitaire", "Entièrement payant"]
};

// mode: "Classement" | "Concours" | "Payant"
// bourse / aide = quotas d'allocations (aide = aides universitaires / FPP)
const UNIVERSITES_PUBLIQUES = [
{
  sigle: "UAC", nom: "Université d'Abomey-Calavi",
  etablissements: [
  { sigle: "IRSP", nom: "Institut Régional de Santé Publique", filieres: [
    { nom: "Santé publique polyvalente", bourse: 17, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Agent de santé communautaire; surveillance épidémiologique; recherche en santé; planification/suivi-évaluation; hygiène et assainissement" }
  ]},
  { sigle: "FLASH-Adjarra", nom: "Faculté des Lettres, Arts et Sciences Humaines - Adjarra", filieres: [
    { nom: "Géographie et Aménagement du Territoire", bourse: 60, aide: 340, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT","DT/STI"], matieres: ["Français","Hist-Géo/Anglais (DT/STI)","Maths"], notes: "DEAT: les 3 matières écrites", debouches: "Enseignement; recherche; assainissement" },
    { nom: "Socio-Anthropologie", bourse: 63, aide: 323, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT","DT/STI"], matieres: ["Français","Hist-Géo/Anglais (DT/STI)","Maths"], debouches: "Centres sociaux; ministères; recherche" },
    { nom: "Anglais", bourse: 134, aide: 667, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT","DT/STI"], matieres: ["Français","Hist-Géo/Maths (DT/STI)","Anglais (LV1)"], debouches: "Interprétariat; tourisme; enseignements" }
  ]},
  { sigle: "IMSP", nom: "Institut de Mathématiques et de Sciences Physiques", filieres: [
    { nom: "Classes préparatoires MPSI et PCSI", bourse: 81, aide: 0, mode: "Classement", bacs: ["C","D","E","F"], matieres: ["Maths","PCT","Français"], debouches: "Grandes écoles d'ingénieurs; Masters Maths/Physique/Informatique" }
  ]},
  { sigle: "FLLAC", nom: "Faculté des Lettres, Langues, Arts et Communications", filieres: [
    { nom: "Allemand", bourse: 12, aide: 75, mode: "Classement", bacs: ["A1","A2","B"], matieres: ["Allemand (LV1)","Anglais (LV2)/Hist-Géo (B)","Français"], debouches: "Interprétariat; tourisme; enseignement; édition" },
    { nom: "Anglais", bourse: 82, aide: 640, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Anglais (LV1)","Français","Hist-Géo"], debouches: "Interprétariat; tourisme; enseignement; édition" },
    { nom: "Espagnol", bourse: 12, aide: 69, mode: "Classement", bacs: ["A1","A2","B"], matieres: ["Espagnol (LV1)","Anglais (LV2)/Hist-Géo (B)","Français"], debouches: "Interprétariat; tourisme; enseignement; édition" },
    { nom: "Lettres Modernes", bourse: 88, aide: 60, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1)","Philo"], debouches: "Enseignement; édition; didactique" },
    { nom: "Sciences du Langage et de la Communication", bourse: 82, aide: 311, mode: "Classement", bacs: ["A1","A2","B","C","D","G3","G1"], matieres: ["Français","Anglais (LV1)","Philo/Etude de cas (G)"], debouches: "Didacticien; consultant en éducation bi/plurilingue et interculturelle" }
  ]},
  { sigle: "INMAAC", nom: "Institut National des Métiers d'Arts, d'Archéologie et de la Culture", filieres: [
    { nom: "Administration Culturelle", bourse: 7, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Hist-Géo","Philo"], debouches: "Production; diffusion et communication; management d'artistes et structures culturelles" },
    { nom: "Arts dramatiques", bourse: 7, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Hist-Géo","Philo"], debouches: "Comédien; metteur en scène; régisseur; voix off; doublage" },
    { nom: "Arts Plastiques", bourse: 8, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D","DT/Arts textile","DT/Communication graphique"], matieres: ["Français","Philo","Maths"], notes: "DT: Dissertation, Histoire de l'Art, Art Appliqué", debouches: "Dessinateur; peintre; sculpteur; designer; illustrateur; maquettiste; critique d'art" },
    { nom: "Musique et Musicologie", bourse: 7, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D","DT/Musique","DT/MAO"], matieres: ["Français","Anglais (LV1)","Maths"], notes: "DT: Harmonie, Théorie musicale, Histoire de la musique/organologie ou MAO", debouches: "Chanteur; chef de chœur; designer sonore; compositeur; musicien" },
    { nom: "Cinéma et Audiovisuel", bourse: 7, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","PCT (Maths pour A)","Philo"], debouches: "Scénariste; storyboardeur; scénographe; régisseur; monteur image" }
  ]},
  { sigle: "CIFRED", nom: "Centre Inter Facultaire de Formation et de Recherche en Environnement pour le Développement Durable", filieres: [
    { nom: "Environnement, Hygiène et Santé publique", bourse: 8, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D","EA"], matieres: ["SVT (Mobilisation des ressources en eau pour EA)","PCT (LV1 pour A, Economie pour B)","Hist-Géo (Assainissement pour EA)"], debouches: "Inspecteur d'action sanitaire" }
  ]},
  { sigle: "ICV", nom: "Institut de Cadre de Vie (ex-IGATE)", filieres: [
    { nom: "Gestion du cadre de vie", bourse: 56, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Maths (LV1 pour A, Economie pour B)","Français","Hist-Géo"], debouches: "Aménagement; reboisement; sauvegarde environnementale et sociale; restauration de l'environnement" },
    { nom: "Gestion des changements climatiques et des écosystèmes", bourse: 9, aide: 0, mode: "Classement", bacs: ["C","D","EA"], matieres: ["Maths","Français","Hist-Géo (Mobilisation des ressources en eau pour EA)"], debouches: "Changement climatique; aménagement et gestion des ressources naturelles" },
    { nom: "Géomatique et Environnement", bourse: 8, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Français","Hist-Géo"], debouches: "Spécialiste en géomatique" },
    { nom: "Planification et Gestion des espaces urbains et ruraux", bourse: 32, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Maths (LV1 pour A, Economie pour B)","Français","Hist-Géo"], debouches: "Planification et gestion des espaces urbains" }
  ]},
  { sigle: "INMeS", nom: "Institut National Médico-Sanitaire", filieres: [
    { nom: "Sciences Infirmières", bourse: 35, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["PCT","SVT"], debouches: "Soins infirmiers en hôpitaux et centres de santé" },
    { nom: "Sciences Obstétricales", bourse: 41, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["PCT","SVT"], debouches: "Soins obstétricaux en hôpitaux et centres de santé" }
  ]},
  { sigle: "INE", nom: "Institut National de l'Eau", filieres: [
    { nom: "Hydrologie quantitative et Gestion intégrée des Ressources", bourse: 34, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Hydrologues; chimistes des eaux; contrôle qualité" },
    { nom: "Hydrogéologie et Gestion intégrée des Ressources", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Hydrogéologues; contrôle qualité" },
    { nom: "Ecohydrologie et Gestion intégrée des Ressources", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Ecohydrologues; hydrogéophysiciens" },
    { nom: "Gestion des crises et risques liés à l'eau et au climat", bourse: 27, aide: 0, mode: "Classement", bacs: ["C","D","EA","DEAT/AER"], matieres: ["Maths","PCT","SVT (PE pour EA)"], notes: "DEAT/AER: les 3 matières écrites", debouches: "Gestion des risques hydro-climatiques" },
    { nom: "Génie rural et Maîtrise de l'Eau", bourse: 19, aide: 0, mode: "Classement", bacs: ["C","D","EA","DEAT/AER"], matieres: ["Maths","PCT","SVT (PE pour EA)"], debouches: "Contrôleur du génie rural; aménagements hydro-agricoles" },
    { nom: "Hydraulique et Assainissement", bourse: 55, aide: 0, mode: "Classement", bacs: ["C","D","EA"], matieres: ["Maths","PCT","SVT (PE pour EA)"], debouches: "Contrôleur des travaux d'assainissement; génie sanitaire" },
    { nom: "Eau Hygiène et Assainissement (EHA)", bourse: 54, aide: 0, mode: "Classement", bacs: ["C","D","EA","DEAT/AER"], matieres: ["Maths","PCT","SVT (PE pour EA)"], debouches: "Action communautaire en génie sanitaire; auto-emploi" }
  ]},
  { sigle: "ENEAM", nom: "Ecole Nationale d'Economie Appliquée et de Management", filieres: [
    { nom: "Administration des Réseaux informatiques", bourse: 50, aide: 0, mode: "Classement", bacs: ["C","D","DT/IMI"], matieres: ["Maths","Français","Anglais"], notes: "DT/IMI: Maths appliquées, Français, Technologie des systèmes informatiques", debouches: "Technicien réseaux; maintenance informatique; développeur d'applications" },
    { nom: "Analyse Informatique et Programmation", bourse: 34, aide: 0, mode: "Classement", bacs: ["C","D","DT/IMI"], matieres: ["Maths","Français","Anglais"], debouches: "Développeur d'applications (Desktop, Web, Mobile)" },
    { nom: "Assurance", bourse: 7, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths ou Etude de Cas (G)","Français","Anglais"], debouches: "Chargé de clientèle; conseiller en négoce; gestionnaire de patrimoine" },
    { nom: "Banque et Finance de Marché", bourse: 8, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths ou Etude de Cas (G)","Français","Anglais"], debouches: "Chargé de clientèle; conseiller en marché; gestion de portefeuilles" },
    { nom: "Banque et Institutions des Micro finances", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths ou Etude de Cas (G)","Français","Anglais"], debouches: "Banque; microfinance; gestion de patrimoine" },
    { nom: "Marketing", bourse: 8, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3","DT/CoM"], matieres: ["Economie (B)/Maths (C-D)/Etude de Cas (G)","Français","Anglais (LV pour B)"], debouches: "Marketing et communication commerciale; marketing digital; community management; e-commerce" },
    { nom: "Gestion des Ressources Humaines", bourse: 4, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Economie (B)/Maths (C-D)/Etude de Cas (G)","Français","Anglais (LV1 pour B)"], debouches: "Gestion du personnel et RH en entreprises privées et publiques" },
    { nom: "Gestion des Transports", bourse: 7, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths ou Etude de Cas (G)","Français","Anglais"], debouches: "Entreprises maritimes; logistique; administrations" },
    { nom: "Gestion de Logistique", bourse: 11, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths ou Etude de Cas (G)","Français","Anglais"], debouches: "Logistique; agences de voyage; approvisionnement" },
    { nom: "Statistique Economique et Sectorielle", bourse: 22, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture générale","Maths"], debouches: "Statisticien; cabinets d'études et de conseils" },
    { nom: "Statistique Démographique et Sociale", bourse: 31, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture générale","Maths"], debouches: "Statisticien; cabinets d'études et de conseils" },
    { nom: "Planification et Gestion des Projets", bourse: 23, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Français","Anglais"], debouches: "Planificateur; gestionnaire de projets" },
    { nom: "Planification et Economie du Développement Durable", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Français","Anglais"], debouches: "Planificateur; cabinets d'études et conseils" },
    { nom: "Développement Local et Régional", bourse: 5, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Français","Anglais"], debouches: "Développement local; gestion de projets" },
    { nom: "Gestion Financière et Comptable", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D","G2"], matieres: ["Maths (Etude de cas pour G2)","Français","Anglais"], debouches: "Comptable; responsable financier; auditeur financier/interne" }
  ]},
  { sigle: "EPA", nom: "École du Patrimoine Africain", filieres: [
    { nom: "Gestion du patrimoine culturel", bourse: 33, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3","DT/Tourisme"], matieres: ["Hist-Géo (Etude de cas pour G)","Français","Anglais (LV1 pour A et B)"], notes: "DT/Tourisme: Anglais, Mercatique du tourisme, Législation du tourisme", debouches: "Droit du patrimoine; patrimoniteurs; gestionnaires de musées; communicateurs culturels" }
  ]},
  { sigle: "FASHS", nom: "Faculté des Sciences Humaines et Sociales (Calavi)", filieres: [
    { nom: "Géographie et Aménagement du Territoire", bourse: 82, aide: 667, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT"], matieres: ["Anglais (LV1)","Maths","Hist-Géo"], notes: "DEAT: les 3 matières écrites", debouches: "Enseignement; recherche; assainissement" },
    { nom: "Psychologie", bourse: 44, aide: 252, mode: "Classement", bacs: ["A1","A2","B","D"], matieres: ["Maths","Français","SVT"], debouches: "Formation des enseignants; centres spécialisés (sourds-muets, amblyopes, psychiatrie)" },
    { nom: "Sciences de l'Education et de la Formation", bourse: 52, aide: 189, mode: "Classement", bacs: ["A1","A2","C","D"], matieres: ["Français","Anglais (LV1 pour A)","Philo (A) ou SVT (C,D)"], debouches: "Formation des enseignants; centres d'accueil et de formation" },
    { nom: "Philosophie", bourse: 37, aide: 176, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1 pour A)","Philo"], debouches: "Enseignants dans les collèges et lycées" },
    { nom: "Socio-Anthropologie", bourse: 36, aide: 649, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Français","Philo (Droit Admin G1, Maths G2-G3)","Hist-Géo (Anglais pour G)"], debouches: "Centres sociaux; ministères; recherche" },
    { nom: "Histoire et Archéologie", bourse: 69, aide: 151, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Hist-Géo","Anglais (LV1 pour A et B)"], debouches: "Enseignement; conservateur de musée; recherche documentaire; patrimoine culturel" },
    { nom: "Psychologie du travail et des Organisations", bourse: 29, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Maths","SVT","Anglais (LV1 pour A et B)"], debouches: "Psychologue du travail et des organisations" }
  ]},
  { sigle: "ENSTIC", nom: "Ecole Nationale des Sciences et Techniques de l'Information et de la Communication", filieres: [
    { nom: "Journalisme", bourse: 16, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Culture générale","Hist-Géo"], debouches: "Journaliste (presse écrite, en ligne, radio, TV); relations presse; community manager" },
    { nom: "Métiers de l'Audiovisuel et du Multimédia", bourse: 20, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Culture générale","Hist-Géo"], debouches: "Producteur audiovisuel; graphiste-monteur; réalisateur; post-production" }
  ]},
  { sigle: "ENAM", nom: "Ecole Nationale d'Administration (ex-ENAM)", filieres: [
    { nom: "Administration Générale", bourse: 70, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Français ou Etude de cas (G)","Hist-Géo ou Français (G)","Philo ou Economie (G)"], debouches: "Attaché des affaires étrangères; services administratifs; inspecteur du travail" },
    { nom: "Administration des Finances", bourse: 69, aide: 0, mode: "Classement", bacs: ["C","D","G2","G3"], matieres: ["Maths (C-D) ou Etude de cas (G)","Français","Economie (G) ou Hist-Géo (C-D)"], debouches: "Attaché des services financiers; inspecteur des impôts; marchés publics" },
    { nom: "Secrétariat de Gestion", bourse: 40, aide: 0, mode: "Classement", bacs: ["A1","A2","B","G1","G2","G3","C","D"], matieres: ["Anglais (LV1 pour A et B)","Français","Hist-Géo (A-C-D) ou Economie (B) ou Etude de cas (G)"], debouches: "Attaché des services administratifs (secrétariat, assistant de gestion)" },
    { nom: "Sciences et Techniques de l'Information documentaire", bourse: 38, aide: 0, mode: "Classement", bacs: ["A1","A2","B","G1","G2","G3","C","D"], matieres: ["Anglais (LV1 pour A et B)","Français","Hist-Géo (A-C-D) ou Economie (B et G)"], debouches: "Technicien supérieur en archivistique; documentaliste" }
  ]},
  { sigle: "IFRI", nom: "Institut de Formation et de Recherche en Informatique", filieres: [
    { nom: "Génie Logiciel", bourse: 17, aide: 0, mode: "Classement", bacs: ["C","D","E","DT/IMI","DT/DWM"], matieres: ["Maths","Anglais ou Etude de Fabrication (E)","Français"], notes: "DT: Maths appliquées, Français, Technologie des systèmes informatiques ou Sites et Applications Web", debouches: "Analystes-concepteurs; architectes logiciels; administrateurs BD; développeurs; auto-entreprenariat" },
    { nom: "Internet et Multimédia", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","E","DT/IMI","DT/DWM","DT/PM"], matieres: ["Maths","Anglais ou Etude de Fabrication (E)","Français"], debouches: "Applications mobiles; designers; monteurs vidéo; web TV/radio" },
    { nom: "Intelligence artificielle (IA)", bourse: 19, aide: 0, mode: "Classement", bacs: ["C","D","E"], matieres: ["Maths","Anglais ou Etude de Fabrication (E)","Français"], debouches: "Solutions intelligentes; analyse de données décisionnelles; big data; auto-entreprenariat" },
    { nom: "Systèmes embarqués et Internet des Objets (SEIoT)", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","E","DT/IMI","DT/EAP"], matieres: ["Maths","Anglais ou Etude de Fabrication (E)","Français"], debouches: "Solutions embarquées; domotique; électronique; auto-entreprenariat" },
    { nom: "Sécurité Informatique", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","E","DT/IMI"], matieres: ["Maths","Anglais ou Etude de Fabrication (E)","Français"], debouches: "Réseaux et systèmes; sécurité informatique; contrôle des SI" }
  ]},
  { sigle: "FSA", nom: "Faculté des Sciences Agronomiques", filieres: [
    { nom: "Sciences et Techniques de Production Végétale", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PV"], matieres: ["Maths","PCT","SVT"], notes: "DEAT: les 3 matières écrites", debouches: "Entrepreneur agricole; contrôle qualité des cultures; gestion et conservation" },
    { nom: "Sciences et Techniques de Production Animale", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PA"], matieres: ["Maths","PCT","SVT"], debouches: "Gestion et conduite des élevages; laboratoire; zootechnie" },
    { nom: "Aménagement et Gestion des Forêts et Parcours Naturels", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Foresterie"], matieres: ["Maths","PCT","SVT"], debouches: "Gestion des forêts; inventaire forestier; plans d'aménagement" },
    { nom: "Génie Rural, Mécanisation Agricole, Pêche et Aquaculture", bourse: 35, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Pêche-aquaculture","DEAT/AER"], matieres: ["Maths","PCT","SVT"], debouches: "Périmètres irrigués; mécanisation agricole; fermes piscicoles" },
    { nom: "Nutrition et Technologie Alimentaires", bourse: 17, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["Maths","PCT","SVT"], debouches: "Diététique; nutrition hospitalière; industries agroalimentaires" },
    { nom: "Agroéconomie, Sociologie et Vulgarisation Rurales", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Fermes agricoles; recherche et vulgarisation; enseignement lycées agricoles" },
    { nom: "Entreprenariat Agricole", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Gestionnaire de ferme" }
  ]},
  { sigle: "FSS", nom: "Faculté des Sciences de la Santé", filieres: [
    { nom: "Médecine Générale", bourse: 150, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Médecin généraliste; spécialisations en sciences de la santé" },
    { nom: "Pharmacie", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Pharmacien; spécialisations option pharmacie" },
    { nom: "Kinésithérapie", bourse: 15, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["PCT","SVT","Maths"], debouches: "Kinésithérapie; spécialisations option kinésithérapie" },
    { nom: "Assistance sociale", bourse: 10, aide: 0, mode: "Classement", bacs: ["A1","A2","B","D"], matieres: ["Philo","Hist-Géo","SVT"], debouches: "Technicien supérieur de l'action sociale" },
    { nom: "Nutrition et Diététique", bourse: 10, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Nutrition clinique; programmes de nutrition; consultant" }
  ]},
  { sigle: "EPAC", nom: "Ecole Polytechnique d'Abomey-Calavi", filieres: [
    { nom: "Analyse Biomédicale", bourse: 15, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Technicien de laboratoire; assistant de recherche" },
    { nom: "Génie de Technologie Alimentaire", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["Maths","PCT","SVT"], debouches: "Industries alimentaires; normes; audit agroalimentaire" },
    { nom: "Production et Santé animales", bourse: 37, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PA"], matieres: ["Maths","PCT","SVT"], debouches: "Cliniques vétérinaires; abattoirs; contrôle vétérinaire; recherche" },
    { nom: "Génie de l'Environnement", bourse: 28, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Forest","DEAT/PV"], matieres: ["Maths","PCT","SVT"], debouches: "Protection de l'environnement; études d'impact; cabinet QHSE" },
    { nom: "Génie d'Imagerie médicale et de Radiobiologie", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","SVT"], debouches: "Radiologie et échographie hospitalières; recherche en radiobiologie" },
    { nom: "Génie Civil", bourse: 25, aide: 0, mode: "Classement", bacs: ["C","D","E","F4","DT/BTP"], matieres: ["Maths","PCT","Anglais ou Français (E, F, DT/BTP)"], debouches: "Chefs chantiers; techniciens d'étude; conducteurs de travaux; laboratoires" },
    { nom: "Génie Electrique", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","E","F2","F3"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Sociétés d'électricité; usines; cabinets d'experts (audit)" },
    { nom: "Génie Mécanique et Energétique", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","E","F1"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Maintenance industrielle; production de pièces; bureaux d'études; contrôle qualité" },
    { nom: "Génie Informatique et Télécom", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","E","F2"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Réseaux télécoms; cabinets d'experts; usines" },
    { nom: "Génie Chimique procédés", bourse: 15, aide: 0, mode: "Classement", bacs: ["C","D","E"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Unités de production; HSE; industrie agroalimentaire et pharmaceutique; traitement des pollutions" },
    { nom: "Machinisme Agricole", bourse: 27, aide: 0, mode: "Classement", bacs: ["C","D","E","F3","DEAT/AER"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Fabrication mécanique; parcs machines; maintenance des engins agricoles" },
    { nom: "Génie Biomédical (Maintenance Biomédicale et Hospitalière)", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D","E","F2","F3"], matieres: ["Maths","PCT","Anglais ou Français (E et F)"], debouches: "Maintenance hospitalière; contrôle des équipements médicaux et électroniques" }
  ]},
  { sigle: "CEFORP", nom: "Centre de Formation et de Recherche en matière de Population", filieres: [
    { nom: "Dynamique de Population et Planification Régionale", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Hist-Géo","Anglais"], debouches: "Développement local; questions de population; SIG et cartographie; suivi de projets" }
  ]},
  { sigle: "HERCI", nom: "Haute Ecole Régionale de Commerce International", filieres: [
    { nom: "Négoce International", bourse: 7, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths","Anglais","Economie (B)/Hist-Géo (C-D)/Etude de Cas (G)"], debouches: "Négoce international; relations maritimes internationales" },
    { nom: "Gestion des Relations Maritimes Internationales", bourse: 8, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths","Anglais","Economie (B)/Hist-Géo (C-D)/Etude de Cas (G)"], debouches: "Agent commercial import-export; technicien commercial" },
    { nom: "Commerce International", bourse: 7, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths","Anglais","Economie (B)/Hist-Géo (C-D)/Etude de Cas (G)"], debouches: "Chef de zone import-export; force de vente internationale; courtier" }
  ]},
  { sigle: "INJEPS", nom: "Institut National de la Jeunesse, de l'Education Physique et Sportive", filieres: [
    { nom: "Education Physique et Sportive", bourse: 40, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","SVT","Pratique EPS"], debouches: "Professeur d'EPS; Master EP Sport et Développement Humain" },
    { nom: "Entrainement Sportif", bourse: 15, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","SVT","Pratique EPS"], debouches: "CAPAS/CAPS; entraîneur; préparateur physique" },
    { nom: "Développement communautaire", bourse: 8, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1)","Philo"], debouches: "Action socio-éducative; projets de développement; planification locale" },
    { nom: "Andragogie", bourse: 8, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1)","Philo"], debouches: "Ingénierie de formation; éducation des adultes" },
    { nom: "Récréologie", bourse: 9, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1)","Philo"], debouches: "Projets de loisir et tourisme; gestion du patrimoine" },
    { nom: "Entrepreneuriat social", bourse: 14, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: ["Français","Anglais (LV1)","Philo"], debouches: "Création et gestion d'entreprise sociale" }
  ]},
  { sigle: "ENS-PN", nom: "Ecole Normale Supérieure / Porto-Novo", filieres: [
    { nom: "Histoire et Géographie", bourse: 12, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Histoire ou Géographie"], debouches: "Professeur Adjoint des lycées et collèges" },
    { nom: "Espagnol", bourse: 12, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Espagnol"], debouches: "Professeur Adjoint; interprète; traducteur" },
    { nom: "Allemand", bourse: 11, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Allemand"], debouches: "Professeur Adjoint; interprète; traducteur" },
    { nom: "Anglais", bourse: 17, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Anglais"], debouches: "Professeur Adjoint; interprète; traducteur" },
    { nom: "Français", bourse: 22, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Français"], debouches: "Professeur Adjoint des lycées et collèges" },
    { nom: "Philosophie", bourse: 9, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D"], matieres: ["Culture générale","Commentaire de texte en Philo"], debouches: "Professeur Adjoint des lycées et collèges" }
  ]},
  { sigle: "FADESP", nom: "Faculté de Droit et de Science Politique", filieres: [
    { nom: "Droit", bourse: 104, aide: 999, mode: "Classement", bacs: ["A1","A2","B","C","D","G2"], matieres: ["Français","Anglais (LV1)","Hist-Géo / Etude de cas (G2)"], debouches: "Services administratifs; juriste d'affaires; auxiliaires de justice; magistrature" },
    { nom: "Sciences Politiques", bourse: 38, aide: 183, mode: "Classement", bacs: ["A1","A2","B","C","D","G2"], matieres: ["Français","Anglais (LV1)","Hist-Géo / Etude de cas (G2)"], debouches: "Diplomate; relations internationales; politiques publiques; gestion de projets" }
  ]},
  { sigle: "FASEG", nom: "Faculté des Sciences Economiques et de Gestion", filieres: [
    { nom: "Sciences Economiques et de Gestion (Tronc commun)", bourse: 207, aide: 1407, mode: "Classement", bacs: ["B","C","D","G2","G3","DT/CoM"], matieres: ["Maths (C-D) / Economie (B) / Etude de cas (G)","PCT (C-D)","Français"], debouches: "Analystes; statisticiens; comptable; microfinance; économiste; banque; assurance; PME" },
    { nom: "Econométrie et Statistiques Appliquées", bourse: 18, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","Français"], debouches: "Statisticien; économètre; analyste; stratégie et prise de décisions" },
    { nom: "Sciences et Techniques Comptables et Financières (STCF)", bourse: 8, aide: 0, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C-D) / Economie-Etude de cas (B-G)","PCT (C-D)","Français"], debouches: "Audit comptable ou financier; contrôle interne; agent comptable" }
  ]},
  { sigle: "FAST", nom: "Faculté des Sciences et Techniques", filieres: [
    { nom: "Sciences de la Vie et de la Terre", bourse: 65, aide: 245, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Français"], debouches: "Enseignement SVT; laboratoires; écoles d'ingénieurs" },
    { nom: "Physique-Chimie", bourse: 254, aide: 405, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","PCT","Français"], debouches: "Enseignement PCT; laboratoires; écoles d'ingénieurs" },
    { nom: "Mathématiques Informatique et Applications", bourse: 247, aide: 119, mode: "Classement", bacs: ["C"], matieres: ["Maths","PCT","Français"], debouches: "Enseignement Maths; laboratoires; écoles d'ingénieurs" },
    { nom: "Energies Renouvelables et Systèmes Energétiques", bourse: 27, aide: 0, mode: "Classement", bacs: ["C","D","F2","F3"], matieres: ["Maths","PCT","Français"], debouches: "Production et fourniture d'énergie électrique; services" },
    { nom: "Génétique, Biotechnologies et Ressources Biologiques", bourse: 12, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Français"], debouches: "Recherche en génétique; ressources génétiques; sélections végétales et animales" },
    { nom: "Microbiologie et Biotechnologie Alimentaire", bourse: 17, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["SVT","PCT","Français"], debouches: "Production industrielle; contrôle qualité; transformations agroalimentaires" },
    { nom: "Hydrobiologie Appliquée", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Pêche-aquaculture"], matieres: ["SVT","PCT","Français"], debouches: "Qualité de l'eau; pisciculture; aquariologie; inspection des produits halieutiques" }
  ]},
  { sigle: "CONFUCIUS", nom: "Institut Confucius", filieres: [
    { nom: "Langue Chinoise", bourse: 0, aide: 0, mode: "Classement", bacs: ["A1","A2","B","C","D"], matieres: [], debouches: "Entreprises chinoises; interprète; guide; bourses en Chine" },
    { nom: "Didactique du Chinois", bourse: 0, aide: 0, mode: "Classement", bacs: ["A1","A2","B"], matieres: [], debouches: "Entreprises chinoises; interprète; bourses en Chine" }
  ]},
  { sigle: "ILACI", nom: "Institut de Langue Arabe et Culture Islamique", filieres: [
    { nom: "Langue Arabe", bourse: 0, aide: 0, mode: "Classement", bacs: ["Toutes séries"], matieres: [], debouches: "Enseignement; traduction; journalisme; tourisme; rédaction" },
    { nom: "Culture Islamique", bourse: 0, aide: 0, mode: "Classement", bacs: ["Toutes séries"], matieres: [], debouches: "Enseignement; recherche; culture" }
  ]}
]},
{
  sigle: "UP", nom: "Université de Parakou",
  etablissements: [
  { sigle: "FA", nom: "Faculté d'Agronomie", filieres: [
    { nom: "Sciences et Techniques de Production Végétale", bourse: 22, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Entrepreneur/conseiller agricole; protection des végétaux; enseignant lycées agricoles" },
    { nom: "Sciences et Techniques de Production Animale et Halieutique", bourse: 21, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Gestion d'élevages et exploitations aquacoles; conseiller agricole" },
    { nom: "Aménagement et Gestion des Ressources Naturelles", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Aires protégées; eaux et forêts; conservation" },
    { nom: "Sociologie et Economie Rurales", bourse: 22, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Coopératives agricoles; clusters; développement local; études socio-économiques" },
    { nom: "Nutrition et Sciences Agro-alimentaires", bourse: 20, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Agro-alimentaire; qualité IAA; enseignant lycées agricoles" }
  ]},
  { sigle: "FM", nom: "Faculté de Médecine", filieres: [
    { nom: "Médecine Humaine", bourse: 117, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","SPCT","SVT"], debouches: "Médecin généraliste dans les hôpitaux et centres de santé" }
  ]},
  { sigle: "ENATSE", nom: "Ecole Nationale de formation des Techniciens Supérieurs en Santé Publique et Surveillance Epidémiologique", filieres: [
    { nom: "Santé publique et surveillance épidémiologique", bourse: 34, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","Anglais","SVT"], debouches: "Biostatisticien; surveillance épidémiologique; recherche en santé; collectivités" }
  ]},
  { sigle: "IFSIO", nom: "Institut de Formation en Soins Infirmiers et Obstétricaux", filieres: [
    { nom: "Soins Infirmiers", bourse: 31, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["PCT","SVT"], debouches: "Infirmier diplômé d'Etat" },
    { nom: "Soins obstétricaux", bourse: 44, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["PCT","SVT"], debouches: "Sage-femme diplômée d'Etat" }
  ]},
  { sigle: "IUT", nom: "Institut Universitaire de Technologie", filieres: [
    { nom: "Gestion des Banques", bourse: 15, aide: 0, mode: "Classement", bacs: ["C","D","G2"], matieres: ["Maths (C,D)/Etude de Cas (G)","Français","Anglais"], debouches: "Organismes financiers; établissements de crédits; banques" },
    { nom: "Gestion Commerciale", bourse: 8, aide: 0, mode: "Classement", bacs: ["C","D","G3","B","DT/CoM"], matieres: ["Maths (B,C,D)/Etude de Cas (G)","Français","Anglais (LV1)"], debouches: "Services commerciaux; logistique internationale; grande distribution; communication" },
    { nom: "Gestion des Entreprises", bourse: 8, aide: 0, mode: "Classement", bacs: ["C","D","G2"], matieres: ["Maths (C,D)/Etude de Cas (G)","Français","Anglais"], debouches: "Cabinets comptables; banques; assurances; PME; auto-emploi" },
    { nom: "Gestion des Transports et Logistiques", bourse: 14, aide: 0, mode: "Classement", bacs: ["C","D","B","G2"], matieres: ["Maths (B,C,D)/Etude de Cas (G)","Français","Anglais (LV1)"], debouches: "Transport; logistique d'entreprise; fret aérien; aviation civile" },
    { nom: "Informatique de Gestion", bourse: 59, aide: 0, mode: "Classement", bacs: ["C","D","G2"], matieres: ["Maths","Français/Economie (G2)","Anglais/Etude de Cas (G2)"], debouches: "Analyste-programmeur; chef de programme; ingénieur logiciel; administrateur réseau" },
    { nom: "Gestion des Ressources Humaines", bourse: 8, aide: 0, mode: "Classement", bacs: ["A2","B","C","D","G1","G2","G3"], matieres: ["Maths (A2,C,D)/Etude de Cas (G2-G3)/Economie (B-G1)","Français","Anglais (LV1)"], debouches: "Entreprises; assurances; administrations; ONG" }
  ]},
  { sigle: "ENSPD", nom: "Ecole Nationale de Statistique, de Planification et de Démographie", filieres: [
    { nom: "Statistiques Appliquées", bourse: 22, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture Générale","Maths"], debouches: "Planificateur; recherche; banques et microfinance; INStaD" },
    { nom: "Planification et Suivi Evaluation", bourse: 21, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture Générale","Maths"], debouches: "Planification; suivi-évaluation; projets de développement" }
  ]},
  { sigle: "FASEG-UP", nom: "Faculté de Sciences Economiques et de Gestion", filieres: [
    { nom: "Analyse et Politique Economiques (APE)", bourse: 24, aide: 42, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Politiques économiques; projets de développement; suivi-évaluation" },
    { nom: "Economie Agricole (EA)", bourse: 62, aide: 96, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Economie agricole; conseil; projets de développement" },
    { nom: "Economie et Finance des Collectivités Locales (EFCL)", bourse: 23, aide: 42, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Finances locales; fiscalité; mairies; développement local" },
    { nom: "Economie et Finance Internationales (EFI)", bourse: 29, aide: 82, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Politiques économiques et monétaires; commerce; finances" },
    { nom: "Entrepreneuriat et Gestion des Entreprises (EGE)", bourse: 21, aide: 57, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Création d'entreprise; études de faisabilité; plans d'affaires; PME/PMI" },
    { nom: "Marketing et Management des Organisations (MMO)", bourse: 13, aide: 37, mode: "Classement", bacs: ["B","C","D","G2","G3","DT/CoM"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Management; marketing; communication; audit en gestion" },
    { nom: "Finance et Comptabilité (FC)", bourse: 76, aide: 243, mode: "Classement", bacs: ["B","C","D","G2","G3"], matieres: ["Maths (C,D)/Etude de Cas (G)/Economie (B)","Français","Anglais (LV1)"], debouches: "Finances; comptabilité; contrôle de gestion; audit" }
  ]},
  { sigle: "FDSP", nom: "Faculté de Droit et Sciences Politiques", filieres: [
    { nom: "Droit Privé", bourse: 99, aide: 545, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Français","Philosophie/Etude de cas (G)","Hist-Géo/Anglais (G)"], debouches: "Juriste; greffier; avocat/huissier/notaire; magistrature (après master)" },
    { nom: "Droit Public", bourse: 75, aide: 341, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Français","Philosophie/Etude de cas (G)","Hist-Géo/Anglais (G)"], debouches: "Services administratifs et financiers; impôts; assistant juridique; magistrature (après master)" },
    { nom: "Sciences Politiques et Relations Internationales", bourse: 41, aide: 129, mode: "Classement", bacs: ["A1","A2","B","C","D","G1","G2","G3"], matieres: ["Français","Philosophie/Etude de cas (G)","Hist-Géo/Anglais (G)"], debouches: "Diplomatie; services extérieurs; attaché politique; lobbying; médiation" }
  ]},
  { sigle: "FLASH-UP", nom: "Faculté des Lettres, Arts et Sciences Humaines", filieres: [
    { nom: "Allemand", bourse: 36, aide: 195, mode: "Classement", bacs: ["A1","A2","B"], matieres: ["Français","Philo","Allemand (LV1)"], debouches: "Enseignement; interprète; traducteur; tourisme" },
    { nom: "Anglais", bourse: 141, aide: 424, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT"], matieres: ["Français","Anglais (LV1)","Maths"], debouches: "Enseignement; interprète; traducteur; tourisme" },
    { nom: "Espagnol", bourse: 38, aide: 244, mode: "Classement", bacs: ["A1","A2","B"], matieres: ["Français","Philo","Espagnol (LV1)"], debouches: "Enseignement; interprète; traducteur; tourisme" },
    { nom: "Géographie et Aménagement du Territoire", bourse: 101, aide: 431, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT"], matieres: ["Français","Anglais (LV1)","Maths"], debouches: "Enseignement; urbaniste; climatologiste; hydrologue" },
    { nom: "Sociologie Anthropologie", bourse: 115, aide: 503, mode: "Classement", bacs: ["A1","A2","B","C","D","DEAT"], matieres: ["Français","Anglais (LV1)","Maths"], debouches: "Centres sociaux; recherche; ministères; ONG; médiateur" },
    { nom: "Lettres Modernes", bourse: 230, aide: 444, mode: "Classement", bacs: ["A1","A2"], matieres: ["Français","Philosophie","Hist-Géo"], debouches: "Enseignement; interprète; traducteur" }
  ]}
]},
{
  sigle: "UNSTIM", nom: "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques",
  etablissements: [
  { sigle: "ENSET", nom: "Ecole Normale Supérieure de l'Enseignement Technique", debouchesCommun: "Professeur adjoint des Lycées et Collèges", filieres: [
    { nom: "Comptabilité", bourse: 9, aide: 0, mode: "Concours", bacs: ["B","G2","G3","C","D","DT/COM"], matieres: ["Culture générale","Etude de cas (G)/Maths (C,D)/Economie (B)/Techn Compta et Mercatique (DT/COM)"] },
    { nom: "Economie", bourse: 12, aide: 0, mode: "Concours", bacs: ["B","G2","G3","C","D","DT/COM"], matieres: ["Culture générale","Etude de cas (G)/Maths (C,D)/Economie (B)"] },
    { nom: "Electrotechnique", bourse: 30, aide: 0, mode: "Concours", bacs: ["C","D","F2","F3","DT/Electricité","DT/Electrotech Appliqué"], matieres: ["Culture générale","PCT (C,D)","Electrotech (F2,F3,DT)"] },
    { nom: "Génie Civil", bourse: 34, aide: 0, mode: "Concours", bacs: ["C","D","F4","DT/BTP"], matieres: ["Culture générale","PCT (C,D)/RDM (F4,DT/BTP)"] },
    { nom: "Secrétariat", bourse: 6, aide: 0, mode: "Concours", bacs: ["A1","A2","B","G1"], matieres: ["Culture générale","BS (G1)/Histoire (A1,A2)/Economie (B)"] },
    { nom: "Mécanique Automobile", bourse: 28, aide: 0, mode: "Concours", bacs: ["C","D","F2","DT/MA"], matieres: ["Culture générale","PCT (C,D)/Techno Automobile (DT/MA)/Dessin Industriel (F2)"] },
    { nom: "Fabrication Mécanique", bourse: 22, aide: 0, mode: "Concours", bacs: ["C","D","E","F1","DT/FM"], matieres: ["Culture générale","PCT (C,D)/RDM (E,F1,DT/FM)"] },
    { nom: "Economie Familiale et Sociale", bourse: 5, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D","DT/EFS"], matieres: ["Culture générale","PCT (C,D)/Educ santé (DT/EFS)/Anglais (A1,A2)/Economie (B)"] },
    { nom: "Hôtellerie-Restauration", bourse: 36, aide: 0, mode: "Concours", bacs: ["A1","A2","B","C","D","DT/HR","DT/Tourisme","DT/EFS"], matieres: ["Culture générale","PCT (C,D)/Tech BR (DT/HR)/Hist (A1,A2)/Economie (B)/Anglais (DT/Tourisme)"] },
    { nom: "Froid et Climatisation", bourse: 27, aide: 0, mode: "Concours", bacs: ["C","D","E","F3","DT/FC"], matieres: ["Culture générale","PCT (C,D)/Tech Froid (DT/FC)/Electrotechnique (F3)/RDM (E)"] },
    { nom: "Electronique", bourse: 14, aide: 0, mode: "Concours", bacs: ["C","D","F2","DT/EAp"], matieres: ["Culture générale","PCT (C,D)/EST (F2)"] },
    { nom: "Energies Renouvelables", bourse: 34, aide: 0, mode: "Concours", bacs: ["C","D","F2","F3","DT/Electricité","DT/EAp"], matieres: ["Culture générale","PCT (C,D)/Maths appliquées (F2,F3,DT)"] },
    { nom: "Production Animale", bourse: 13, aide: 0, mode: "Concours", bacs: ["C","D","DEAT/PA","DEAT/PV"], matieres: ["Culture générale","SVT (D)/PCT (C)/Zootechnie spéciale (DEAT/PA)"] },
    { nom: "Production Végétale", bourse: 8, aide: 0, mode: "Concours", bacs: ["C","D","DEAT/PA","DEAT/PV"], matieres: ["Culture générale","SVT (D)/PCT (C)/Agriculture spéciale (DEAT/PV)"] }
  ]},
  { sigle: "INSTI", nom: "Institut National Supérieur de Technologie Industrielle", filieres: [
    { nom: "Génie Civil", bourse: 68, aide: 0, mode: "Classement", bacs: ["C","D","E","F4","DT/BTP","DT/OG","DT/DPB"], matieres: ["Maths","SPCT","Anglais (C,D)/Construction Mécanique (E)/Béton Armé (F4)/RDM (DT/BTP,DT/DPB)/Technologie (DT/OG)"], debouches: "Techniciens de travaux GC; contrôleurs de chantiers; assistant experts géomètres/architecture/notaires" },
    { nom: "Génie Energétique (Energies Renouvelables et Systèmes Energétiques)", bourse: 37, aide: 0, mode: "Classement", bacs: ["C","D","E","F2","F3","DT/Electrotech","DT/EAp"], matieres: ["Maths","SPCT","Anglais (C,D)/Constr. Méca (E)/Electrotech (F3,DT)/EST (F2)"], debouches: "Industrie électrique; bâtiment; énergies renouvelables; audit énergétique" },
    { nom: "Génie Energétique (Froid et Climatisation)", bourse: 30, aide: 0, mode: "Classement", bacs: ["C","D","E","F3","DT/Electrotech","DT/FC"], matieres: ["Maths","SPCT ou Technique de Froid (DT/FC)","Anglais (C,D)/Techno spécialité (DT-FC)/Electrotech (F3)/Constr. méca (E)"], debouches: "Froid et climatisation bâtiment et automobile; instrumentation" },
    { nom: "Génie Electrique et Informatique (Informatique et Télécommunications)", bourse: 24, aide: 0, mode: "Classement", bacs: ["C","D","E","F3","DT/Electrotech","DT/Appliquée"], matieres: ["Maths","Anglais (C,D)/Constr. Méca (E)/Electrotech (F3,DT)","SPCT"], debouches: "Service informatique; audit; dev web/mobile; télécoms; systèmes embarqués" },
    { nom: "Génie Electrique et Informatique (Electronique et Electrotechnique)", bourse: 26, aide: 0, mode: "Classement", bacs: ["C","D","E","F3","DT/Electrotech"], matieres: ["Maths","SPCT","Anglais (C,D)/Constr. Méca (E)/Electrotech (F3,DT)"], debouches: "Electricité industrielle et bâtiments; énergie; automatismes; télésurveillance" },
    { nom: "Maintenance des Systèmes (Maintenance Industrielle)", bourse: 21, aide: 0, mode: "Classement", bacs: ["F1","F2","F3","DT/FC","DT/Electrotech"], matieres: ["Maths","SPCT","Constr. Méca (F1,F2)/EST (F3)"], debouches: "Industries de transformation; production alimentaire; audit; SAV" },
    { nom: "Maintenance des Systèmes (Maintenance Automobile)", bourse: 25, aide: 0, mode: "Classement", bacs: ["F1","F2","DT/MA"], matieres: ["Maths","SPCT","Constr. Méca (F1,F2)/Mécanique (DT-MA)"], debouches: "Parcs automobiles; concessionnaires; engins agricoles; BTP; équipementiers" },
    { nom: "Génie Mécanique et Productique", bourse: 38, aide: 0, mode: "Classement", bacs: ["C","D","E","F1","DT/MA","DT/FM"], matieres: ["Maths","SPCT","Anglais (C,D)/Constr. Méca (E,F1,DT/FM)/Mécanique (DT/MA)"], debouches: "Maintenance industrielle; fabrication mécanique; contrôle qualité; mécanisation agricole" }
  ]},
  { sigle: "INSPEI", nom: "Institut National Supérieur des Classes Préparatoires aux Etudes d'Ingénieurs", filieres: [
    { nom: "Sciences et Techniques de l'Ingénieur", bourse: 83, aide: 0, mode: "Concours", bacs: ["C","D","E"], matieres: ["PCT","Maths"], debouches: "Ingénieur de conception (après 3 ans dans les écoles d'ingénieur de l'UNSTIM)" }
  ]},
  { sigle: "ENS-Nati", nom: "Ecole Normale Supérieure de Natitingou", filieres: [
    { nom: "Mathématiques et Informatique (MI)", bourse: 29, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture générale","Maths"], debouches: "Professeur Adjoint de Maths" },
    { nom: "Physique, Chimie et Technologie (PCT)", bourse: 17, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture générale","PCT"], debouches: "Professeur Adjoint de PCT" },
    { nom: "Sciences de la Vie et de la Terre (SVT)", bourse: 12, aide: 0, mode: "Concours", bacs: ["C","D"], matieres: ["Culture générale","SVT"], debouches: "Professeur Adjoint de SVT" }
  ]},
  { sigle: "ENSBBA", nom: "Ecole Nationale Supérieure des Biosciences et Biotechnologies Appliquées", filieres: [
    { nom: "Biotechnologie Médicale", bourse: 11, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Laboratoires de diagnostics biomédicaux; contrôle qualité; recherche; auto-emploi" },
    { nom: "Biotechnologie Pharmaceutique (BP)", bourse: 10, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Industries pharma et cosmétiques; substances naturelles; contrôle qualité; auto-emploi" },
    { nom: "Génétique Biotechnologies et Applications", bourse: 10, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Recherche génétique; tests génétiques; sélections végétales et animales" },
    { nom: "Génie Biologique et Bioprocédés (GBB)", bourse: 15, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Laboratoires d'analyse; biologie appliquée; recherche; auto-emploi" },
    { nom: "Diététique des aliments et Nutrition", bourse: 9, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["SVT","PCT","Maths"], debouches: "Diététique; contrôle qualité aliments; restauration collective; nutrition hospitalière" }
  ]},
  { sigle: "FAST-Nati", nom: "Faculté des Sciences et Techniques de Natitingou", filieres: [
    { nom: "Mathématiques Informatiques", bourse: 83, aide: 43, mode: "Classement", bacs: ["C","D"], matieres: ["Anglais","PCT","Maths"], debouches: "Télécoms et NTIC; enseignement (BAPES/CAPES MI); écoles d'ingénieurs; master recherche" },
    { nom: "Physique Chimie", bourse: 66, aide: 28, mode: "Classement", bacs: ["C","D"], matieres: ["Anglais","PCT","Maths"], debouches: "Météorologie/océanographie; enseignement PCT; industries chimiques, agroalimentaires, pharmaceutiques" }
  ]},
  { sigle: "ENSGEP", nom: "Ecole Nationale Supérieure de Génie Energétique et Procédés", filieres: [
    { nom: "Froid et Climatisation", bourse: 25, aide: 0, mode: "Classement", bacs: ["C","D","DT/Froid et Clim"], matieres: ["Maths","Anglais","SPCT (C,D)/TF (DT)"], debouches: "Installation, mise en service et maintenance d'équipements de froid et climatisation" },
    { nom: "Equipements motorisés", bourse: 24, aide: 0, mode: "Classement", bacs: ["C","D","E","DT/MA","DT/FM"], matieres: ["Maths","Anglais/Français (E)","SPCT (C,D)/Mécanique (DT/MA)/Constr. Méca (E,DT/FM)"], debouches: "Electromécanique; mécanique automobile; électroménager; systèmes hydrauliques et pneumatiques" }
  ]},
  { sigle: "ENSTP", nom: "Ecole Nationale Supérieure des Travaux Publics", filieres: [
    { nom: "Génie Civil", bourse: 21, aide: 0, mode: "Classement", bacs: ["C","D","E","EA","F4","DT/BTP"], matieres: ["Maths","Anglais/Français (E,F4)","SPCT (C,D,E)/RDM (F4,DT/BTP)/Assainissement (EA)"], debouches: "Bureaux d'études; contrôle de travaux; laboratoires géotechniques; chef de chantier" },
    { nom: "Génie Géomatique Appliquée", bourse: 21, aide: 0, mode: "Classement", bacs: ["C","D","F4","DT/OG","DT/BTP"], matieres: ["Maths","Anglais/Français (F4)","SPCT (C,D)/RDM (F4,DT/BTP)/Technologie (DT/OG)"], debouches: "SIG; cartographie; assistants experts géomètres; mairies" },
    { nom: "Architecture et Urbanisme", bourse: 26, aide: 0, mode: "Classement", bacs: ["C","D","F4","DT/OG","DT/BTP"], matieres: ["Maths","Anglais/Français (F4)","SPCT (C,D)/RDM (F4,DT/BTP)/Technologie (DT/OG)"], debouches: "Architectes-urbanistes; contrôle de chantiers; aménagements urbains" },
    { nom: "Hydraulique et Assainissement", bourse: 25, aide: 0, mode: "Classement", bacs: ["C","D","E","EA","F4"], matieres: ["Maths","Anglais/Français (E,F4)","SPCT (C,D,E)/RDM (F4)/Assainissement (EA)"], debouches: "Hydraulique; laboratoires d'analyse d'eau; stations d'épuration; ouvrages hydro-agricoles" }
  ]}
]},
{
  sigle: "UNA", nom: "Université Nationale d'Agriculture",
  etablissements: [
  { sigle: "EAq", nom: "Ecole d'Aquaculture", filieres: [
    { nom: "Aquaculture", bourse: 31, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Pêche-aquaculture","DEAT/PA"], matieres: ["SVT","Maths","SPCT"], debouches: "Entreprises aquacoles; production de poissons/crevettes; aliments aquacoles; aquariologie; semences aquacoles" }
  ]},
  { sigle: "EHAEV", nom: "Ecole d'Horticulture et d'Aménagement des Espaces Verts", filieres: [
    { nom: "Horticulture et Aménagement des espaces Verts", bourse: 55, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PV","DEAT/Foresterie"], matieres: ["SVT","Maths","SPCT"], debouches: "Entreprises horticoles; espaces verts; irrigation; hydroponie; biotechnologies horticoles; organisations internationales" }
  ]},
  { sigle: "EGPVS", nom: "Ecole de Gestion et de Production Végétale et Semencière", filieres: [
    { nom: "Gestion et Production Végétale et Semencière", bourse: 60, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PV"], matieres: ["SVT","Maths","SPCT"], debouches: "Production végétale; semences; fertilité des sols; protection des végétaux; biotechnologie" }
  ]},
  { sigle: "ESTCTPA", nom: "Ecole des Sciences et Techniques de Conservation et de Transformation des Produits Agricoles", filieres: [
    { nom: "Industrie des Produits Agro-Alimentaires et Nutrition Humaine (IPA-NH)", bourse: 23, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["SVT","Maths","SPCT"], debouches: "Industries agroalimentaires; conservation; contrôle qualité; éducation nutritionnelle" },
    { nom: "Industrie des Bio-Ressources (IBR)", bourse: 22, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["SVT","Maths","SPCT"], debouches: "Cosmétique et phytothérapie; biogaz; huiles végétales; aliments bétail; post-récolte" },
    { nom: "Génie de Conditionnement Emballage et Stockage des Produits Alimentaires (GCES)", bourse: 24, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/NTA"], matieres: ["SVT","Maths","SPCT"], debouches: "Conditionnement-emballages; normes; structures de stockage (greniers, silos, entrepôts)" }
  ]},
  { sigle: "EGR", nom: "Ecole de Génie Rural", filieres: [
    { nom: "Agroéquipement", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","E","F1","F2","F3","DT/FM","DT/CEMS","DT/MA","DT/Electrotech","DEAT/AER"], matieres: ["Maths","SPCT","Anglais (C,D)/Constr. mécanique (E,F1,DT)/Mécanique (DT/MA)/Electrotech (F3)/EST (F2)"], debouches: "Conception de machines; maintenance d'engins agricoles; fermes mécanisées; industries de transformation" },
    { nom: "Electrification Rurale et Energies Renouvelables (ERER)", bourse: 17, aide: 0, mode: "Classement", bacs: ["C","D","E","F1","F2","F3","DT/Electrotech","DT/EAp"], matieres: ["Maths","SPCT","Français (C,D,E,F1)/Electrotechnique ou EST (F2,F3,DT)"], debouches: "Energies renouvelables; électrification rurale; biogaz; audit; entreprenariat énergies vertes" },
    { nom: "Infrastructures Rurales et Assainissement", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","E","EA","F1","F4","DT/BTP","DT/DPB","DT/OG","DEAT/AER"], matieres: ["Maths","SPCT","Français (C,D,F1,E)/RDM (F4,DT/BTP,DT/DPB)/Mobilisation des ressources en eau (EA)/DRT (DT/OG)"], debouches: "Ouvrages et réseaux hydrauliques; irrigation-drainage; aménagement hydro-agricole; BTP; stations d'épuration" }
  ]},
  { sigle: "EGESE", nom: "Ecole de Gestion et d'Exploitation des Systèmes d'Elevage", filieres: [
    { nom: "Productions et santé animales", bourse: 57, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/PA"], matieres: ["Maths","SPCT","SVT"], debouches: "Fermes d'embouche; production laitière et œufs; accouvage; cliniques et pharmacies vétérinaires; aliments bétail" }
  ]},
  { sigle: "EAPA", nom: "Ecole d'Agrobusiness et de Politiques Agricoles", filieres: [
    { nom: "Finance Agricole (FA)", bourse: 16, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Banque et assurance agricoles; institutions de financement; conseil" },
    { nom: "Gestion des Exploitations Agricoles et Entreprises Agroalimentaires (GEAEA)", bourse: 36, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Gestion d'entreprises agricoles; coopératives; analyse du marché" },
    { nom: "Marketing des Intrants et Produits Agricoles (MIPA)", bourse: 36, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Mercaticien agricole; agent commercial; études socio-économiques; consultant" }
  ]},
  { sigle: "ESRVA", nom: "Ecole de Sociologie rurale et de Vulgarisation Agricole", filieres: [
    { nom: "Sociologie rurale et Vulgarisation Agricole", bourse: 43, aide: 0, mode: "Classement", bacs: ["C","D","DEAT"], matieres: ["Maths","SPCT","SVT"], debouches: "Vulgarisation/conseil agricole; recherche; organisations paysannes; gouvernance des filières; organisations internationales" }
  ]},
  { sigle: "EForT", nom: "Ecole de Foresterie Tropicale", filieres: [
    { nom: "Foresterie Tropicale", bourse: 27, aide: 0, mode: "Classement", bacs: ["C","D","DEAT/Foresterie"], matieres: ["Maths","SPCT","SVT"], debouches: "Gestion des ressources naturelles; réserves de faune; cartographie forestière; drones; PFNL; études d'impact" }
  ]}
]}
];

const AUTRES_STRUCTURES = {
  IUEP: {
    nom: "Institut Universitaire d'Enseignement Professionnel",
    filieres: [
      { nom: "Métiers de l'agriculture (toutes filières)", bourse: 50, aide: 0, mode: "Concours", bacs: ["C","D","DEAT"], matieres: ["Culture générale","SVT (C,D)/Agriculture générale (DEAT)"], debouches: "Métiers de l'agriculture" }
    ]
  },
  ecolesInterEtats: [
    { nom: "Ecole inter-Etats des Sciences et Médecine Vétérinaires (EISMV)", bourse: 8, aide: 0, mode: "Classement", bacs: ["C","D"], matieres: ["Maths","SPCT","SVT"], debouches: "Vétérinaires" },
    { nom: "Ecole Africaine des Métiers de l'Architecture et de l'Urbanisme (EAMAU)", bourse: 5, aide: 0, mode: "Concours", bacs: ["C","D"], debouches: "Architectes; urbanistes" },
    { nom: "Ecole Supérieure Multinationale de Télécommunications (ESMT)", bourse: 14, aide: 0, mode: "Concours", bacs: ["C","D","DT"], debouches: "Multimédias; télécommunications" },
    { nom: "Institut de Formation et de Recherche démographique (IFORD)", bourse: 5, aide: 0, mode: "Concours" },
    { nom: "Centre d'Appui aux Ecoles de Statistique Africaines (CAPESA)", bourse: 26, aide: 0, mode: "Concours" },
    { nom: "Ecole Centrale de Casablanca", bourse: 6, aide: 0, mode: "Concours" }
  ],
  UADC: {
    nom: "Université Africaine de Développement Coopératif",
    modeEntree: "Payant (à titre payant — se rapprocher de l'UADC)",
    ufr: [
      { sigle: "UFR/EGC", nom: "Economie et Gestion Coopératives", filieres: [
        { nom: "Entrepreneuriat et Gestion de Projets de l'Economie Sociale", bacs: ["A","B","C","D","G2","G3"], matieres: ["Hist-Géo (A-B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "Chef de projets; planification; PME; consultant; entrepreneur" },
        { nom: "Economie et Gestion des Organisations Coopératives et Associatives", bacs: ["B","C","D","G2","G3"], matieres: ["Economie (B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "Inspecteur d'action coopérative; gestion de coopératives; organisations internationales" }
      ]},
      { sigle: "UFR/FMF", nom: "Financement et Micro financement", filieres: [
        { nom: "Micro Finance", bacs: ["B","C","D","G2","G3"], matieres: ["Economie (B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "SFD; caisses communautaires; audit financier; entrepreneur" },
        { nom: "Gestion des structures de Micro Assurance Santé", bacs: ["A","B","C","D","G2","G3"], matieres: ["Hist-Géo (A-B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "Assurance maladie; mutuelles de santé; ARCH; entrepreneur" }
      ]},
      { sigle: "UFR/GD", nom: "Développement", filieres: [
        { nom: "Développement Local et Décentralisation", bacs: ["A","B","C","D","G2","G3"], matieres: ["Hist-Géo (A-B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "Collectivités locales; projets de développement local; coopérations communales" },
        { nom: "Genre et Développement", bacs: ["A","B","C","D","G2","G3"], matieres: ["Hist-Géo (A-B)/Maths (C-D)/Etude de Cas (G2-G3)","Français","Anglais"], debouches: "Leadership genre; animation communautaire; projets de développement" }
      ]}
    ]
  },
  semeCity: {
    nom: "Etablissements de Sèmè City",
    modeEntree: "Payant (se rapprocher de Sèmè City)",
    etablissements: [
      { nom: "Africa Design School", filieres: ["Licence en Design"] },
      { nom: "Ecole de l'Innovation et de l'Expertise Informatique (EPITECH)", filieres: ["Licence en Métier de l'Informatique"] }
    ]
  }
};

// EPES — Etablissements Privés d'Enseignement Supérieur
// Détail des licences par établissement : à enrichir en phase 2 (pages 72-96 du guide)
const EPES_AGREES = [
  "CIFEC","SAPIENTIA","ESAE","ESEP LE BERGER","ESPERANZA","ESEC","ESI Sainte Marie Stella",
  "ESGC VERECHAGUINE A.K.","ESGTIC - Ecce Homo","ESGIS","ESG SERENA","ESM","ESTG","ESMER",
  "ESJMF","ESSF","PIGIER BENIN","HECM","HEGJ","IIM","Institut Jean Paul II","ISEG","ISCG",
  "ISFES Laura Vicuña","ISM Adonaï","ISMT Saint SALOMON","ISMA","ISGA","ISSPT","IUSEBA",
  "IUM MatheFineco","IUP Panafricain","LCS Les COURS SONOU","IRGIB-AFRICA","POLYTECH ADA",
  "UATM-GASA","UCAO","UPI-ONM","UPAO"
];

const EPES_REGIME_OUVERTURE = [
  "ASE African School Of Economics","ASSANA-FORMATION","CET AAT-IPAAM","CFPMM","CFPP","CFTH",
  "CIUM","CP-Audacia","Ecole de Commerce de Lyon Campus Bénin","SAPIENTIA","ECOTES","EITB",
  "EPUMA","Ecole Prof. Salésienne St Jean BOSCO","ESTG","ESP","ESEP LE BERGER","ESPERANZA",
  "ESCAE","ESGC VERECHAGUINE","ESGT","ESJC/UAFPJ","ESM","ESTIM","ES cadres du funéraire","ESCT",
  "ESIGT","ESST-L","ESTAG","ESTAM","ESJMF","ESPAM","ES Polytechnique Le Pharaon","ESFRE",
  "ESPSA/K.D-K","ESSF","ES Saint-Louis d'Afrique","ESU st Clements and Commonwealth","PIGIER BENIN",
  "EPS LA CITE","ESFAM-BENIN","ESMATH BENIN","HEIM WELDIOS","HECM","HEGJ","HEGT","HECOMET",
  "HENSA","HNAUB Houdégbé","IAIB Ibn Batouta","Institut CERCO","IFA TOSSI","IIFGIT","IIFMEC",
  "Institut Polytechnique LE CITOYEN","IPPH Paul Hazoume","IRFP","IRSBAC COM","ISAPAB","ISCOM",
  "ISCG","ISFOP","IS FOPASE","ISGG","ISAO","ISM Adonaï","ISMADE","ISSIC","ISEG","Institut Sup. HCUB",
  "ISNE","ISNDA","IUAB","IU Courage","IUEP Govié","IUBO","IU Langue et Sciences","IUMA","IUST-AS",
  "IUB","IUPM","IU EDEXCEL","IU le Grand Berger","IUP Panafricain","IU Saints Adrien et Anselme",
  "IU ULTIME","IU West African Union","LCS Les COURS SONOU","LaNEM","Pinnacle African Institute",
  "POMA","UATM-GASA","UCAO","UPAO"
];

// ============================================================
// FONCTIONS UTILITAIRES POUR LE MOTEUR D'ORIENTATION
// ============================================================

/**
 * Calcule la moyenne de classement officielle.
 * @param {Array<{note:number, coef:number}>} matieres - 3 matières fondamentales
 * @returns {number} moyenne pondérée arrondie à 2 décimales
 * Exemple : calculerMoyenneClassement([{note:14,coef:5},{note:12,coef:4},{note:13,coef:4}])
 */
function calculerMoyenneClassement(matieres) {
  const sommeCoefs = matieres.reduce((s, m) => s + m.coef, 0);
  if (sommeCoefs === 0) return 0;
  const sommePonderee = matieres.reduce((s, m) => s + m.note * m.coef, 0);
  return Math.round((sommePonderee / sommeCoefs) * 100) / 100;
}

/**
 * Retourne toutes les filières publiques accessibles avec une série de bac donnée.
 * @param {string} serie - ex: "C", "D", "A1", "G2", "DT/BTP", "DEAT/PV"
 */
function filieresParBac(serie) {
  const resultats = [];
  UNIVERSITES_PUBLIQUES.forEach(u => u.etablissements.forEach(e => e.filieres.forEach(f => {
    const ok = f.bacs.some(b => b === serie || b === "Toutes séries" ||
      (serie.startsWith("DEAT") && b.startsWith("DEAT")) ||
      (serie.startsWith("DT") && b.startsWith("DT") && (b === serie || b === "DT")));
    if (ok) resultats.push({ universite: u.sigle, etablissement: e.sigle, ...f });
  })));
  return resultats;
}

/**
 * Filières triées par nombre de bourses disponibles (places), décroissant.
 * @param {number} minBourses - seuil minimal (défaut 0)
 */
function filieresParPlaces(minBourses = 0) {
  const resultats = [];
  UNIVERSITES_PUBLIQUES.forEach(u => u.etablissements.forEach(e => e.filieres.forEach(f => {
    if (f.bourse >= minBourses) resultats.push({ universite: u.sigle, etablissement: e.sigle, nom: f.nom, bourse: f.bourse, aide: f.aide, total: f.bourse + f.aide, mode: f.mode });
  })));
  return resultats.sort((a, b) => b.total - a.total);
}

/**
 * Recherche de filières par mot-clé (nom ou débouchés).
 */
function rechercherFiliere(motCle) {
  const q = motCle.toLowerCase();
  const resultats = [];
  UNIVERSITES_PUBLIQUES.forEach(u => u.etablissements.forEach(e => e.filieres.forEach(f => {
    if (f.nom.toLowerCase().includes(q) || (f.debouches || "").toLowerCase().includes(q)) {
      resultats.push({ universite: u.sigle, etablissement: e.sigle, ...f });
    }
  })));
  return resultats;
}

/**
 * Statistiques globales sur les allocations.
 */
function statistiquesAllocations() {
  let totalBourses = 0, totalAides = 0, nbFilieres = 0;
  UNIVERSITES_PUBLIQUES.forEach(u => u.etablissements.forEach(e => e.filieres.forEach(f => {
    totalBourses += f.bourse; totalAides += f.aide; nbFilieres++;
  })));
  return { nbFilieres, totalBourses, totalAides, totalPlaces: totalBourses + totalAides };
}

// Export (Node.js + navigateur)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ORIENTATION_META, UNIVERSITES_PUBLIQUES, AUTRES_STRUCTURES, EPES_AGREES, EPES_REGIME_OUVERTURE, calculerMoyenneClassement, filieresParBac, filieresParPlaces, rechercherFiliere, statistiquesAllocations };
}
