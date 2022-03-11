import { SocialUser } from "angularx-social-login";

// Pour le noms des différentes pages / components Angular

export type PageName = 'Infos' | 'Flag' | 'Dibi-infos' | 'Dibi-dict' | 'Dibi-suggest-word' | 'Dibi-vote' | 'Dibi-grammar-rules' | 'Logs';

// Pour la page flag

export interface Coord {
    i: number;
    j: number;
}

export interface Pixel {
    entityId: string;
    author: string;
    hexColor: string;
    indexInFlag: string;
    coord?: Coord;
}

export interface Region {
    name: string;
    discordLink: string;
    lowerJ: number;
    lowerI: number;
    upperJ: number;
    upperI: number;
}

// Général

export type PartOfSpitch = 'Noun' | 'Pronoun' | 'Verb' | 'Adjective' | 'Adverb' | 'Conjonction' | 'Interjection' | 'FunctionParticule' | 'TransformationParticule' | 'SpiritWord';

// Pour le dictionnaire

// Mot Dibi
export interface DibiWord {
    _id?: string;
    dibi: string;
    french: string;
    english?: string;
    partOfSpeech: PartOfSpitch;
    author?: string;
    date?: Date | string;
    description?: string;
}

// Une suggestion est une liste de versions 
export interface DibiWordSuggestion {
    version: number; // Version de la suggestion (1 au début, puis 2 après première modification si refus...)
    date: Date; // Date et heure de la proposition
    author: any; // Compte utilisateur qui a proposé le mot
    word: DibiWord; // Mot proposé ne contenant pas encore d'_id
    multipleDibi: boolean; // Vrai si plusieurs propositions pour le mot dibi
    dibiSuggestions: Suggestion[]; // Les suggestions de mots dibi à voter
    upVotes: []; // Comptes utilisateurs ayant votés pour
    downVotes: []; // Comptes utilisateurs ayant votés contre
    comments: Comment[]; // liste des commentaires faits par les utilisateurs
    state: stateSuggestion;
}

// Une proposition de mot Dibi à voter
export interface Suggestion {
    dibi?: string; // Proposition
    description?: string; // Description du choix facultative
    votes?: NoteDibiWord[]; // Notes (votes) = liste de notes
}

// Un vote pour une proposition parmi plusieurs mots dibi
export interface NoteDibiWord {
    email: string; // Email du compte qui a voté
    date: Date; // Date du vote
    value: number; // Valeur de la note
}

// Un commentaire
export interface Comment {
    author: any; // Compte du commentateur
    title: string; // Titre du commentaire
    content: string; // Commentaire texte
    date: Date; // Date et heure du post du commentaire
}

// États que peut prendre une suggestion
export type stateSuggestion =
    'suggested' // Le mot vient d'être proposé, il n'est pas issue d'une modification, le mot est en phase de vote par les utilisateurs
    | 'modified' // Après un refus utilisateurs ou admins, le mot a été modifié par son auteur, le mot est en phase de vote par les utilisateurs
    | 'accepted' // Les votes des utilisateurs ont permis de valider le mot, le mot est à présent en attente de validation par admins
    | 'refusedByUsers' // Les votes des utilisateurs ont refusé le mot, il est en attente d'être modifié par l'auteur en fonction des commentaires
    | 'refusedByAdmins' // Les admins ont refusé le mot accepté par les utilisateur, il est en attente d'être modifié par l'auteur en fonction des commentaires
    | 'added' // Le mot accepté par les utilisateurs et validé par les admins, il est à présent ajouté comme mot au dictionnaire, et archivé (l'archivage est simplement l'état added)

export interface AccountSettings {
    email: string, // Email fonctionnant comme clé primaire
    user: SocialUser,
    discordPseudo: string; // Pseudo sur Discord (modifiable)
    discordTag: string; // Code à 4 chiffres après le #
    description?: string; // Description du profil
}

// Pour les logs
export interface Log {
    id_?: string;
    message: string;
    timestamp: Date;
}

// Pour les règles de grammaire
/*
// Un exemple dans une règle de grammaire
export interface Example {
    dibi: string; // Phrase en Dibi pour illustrer l'exemple
    french?: string; // Traduction française de la phrase Dibi
    description?: string; // Explication de l'exemple
}

// Section d'une règle de grammaire, une règle de grammaire est constitué de 0 à n sections
export interface Section {
    text: string; // Description détaillée de la règle
    examples: Example[]; // Liste d'exemples pour illustrer la règle
}

// Règle de grammaire
export interface GrammarRule {
    _id?: string; //Id généré par mongodb
    title: string; // Titre de la règle
    sections: Section[]; // Liste de description de la règle (chaque section à un texte et 0 à n exemples)
}

// Groupement de règles de grammaire
export interface GroupedGrammatarRules {
    name: string; // Nom du groupe
    grammarRules: GrammarRule[]; // Liste de règles appartenant à ce groupe
}
*/