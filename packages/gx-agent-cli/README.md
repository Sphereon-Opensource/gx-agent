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

# Overview

After Prerequisites and installation part, we will discuss how to setup your own X.509 keys and SSL certificate. What follows is a guide for using this cli agent to connect to a gaia-x compatible Compliance Service (gx-compliance for short).
Below you can see a simple workflow scenario of this CLI tool:

![Flow diagram](https://github.com/Sphereon-Opensource/gx-agent/blob/develop/docs/simple-gx-flow.puml)

# Prerequisites and installation

## NodeJS version 18

Please download NodeJS version 18. You can find NodeJS for your computer on the following
page: https://nodejs.org/en/blog/release/v18.16.0/
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
  config            Agent configuration
  did               Decentralized Identifiers (DID) commands
  vc                Generic Verifiable Credential commands
  vp                Generic Verifiable Presentation commands
  ecosystem         Ecosystem specific commands
  participant       Participant commands
  so|service        Service Offering commands
  export [options]  Exports all agent data so it can be hosted or backed-up
  help [command]    display help for command
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

```shell
gx-agent config create

output:

Creating agent file: C:\Users\example\.gx-agent\agent.yml
Done. Agent file available at: C:\Users\example\.gx-agent\agent.yml
Please check the agent configuration file for any configuration options you wish to modify
```

We advise you to use the `home` location, as it means the configuration file is always available no matter from which
directory you invoke the command. Using `cwd` or current working directory is handy, when you want to use distinct
configuration files, for instance if you have to manage more than one domain. Although the agent is capable of handling
multiple domains from a single agent, you would need to provide the domain or DID value for most commands when the agent
manages multiple domains/DIDs. Having separate configuration files in separate directories then means, you do not have
to provide the DID/domain values, as the agent will notice you are only managing a single domain/DID.

## Gaia-X Versions

There has been a couple of gaia-x versions, since there are major changes between versions, this library intends to only support the latest **v1.2.8**
_support for versions v2206 and v2210 are removed in this release_

- 1.2.8 (latest)
  _this version is the first version that supports VerifiablePresentation by design._

## Verify configuration

Verifies a Gaia-X `agent.yml` file at a specific file location. If the `-f/--filename` option is omitted the default
home-dir location will be used in stead. The `--show` option, will display the entire configuration file.

For technical people or developers. You can also test whether low level agent methods are properly configured and
available by providing the `-m/--method` option. For example to test the DID resolution method, you could
supply `resolveDid` as `-m/--method` option.

```shell
gx-agent config verify -f ./agent.yml --show

output:

version: 3
gx:
  complianceServiceUrl: https://nk-gx-compliance.eu.ngrok.io
  complianceServiceVersion: v1.2.8
  dbEncryptionKey: 13455271cbd1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa7201
  dbFile: ./db/gx.db.sqlite
  kmsName: local
constants:
  ... truncated for README

Your Gaia-X agent configuration seems fine. An agent can be created and the 'agent.execute()' method can be called on it.
```

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
gx-agent did create --private-key-file=path/to/privkey.pem --cert-file=path/to/cert.pem --ca-chain-file=path/to/cacerts.pem --domain=nx-gx-agent.eu.ngrok.io

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

There is a command to export a template/example for two version of participants self-description to disk. If you want to create a Pariticipant according to v2206 api, you can call it with that specific version `-v v2206`, or you can call it with `-v v2210` to get the new version of Participant Self-Description. _Also calling it without a version param will generate v2210 version of a participant self-description._ You can then edit this example
self-description with your information.
The `--show` argument, displays the example self-description to your console.

```shell
gx-agent participant sd export-example -d did:web:nk-gx-agent.eu.ngrok.io --show

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
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "id": "urn:uuid:554db947-e001-431c-ae55-22a781e1f928",
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "issuanceDate": "2023-05-29T18:03:00.887Z",
  "credentialSubject": {
    "id": "did:web:nk-gx-agent.eu.ngrok.io",
    "type": "gx:LegalParticipant",
    "gx:legalName": "Gaia-X European Association for Data and Cloud AISBL",
    "gx:legalRegistrationNumber": {
      "gx:vatID": "BE0762747721"
    },
    "gx:headquarterAddress": {
      "gx:countrySubdivisionCode": "BE-BRU"
    },
    "gx:legalAddress": {
      "gx:countrySubdivisionCode": "BE-BRU"
    },
    "gx-terms-and-conditions:gaiaxTermsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-05-29T16:05:10Z",
    "verificationMethod": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fqGrFQqR2LrwQ3j2IC5QPZAHsTNIcfDDe8AjgGOzvY5yOKCj4VDE0rSpb70dQIwoGKJEDEQFUQnEXXlKDZSD79EmSDdJJTpTJJ4xlAS8kXHc6jEgq0gYKkKY7eTUQUhuHrCGFEJ-I-KTJLut3czcdzsRsBITqDbazrEoFOvgKv_C6XzOYIMWxxcczRtGFkKm8c-lIHayABnfHV9ES6PsfwNBuGC5HcsCY0lUZ9h4PMMYC60p-sspCxKLzpILfpcGLV-D73JGrvLycdW7zYNW_M5IQ0gOhaebw_oNSfSdaX08QZ9fAQhXLg3QzX4qIvLzsQVVmn1XFbXdiye574x89w"
  }
}

```

You now should open the file, and adjust the values with your participant information. Update all
the values. Do not add new keys or remove any properties/keys, except for the some of the keys that are mentioned in the context file:

- gx:legalRegistrationNumber
- gx:parentOrganization
- gx:subOrganization
- gx:headquarterAddress
- gx:legalAddress
  For a better guide on how to populate your requested field you can take a look at the main shape file: https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#

- Make sure to save the file afterwards. If you made some mistakes, you can always re-export the example. Be aware that it will always overwrite the existing file!

## Submit the participant self-description

The next command creates a self-asserted Verifiable Credential out of the self-description input file. It sends that in
as a
Verifiable Presentation to the Compliance service as configured in your agent.yml file. The compliance service then will
verify the Verifiable Presentation, containing the self-description Verifiable Credential. It also performs some checks
on the information provided, like for instance the registration numbers. If everything is okay, it will return a
Compliance Verifiable Credential to you. That credential denotes you are now a valid Gaia-X participant.

Next to using the input file, you could also submit a self-description if it was already stored in the agent. This means
you can provide the ID value of the self-description credential in the agent.

You can use the `--show` option, to show all the credentials used in the exchange.

```shell
gx-agent participant sd submit -sif ./participant-input-credential.json
```

or from an existing agent self-description credential:

```shell
gx-agent participant sd submit -id dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef51114

output:
┌───────────────────────┬──────────────────────────────────────┬─────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                  type │                               issuer │                         subject │            issuance-date │                                                                                                                               id │
├───────────────────────┼──────────────────────────────────────┼─────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Compliance            │ did:web:nk-gx-compliance.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-06-08T14:21:10.896Z │ 763640a06a6c65f79c79d0ff7e549ba1241e06ff260fb98103e67afbc818fe0b82371c2e63907c63a938b836f7dfe85055e8ece07051226516b2143320e020ce │
└───────────────────────┴──────────────────────────────────────┴─────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Notice that you now have a Participant Credential, which is issued by the compliance server

## List participant self-description credentials

You can list participant self-descriptions known to the agent. Normally this should only be one for a domain, but you
can create new ones for the same domain/did, to update values. You can optionally provide a `-d/--did` option, to
provide the DID or domain name for which to list the participant self-description credentials.

```shell
gx-agent  participant sd list

output:
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          issuer │                              subject │            issuance-data │                                                                                                                               id │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-01-26T03:04:58.179Z │ dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143 │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Show a participant self-description credential

To show the content of a participant self-description credential known to the agent, you can first list all the
participant self-descriptions (see command above). From that output you can get the id value and use that to show the
credential.

```shell
gx-agent participant sd show dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143

output:
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┐
│                          issuer │                              subject │            issuance-data │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io      │ 2023-05-29T18:03:00.887Z │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┘
id: dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "id": "urn:uuid:554db947-e001-431c-ae55-22a781e1f928",
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "issuanceDate": "2023-05-29T18:03:00.887Z",
  "credentialSubject": {
    "id": "2023-05-29T18:03:00.887Z",
    "type": "gx:LegalParticipant",
    "gx:legalName": "Gaia-X European Association for Data and Cloud AISBL",
    "gx:legalRegistrationNumber": {
      "gx:vatID": "BE0762747721"
    },
    "gx:headquarterAddress": {
      "gx:countrySubdivisionCode": "BE-BRU"
    },
    "gx:legalAddress": {
      "gx:countrySubdivisionCode": "BE-BRU"
    },
    "gx-terms-and-conditions:gaiaxTermsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-05-29T16:05:10Z",
    "verificationMethod": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fqGrFQqR2LrwQ3j2IC5QPZAHsTNIcfDDe8AjgGOzvY5yOKCj4VDE0rSpb70dQIwoGKJEDEQFUQnEXXlKDZSD79EmSDdJJTpTJJ4xlAS8kXHc6jEgq0gYKkKY7eTUQUhuHrCGFEJ-I-KTJLut3czcdzsRsBITqDbazrEoFOvgKv_C6XzOYIMWxxcczRtGFkKm8c-lIHayABnfHV9ES6PsfwNBuGC5HcsCY0lUZ9h4PMMYC60p-sspCxKLzpILfpcGLV-D73JGrvLycdW7zYNW_M5IQ0gOhaebw_oNSfSdaX08QZ9fAQhXLg3QzX4qIvLzsQVVmn1XFbXdiye574x89w"
  }

```

## Verify a participant self-description

This command verifies a participant self-description credential. It first does a local validation of the Verifiable
Credential, including a check on the signature/proof. After that it contacts the compliance service to check whether the
compliance service provides a response that the participant self-description is compliant.

The optional `---show` option shows the contents of credential on the console

```shell
gx-agent participant sd verify -id dff1ffbee0abd14c9483946dbe703d443702a7bdbc5b74dce5d29f3e8afb0c197698656d5d1466726c6e57b9ed0590befbf650f09e4a5552999a8697ef511143

output:
Agent validation of the self-description. Valid: true
┌──────────┐
│ verified │
├──────────┤
│     true │
└──────────┘
```

# Ecosystems

Up until now the commands have interacted with the Gaia-X compliance service. The participant self-description resulted
in a Compliance credential being issued by the Compliance Server. You will find the concept of self-descriptions in
later chapters. These self-descriptions are being used by participants in specific ecosystems. 'The Future Mobility
Alliance' is one such ecosystem. The Gaia-X agent supports adding new ecosystems, as long as they are using endpoints
similar to the compliance server.

## Add an ecosystem

Adds a new ecosystem to the `agent.yml` file. The name and url are required arguments. If the name contains any spaces
be sure to add quotes (") around the name. We suggest to keep the name short and succinct, maybe even abbreviating the
full name of the ecosystem. You can always provide an optional description, containing the full name.

```shell
gx-agent ecosystem add FMA https://compliance.future-mobility-alliance.org -d "Future Mobility Alliance"

output:
New ecosystem FMA has been added to your agent configuration: C:\Users\Example\.gx-agent\agent.yml
┌──────┬─────────────────────────────────────────────────┬──────────────────────────┐
│ name │                                             url │              description │
├──────┼─────────────────────────────────────────────────┼──────────────────────────┤
│  FMA │ https://compliance.future-mobility-alliance.org │ Future Mobility Alliance │
└──────┴─────────────────────────────────────────────────┴──────────────────────────┘
```

## Update an ecosystem

If you made a mistake in the url or description, you of course could delete the ecosystem first and then add it again,
but there is also an update command. Actually that command is an alias for the add command. The command looks at whether
an existing ecosystem is already found by that name. If so it updates it.
If you made a mistake in the name, you will have to delete the erroneous ecosystem by name and add the new one

## Delete an ecosystem

Be aware that if you delete an ecosystem you will not be able to interact with it again, unless you re-add it of-course.

```shell
gx-agent ecosystem delete FMA

 output:
┌──────┬─────────────────────────────────────────────────┬──────────────────────────┐
│ name │                                             url │              description │
├──────┼─────────────────────────────────────────────────┼──────────────────────────┤
│  FMA │ https://compliance.future-mobility-alliance.org │ Future Mobility Alliance │
└──────┴─────────────────────────────────────────────────┴──────────────────────────┘
Ecosystem FMA has been deleted from your agent configuration: C:\Users\example\.gx-agent\agent.yml
```

## List

You can list all known ecosystems from the `agent.yml` configuration file using the below command.

```shell
gx-agent ecosystem list

output:
┌──────┬─────────────────────────────────────────────────┬──────────────────────────┐
│ name │                                             url │              description │
├──────┼─────────────────────────────────────────────────┼──────────────────────────┤
│  FMA │ https://compliance.future-mobility-alliance.org │ Future Mobility Alliance │
└──────┴─────────────────────────────────────────────────┴──────────────────────────┘
```

# Service Offerings

As soon as you are a Gaia-X compliant participant, you can start to offer services. In order to do so, you first need to
create a service offering self-description. This is a so called "Credential". You will need to sign this self-description, using
your DID, making it a Verifiable Credential. The compliance service will issue an attestation, in the form of a
ServiceOffering Credential, signed by it’s DID. This allows you to prove to others that you provide certain services.

## Export example service-input-credential.json

There is a command to export a template/example service-offering self-description to disk. You can then edit this example
self-description with your information.
We currently support creation of two different version of this entity. If you want to create the latest version, you have to provide a type argument as well. Accepted type for a service-offering are mentioned below (also you can see them with passing a `-h` to export-example command):
In the current version you can create an example with calling agent:

_The ServiceOffering and it's example might change in the near future as GAIA-X team are modifying this part_

```shell
┌────────────────────────────────┬
│             type               │
├────────────────────────────────┤
│ gx_ServiceOffering             │
├────────────────────────────────┤
│ DcatDataService                │
├────────────────────────────────┤
│ DcatDataset                    │
└────────────────────────────────┴
```

The `--show` argument, displays the example self-description to your console.

```shell

gx-agent so sd example -d

output:
IMPORTANT: the values specified with '*' should be populated by you.
┌──────────────────┬────────────────────────────────────────┬────────────────────────────────────────────────┐
│             type │                                sd-file │                                            did │
├──────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────┤
│ service-offering │ service-offering-input-credential.json │ did:web:nk-gx-agent.eu.ngrok.io                │
└──────────────────┴────────────────────────────────────────┴────────────────────────────────────────────────┘
Example service-offering self-description file has been written to service-offering-input-credential.json. Please adjust the contents and use one of the onboarding methods
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "issuer": "did:web:nk-gx-agent.eu.ngrok.io",
  "id": "urn:uuid:b0aee1c5-a00f-46b4-8142-dbe60903f8b2",
  "credentialSubject": {
    "id": "https://nk-gx-agent.eu.ngrok.io",
    "type": "gx:ServiceOffering",
    "gx:providedBy": {
      "id": "did:web:nk-gx-agent.eu.ngrok.io"
    },
    "gx:policy": "",
    "gx:termsAndConditions": {
      "gx:URL": "http://termsandconds.com",
      "gx:hash": "d8402a23de560f5ab34b22d1a142feb9e13b3143"
    },
    "gx:dataAccountExport": {
      "gx:requestType": "API",
      "gx:accessType": "digital",
      "gx:formatType": "application/json"
    }
  },
  "type": "VerifiableCredential"
}

```

You now should open the file, and adjust the values with your service-offer information. Update all
the values. Make sure to save the file afterwards. If you made some mistakes, you can always re-export the example. Be
aware that it
will always overwrite the existing file!

## Submit the service-offering self-description

The next command creates a self-asserted Verifiable Credential out of the ServiceOffering self-description input file. It sends that in
as a Verifiable Presentation with previously fetched ComplianceCredential and Participant SelfDescription to the Ecosystem Compliance service as configured in your agent.yml file.

```json
{
  "type": ["VerifiablePresentation"],
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "verifiableCredential": [
    { // Your LegalParticipant self-description VerifiableCredential },
    { // Your ServiceOffering self-description  VerifiableCredential },
    { // Your LegalParticipant Compliance Credential Signed by Gaia-X Compliance service },
  ],
  "holder": "did:web:4c30-2001-1c04-2b10-ee00-e7d5-abed-7e72-9d92.ngrok-free.app",
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-06-01T08:47:10Z",
    "verificationMethod": "did:web:nk-gx-agent.eu.ngrok.io#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..h-rEB7ZPqRCh4Pb9eXK7iX4PEtwF9GdHlrrMR6JSnybVMsxnKcN5tBgqJx33dSIXyPtPSciA2rcp2d7qyQ_tr60oD2dMwu2xnYqgRL67iIkGfg8jIRpunjrZG2PQXPK61ziZvGo4HwuVztY5bwZAqtGTKRs7dWona3U7q2uGsELHojFoHIHfR_j0RPSxLWh8ek_8ZNE13aNVR9QvPwUcxEJ9OGhifhO6XVwwFUDtNtgbGqIU4mwdSC6DU2h6yUsYSK2pu7SRj7qrq4cDbp70OAuLwV8Sywg5IqxuJKKlJZq5YJy_7hgBSvr3RcqeY8BSFr7-H2QGg2n9HuWRIKuwNg"
  }
}
```

And you Ecosystem Compliance Service will send you another ComplianceCredential in response:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://registry.lab.gaia-x.eu//development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": ["VerifiableCredential"],
  "id": "https://nk-eco-compliance.eu.ngrok.io/credential-offers/67645d91-6bb5-4661-a6d1-2d36dce30172",
  "issuer": "did:web:nk-eco-compliance.eu.ngrok.io",
  "issuanceDate": "2023-05-31T14:10:01.794Z",
  "expirationDate": "2023-08-29T14:10:01.794Z",
  "credentialSubject": [
    {
      "type": "gx:compliance",
      "id": "did:web:nk-eco-compliance.eu.ngrok.io",
      "integrity": "sha256-d03feb54fedcb3ed0411f723bdd8b19e928d742a49f4c7ca109979e08ac83974"
    },
    {
      "type": "gx:compliance",
      "id": "did:web:nk-eco-compliance.eu.ngrok.io",
      "integrity": "sha256-198332fad39100e726dcc94bd1c68dfbee2db02befc12c92e35e7648b4399336"
    },
    {
      "type": "gx:compliance",
      "id": "did:web:nk-eco-compliance.eu.ngrok.io",
      "integrity": "sha256-11fb3ded1ce29b06c5ad15f2bcc8bf1eac41973e70289bf41600aeb1dffe5356"
    }
  ],
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-05-31T14:10:02.314Z",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..AbRrpo2qbgaCS6HAykU6PACi37iFxlviyu2hxrfhhjhvmz7sItIPFMQc_fj-qGyXD6Zr_LoA2aR5kFE2w4zgu0oEP8Mmudf4fTKzl-3vPNY9lfEUf9tLg_LxLzivs24C2Vz4y2--r2BkNeeXTJ7_pnlBWuDoVPNm3gcrfcT69VcLWmZpErOqhbHTmqafoklr4iGOs7ehU9TGxXS7JptGglAZ_caBVfHvIQQi1MP31mQeIJk7U_t7KohW4Y5ZQKjBL36OL2OqPprZhBEcouOGqI82fRKxAdq22AIjFkgarg9QavwLlq1F_F0qxshpR_QGBE55LV9uU6NJ877Is2sa_w",
    "verificationMethod": "did:web:nk-eco-compliance.eu.ngrok.io#JWK2020-RSA"
  }
}
```

_NOTE: you can run gx-agent vc list in any step and see your VCs in the agent. at the end of this step you should see this list containing all the necessary credentials:_

```shell
┌─────────────────────┬───────────────────────────────────────┬─────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────┐
│               types │                                issuer │                         subject │            issuance-date │                                                               id │
├─────────────────────┼───────────────────────────────────────┼─────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ gx:LegalParticipant │ did:web:nk-gx-agent.eu.ngrok.io       │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-06-08T13:08:29.888Z │ <participant sd id>                                              │
│ ServiceOffering     │ did:web:nk-gx-agent.eu.ngrok.io       │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-06-08T13:08:29.888Z │ <service offering sd id>                                         │
│          Compliance │ did:web:nk-gx-compliance.eu.ngrok.io  │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-06-08T14:10:52.037Z │ <participant compliance id from gx-compliance>                   │
│          Compliance │ did:web:nk-eco-compliance.eu.ngrok.io │ did:web:nk-gx-agent.eu.ngrok.io │ 2023-06-08T14:26:49.870Z │ <participant and service offering compliance from eco-compliance>│
└─────────────────────┴───────────────────────────────────────┴─────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────┘

