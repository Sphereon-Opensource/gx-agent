<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>Gaia-X Compliance Client CLI (Typescript) 
  <br>
</h1>

---

**Warning: This package still is in every early development. Breaking changes without notice will happen at this point!**

---

# gx-compliance-client-cli

## Commands

```shell
gx-agent did create --private-key-file=privkey.pem --cert-file=cert.pem --ca-chain=cacerts.pem --domain=example.com
gx-agent participant compliance submit –sd-file=self-description.json
gx-agent participant self-description create –sd-file=self-description.json
gx-agent participant compliance submit –sd-id=<abcd>
gx-agent participant self-description verify –sd-file=self-description.json
gx-agent participant compliance status –sd-id=<abcd>
gx-agent ecosystem add –name=FMA –ecosystem-url=https://compliance.future-mobility-alliance.org
gx-agent participant ecosystem submit  --ecosystem=FMA –sd-id=<abcd> --compliance-id=<efgh>
gx-agent participant ecosystem submit  --ecosystem-url=https://compliance.future-mobility-alliance.org –sd-id=<abcd> --compliance-id=<efgh>
```
