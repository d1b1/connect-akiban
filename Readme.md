# Very BETA

Lately I'm really busy working at Teambox and I have no time (nor motivation) to maintain this module anymore.
Please let me know if anyone would be interested to maintain that module!

# connect-akiban

connect-akiban is a Akiban session store.

## Version 1.*

This is an initial fork of the connect-mongodb project. At this time there is not akiban node implementation. To make this follow
the connect middleware pattern a separate akiban db server project is needed.

## Installation

via npm:

    $ npm install connect-akiban

## Options

To start `connect-akiban`, you have to pass instances of select akiban classes, thus permitting the usage of existing 
connections or server configurations. The assumption is that the node application will use the same connection for both
the datastore and the session management.

Using an existing connection:

  * `db` Existing connection/database reference

Or with a server configuration:

  * `server_config` Existing server configuration

Other options:

  * `entity` MongoDB collection to host sessions. _'sessions' by default_
  * `reapInterval` ms to check expired sessions to remove on db
  * `username` To authenticate your db connection
  * `password` To authenticate your db connection

## Example

You have a complete example on `example/index.js`.

    var connect = require('connect')
      , Db = require('akiban').Db
      , Server = require('akiban').Server
      , server_config = new Server('localhost', 1000, { auto_reconnect: true, protocal: rest })
      , db = new Db('test', server_config, {})
      , akibanStore = require('connect-akiban');

    connect.createServer(
      connect.bodyParser(),
      connect.cookieParser(),
      connect.session({
        cookie: {maxAge: 60000 * 20} // 20 minutes
      , secret: 'foo'
      , store: new akibanStore({db: db})
      })
    );

