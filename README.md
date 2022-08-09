# bitquery-mongo-reader
Improved UMP(User Management Protocol) reader, to be used as a refernce work for additional Bridge readers.
Please see doc/PROTOCOL.md for protocol description.

The ```.env``` variables ```DEFAULT_QUERY``` and ```DEFAULT_SOCKET``` are used to specify the query strings a user wishes to start with their query and socket UI fields. These can be edited during a session.

Strings must be in strict full JSON format and follow Bitquery layout for query strings.

The other .env variables are for internal use.

##Example ```.env``` file

```
BRIDGE='eyJpZCI6IjFINDhDM3dnMVljZ3BUN1R4NjFQSHpIOEx4NnY1dFZVS0wifQ=='
PORT=80
MONGODB_READ_CREDS='bW9uZ29kYjovL2JyaWRnZXBvcnQtbW9uZ286MzExMy9icmlkZ2VfMUg0OEMzd2cxWWNncFQ3VHg2MVBIekg4THg2djV0VlVLTA=='
MONGODB_DATABASE='bridge_1H48C3wg1YcgpT7Tx61PHzH8Lx6v5tVUKL'
DEFAULT_QUERY='{"v": 3,"q": {"collection": "users", "find": {}}}'
DEFAULT_SOCKET='{"v": 3,"q": {"collection": "users", "find": {}}}'
```
