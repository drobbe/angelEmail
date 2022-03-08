/**
 * Make an API Call by passing the payload and inject Tracing headers and context in the process
 * @param url
 * @param payload
 * @param auth
 * @param span
 * @param method
 */
export const quitarAcentos = function (word: string): string {
    const acentos = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ú: 'u',
        Á: 'A',
        É: 'E',
        Í: 'I',
        Ó: 'O',
        Ú: 'U'
    };
    return word
        .split('')
        .map((letra) => acentos[letra] || letra)
        .join('')
        .toString();
};
