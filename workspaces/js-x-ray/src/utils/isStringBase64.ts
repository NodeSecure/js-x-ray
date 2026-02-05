export interface Base64Options {
  allowMime?: boolean;
  mimeRequired?: boolean;
  paddingRequired?: boolean;
  allowEmpty?: boolean;
}

export function isStringBase64(
  v: string,
  opts: Base64Options = {}
): boolean {
  if (opts.allowEmpty === false && v === "") {
    return false;
  }

  let regex = "(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+\\/]{3}=)?";
  const mimeRegex = "(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)";

  if (opts.mimeRequired === true) {
    regex = mimeRegex + regex;
  }
  else if (opts.allowMime === true) {
    regex = mimeRegex + "?" + regex;
  }

  if (opts.paddingRequired === false) {
    regex = "(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?";
  }

  return (new RegExp("^" + regex + "$", "gi")).test(v);
}