```

## List service-offering self-description credentials

You can list service-offering self-descriptions known to the agent.

```shell
gx-agent so sd list
┌─────────────────────────────────┬──────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          issuer │                              subject │            issuance-data │                                                                                                                               id │
├─────────────────────────────────┼──────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ did:web:nk-gx-agent.eu.ngrok.io │ 51d15354-4570-4b44-9beb-8e78b9ab6795 │ 2023-01-26T03:35:50.574Z │ 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447 │
└─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Show a service-offering self-description credential

To show the content of a service-offering self-description credential known to the agent, you can first list all the
service-offering self-descriptions (see command above). From that output you can get the id value and use that to show
the
credential.

```shell
gx-agent so sd show 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447

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

```

## Verify a service-offering self-description

This command verifies a service-offering self-description credential. It first does a local validation of the Verifiable
Credential, including a check on the signature/proof. After that it contacts the compliance service to check whether the
compliance service provides a response that the service-offering self-description is compliant.

The optional `--show` option shows the contents of credential on the console

```shell
gx-agent so sd verify -id 98021d8c32ccf3723ecf83d712a634000ecf10875e1e9b39ece5f90606f65227959936269ad0d65ed9921b6062d9d4cd3ba2ea8d441e38f748e758c864942447

output:
Agent validation of the self-description. Valid: true
┌──────────┐
│ conforms │
├──────────┤
│     true │
└──────────┘
```

