export const sast_warnings = {
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
  unsafe_command: "Utilisation d'une commande child_process suspecte, comme spawn() ou exec()",
  serialize_environment: "Le code tente de sérialiser process.env, ce qui pourrait entraîner une exfiltration des variables d'environnement",
  synchronous_io: "Le code contient des opérations I/O synchrones, ce qui peut bloquer l'event-loop et dégrader les performances.",
  data_exfiltration: "Détecte la sérialisation d'informations système sensibles (os.userInfo, os.networkInterfaces, os.cpus, dns.getServers) qui pourrait indiquer une collecte de données non autorisée pour transmission externe.",
  log_usage: "Utilisation de méthodes de l'API console (log, info, warn, error, debug) qui peuvent exposer des informations sensibles en environnement de production.",
  sql_injection: "Littéraux de gabarit avec expressions interpolées dans les requêtes SQL (SELECT, INSERT, UPDATE, DELETE) sans paramétrisation appropriée, créant des vulnérabilités potentielles d'injection SQL.",
  monkey_patch: "Modification des prototypes natifs ou objets globaux à l'exécution, ce qui introduit des risques de sécurité incluant le détournement de flux, des effets secondaires globaux et la dissimulation potentielle d'activités malveillantes.",
  insecure_random: "Utilisation d'une génération de nombres aléatoires non sécurisée à l'aide de Math.random(). Math.random() n'est pas cryptographiquement sûr et ne doit pas être utilisé pour des opérations sensibles en matière de sécurité.",
  weak_scrypt: "Utilisation de crypto.scrypt() ou crypto.scryptSync() avec des paramètres non sécurisés tels qu'un sel codé en dur, un sel trop court (moins de 16 octets), ou un paramètre de coût insuffisant (inférieur à 16384). Ces configurations faibles compromettent la sécurité de la dérivation de clé basée sur un mot de passe.",
  prototype_pollution: "Utilisation de __proto__ pour modifier un prototype d'objet à l'exécution, pouvant écraser des propriétés natives et introduire des vulnérabilités de pollution de prototype.",
  unsafe_prehash: "Utilisation de bcryptjs avec un mot de passe pré-haché par un algorithme non sécurisé (md5, sha1, sha256 ou sha512). Un attaquant peut contourner bcrypt en cassant le hachage intermédiaire plus faible.",
  weak_bcrypt: "Utilisation des fonctions de hachage bcryptjs (hash, hashSync, genSalt, genSaltSync) avec un facteur de travail inférieur à 10, rendant le hachage de mot de passe vulnérable aux attaques par brute force.",
  password_shucking: "Utilisation de bcryptjs où le mot de passe est d'abord haché avec un condensat cryptographique (md5, sha1, sha256 ou sha512) avant d'être passé à bcrypt, permettant des attaques de hash shucking qui contournent la protection bcrypt.",
  unsafe_vm_context: "Utilisation de vm.runInContext() ou vm.Script.runInContext() où l'objet contexte peut être influencé par des entrées non fiables, rendant la sandbox vulnérable."
};

export default {
  sast_warnings
}
