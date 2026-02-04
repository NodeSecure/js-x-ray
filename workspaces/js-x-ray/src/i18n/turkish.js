const sast_warnings = {
  parsing_error: "JavaScript kodu meriyah ile ayrıştırılırken bir hata oluştu. Bu, dizeden AST'ye dönüşümün başarısız olduğu anlamına gelir. Böyle bir hatayla karşılaşırsanız lütfen burada bir sorun (issue) açın.",
  unsafe_import: "Bir içe aktarma (require, require.resolve) ifadesi/deyimi takip edilemedi.",
  unsafe_regex: "Güvensiz olduğu tespit edilen bir RegEx, ReDoS Saldırısı için kullanılabilir.",
  unsafe_stmt: "eval() veya Function(\"\") gibi tehlikeli ifadelerin kullanımı.",
  unsafe_assign: "process veya require gibi korumalı bir globale atama yapılması.",
  encoded_literal: "Kodlanmış bir sabit değer tespit edildi (onaltılık değer, unicode dizisi, base64 dizesi vb. olabilir).",
  suspicious_file: "İçinde ondan fazla kodlanmış sabit değer bulunan şüpheli bir dosya.",
  short_identifiers: "Tüm tanımlayıcıların ortalama uzunluğunun 1,5'in altında olduğu anlamına gelir. Yalnızca dosya 5'ten fazla tanımlayıcı içeriyorsa mümkündür.",
  suspicious_literal: "Tüm sabit değerlerin toplam şüpheli puanının 3'ten büyük olduğu anlamına gelir.",
  obfuscated_code: "Kodun karartılmış (obfuscated) olma olasılığı çok yüksek...",
  weak_crypto: "Kod muhtemelen zayıf bir kripto algoritması içeriyor (md5, sha1...).",
  shady_link: "Dize (Literal) şüpheli uzantılı bir alan adına giden bir URL içeriyor.",
  zero_semver: "0.x ile başlayan sürüm (kararsız proje veya ciddi sürümleme yapılmamış).",
  empty_package: "Paket tarball'u yalnızca bir package.json dosyası içeriyor.",
  unsafe_command: "spawn() veya exec() gibi şüpheli child_process komutlarının kullanımı.",
  serialize_environment: "Kod, ortam değişkenlerinin sızmasına neden olabilecek process.env'yi serileştirmeye çalışıyor.",
  synchronous_io: "Kod, olay döngüsünü (event loop) engelleyebilecek ve performansı düşürebilecek senkronize I/O işlemleri içeriyor.",
  data_exfiltration: "Harici iletim için yetkisiz veri toplamayı gösterebilecek hassas sistem bilgilerinin (os.userInfo, os.networkInterfaces, os.cpus, dns.getServers) serileştirilmesini algılar.",
  log_usage: "Üretim ortamlarında hassas bilgileri ifşa edebilecek console günlükleme yöntemlerinin (log, info, warn, error, debug) kullanımı.",
  sql_injection: "SQL sorgularında (SELECT, INSERT, UPDATE, DELETE) uygun parametreleştirme yapılmadan kullanılan ifadeler içeren şablon dizeleri, potansiyel SQL enjeksiyonu güvenlik açıkları oluşturur.",
  monkey_patch: "Çalışma zamanında yerel prototiplerin veya global nesnelerin değiştirilmesi; akış ele geçirme, global yan etkiler ve kötü niyetli faaliyetlerin gizlenmesi dahil olmak üzere güvenlik riskleri oluşturur.",
  insecure_random: "Math.random() kullanılarak güvensiz rastgele sayı üretimi. Math.random() kriptografik olarak güvenli değildir ve güvenliğe duyarlı işlemler için kullanılmamalıdır."
};

export default {
  sast_warnings
}
