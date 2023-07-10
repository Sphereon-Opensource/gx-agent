$ gx-dev did create --private-key-file /home/sadjad/Downloads/private-key.pem --cert-file /home/sadjad/Downloads/cert.pem --ca-chain-file /home/sadjad/Downloads/fullchain.pem -d 164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app
┌──────────┬─────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┐
│ provider │                                                                 DID │                                                               alias │
├──────────┼─────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│  did:web │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │
└──────────┴─────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┘

$ gx-dev did export
┌─────────────────────────────────────────────────────────────────────┬───────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                 DID │          file │                                                                                             path │
├─────────────────────────────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │      did.json │      ./exported/164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/.well-known/did.json │
│ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ fullchain.pem │ ./exported/164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/.well-known/fullchain.pem │
└─────────────────────────────────────────────────────────────────────┴───────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┘
Well-known DID files have been exported.
Please copy everything from exported/164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app, to your webserver. Do not forget to include the hidden .well-known directory!

$ sudo cp -f exported/164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/.well-known/* /var/www/gci/.well-known/

$ gx-dev participant sd submit -sif ./participant.json --show
{
  "id": "urn:uuid:0646c9c1-1aeb-47a8-ae50-964f4f4a2c49",
  "type": [
    "VerifiablePresentation"
  ],
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "id": "urn:uuid:554db947-e001-431c-ae55-22a781e1f928",
      "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
      "issuanceDate": "2023-05-29T18:03:00.887Z",
      "credentialSubject": {
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
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
        "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fqGrFQqR2LrwQ3j2IC5QPZAHsTNIcfDDe8AjgGOzvY5yOKCj4VDE0rSpb70dQIwoGKJEDEQFUQnEXXlKDZSD79EmSDdJJTpTJJ4xlAS8kXHc6jEgq0gYKkKY7eTUQUhuHrCGFEJ-I-KTJLut3czcdzsRsBITqDbazrEoFOvgKv_C6XzOYIMWxxcczRtGFkKm8c-lIHayABnfHV9ES6PsfwNBuGC5HcsCY0lUZ9h4PMMYC60p-sspCxKLzpILfpcGLV-D73JGrvLycdW7zYNW_M5IQ0gOhaebw_oNSfSdaX08QZ9fAQhXLg3QzX4qIvLzsQVVmn1XFbXdiye574x89w"
      }
    }
  ],
  "holder": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-05-29T16:11:18Z",
    "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ajIrnlKpK8e6OK6Sdno5FO1Ui0tO8Kv2vE8n-fmTuWr4EXoz-kclg8PgWOtps660hYdoFNk9CyXgbyzZKZop6rRtT176N8FbyMXj7ZhrVVNmw1laNAzof3R09_DHDBpS-6IERIAd1UnOXu3srny8162OFUcy0sJZ6qmOQvkDhmOB9R1dtj7nZ_IOI2Ty2D2BDLGysmOuiWBWigq1E9LvEY2bRNVvqpn6zFXMyf8C6IosojmfeZtNQPrGTQyrnfVH5FGfRszYxZObM4VK-mJhqffB8fy4YZQ_i8_YEqGCtlLvnjGHO8Eq4tnhLRnMVzj_F8L7iKCQ9UZ6TUaGWpzDdA"
  }
}
┌──────────────────────┬─────────────────────────────────────────────────────────────────────┬─────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                 type │                                                              issuer │ subject │            issuance-date │                                                                                                                               id │
├──────────────────────┼─────────────────────────────────────────────────────────────────────┼─────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ VerifiableCredential │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │         │ 2023-05-29T16:11:20.751Z │ def4eee90d7941c16f59f01abfbfa5d327e20f2c8d0542e2aaa1c6b7b07ff1d48c1ac8a486ae2777dca56e5b5ff5dcd6ec8060311dda9daf95b26af9ef03646b │
└──────────────────────┴─────────────────────────────────────────────────────────────────────┴─────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
{
  "verifiableCredential": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://registry.lab.gaia-x.eu//development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ],
    "type": [
      "VerifiableCredential"
    ],
    "id": "https://164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/credential-offers/fdbda79b-1762-48d6-86d7-b733df86c6d0",
    "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
    "issuanceDate": "2023-05-29T16:11:20.751Z",
    "expirationDate": "2023-08-27T16:11:20.751Z",
    "credentialSubject": [
      {
        "type": "gx:compliance",
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "integrity": "sha256-5499025b7129f5be6d703dd996dcd104b496752b1009d37203a061303534cf07"
      }
    ],
    "proof": {
      "type": "JsonWebSignature2020",
      "created": "2023-05-29T16:11:21.308Z",
      "proofPurpose": "assertionMethod",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..EzXGJ24dY-y9MVFwxRsIFRpRuNvIyUVQ_PJ160W-QvOVK5xNddqMfjhdir4CQa-sRrzLK6gPigVTLMguSImjMcrcAVW6i-SODzOQU3GWVVPoT_HcTw-KGaYErdfDx4y79Pk_F1u4rQquul3cpfJENlqrsolyBrUQ4RsS53Jq6AiNUJyuoC0FqG6sRbREQT5hCYblvu16UyOBc_tnVPuIM9-F0jQhgY3jwKdBIfbYUF-PvfZRRQP2Pml1KNFFHVcbRZ9oeG9I4It3muY3FeBRtWwYeq7Ok_ZLwFnoLjKvKM0QarQbI6RIdi2iTYwS24oKxyjfzv9MLtU_db8l1Sp16g",
      "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA"
    }
  },
  "hash": "def4eee90d7941c16f59f01abfbfa5d327e20f2c8d0542e2aaa1c6b7b07ff1d48c1ac8a486ae2777dca56e5b5ff5dcd6ec8060311dda9daf95b26af9ef03646b"
}

$ gx-dev vc list
┌──────────────────┬─────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│            types │                                                              issuer │                                                             subject │            issuance-date │                                                                                                                               id │
├──────────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│       Compliance │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │                                                                     │ 2023-05-29T16:11:20.751Z │ def4eee90d7941c16f59f01abfbfa5d327e20f2c8d0542e2aaa1c6b7b07ff1d48c1ac8a486ae2777dca56e5b5ff5dcd6ec8060311dda9daf95b26af9ef03646b │
│ LegalParticipant │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ 2023-05-29T18:03:00.887Z │ 65a3d15188f00c5a3af21411c40d5cc50e8b0d65b0be018d958cc3b24524f99717bb6aeeb865e9b6fc803aad9d741ea491fba29066ffcc72da06085d9202f503 │
└──────────────────┴─────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

$ gx-dev ecosystem so exsub FMA -sid b70ec6c72865aea28dca1e50590a3887a00c104b48ebe6bceeaac82bcbc4cae1d178f144c6516a0ed69a647bc004ca6d40a24d9061e803500c6849ee5605f474 -cid 93af338744bcd531628d8655cf7bb36f66a3714cb5b07f7d01268a78a8a8bd042b829051b5ad7bb0d446a690041008b232764186726938f953d3a93cb791d1de -sof ./so.json --show
┌──────────────────────┬─────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────┐
│                types │                                                              issuer │                                                             subject │            issuance-date │                                                                                                                               id │ persisted │
├──────────────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┤
│ VerifiableCredential │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app │ 2023-05-29T18:25:13.934Z │ 0e2d6d1d178db4475f2dc4a1346445160fe90bb5644c147d07413d89aba9e70e917ed77c380f85ed5e792275d4c7f8ee0a1379175baa3d48b39fdffd4b186a05 │      true │
└──────────────────────┴─────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────┘
serviceOffering VP: {
  "verifiablePresentation": {
    "id": "urn:uuid:663b5cfd-0f3c-422c-af06-930c4b7dffb5",
    "type": [
      "VerifiablePresentation"
    ],
    "@context": [
      "https://www.w3.org/2018/credentials/v1"
    ],
    "verifiableCredential": [
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": [
          "VerifiableCredential"
        ],
        "id": "https://gaia-x.eu/.well-known/service1.json",
        "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "issuanceDate": "2023-05-29T18:25:13.934Z",
        "credentialSubject": {
          "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
          "type": "gx:ServiceOffering",
          "gx:providedBy": {
            "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app"
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
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-05-29T16:41:27Z",
          "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
          "proofPurpose": "assertionMethod",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mxbytXXVBjB1Ic0zgPq9MeG1Ir7RR53j7d_y5axjQEUqJyoflVP4ZLR636nahy1OtBbKJYfeLnklqw998hKHgxf0aOa1ZLUAt8crH60R_oDJ2Xd-hLMqgKaWlFqYYt3yy0sNMCEwNLkV_fZ--cmR6Se0DUM_Gvlzu2UTH20LKpxyGeIhLkP7SrLDtljqA79xUZJXiaXUnd2SGu7fwy96DrRU4jqh_Zwz6Y_4OxGHWNmxBzY1lzEjb9Q2gYW_5_7-X7L6xJuN54-UG0YzqJTHFakP_R8K3bmPSNnSkKOqFsdynj_7pNCzIGKn4UhO4F2nIki6Ul0eKBwNQX4cFTwofQ"
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://registry.lab.gaia-x.eu//development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": [
          "VerifiableCredential"
        ],
        "id": "https://164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/credential-offers/f6888e32-e2d0-4271-b347-cf25aa0547a4",
        "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "issuanceDate": "2023-05-29T16:23:22.381Z",
        "expirationDate": "2023-08-27T16:23:22.381Z",
        "credentialSubject": [
          {
            "type": "gx:compliance",
            "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
            "integrity": "sha256-5499025b7129f5be6d703dd996dcd104b496752b1009d37203a061303534cf07"
          }
        ],
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-05-29T16:23:23.023Z",
          "proofPurpose": "assertionMethod",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..k7b91HkES_rns90MbFJHng8lSiiSslAQaHcSgiOLDIW-02bPt9vz4dX-_UvaZHuUEMYZR-SFV3K1KQsvvCm4sTYiugDbnVjJk_6uctf5ALCw_OyU_RRXlImQf3rnJn-P8wPBZlHoGHxS8cFArbJBBZuRuDcTVrJ7I_hNt5anIv3acXaUwRdGSceb9akdW8uCCQhTGr1eL1GhUSCiDyS-_1YCNzA66VuK40cjH_AB2KerQ7g-igscpKaOd044TFHkBaYiITRU-t5pmRvLobWpH-zVmJoVgEMnHcruIXnTV4DWWkiWsviUOoDy2fRPr6M6uWUPTFF8Fb17wmKK1wJ0bw",
          "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA"
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": [
          "VerifiableCredential"
        ],
        "id": "urn:uuid:554db947-e001-431c-ae55-22a781e1f928",
        "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "issuanceDate": "2023-05-29T18:03:00.887Z",
        "credentialSubject": {
          "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
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
          "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
          "proofPurpose": "assertionMethod",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fqGrFQqR2LrwQ3j2IC5QPZAHsTNIcfDDe8AjgGOzvY5yOKCj4VDE0rSpb70dQIwoGKJEDEQFUQnEXXlKDZSD79EmSDdJJTpTJJ4xlAS8kXHc6jEgq0gYKkKY7eTUQUhuHrCGFEJ-I-KTJLut3czcdzsRsBITqDbazrEoFOvgKv_C6XzOYIMWxxcczRtGFkKm8c-lIHayABnfHV9ES6PsfwNBuGC5HcsCY0lUZ9h4PMMYC60p-sspCxKLzpILfpcGLV-D73JGrvLycdW7zYNW_M5IQ0gOhaebw_oNSfSdaX08QZ9fAQhXLg3QzX4qIvLzsQVVmn1XFbXdiye574x89w"
        }
      }
    ],
    "holder": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
    "proof": {
      "type": "JsonWebSignature2020",
      "created": "2023-05-29T16:41:28Z",
      "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
      "proofPurpose": "assertionMethod",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XJfE3snB8O42kPs8JlO2lHnLddg-sCCrhy47FWjCh8W36LZobfwq-WMbA4WAM-XgAAd-Ih6HRPEULA09bw5y_th1aYFYmk9m6rpPh4qFu4GgSBxOtPE5upx_VHy1P7Zt4zFTHhCJ-jhAJhqKt237qm3vf983z2t_g9cHvZg-_Mmpr5eHUxRH3wcw96KeEN66myaWN50D1rcNNZulKf0oh3f0lXnT2IvCwi_5nOD6x8AEAPhJZRGdKtPS2NHmx6XNVqYZ9_wjmJr-d7X13a4gSPPCkXhyZuK1fCN0677tb7Rv6uC_5HXrymOOxNY8pUSjXjAWXQnDc2MxgXGs4vlcog"
    }
  },
  "hash": ""
}
{
  "id": "urn:uuid:663b5cfd-0f3c-422c-af06-930c4b7dffb5",
  "type": [
    "VerifiablePresentation"
  ],
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "id": "https://gaia-x.eu/.well-known/service1.json",
      "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
      "issuanceDate": "2023-05-29T18:25:13.934Z",
      "credentialSubject": {
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "type": "gx:ServiceOffering",
        "gx:providedBy": {
          "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app"
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
      "proof": {
        "type": "JsonWebSignature2020",
        "created": "2023-05-29T16:41:27Z",
        "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mxbytXXVBjB1Ic0zgPq9MeG1Ir7RR53j7d_y5axjQEUqJyoflVP4ZLR636nahy1OtBbKJYfeLnklqw998hKHgxf0aOa1ZLUAt8crH60R_oDJ2Xd-hLMqgKaWlFqYYt3yy0sNMCEwNLkV_fZ--cmR6Se0DUM_Gvlzu2UTH20LKpxyGeIhLkP7SrLDtljqA79xUZJXiaXUnd2SGu7fwy96DrRU4jqh_Zwz6Y_4OxGHWNmxBzY1lzEjb9Q2gYW_5_7-X7L6xJuN54-UG0YzqJTHFakP_R8K3bmPSNnSkKOqFsdynj_7pNCzIGKn4UhO4F2nIki6Ul0eKBwNQX4cFTwofQ"
      }
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://registry.lab.gaia-x.eu//development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "id": "https://164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/credential-offers/f6888e32-e2d0-4271-b347-cf25aa0547a4",
      "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
      "issuanceDate": "2023-05-29T16:23:22.381Z",
      "expirationDate": "2023-08-27T16:23:22.381Z",
      "credentialSubject": [
        {
          "type": "gx:compliance",
          "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
          "integrity": "sha256-5499025b7129f5be6d703dd996dcd104b496752b1009d37203a061303534cf07"
        }
      ],
      "proof": {
        "type": "JsonWebSignature2020",
        "created": "2023-05-29T16:23:23.023Z",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..k7b91HkES_rns90MbFJHng8lSiiSslAQaHcSgiOLDIW-02bPt9vz4dX-_UvaZHuUEMYZR-SFV3K1KQsvvCm4sTYiugDbnVjJk_6uctf5ALCw_OyU_RRXlImQf3rnJn-P8wPBZlHoGHxS8cFArbJBBZuRuDcTVrJ7I_hNt5anIv3acXaUwRdGSceb9akdW8uCCQhTGr1eL1GhUSCiDyS-_1YCNzA66VuK40cjH_AB2KerQ7g-igscpKaOd044TFHkBaYiITRU-t5pmRvLobWpH-zVmJoVgEMnHcruIXnTV4DWWkiWsviUOoDy2fRPr6M6uWUPTFF8Fb17wmKK1wJ0bw",
        "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA"
      }
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "id": "urn:uuid:554db947-e001-431c-ae55-22a781e1f928",
      "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
      "issuanceDate": "2023-05-29T18:03:00.887Z",
      "credentialSubject": {
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
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
        "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..fqGrFQqR2LrwQ3j2IC5QPZAHsTNIcfDDe8AjgGOzvY5yOKCj4VDE0rSpb70dQIwoGKJEDEQFUQnEXXlKDZSD79EmSDdJJTpTJJ4xlAS8kXHc6jEgq0gYKkKY7eTUQUhuHrCGFEJ-I-KTJLut3czcdzsRsBITqDbazrEoFOvgKv_C6XzOYIMWxxcczRtGFkKm8c-lIHayABnfHV9ES6PsfwNBuGC5HcsCY0lUZ9h4PMMYC60p-sspCxKLzpILfpcGLV-D73JGrvLycdW7zYNW_M5IQ0gOhaebw_oNSfSdaX08QZ9fAQhXLg3QzX4qIvLzsQVVmn1XFbXdiye574x89w"
      }
    }
  ],
  "holder": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-05-29T16:41:28Z",
    "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XJfE3snB8O42kPs8JlO2lHnLddg-sCCrhy47FWjCh8W36LZobfwq-WMbA4WAM-XgAAd-Ih6HRPEULA09bw5y_th1aYFYmk9m6rpPh4qFu4GgSBxOtPE5upx_VHy1P7Zt4zFTHhCJ-jhAJhqKt237qm3vf983z2t_g9cHvZg-_Mmpr5eHUxRH3wcw96KeEN66myaWN50D1rcNNZulKf0oh3f0lXnT2IvCwi_5nOD6x8AEAPhJZRGdKtPS2NHmx6XNVqYZ9_wjmJr-d7X13a4gSPPCkXhyZuK1fCN0677tb7Rv6uC_5HXrymOOxNY8pUSjXjAWXQnDc2MxgXGs4vlcog"
  }
}
url: http://localhost:3000/api/eco/credential-offers
VerifiableCredential ServiceOffering Compliance response: {
  "verifiableCredential": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://registry.lab.gaia-x.eu//development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ],
    "type": [
      "VerifiableCredential"
    ],
    "id": "https://164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app/credential-offers/9d3fff80-77aa-4fb2-bb89-e3087dad6e8d",
    "issuer": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
    "issuanceDate": "2023-05-29T16:41:31.249Z",
    "expirationDate": "2023-08-27T16:41:31.249Z",
    "credentialSubject": [
      {
        "type": "gx:compliance",
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "integrity": "sha256-63654ebabb07e0b7e3cb35cb5541ab23694902d605f1074710529232c34cb40b"
      },
      {
        "type": "gx:compliance",
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "integrity": "sha256-50f03169e6bd5995bddf50291b64e46e82dac34e44144dc0b936475d36852d9e"
      },
      {
        "type": "gx:compliance",
        "id": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app",
        "integrity": "sha256-5499025b7129f5be6d703dd996dcd104b496752b1009d37203a061303534cf07"
      }
    ],
    "proof": {
      "type": "JsonWebSignature2020",
      "created": "2023-05-29T16:41:31.790Z",
      "proofPurpose": "assertionMethod",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..aALKm_ZcN_yKAdd0Q6wPXKWKCSmsILsavTBswzkndRWOZVPMjOFu9gs7Tr_tCsiuy_ssZt7YmkPtyzoxbKk79WfWoWD8WJe1wWmjeS3Tbb6nfvkCDlm36yfZ18yXL-YPz7NFdbyKi3a5MKhzuxiXQf20mkHXOiMywgeO15K_YtKXA_74E17tJEyC3binyLDifzo6AnRSmAfGkmZEW3393d1KKtgcN9dHav0i4hOOH5DwCpNbFhz0hRxxt2OZCRBUWSnUQoD7_F_nMsX4kOMYPzQRG4wFRvfriOU38EIpX6XaxzyCj1Jehd8ra3WdMYJPVlEBDKoDc4OrBSGGQ34tXw",
      "verificationMethod": "did:web:164e-2001-1c04-2b10-ee00-e375-2d7a-ffc3-9904.ngrok-free.app#JWK2020-RSA"
    }
  },
  "hash": "0ea1240b5ddf87971da1cbc470747c17a0b291c80da4623651a47a2fa64cf98c89f8205ce3b7751b8ad7e174b21fc0a0990101d32e96a4742ee7bde0ea5606ba"
}