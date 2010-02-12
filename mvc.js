require.paths.unshift("./vendor");
require.paths.unshift("./vendor/ejsgi/lib");
require.paths.unshift("./vendor/node-scylla/lib");
require.paths.unshift("./vendor/node-dirty/lib");

var sys = require("sys"),
    posix = require("posix"),
    events = require("events"),
    scylla = require("scylla"),
    ejsgi = require("ejsgi"),
    Mustache = require("mustache"),
    Dirty = require("dirty").Dirty;

/* Model */

var posts = new Dirty("posts.dirty", { flushInterval: 10 });
var post  = { title: "Awesome post" };
posts.add(post);

/* Controller */

var HomeController = {
  index: function(req) {
    var promise = new events.Promise();
    
    posix.cat("./templates/index.html.mu").addCallback(function(tpl) {
      var body = Mustache.to_html(tpl, { title: posts.get(post._id).title });
    
      var res = {
        body: new req.jsgi.stream(),
        status: 200,
        headers: {
          "content-type": "text/html",
          "content-length": body.length
        }
      };
      res.body.write(body);
      res.body.close();

      promise.emitSuccess(res);
    });

    return promise;
  }
};

/* Router */

function Router() { scylla.Base.call(this); }
Router.prototype = Object.create(scylla.Base.prototype);
process.mixin(Router.prototype, { "GET /": HomeController.index });

/* Server */

ejsgi.Server(new Router().adapter("ejsgi"), "localhost", 8000).start();