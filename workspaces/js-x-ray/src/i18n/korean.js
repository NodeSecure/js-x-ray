const sast_warnings = {
  parsing_error: "meriyah로 JavaScript 코드를 파싱하는 중 오류가 발생했습니다. 문자열에서 AST로의 변환이 실패했음을 의미합니다. 이 오류가 발생하면 이슈를 등록해 주세요.",
  unsafe_import: "import (require, require.resolve) 구문/표현식을 추적할 수 없습니다.",
  unsafe_regex: "안전하지 않은 정규식이 감지되었으며, ReDoS 공격에 악용될 수 있습니다.",
  unsafe_stmt: "eval() 또는 Function(\"\")과 같은 위험한 구문이 사용되었습니다.",
  unsafe_assign: "process 또는 require와 같은 보호된 전역 객체에 대한 할당이 감지되었습니다.",
  encoded_literal: "인코딩된 리터럴이 감지되었습니다 (16진수 값, 유니코드 시퀀스, base64 문자열 등일 수 있습니다).",
  suspicious_file: "인코딩된 리터럴이 10개 이상 포함된 의심스러운 파일입니다.",
  short_identifiers: "모든 식별자의 평균 길이가 1.5 미만입니다. 파일에 5개 이상의 식별자가 포함된 경우에만 해당됩니다.",
  suspicious_literal: "모든 리터럴의 의심 점수 합계가 3보다 큽니다.",
  obfuscated_code: "코드가 난독화되었을 가능성이 매우 높습니다...",
  weak_crypto: "코드에 취약한 암호화 알고리즘(md5, sha1 등)이 포함되어 있을 수 있습니다.",
  shady_link: "리터럴(문자열)에 의심스러운 확장자를 가진 도메인의 URL이 포함되어 있습니다.",
  zero_semver: "시맨틱 버전이 0.x로 시작합니다 (불안정한 프로젝트이거나 체계적인 버전 관리가 없음).",
  empty_package: "패키지 tarball에 package.json 파일만 포함되어 있습니다.",
  unsafe_command: "spawn() 또는 exec()와 같은 의심스러운 child_process 명령이 사용되었습니다.",
  serialize_environment: "코드가 process.env를 직렬화하려고 시도하고 있으며, 이는 환경 변수 유출로 이어질 수 있습니다.",
  synchronous_io: "코드에 동기 I/O 작업이 포함되어 있으며, 이는 이벤트 루프를 차단하고 성능을 저하시킬 수 있습니다.",
  data_exfiltration: "민감한 시스템 정보(os.userInfo, os.networkInterfaces, os.cpus, dns.getServers)의 직렬화가 감지되었으며, 이는 외부 전송을 위한 무단 데이터 수집을 나타낼 수 있습니다.",
  log_usage: "프로덕션 환경에서 민감한 정보를 노출할 수 있는 콘솔 로깅 메서드(log, info, warn, error, debug)가 사용되었습니다.",
  sql_injection: "SQL 쿼리(SELECT, INSERT, UPDATE, DELETE)에서 적절한 매개변수화 없이 보간된 표현식이 포함된 템플릿 리터럴이 사용되어 SQL 인젝션 취약점이 발생할 수 있습니다.",
  monkey_patch: "런타임에 네이티브 프로토타입 또는 전역 객체를 수정하고 있으며, 이는 흐름 하이재킹, 전역 부작용, 악성 활동 은폐 등의 보안 위험을 초래합니다.",
  insecure_random: "Math.random()을 사용한 안전하지 않은 난수 생성이 감지되었습니다. Math.random()은 암호학적으로 안전하지 않으므로 보안에 민감한 작업에 사용해서는 안 됩니다.",
  weak_scrypt: "하드코딩된 솔트, 짧은 솔트(16바이트 미만), 또는 불충분한 비용 매개변수(16384 미만)와 같은 안전하지 않은 매개변수로 crypto.scrypt() 또는 crypto.scryptSync()가 사용되었습니다. 이러한 취약한 설정은 비밀번호 기반 키 파생의 보안을 손상시킵니다."
};

export default {
  sast_warnings
}
