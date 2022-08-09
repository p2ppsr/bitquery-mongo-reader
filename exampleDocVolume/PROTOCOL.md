# User Management Protocol

- [Query](./query)
- [Socket](./socket)

The User Management Protocol gives Bitcoin users a way to store and access their data with a user account maintained on the 
blockchain. It gives them the power to control access to information encrypted with their keys, leveraging the properties of a 
permissioned and private infrastructure to grant or deny access for specific types of data.

## Goals

- **Permissionless Management.** Users, not gatekeepers, should be the ones who control accounts.
- **Fixed.** Users should have one set of keys that will always belong to them.
- **Robust.** Even if a user loses access to one of their authentication factors, they should still be able to get back into their account.
- **Permissioned Access.** Users should be able to grant access to a portion of their data without giving access to all data.
- **Private.** It should not be possible for third parties to know which access has been granted to which data.

## Protocol

There are two trees of keys. Each tree uses [Sendover](https://github.com/p2ppsr/sendover).

Security Level  | Tree Name
----------------|----------------
Normal Security | Primary Keys
High Security   | Privileged Keys

The symmetric BIP32 keys cannot not use public derivation. The 256 private key bits are used directly in AES, or similar.
Each protocol that interacts with users should pick a protocol ID used for storing and encrypting data. We reserve several [admin protocols](https://projectbabbage.com/docs/babbage-sdk/reference/admin-protocols) for our internal use.

## Redundancy

The user's keys are fixed. They don't change and should be considered reliable. However, since users aren't able to reliably retain access to an authentication factor (password, phone number, email address, recovery phrase etc.), there needs to be multiple ways for the user to access their data by combining multiple authentication factors until they meet an unlocking threshold. They can then decrypt their keys and obtain access.

## Blockchain Data Protocol

Any **Bitcoin SV** transaction where an output script pushes the below fields onto the stack publishes a valid user account descriptor, provided that the output contains at least 1 satoshi, the issuance ID refers to a UTXO being redeemed by this transaction, and the field 16 signature is valid.

If the UTXO defined by this output script ever becomes spent, the spending transaction must itself include a new output following this protocol, whose issuance ID points to the old UTXO, and whose rendition ID is properly incremented. Using this mechanism, the state of the User token can be updated. If these rules are not proplerly followed, the user token is to be considered revoked and no longer valid.

PUSHDATA | Field
---------|---------------------------------
0        | `<pubkey>`
1        | `OP_CHECKSIG`
2        | Bitcom Protocol Namespace Address (\`14HpZFLijstRS8H1P7b6NdMeCyH6HjeBXF\`)
3        | Issuance ID, 32-byte TXID + 4-byte Vout (must be an outpoint being spent by **this** transaction, it doesn't matter which one)
4        | Rendition ID (starts at 1, increments by 1 with every update)
5        | Primary Key encrypted with the XOR of the password key and the presentation key
6        | Primary Key encrypted with the XOR of the password key and the recovery key
7        | Primary Key encrypted with the XOR of the presentation key and the recovery key
8        | Privileged Key encrypted with the XOR of the password key and the primary key
9        | Privileged Key encrypted with the XOR of the presentation key and the recovery key
10       | The SHA-256 hash of the current presentation key
11       | 32-byte password salt for use in PBKDF2
12       | The SHA-256 hash of the current recovery key
13       | Current presentation key encrypted with the Privileged Key
14       | Current recovery key encrypted with the Privileged Key
15       | Current password key encrypted with the Privileged Key
16       | A signature from the field 0 public key over fields 2-15
...      | `OP_DROP` / `OP_2DROP` — Drop fields 2-16 from the stack.

## Cryptographic Conventions

### The Password Key

103300 rounds of PBKDF2 are used with the password salt when deriving a key from the password. The resulting key must be 256 bits.

### The Recovery Key

The recovery key must be a 256 bit value. Its format when shown to the user is beyond the scope of this specification. No key stretching is used. Note that the hash of this key is made public in the account descriptor to help a user find their account with only a recovery key and a password.

### The Presentation Key

The presentation key must be a 256 bit value. Generally, there isn't a need to show it to the user. No key stretching is used. Note that the hash of this key is made public in the account descriptor to help a user find their account with only a presentation key and a password.

## Updating the Account Descriptor

When the user changes any of their authentication factors, they sometimes need to update or revise their account descriptor. This is achieved by spending forward the User token while retaining various fields from the original Push Drop script. While the authentication factors can change, updated account descriptors must keep the same primary and privileged root keys as the original.

Changes to the root keys of users are not yet covered by this specification. In the future, as the system grows, people will want to revoke compromised identities and associated keys. Currently, this is only possible by the use of the Authrite certificate revocation process, and this depends on identity certifiers.
