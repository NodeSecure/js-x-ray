const sast_warnings = {
  parsing_error: "An error occured when parsing the JavaScript code with meriyah. It mean that the conversion from string to AST has failed. If you encounter such an error, please open an issue here.",
  unsafe_import: "Unable to follow an import (require, require.resolve) statement/expr.",
  unsafe_regex: "A RegEx as been detected as unsafe and may be used for a ReDoS Attack.",
  unsafe_stmt: "Usage of dangerous statement like eval() or Function(\"\").",
  unsafe_assign: "Assignment of a protected global like process or require.",
  encoded_literal: "An encoded literal has been detected (it can be an hexa value, unicode sequence, base64 string etc)",
  suspicious_file: "A suspicious file with more than ten encoded-literal in it.",
  short_identifiers: "This mean that all identifiers has an average length below 1.5. Only possible if the file contains more than 5 identifiers.",
  suspicious_literal: "This mean that the sum of suspicious score of all Literals is bigger than 3.",
  obfuscated_code: "There's a very high probability that the code is obfuscated...",
  weak_crypto: "The code probably contains a weak crypto algorithm (md5, sha1...)",
  shady_link: "A Literal (string) contains an URL to a domain with a suspicious extension.",
  zero_semver: "Semantic version starting with 0.x (unstable project or without serious versioning)",
  empty_package: "The package tarball only contains a package.json file.",
  unsafe_command: "Usage of suspicious child_process command such as spawn() or exec()",
  serialize_environment: "The code attempts to serialize process.env which could lead to environment variable exfiltration",
  synchronous_io: "The code contains synchronous I/O operations, which can block the event loop and degrade performance.",
  data_exfiltration: "Detects serialization of sensitive system information (os.userInfo, os.networkInterfaces, os.cpus, dns.getServers) which could indicate unauthorized data collection for external transmission.",
  log_usage: "Usage of console logging methods (log, info, warn, error, debug) that may expose sensitive information in production environments.",
  sql_injection: "Template literals with interpolated expressions in SQL queries (SELECT, INSERT, UPDATE, DELETE) without proper parameterization, creating potential SQL injection vulnerabilities.",
  monkey_patch: "Modification of native prototypes or global objects at runtime, which introduces security risks including flow hijacking, global side effects, and potential concealment of malicious activities."
};

export default {
  sast_warnings
}
