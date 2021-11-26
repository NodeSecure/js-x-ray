import { unsafeUnicodeControlCharacters } from "../constants.js";

export function verify(sourceString) {
  for (const unsafeCharacter of unsafeUnicodeControlCharacters) {
    if (sourceString.includes(unsafeCharacter)) {
      return true;
    }
  }

  return false;
}
