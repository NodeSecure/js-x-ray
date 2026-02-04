const sast_warnings = {
  parsing_error: `Une erreur s'est produite lors de l'analyse du code JavaScript avec meriyah.
              Cela signifie que la conversion de la chaîne de caractères AST a échoué.
              Si vous rencontrez une telle erreur, veuillez ouvrir une issue.`,
  unsafe_import: "Impossible de suivre l'import (require, require.resolve) statement/expr.",
  unsafe_regex: "Un RegEx a été détecté comme non sûr et peut être utilisé pour une attaque ReDoS.",
  unsafe_stmt: "Utilisation d'instructions dangereuses comme eval() ou Function(\"\").",
  unsafe_assign: "Attribution d'un processus ou d'un require global protégé..",
  encoded_literal: "Un code littérale a été découvert (il peut s'agir d'une valeur hexa, d'une séquence unicode, d'une chaîne de caractères base64, etc.)",
  short_identifiers: "Cela signifie que tous les identifiants ont une longueur moyenne inférieure à 1,5. Seulement possible si le fichier contient plus de 5 identifiants.",
  suspicious_literal: "Cela signifie que la somme des scores suspects de tous les littéraux est supérieure à 3.",
  suspicious_file: "Un fichier suspect contenant plus de dix chaines de caractères encodés",
  obfuscated_code: "Il y a une très forte probabilité que le code soit obscurci...",
  weak_crypto: "Le code contient probablement un algorithme de chiffrement faiblement sécurisé (md5, sha1...).",
  shady_link: "Un Literal (string) contient une URL vers un domaine avec une extension suspecte.",
  zero_semver: "Version sémantique commençant par 0.x (projet instable ou sans versionnement sérieux)",
  empty_package: "L'archive du package ne contient qu'un fichier package.json.",
  unsafe_command: "Utilisation d'une commande child_process suspecte, comme spawn() ou exec()",
  serialize_environment: "Le code tente de sérialiser process.env, ce qui pourrait entraîner une exfiltration des variables d'environnement",
  synchronous_io: "Le code contient des opérations I/O synchrones, ce qui peut bloquer l'event-loop et dégrader les performances.",
  data_exfiltration: "Détecte la sérialisation d'informations système sensibles (os.userInfo, os.networkInterfaces, os.cpus, dns.getServers) qui pourrait indiquer une collecte de données non autorisée pour transmission externe.",
  log_usage: "Utilisation de méthodes de l'API console (log, info, warn, error, debug) qui peuvent exposer des informations sensibles en environnement de production.",
  sql_injection: "Littéraux de gabarit avec expressions interpolées dans les requêtes SQL (SELECT, INSERT, UPDATE, DELETE) sans paramétrisation appropriée, créant des vulnérabilités potentielles d'injection SQL.",
  monkey_patch: "Modification des prototypes natifs ou objets globaux à l'exécution, ce qui introduit des risques de sécurité incluant le détournement de flux, des effets secondaires globaux et la dissimulation potentielle d'activités malveillantes.",
  insecure_random: "Utilisation d'une génération de nombres aléatoires non sécurisée à l'aide de Math.random(). Math.random() n'est pas cryptographiquement sûr et ne doit pas être utilisé pour des opérations sensibles en matière de sécurité."
};

export default {
  sast_warnings
}
