# connect-akiban

connect-akiban is a Akiban session store.

This is a beta project designed to implement the connect middleware for session. It's based upon the code and pattern
used in the connect-mongodb and connect-couchdb projects. Once it reaches a stable, working point, I will push to 
npm and the npm install will work.

## Installation
This project is not available in the NPM registry yet. No not use.

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

## Attribution
This project is directly based upon the work of masylum and the connect-mongodb project. This is not a direct fork
because none of the code will be compatible with the base project. New datastore etc.

https://github.com/masylum/connect-mongodb