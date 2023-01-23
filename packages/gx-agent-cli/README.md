<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>Gaia-X Agent Command Line Interface (CLI) 
  <br>
</h1>

---

**Warning: This package is in very early development. Breaking changes without notice will happen at this point!**

---

# GX Compliance Agent CLI

The Gaia-X Compliance Agent Command Line interface, allows you to manage the agent from the command line. Common
methods, like creating a DID, generating self-descriptions, acquiring Compliance Credentials from the Compliance Service
are supported.


# Prerequisites and installation

## NodeJS version 16
Please download NodeJS version 16. You can find NodeJS for your computer on the following page: https://nodejs.org/en/blog/release/v16.16.0/
Follow the installation instructions on the nodejs website

## Install the Gaia-X agent CLI tool
After installing nodejs open a terminal window or command prompt on your computer. Ideally with elevated permissions. Type in the following command:

```shell
npm install -g @sphereon/gx-agent-cli --no-audit
```

If you are using yarn instead of npm (required you to install yarn first separately from nodejs)
````shell
yarn global add @sphereon/gx-agent-cli
````

## Check that the CLI is available to you
Open a new terminal or command prompt on your computer and type

```shell
gx-agent --help

Usage: cli [options] [command]

Options:
  -h, --help      display help for command

Commands:
  config          Agent configuration
  did             Decentralized Identifiers (DID) commands
  vc              Generic Verifiable Credential commands
  vp              Generic Verifiable Presentation commands
  ecosystem       gx-participant ecosystem
  participant     Participant commands
  so|service      Service Offering commands
  help [command]  display help for command
```
If you see an output similar like the above, the Gaia-X Agent CLI is properly installed.


## Create X.509 keys and get SSL certificate

You will first need to have an existing X.509 EV SSL certificate or create a new
one. [This document](../../docs/X509-setup.md)
explains how to setup a new X.509 certificate. Without following the steps in the document you cannot be onboarded as
Gaia-X participant.

# DID Commands

