
// Pour le noms des différentes pages / components Angular

export type PageName = 'Infos' | 'Flag' | 'Dibi-infos' | 'Dibi-dict' | 'Dibi-grammar-rules' | 'Dibi-add-word' | 'Dibi-mc' | 'Logs';

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

export type PartOfSpitch = 'Noun' |'Pronoun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition' | 'Conjonction' | 'Interjection' | 'Particule';

// Pour le dictionnaire

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

// Pour la partie Minecraft

export interface MinecraftWord {
    _id?: string;
    english: string;
    dibi: string;
    done: boolean;
    memo?: string;
}

// Pour les logs

export interface Log {
    id_?: string;
    message: string;
    timestamp: Date;
}

// Pour les règles de grammaire

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