# Labels

Using this agent, you can also create all kinds of Labels as well. You can then include these labels in your Service Offerings to show a certain credential. Here is an example for a ISO VerifiableCredential:
First, you need to create a VerifiableCredential (or ask a third party to generate a VerifiableCredential for you). In order to do this with this agent, you can simply call the following command on an _unsigned credential_

```shell
gx-agent vc issue -f ./iso.json -p
```

After acquiring a Label Verifiable Credential, you can include this label into you Service Offering VerifiablePresentations. You can use this for both onboarding a Service Offering into gx-compliance and also your selected ecosystem:
For onboarding the service in the **ecosystem**:

```shell
gx-agent ecosystem so submit FMA -sid <you self-description participant vc id> -cid <your gx compliance credential id> -eid <your ecosystem compliance id> -sof ./service-offering-input-credential.json -lai <your label id(s)>
# you can also call pass the labels via the file using laf (`--label-files`) instead of `lai` parameter
```

For onboarding the service in the **gx compliance**:

```shell
gx-agent so sd submit -sof ./service-offering-input-credential.json -sid <ID of your participant self-description vc> -cid <ID of your compliance VC from Gaia-X compliance> -lai <your label id(s)>
# you can also call pass the labels via the file using laf (`--label-files`) instead of `lai` parameter
```

# Developers

## Building an executable

Make sure the CLI is build as well as it dependencies in this monorepo, eg `yarn build`
Also install the [pkg]() progam, globally, eg `yarn global add pkg`

Now create the binaries for the different platforms:

```shell
pkg ./dist/cli.js
```
