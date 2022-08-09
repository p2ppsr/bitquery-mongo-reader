# bitquery-mongo-reader

This is a reader for use with bridges that utilizes Bitquery and MongoDB for document storage and retrieval. Reader protocol documentation can be configured with Docker volumes.

The environmental variables ```DEFAULT_QUERY``` and ```DEFAULT_SOCKET``` are used to specify the query strings a user starts with in their query and listening socket UI fields. These can be edited by the user, during the session, to create new queries or listening sockets.

Configuration of these variables, as well as the other variables required by all bridge readers (`BRIDGE`, `PORT`, etc.), can be accomplished within a `docker-compose.yml` file, or other means.

Bitqueries must be in strict full JSON format and follow the [Bitquery spec](https://master--projectbabbage.netlify.app/docs/bridgeport/reference/bitquery) (see example below).

## Example Environment

An example configuration utilizing the Bitquery Mongo Reader can be found in the [docker-compose.yml](docker-compose.yml). This example configuration is set up for the UMP bridge, proxied with Connecticut. In the example configuration, we mount an example documentation volume containing a copy of the UMP protocol document.

To spin up the example environment, use `docker compose up`.

You can then access the running bridge reader [localhost:3103/1H48C3wg1YcgpT7Tx61PHzH8Lx6v5tVUKL](localhost:3103/1H48C3wg1YcgpT7Tx61PHzH8Lx6v5tVUKL) for displaying both the Query UI and Socket UI.

## License

The license for the code in this repository is the Open BSV License.
