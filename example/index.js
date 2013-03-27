var util        = require('util')
  , http        = require('http')
  , connect     = require('connect')
  , akibanStore = require('../lib/connect-akiban')
  , Db          = require('../lib/akiban-server').Db
  , Server      = require('../lib/akiban-server').Server
  , server_config = new Server('localhost', 1000, { auto_reconnect: true })
  , db            = new Db('test', server_config, {})
  , akiban_store = new akibanStore({ db: db, reapInterval: 3000 });

http.IncomingMessage.prototype.flash = function (type, msg) {

  var msgs = this.session.flash = this.session.flash || {};
  if (type && msg) {
    (msgs[type] = msgs[type] || []).push(msg);
  } else if (type) {
    var arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    this.session.flash = {};
    return msgs;
  }

};

connect.createServer(

  connect.favicon(),
  connect.bodyParser(),
  connect.cookieParser(),

  // reap every 6 seconds, 6 seconds maxAge
  connect.session({
   cookie: {maxAge: 6000}, 
   store: akiban_store, 
   secret: 'HarrisonAve'
  }),

  // Increment views
  function (req, res) {
    req.session.count = req.session.count || 0
    ++req.session.count;

    // Display online count
    req.sessionStore.length(function(err, len){
      if (req.session.count < 10) {
        var msgs = req.flash('info').join('\n');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(msgs);
        res.write('<form method="post"><input type="hidden" name="foo" value="bar" /><input type="submit" value="POST request!" /></form>');
        res.write('<p>online : ' + len + '</p>');
        res.end('<p>views: ' + req.session.count + '</p>');
      } else {
        // regenerate session after 10 views
        req.session.regenerate(function(){
          req.flash('info', 'sess key is now <strong>' + req.sessionID + '</strong>');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('regenerated session');
        });
      }
    });
  }
).listen(3000);

util.puts('Connect Server started on port 3000');
