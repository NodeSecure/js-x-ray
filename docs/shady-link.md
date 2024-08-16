# Shady link
| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| shady-link | `Warning` | `sast_warnings.shady_link` | ❌ | 

## Introduction

Identify when a literal (string) contains a suspicious URL:
  - To a domain with a **suspicious** extension.
  - URLs with a raw **IP address**.

## A suspicious domain

```js
const foo = "http://foo.xyz";
```

## URL with a dangerous raw IP address

URLs containing raw IP addresses can be considered potentially dangerous for several reasons:

  - **Phishing and social engineering**: Attackers can use raw IP addresses in URLs to hide the true destination of the link.

  - **Malware and code injection attacks**: Raw IP addresses can point to malicious websites that host malware or use compromising code injection techniques.

  - **Privacy violations**: Bypass proxy servers or firewalls designed to block access to certain websites, thereby exposing users.

```js
const IPv4URL = "http://77.244.210.247/script";

const IPv6URL = "http://2444:1130:80:2aa8:c313:150d:b8cf:c321/script"; 
```

<br />
<br />

> [!IMPORTANT]\
> Credit goes to the [guarddog](https://github.dev/DataDog/guarddog) team.\
> Credit goes to the [ietf.org](https://www.ietf.org/rfc/rfc3986.txt).
