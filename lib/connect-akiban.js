/*!
 * connect-akiban
 * Copyright(c) 2013 Stephan Smith <Stephan.Smith.bc93@gmail.com>
 * Mantained by Stephan Smith <Stephan.Smith.bc93@gmail.com>
 * MIT Licensed
 */

var Store = require('connect').session.Store
  , akiban = require('akiban')
  , _collection = null
  , _defaults = {host: '127.0.0.1', port: 1000, dbname: 'dev', entity: 'sessions', reapInterval: 60 * 1000};

function _default(callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };
  return callback;
}

/**
 * Initialize AkibanStore with the given `options`.
 *
 * @param {Object} options
 * @param {Function} callback
 * @api public
 *
 */
var AKIBANSTORE = module.exports = function akibanStore(options, callback) {
  options = options || {};
  callback = _default(callback);

  var db, server_config, url, auth;

  function getCollection(db, callback) {
    db.collection(options.collection || _defaults.collection, function (err, col) {
      if (err) callback(err);
      _collection = col;
      callback();
    });
  }

  function authenticateAndGetCollection(callback) {
    if (options.username && options.password) {
      db.authenticate(options.username, options.password, function () {
        getCollection(db, callback);
      });
    } else {
      getCollection(db, callback);
    }
  }

  if (options.url) {
    url = require('url').parse(options.url);

    if (url.auth) {
      auth = url.auth.split(':', 2);
      options.username = auth[0];
      options.password = auth[1];
    }

    options.db = new akiban.Db(
      url.pathname.replace(/^\//, '')
    , new akiban.Server(url.hostname || _defaults.host, +url.port || _defaults.port)
    );
  }

  if (options.server_config) {
    server_config = options.server_config;
    db = new akiban.Db(options.dbname || _defaults.dbname, server_config);
  }

  if (options.db) {
    server_config = options.db.serverConfig;
    db = options.db;
  }

  if (!db || !server_config) {
    return callback(Error('You must provide a `db` or `server_config`!'));
  }

  Store.call(this, options);

  if (options.reapInterval !== -1) {
    var reap_interval = setInterval(function () {
      _collection.remove({expires: {'$lte': Date.now()}}, function () { });
    }, options.reapInterval || _defaults.reapInterval, this); // _defaults to each minute

    db.on('close', function () {
      clearInterval(reap_interval);
    });
  }

  if (server_config.isConnected()) {
    authenticateAndGetCollection(callback);
  } else {
    server_config.connect(db, function (err) {
      if (err) callback(Error("Error connecting (" + (err instanceof Error ? err.message : err) + ")"));
      authenticateAndGetCollection(callback);
    });
  }
};

AKIBANSTORE.prototype.__proto__ = Store.prototype;

/**
 * Attempt to fetch session by the given `sid`.
 *
 *   Old versions of this code used to store sessions in the database
 *   as a JSON string rather than as a structure.  For backwards
 *   compatibility, handle old sessions.
 *
 * @param {String} sid
 * @param {Function} cb
 * @api public
 */
AKIBANSTORE.prototype.get = function (sid, cb) {
  cb = _default(cb);
  _collection.findOne({_id: sid}, function (err, data) {
    try {
      if (data) {
        var sess = typeof data.session === 'string' ? JSON.parse(data.session)
                                                    : data.session;
        cb(null, sess);
      } else {
        cb();
      }
    } catch (exc) {
      cb(exc);
    }
  });
};


/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} cb
 * @api public
 */
AKIBANSTORE.prototype.set = function (sid, sess, cb) {
  cb = _default(cb);
  var update = {_id: sid, session: JSON.stringify(sess)};
  if (sess && sess.cookie && sess.cookie.expires) {
    update.expires = Date.parse(sess.cookie.expires);
  }

  _collection.update({_id: sid}, update, {upsert: true}, function (err, data) {
    cb.apply(this, arguments);
  });
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */
AKIBANSTORE.prototype.destroy = function (sid, cb) {
  _collection.remove({_id: sid}, _default(cb));
};

/**
 * Fetch number of sessions.
 *
 * @param {Function} cb
 * @api public
 */
AKIBANSTORE.prototype.length = function (cb) {
  _collection.count({}, _default(cb));
};

/**
 * Clear all sessions.
 *
 * @param {Function} cb
 * @api public
 */
AKIBANSTORE.prototype.clear = function (cb) {
  _collection.drop(_default(cb));
};

/**
 * Get the collection
 *
 * @param
 * @api public
 */
AKIBANSTORE.prototype.getCollection = function () {
  return _collection;
};
