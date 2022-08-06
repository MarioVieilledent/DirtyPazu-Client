import { SocialUser } from "angularx-social-login";

// Pour le noms des différentes pages / components Angular

export type PageName = 'Infos' | 'Flag' | 'Dibi-infos' | 'Dibi-dict' | 'New-word' | 'Dibi-suggest-word' | 'Dibi-vote' | 'Dibi-grammar-rules' | 'Account' | 'Logs';

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
    dibi?: string;
    dibis?: dibiOption[]; // Dans le cas d'une proposition de mot dibi avec plusieurs versions à voter
    french: string;
    english?: string;
    partOfSpeech: PartOfSpitch;
    author?: string;
    date?: Date | string;
    description?: string;
}

// Une suggestion est une liste de mots suggérés en même temps (plusieurs mots de la même famille)
export interface DibiWordsSuggestion {
    version: number; // Version de la suggestion (1 au début, puis 2 après première modification si refus...)
    date?: Date; // Date et heure de la proposition
    author: string; // Email du compte utilisateur qui a proposé le mot
    words: DibiWord[]; // Mots proposés avec les différents propositions de mots dibis
    optionsDescription: string[]; // Description des options de mots dibis à voter
    description?: string; // Description pour la suggestion (tous les mots)
    upVotes: []; // Comptes utilisateurs ayant votés pour
    downVotes: []; // Comptes utilisateurs ayant votés contre
    comments: Comment[]; // liste des commentaires faits par les utilisateurs
    state: stateSuggestion; // État de la suggestion
}

// Une proposition de mot Dibi à voter (sur Discord avec les emojis A, B, C, etc.)
export interface dibiOption {
    dibi?: string; // Proposition
    // description?: string; // Description du choix facultative
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
    | 'refused' // Les admins ont refusé le mot, il peut à présent être modifié par l'auteur
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