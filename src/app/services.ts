import { retry } from "rxjs/operators";

export function removeAccents(str: string): string {
    let ret = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents
    ret = ret.replace('Œ', 'Oe');
    ret = ret.replace('œ', 'oe');
    return ret;
}