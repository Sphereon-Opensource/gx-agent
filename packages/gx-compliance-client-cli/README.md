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
gx-participant did create --private-key-file=privkey.pem --cert-file=cert.pem --ca-chain=cacerts.pem --domain=example.com
gx-participant participant compliance submit –sd-file=self-description.json
gx-participant participant self-description create –sd-file=self-description.json
gx-participant participant compliance submit –sd-id=<abcd>
gx-participant participant self-description verify –sd-file=self-description.json
gx-participant participant compliance status –sd-id=<abcd>
gx-participant ecosystem add –name=FMA –ecosystem-url=https://compliance.future-mobility-alliance.org
gx-participant participant ecosystem submit  --ecosystem=FMA –sd-id=<abcd> --compliance-id=<efgh>
gx-participant participant ecosystem submit  --ecosystem-url=https://compliance.future-mobility-alliance.org –sd-id=<abcd> --compliance-id=<efgh>
```