Gaia-X DIDs currently rely on the so called [DID:web](https://w3c-ccg.github.io/did-method-web/) DID documents and
method.
The DID document is responsible for listing public keys associated with the DID and your organizational domain. This DID
is used to sign Gaia-X self-descriptions and so called Verifiable Credentials. This allows others to determine that data
is authentic and not manipulated, originating from your organization.
For Gaia-X so called did:web DIDs will be used, meaning DIDs associated with your domain name hosted at a well known
location (https://example.com/.well-known/did.json). The DID will list at least the X.509 Certificate public key
generated from the public certificate you received in the previous step.

**NOTE:** You first will
have to get a X509 certificate for your domain and DID:WEB, before you can proceed with creating the DID in the agent.
More information can be found [here](./todo)

## Create a DID and import the X.509 certificate

After having followed the instructions to obtain an X.509 certificate, you should have the private-key PEM file, the
certificate PEM file and the Certificate Authority Chain PEM file ready.

The below command creates a new DID Document, with the privkey.pem file as private Key input, the cert.pem file as
public certificate input and cacerts.pem as the Certificate Chain input. Lastly you need to pass in the domain name that
will host the DID document. This domain name needs to be exactly the same as the CN input parameter of the X.509
Certificate and should match the website name/domain you will be hosting the Gaia-X resources on!

Optionally you can provide a --ca-chain-url argument, if you wish to host the Certificate Chain somewhere else than the
default location.

```shell
gx-agent did create --private-key-file=path/to/privkey.pem --cert-file=path/to/cert.pem --ca-chain=path/to/cacerts.pem --domain=example.com
```

The DID Document is now created. You will either export it later, or serve it directly from the Gaia-X Participant
agent (described later in this document). If you do want to have a quick peek, you could use the below command to
explore the database of the agent

## List DIDs

Lists all DIDs known to the agent. Normally you will only have one DID:web for your organization. When only one DID is
present, the agent will automatically select this DID for it's commands. If you have more DIDs available, you should use
the -d option available on most commands, to select the appropriate DID

```shell
gx-agent did list

example output:
┌──────────┬──────────────────────────────────────┬──────────────────────────────────────┐
│ provider │                                  DID │                                alias │
├──────────┼──────────────────────────────────────┼──────────────────────────────────────┤
│  did:web │ did:web:nk-gx-compliance.eu.ngrok.io │ did:web:nk-gx-compliance.eu.ngrok.io │
└──────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```

## Resolve a DID

Resolving a DID, means retrieving the DID Document associated with that particular DID document. Since Gaia-X uses did:
web, it means accessing the domain name with a well-known location for the DID document,
eg: https://identity.foundation/.well-known/did.json

The below command allows you to resolve DID document. Not that directly after importing the X.509 certificates and
creating the DID in the agent, your domain will not yet host the DID document. You will have to export the DID document
first (see next command). The agent allows you to resolve any DID:web DID, but it can also resolve a DID not yet
exported and only locally known to the agent. This is handy during the onboarding phase. You will have to provide the '
-l' or '--local-only' options to enable local agent resolution

Example commands:

```shell
gx-agent did resolve

output:
┌──────────────────────────────────────┐
│                                  DID │
├──────────────────────────────────────┤
│ did:web:nk-gx-compliance.eu.ngrok.io │
└──────────────────────────────────────┘
┌──────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│    error │                                                                                                           message │
├──────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ notFound │ resolver_error: DID must resolve to a valid https URL containing a JSON document: Error: Bad response Bad Gateway │
└──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The above error is expected as long as the DID is not yet exported and hosted at the domain. Let's try again, but
directly ask the agent and with a specific DID:

```shell
gx-agent did resolve did:web:nk-gx-compliance.eu.ngrok.io -l

output:
┌──────────────────────────────────────┐
│                                  DID │
├──────────────────────────────────────┤
│ did:web:nk-gx-compliance.eu.ngrok.io │
└──────────────────────────────────────┘

DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:web:nk-gx-compliance.eu.ngrok.io",
  "verificationMethod": [
    {
      "id": "did:web:nk-gx-compliance.eu.ngrok.io#JWK2020-RSA",
      "type": "JsonWebKey2020",
      "controller": "did:web:nk-gx-compliance.eu.ngrok.io",
      "publicKeyJwk": {
        "kty": "RSA",
        "n": "uUGlbA84qYjmawZ1r9j1rUDAhkrsxdvS7rE7AZIIj41-kNpZw3UU9gPgcRwZIA7TdXewDmU5sLbOXwmNu4WuTlaXBkJAFZ390E5S_fvCBxthE8nMjjyFV8Juj_kZ__00WAHSkZxmsGs6en1AUHhRH74nX8b55Eh5UvysYbP8C6KJlyb8TUpJcOlfLT-RE-1byxgDR4Vnz3r-2kPYxdViUButOGWqKSjSIJtYZi5_kYAQC5zweUBlWeyZ3W5Ai3zRX9MC5_Y6B9fGCZu0__5y6ORCoTOU_hG2U3y7zyMCGIObjCsURhmRSwi30vyE3oIMtBV7YVl4KmrSH2jEg4iaeQ",
        "e": "AQAB",
        "x5u": "https://nk-gx-compliance.eu.ngrok.io/.well-known/fullchain.pem"
      }
    }
  ],
  "authentication": [
    "did:web:nk-gx-compliance.eu.ngrok.io#JWK2020-RSA"
  ],
  "assertionMethod": [
    "did:web:nk-gx-compliance.eu.ngrok.io#JWK2020-RSA"
  ],
  "service": []
}
```

## Export a DID and the CA chain

You will need to host the DID on your domain. For now you will have to copy the files to your webserver (the agent can
host them for you, but that option is not yet available). The document will have to be served from your domain in the
/.well-known location. The easiest way to accommodate that typically is to create a folder called .well-known in your
Website root directory. The export command already creates that folder for you!

The below command will export the DID Document in the file did.json and the CA chain in the file fullchain.pem to disk
in the .well-known directory. Copy the .well-known directory to your webserver.

Note: Do not change the path ot the fullchain.pem file on your webserver. Depending on whether you provided the URL for
the CA chain during DID creation, it might be different from below. Since the DID Document references that URL, it needs
to be resolvable at the correct location!

```shell
gx-agent did export -p my-export

output:
┌──────────────────────────────────────┬───────────────┬────────────────────────────────────────────────────────────────────┐
│                                  DID │          file │                                                               path │
├──────────────────────────────────────┼───────────────┼────────────────────────────────────────────────────────────────────┤
│ did:web:nk-gx-compliance.eu.ngrok.io │      did.json │      ./my-export/nk-gx-compliance.eu.ngrok.io/.well-known/did.json │
│ did:web:nk-gx-compliance.eu.ngrok.io │ fullchain.pem │ ./my-export/nk-gx-compliance.eu.ngrok.io/.well-known/fullchain.pem │
└──────────────────────────────────────┴───────────────┴────────────────────────────────────────────────────────────────────┘
Well-known DID files have been exported.
Please copy everything from my-export/nk-gx-compliance.eu.ngrok.io, to your webserver. Do not forget to include the hidden .well-known directory!
```

After you copied the file to the webserver, you should be able to resolve the DID, without using the `-l/--local-only`
option (see above)

## Delete a DID

Warning, normally you shouldn't be deleting DIDs from your agent. Only do so if you are sure what you are doing.

````shell
gx-agent did delete did:web:nk-gx-compliance.eu.ngrok.io
````

# Participant onboarding

You first need to become a Gaia-X compliant participant. In order to do so, you first need to create a participant
self-description. This is a so called Credential in a specific order. You will need to sign this self-description, using
your DID, making it a Verifiable Credential. The compliance service will issue an attestation, in the form of a
Participant Credential, signed by it’s DID. This allows you to prove to others that you are a Gaia-X participant.

You can either become compliant in 1 step, or by having 2 extra steps. The benefit of using 2 steps is that you can
verify the self-description, before sending it in to become compliant. The agent internally creates the same objects, no
matter what choice you make.

## Export example participant-input-credential.json

There is a command to export a template/example participant self-description to disk. You can then edit this example self-description with your information.
The `--show` argument, displays the example self-description to your console.

````shell
gx-agent participant sd export-example --show

output:
┌─────────────┬───────────────────────────────────┬──────────────────────────────────────┐
│        type │                           sd-file │                                  did │
├─────────────┼───────────────────────────────────┼──────────────────────────────────────┤
│ participant │ participant-input-credential.json │ did:web:nk-gx-compliance.eu.ngrok.io │
└─────────────┴───────────────────────────────────┴──────────────────────────────────────┘
Example self-description file has been written to participant-input-credential.json. Please adjust the contents and use one of the onboarding methods
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.gaia-x.eu/v2206/api/shape"
  ],
  "issuer": "did:web:nk-gx-compliance.eu.ngrok.io",
  "id": "be284e34-665e-4759-b2f0-4e9af6b9f742",
  "credentialSubject": {
    "id": "did:web:nk-gx-compliance.eu.ngrok.io",
    "gx-participant:name": "Example Company",
    "gx-participant:legalName": "Example Company ltd.",
    "gx-participant:website": "https://participant",
    "gx-participant:registrationNumber": [
      {
        "gx-participant:registrationNumberType": "localCode",
        "gx-participant:registrationNumberNumber": "NL001234567B01"
      },
      {
        "gx-participant:registrationNumberType": "leiCode",
        "gx-participant:registrationNumberNumber": "9695007586GCAKPYJ703"
      },
      {
        "gx-participant:registrationNumberType": "EUID",
        "gx-participant:registrationNumberNumber": "FR5910.424761419"
      }
    ],
    "gx-participant:headquarterAddress": {
      "gx-participant:addressCountryCode": "FR",
      "gx-participant:addressCode": "FR-HDF",
      "gx-participant:streetAddress": "2 rue Kellermann",
      "gx-participant:postalCode": "59100",
      "gx-participant:locality": "Roubaix"
    },
    "gx-participant:legalAddress": {
      "gx-participant:addressCountryCode": "FR",
      "gx-participant:addressCode": "FR-HDF",
      "gx-participant:streetAddress": "2 rue Kellermann",
      "gx-participant:postalCode": "59100",
      "gx-participant:locality": "Roubaix"
    },
    "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
  },
  "type": [
    "LegalPerson"
  ]
}
````




```shell

gx-agent participant compliance submit –sd-file=self-description.json
gx-agent participant self-description create –sd-file=self-description.json
gx-agent participant compliance submit –sd-id=<abcd>
gx-agent participant self-description verify –sd-file=self-description.json
gx-agent participant compliance status –sd-id=<abcd>
gx-agent ecosystem add –name=FMA –ecosystem-url=https://compliance.future-mobility-alliance.org
gx-agent participant ecosystem submit  --ecosystem=FMA –sd-id=<abcd> --compliance-id=<efgh>
gx-agent participant ecosystem submit  --ecosystem-url=https://compliance.future-mobility-alliance.org –sd-id=<abcd> --compliance-id=<efgh>
```
