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

Please download NodeJS version 16. You can find NodeJS for your computer on the following
page: https://nodejs.org/en/blog/release/v16.16.0/
Follow the installation instructions on the nodejs website

## Install the Gaia-X agent CLI tool

After installing nodejs open a terminal window or command prompt on your computer. Ideally with elevated permissions.
Type in the following command:

```shell
npm install -g @sphereon/gx-agent-cli --no-audit
```

If you are using yarn instead of npm (required you to install yarn first separately from nodejs)

```shell
yarn global add @sphereon/gx-agent-cli
```

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

# Agent configuration Commands

The agent requires an `agent.yml` file. This is a config file for the agent. It contains parameters and variables,
determining what methods are available for instance. The `agent.yml` file can either be located in the current
directory, or in a `.gx-agent` directory in your home directory. By default, the `.gx-agent` directory in your home
directory is used, unless the current working directory contains an `agent.yml` file.

## Create configuration

Creates the `agent.yml` agent configuration file. It has one option, which is not mandatory. The `-l/--location` option
can have a value of `cwd`, meaning the `agent.yml` file will be written to current working directory, or `home`, meaning
the `agent.yml` file will be written to the `.gx-agent` directory in your user home-directory. If no option is
provided, `home` will be assumed.

````shell
gx-agent config create

output:

Creating agent file: C:\Users\example\.gx-agent\agent.yml
Done. Agent file available at: C:\Users\example\.gx-agent\agent.yml
Please check the agent configuration file for any configuration options you wish to modify
````

We advise you to use the `home` location, as it means the configuration file is always available no matter from which
directory you invoke the command. Using `cwd` or current working directory is handy, when you want to use distinct
configuration files, for instance if you have to manage more than one domain. Although the agent is capable of handling
multiple domains from a single agent, you would need to provide the domain or DID value for most commands when the agent
manages multiple domains/DIDs. Having separate configuration files in separate directories then means, you do not have
to provide the DID/domain values, as the agent will notice you are only managing a single domain/DID.

## Verify configuration

Verifies a Gaia-X `agent.yml` file at a specific file location. If the `-f/--filename` option is omitted the default
home-dir location will be used in stead. The `-s/--show` option, will display the entire configuration file.

For technical people or developers. You can also test whether low level agent methods are properly configured and
available by providing the `-m/--method` option. For example to test the DID resolution method, you could
supply `resolveDid` as `-m/--method` option.

````shell
gx-agent config verify -f ./agent.yml --show

output:

version: 3
gx:
  complianceServiceUrl: https://nk-gx-compliance.eu.ngrok.io
  complianceServiceVersion: v2206
  dbEncryptionKey: 13455271cbd1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa7201
  dbFile: ./db/gx.db.sqlite
  kmsName: local
constants:
  ... truncated for README
  
Your Gaia-X agent configuration seems fine. An agent can be created and the 'agent.execute()' method can be called on it.
````

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
gx-agent did create --private-key-file=path/to/privkey.pem --cert-file=path/to/cert.pem --ca-chain=path/to/cacerts.pem --domain=nx-gx-agent.eu.ngrok.io

output:
┌──────────┬─────────────────────────────────┬─────────────────────────────────┐
│ provider │                             DID │                           alias │
├──────────┼─────────────────────────────────┼─────────────────────────────────┤
│  did:web │ did:web:nk-gx-agent.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io │
└──────────┴─────────────────────────────────┴─────────────────────────────────┘
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
│  did:web │ did:web:nk-gx-agent.eu.ngrok.io      │ did:web:nk-gx-agent.eu.ngrok.io      │
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
│ did:web:nk-gx-agent.eu.ngrok.io      │
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
gx-agent did resolve did:web:nk-gx-agent.eu.ngrok.io -l

output:
┌──────────────────────────────────────┐
│                                  DID │
├──────────────────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io      │
└──────────────────────────────────────┘

DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:web:nk-gx-agent.eu.ngrok.io",
  "verificationMethod": [
    {
      "id": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
      "type": "JsonWebKey2020",
      "controller": "did:web:nk-gx-agent.eu.ngrok.io",
      "publicKeyJwk": {
        "kty": "RSA",
        "n": "uUGlbA84qYjmawZ1r9j1rUDAhkrsxdvS7rE7AZIIj41-kNpZw3UU9gPgcRwZIA7TdXewDmU5sLbOXwmNu4WuTlaXBkJAFZ390E5S_fvCBxthE8nMjjyFV8Juj_kZ__00WAHSkZxmsGs6en1AUHhRH74nX8b55Eh5UvysYbP8C6KJlyb8TUpJcOlfLT-RE-1byxgDR4Vnz3r-2kPYxdViUButOGWqKSjSIJtYZi5_kYAQC5zweUBlWeyZ3W5Ai3zRX9MC5_Y6B9fGCZu0__5y6ORCoTOU_hG2U3y7zyMCGIObjCsURhmRSwi30vyE3oIMtBV7YVl4KmrSH2jEg4iaeQ",
        "e": "AQAB",
        "x5u": "https://nk-gx-agent.eu.ngrok.io/.well-known/fullchain.pem"
      }
    }
  ],
  "authentication": [
    "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA"
  ],
  "assertionMethod": [
    "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA"
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
│ did:web:nk-gx-agent.eu.ngrok.io      │      did.json │ ./my-export/nk-gx-agent.eu.ngrok.io/.well-known/did.json           │
│ did:web:nk-gx-agent.eu.ngrok.io      │ fullchain.pem │ ./my-export/nk-gx-agent.eu.ngrok.io/.well-known/fullchain.pem      │
└──────────────────────────────────────┴───────────────┴────────────────────────────────────────────────────────────────────┘
Well-known DID files have been exported.
Please copy everything from my-export/nk-gx-agent.eu.ngrok.io, to your webserver. Do not forget to include the hidden .well-known directory!
```

After you copied the file to the webserver, you should be able to resolve the DID, without using the `-l/--local-only`
option (see above)

## Delete a DID

Warning, normally you shouldn't be deleting DIDs from your agent. Only do so if you are sure what you are doing.

```shell
gx-agent did delete did:web:nk-gx-agent.eu.ngrok.io
```

# Participant onboarding

You first need to become a Gaia-X compliant participant. In order to do so, you first need to create a participant
self-description. This is a so called Credential in a specific order. You will need to sign this self-description, using
your DID, making it a Verifiable Credential. The compliance service will issue an attestation, in the form of a
Participant Credential, signed by it’s DID. This allows you to prove to others that you are a Gaia-X participant.

You can either become compliant in 1 step, or by having 2 extra steps. The benefit of using 2 steps is that you can
verify the self-description, before sending it in to become compliant. The agent internally creates the same objects, no
matter what choice you make.

## Export example participant-input-credential.json

There is a command to export a template/example participant self-description to disk. You can then edit this example
self-description with your information.
The `--show` argument, displays the example self-description to your console.

```shell
gx-agent participant sd export-example --show

output:
┌─────────────┬───────────────────────────────────┬──────────────────────────────────────┐
│        type │                           sd-file │                                  did │
├─────────────┼───────────────────────────────────┼──────────────────────────────────────┤
│ participant │ participant-input-credential.json │ did:web:nk-gx-agent.eu.ngrok.io      │
└─────────────┴───────────────────────────────────┴──────────────────────────────────────┘
Example self-description file has been written to participant-input-credential.json. Please adjust the contents and use one of the onboarding methods
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.gaia-x.eu/v2206/api/shape"
  ],
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "id": "816826d6-8e1f-4cc6-89a6-a77ae4b63771",
  "credentialSubject": {
    "id": "did:web:nk-gx-agent.eu.ngrok.io",
    "gx-participant:name": "Example Company",
    "gx-participant:legalName": "Example Company ltd.",
    "gx-participant:website": "'https://nk-gx-agent.eu.ngrok.io'",
    "gx-participant:registrationNumber": [
      {
        "gx-participant:registrationNumberType": "local",
        "gx-participant:registrationNumberNumber": "93056589"
      },
      {
        "gx-participant:registrationNumberType": "vat",
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
      "gx-participant:addressCountryCode": "NL",
      "gx-participant:addressCode": "NL-NLD",
      "gx-participant:streetAddress": "2 rue Kellermann",
      "gx-participant:postalCode": "59100",
      "gx-participant:locality": "Roubaix"
    },
    "gx-participant:legalAddress": {
      "gx-participant:addressCountryCode": "NL",
      "gx-participant:addressCode": "NL-NLD",
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

```

You now should open the file, and adjust the values with your participant information. Update all
the values. Do not add new keys or remove any properties/keys, except for the some of the registration numbers:
If you do not have a certain registration number, remove the part between the `{ }` brackets. For instance If you do not
have LEI code, you should remove the next part altogether:

````json
{
  "gx-participant:registrationNumberType": "leiCode",
  "gx-participant:registrationNumberNumber": "9695007586GCAKPYJ703"
},
````

Make sure to save the file afterwards. If you made some mistakes, you can always re-export the example. Be aware that it
will always overwrite the existing file!

## Submit the participant self-description

The next command creates a self-asserted Verifiable Credential out of the self-description input file. It sends that in
as a
Verifiable Presentation to the Compliance service as configured in your agent.yml file. The compliance service then will
verify the Verifiable Presentation, containing the self-description Verifiable Credential. It also performs some checks
on the information provided, like for instance the registration numbers. If everything is okay, it will return a
Compliance Verifiable Credential to you. That credential denotes you are now a valid Gaia-X participant.

Next to using the input file, you could also submit a self-description if it was already stored in the agent. This means
you can provide the ID value of the self-description credential in the agent.

You can use the `-s/--show` option, to show all the credentials used in the exchange.

````shell
gx-agent compliance sd submit -if ./participant-input-credential.json
````

or from an existing agent self-description credential:

````shell
gx-agent compliance sd submit -id dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef51114

output:
┌───────────────────────┬──────────────────────────────────────┬─────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                  type │                               issuer │                         subject │            issuance-date │                                                                                                                               id │
├───────────────────────┼──────────────────────────────────────┼─────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ParticipantCredential │ did:web:nk-gx-compliance.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-01-26T03:05:00.166Z │ d7ae24cbb223adb0df025548a691b684e995843fe6b9f549a9c517167ba68bd26545d759bae5dfe192598e86b7a6ef6874fb9a8c3859fd8317ed379ec9c6414b │
└───────────────────────┴──────────────────────────────────────┴─────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
````

Notice that you now have a Participant Credential, which is issued by the compliance server

## List participant self-description credentials

You can list participant self-descriptions known to the agent. Normally this should only be one for a domain, but you
can create new ones for the same domain/did, to update values. You can optionally provide a `-d/--did` option, to
provide the DID or domain name for which to list the participant self-description credentials.

````shell
gx-agent  participant sd list

output:
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          issuer │                              subject │            issuance-data │                                                                                                                               id │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ 816826d6-8e1f-4cc6-89a6-a77ae4b63771 │ 2023-01-26T03:04:58.179Z │ dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143 │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
````

## Show a participant self-description credential

To show the content of a participant self-description credential known to the agent, you can first list all the
participant self-descriptions (see command above). From that output you can get the id value and use that to show the
credential.

````shell
gx-agent participant sd show dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143

output:
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│                          issuer │                              subject │            issuance-data │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ 816826d6-8e1f-4cc6-89a6-a77ae4b63771 │ 2023-01-26T03:04:58.179Z │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
id: dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.gaia-x.eu/v2206/api/shape"
  ],
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "id": "816826d6-8e1f-4cc6-89a6-a77ae4b63771",
  "credentialSubject": {
    "id": "did:web:nk-gx-agent.eu.ngrok.io",
    "gx-participant:name": "Example Company",
    "gx-participant:legalName": "Example Company ltd.",
    "gx-participant:website": "'https://nk-gx-agent.eu.ngrok.io'",
    "gx-participant:registrationNumber": [
      {
        "gx-participant:registrationNumberType": "local",
        "gx-participant:registrationNumberNumber": "93056589"
      },
      {
        "gx-participant:registrationNumberType": "vat",
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
      "gx-participant:addressCountryCode": "NL",
      "gx-participant:addressCode": "NL-NLD",
      "gx-participant:streetAddress": "2 rue Kellermann",
      "gx-participant:postalCode": "59100",
      "gx-participant:locality": "Roubaix"
    },
    "gx-participant:legalAddress": {
      "gx-participant:addressCountryCode": "NL",
      "gx-participant:addressCode": "NL-NLD",
      "gx-participant:streetAddress": "2 rue Kellermann",
      "gx-participant:postalCode": "59100",
      "gx-participant:locality": "Roubaix"
    },
    "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
  },
  "type": [
    "VerifiableCredential",
    "LegalPerson"
  ],
  "issuanceDate": "2023-01-26T03:04:58.179Z",
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-01-26T03:04:58Z",
    "verificationMethod": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..PD6xomtqqHGnxFzCArJGesk5Qj4oOEE6nvQ_tPk7FuGRftECZvoh3CxXGPExNknienTINWLat6m83pqY_1GpC_pnsySrqEZaWVreXHQm8O2Gbp7l7duObAZafwxv05eCDRbg_Y-LoGi8ixyfPQGaFbuwIEDol_3xDbbIkV76YFlenygvf1mT9YL62qnhHgC8SOKyoUzlA
slO3L-RhXDIi-BAas2oSkrYfOweG5FtiMqn91XZnXfpKxm3bkdieSuUK9-PQzrwQpU9HySSUe9yePgLK_q2EjlWLwY-QHTMGWzqcCiSpW3DgWgG6JgIiHdWxDqTv54Ot6ap0BJ4QY9MDA"
  }
}
````

## Verify a participant self-description

This command verifies a participant self-description credential. It first does a local validation of the Verifiable
Credential, including a check on the signature/proof. After that it contacts the compliance service to check whether the
compliance service provides a response that the participant self-description is compliant.

The optional `-s/--show` option shows the contents of credential on the console

````shell
gx-agent participant sd verify -id dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143

output:
Agent validation of the self-description. Valid: true
┌──────────┐
│ conforms │
├──────────┤
│     true │
└──────────┘
````



# Service Offerings

As soon as you are a Gaia-X compliant participant, you can start to offer services. In order to do so, you first need to create a service offering
self-description. This is a so called Credential. You will need to sign this self-description, using
your DID, making it a Verifiable Credential. The compliance service will issue an attestation, in the form of a
ServiceOffering Credential, signed by it’s DID. This allows you to prove to others that you provide certain services.

## Export example service-input-credential.json

There is a command to export a template/example service-offer self-description to disk. You can then edit this example
self-description with your information.
The `--show` argument, displays the example self-description to your console.

```shell
gx-agent so sd export-example --show

output:
┌──────────────────┬────────────────────────────────────────┬─────────────────────────────────┐
│             type │                                sd-file │                             did │
├──────────────────┼────────────────────────────────────────┼─────────────────────────────────┤
│ service-offering │ service-offering-input-credential.json │ did:web:nk-gx-agent.eu.ngrok.io │
└──────────────────┴────────────────────────────────────────┴─────────────────────────────────┘
Example service-offering self-description file has been written to service-offering-input-credential.json. Please adjust the contents and use one of the onboarding methods
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.gaia-x.eu/v2206/api/shape"
  ],
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "id": "51d15354-4570-4b44-9beb-8e78b9ab6795",
  "credentialSubject": {
    "id": "did:web:nk-gx-agent.eu.ngrok.io",
    "gx-service-offering:providedBy": "https://nk-gx-agent.eu.ngrok.io/.well-known/participant.json",
    "gx-service-offering:name": "my awesome service",
    "gx-service-offering:description": "a service by https://nk-gx-agent.eu.ngrok.io",
    "gx-service-offering:termsAndConditions": [
      {
        "gx-service-offering:url": "https://nk-gx-agent.eu.ngrok.io/terms-and-conditions/",
        "gx-service-offering:hash": "myrandomhash"
      }
    ],
    "gx-service-offering:gdpr": [
      {
        "gx-service-offering:imprint": "https://nk-gx-agent.eu.ngrok.io/terms-and-conditions/"
      },
      {
        "gx-service-offering:privacyPolicy": "https://nk-gx-agent.eu.ngrok.io/personal-data-protection/"
      }
    ],
    "gx-service-offering:dataExport": {
      "gx-service-offering:requestType": "email",
      "gx-service-offering:accessType": "digital",
      "gx-service-offering:formatType": "mime/png"
    }
  },
  "type": [
    "ServiceOffering"
  ]
}
```

You now should open the file, and adjust the values with your service-offer information. Update all
the values. Make sure to save the file afterwards. If you made some mistakes, you can always re-export the example. Be aware that it
will always overwrite the existing file!

## Submit the service-offering self-description

The next command creates a self-asserted Verifiable Credential out of the self-description input file. It sends that in
as a
Verifiable Presentation to the Compliance service as configured in your agent.yml file. The compliance service then will
verify the Verifiable Presentation, containing the self-description Verifiable Credential. It also performs some checks
on the information provided. If everything is okay, it will return a
Compliance Verifiable Credential to you. That credential denotes you are now a valid Gaia-X participant.

Next to using the input file, you could also submit a self-description if it was already stored in the agent. This means
you can provide the ID value of the self-description credential in the agent.

You can use the `-s/--show` option, to show all the credentials used in the exchange.

````shell
gx-agent  so sd submit -sif ./service-offering-input-credential.json


````

or from an existing agent self-description credential:

````shell
gx-agent so sd submit -id 5b55d322eb2bda3899c94ba6617aca2376314a02d59700a1c68d5dbee19aa640ba5576a57bdbd03a356dfa71735423e9ae4da09a2e3df05c1d6dd8c6f9a292f0

Ouput:
┌──────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ verifiableCredential │                                                                                                                             hash │
├──────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│      [object Object] │ 5b55d322eb2bda3899c94ba6617aca2376314a02d59700a1c68d5dbee19aa640ba5576a57bdbd03a356dfa71735423e9ae4da09a2e3df05c1d6dd8c6f9a292f0 │
└──────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
````

Notice that you now have a ServiceOffering Credential, which is issued by the compliance server

## List service-offering self-description credentials

You can list service-offering self-descriptions known to the agent.

````shell
gx-agent so sd list
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          issuer │                              subject │            issuance-data │                                                                                                                               id │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ 51d15354-4570-4b44-9beb-8e78b9ab6795 │ 2023-01-26T03:35:50.574Z │ 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447 │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
````

## Show a service-offering self-description credential

To show the content of a service-offering self-description credential known to the agent, you can first list all the
service-offering self-descriptions (see command above). From that output you can get the id value and use that to show the
credential.

````shell
gx-agent sd sd show so sd show 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447

output:
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│                          issuer │                              subject │            issuance-data │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ 51d15354-4570-4b44-9beb-8e78b9ab6795 │ 2023-01-26T03:35:50.574Z │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
id: 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.gaia-x.eu/v2206/api/shape"
  ],
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "id": "51d15354-4570-4b44-9beb-8e78b9ab6795",
  "credentialSubject": {
    "id": "did:web:nk-gx-agent.eu.ngrok.io",
    "gx-service-offering:providedBy": "https://nk-gx-agent.eu.ngrok.io/.well-known/participant.json",
    "gx-service-offering:name": "my awesome service",
    "gx-service-offering:description": "a service by https://nk-gx-agent.eu.ngrok.io",
    "gx-service-offering:termsAndConditions": [
      {
        "gx-service-offering:url": "https://nk-gx-agent.eu.ngrok.io/terms-and-conditions/",
        "gx-service-offering:hash": "myrandomhash"
      }
    ],
    "gx-service-offering:gdpr": [
      {
        "gx-service-offering:imprint": "https://nk-gx-agent.eu.ngrok.io/terms-and-conditions/"
      },
      {
        "gx-service-offering:privacyPolicy": "https://nk-gx-agent.eu.ngrok.io/personal-data-protection/"
      }
    ],
    "gx-service-offering:dataExport": {
      "gx-service-offering:requestType": "email",
      "gx-service-offering:accessType": "digital",
      "gx-service-offering:formatType": "mime/png"
    }
  },
  "type": [
    "VerifiableCredential",
    "ServiceOffering"
  ],
  "issuanceDate": "2023-01-26T03:35:50.574Z",
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-01-26T03:35:50Z",
    "verificationMethod": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..UM74Ij3DEv8qRmfMUoJ8wlbJHFA0XOUD8_xl_rYRzxaQvUOtrwgCrCnUyPy3U1JOT8nGnkakbfpT8r2x51T2c8wKUtxynDmtVhmBCfTJdp7fOsM1JC4BKQmAPRHXBUEpgUbLQc60OREyp37uJFzmN66q-blCvEt5v-YHhhnpMO49SUXWMKhhBruEPlPQh6UkfW5SDb9MB
ZcR-INzqQKkBKMDhLkxl4cXpOEepT6fYm-DUq4LVaGCy3NHdB6SNF7asNT0xIHXSX5UiU-ZeQsz0Q1O8tSuhvk2NP0IFy4RXO6IIynP56RPeY05CbW40ejE65TNCzyc2xNyU0CZFcWy3Q"
  }
}

````

## Verify a service-offering self-description

This command verifies a service-offering self-description credential. It first does a local validation of the Verifiable
Credential, including a check on the signature/proof. After that it contacts the compliance service to check whether the
compliance service provides a response that the service-offering self-description is compliant.

The optional `-s/--show` option shows the contents of credential on the console

````shell
gx-agent so sd verify -id 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447

output:
Agent validation of the self-description. Valid: true
┌──────────┐
│ conforms │
├──────────┤
│     true │
└──────────┘
````

```shell
gx-agent ecosystem add –name=FMA –ecosystem-url=https://compliance.future-mobility-alliance.org
gx-agent participant ecosystem submit  --ecosystem=FMA –sd-id=<abcd> --compliance-id=<efgh>
gx-agent participant ecosystem submit  --ecosystem-url=https://compliance.future-mobility-alliance.org –sd-id=<abcd> --compliance-id=<efgh>
```

# Developers

## Building an executable

Make sure the CLI is build as well as it dependencies in this monorepo, eg `yarn build`
Also install the [pkg]() progam, globally, eg `yarn global add pkg`

Now create the binaries for the different platforms:

```shell
pkg ./dist/cli.js
```
