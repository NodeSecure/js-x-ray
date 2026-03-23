/* eslint-disable @stylistic/max-len */
export interface Base64Options {
  allowMime?: boolean;
  mimeRequired?: boolean;
  paddingRequired?: boolean;
  allowEmpty?: boolean;
}

// CONSTANTS
const kDefaultBase64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i;
const kBase64NoPaddingRegex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(==)?|[A-Za-z0-9+/]{3}=?)?$/i;
const kBase64AllowMimeRegex = /^(data:\w+\/[a-zA-Z+\-.]+;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i;
const kBase64AllowMimeNoPaddingRegex = /^(data:\w+\/[a-zA-Z+\-.]+;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(==)?|[A-Za-z0-9+/]{3}=?)?$/i;
const kBase64RequireMimeRegex = /^(data:\w+\/[a-zA-Z+\-.]+;base64,)(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i;
const kBase64RequireMimeNoPaddingRegex = /^(data:\w+\/[a-zA-Z+\-.]+;base64,)(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(==)?|[A-Za-z0-9+/]{3}=?)?$/i;

export function isStringBase64(
  v: string,
  opts: Base64Options = {}
): boolean {
  if (opts.allowEmpty === false && v === "") {
    return false;
  }

  if (opts.mimeRequired === true) {
    return opts.paddingRequired === false
      ? kBase64RequireMimeNoPaddingRegex.test(v)
      : kBase64RequireMimeRegex.test(v);
  }

  if (opts.allowMime === true) {
    return opts.paddingRequired === false
      ? kBase64AllowMimeNoPaddingRegex.test(v)
      : kBase64AllowMimeRegex.test(v);
  }

  // paddingRequired === false (no mime)
  if (opts.paddingRequired === false) {
    return kBase64NoPaddingRegex.test(v);
  }

  // Default: no mime, padding required
  return kDefaultBase64Regex.test(v);
}
