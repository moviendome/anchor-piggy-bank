/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/piggy_bank.json`.
 */
export type PiggyBank = {
  "address": "ZaU8j7XCKSxmmkMvg7NnjrLNK6eiLZbHsJQAc2rFzEN",
  "metadata": {
    "name": "piggyBank",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "lock",
      "discriminator": [
        21,
        19,
        208,
        43,
        237,
        62,
        255,
        87
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "dst"
        },
        {
          "name": "lock",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amt",
          "type": "u64"
        },
        {
          "name": "exp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlock",
      "discriminator": [
        101,
        155,
        40,
        21,
        158,
        189,
        56,
        203
      ],
      "accounts": [
        {
          "name": "lock",
          "writable": true
        },
        {
          "name": "dst",
          "writable": true,
          "relations": [
            "lock"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "lock",
      "discriminator": [
        8,
        255,
        36,
        202,
        210,
        22,
        57,
        137
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6001,
      "name": "invalidExpiration",
      "msg": "Expiration must be in the future"
    },
    {
      "code": 6002,
      "name": "lockNotExpired",
      "msg": "Lock has not expired yet"
    }
  ],
  "types": [
    {
      "name": "lock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dst",
            "type": "pubkey"
          },
          {
            "name": "exp",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
