var sys = require('sys'), http = require('http'), posix = require('posix');
require('./vendor/underscore');
var Mustache = require('./vendor/mustache');

var actions = [];

actions.push({
  path: "/",
  template: "simple.html.mu",
  view: {
    title: "Joe",
    calc: function() { return 2 + 4; }
  }
});

http.createServer(function (req, res) {
  req.addListener('complete', function() {
    var action = _(actions).chain().select(function(a) { return req.url == a.path }).first().value();
    
    if (_.isEmpty(action)) {
      res.sendHeader(404, {'Content-Type': 'text/plain'});
      res.sendBody("Error");
      res.finish();
    } else {
      posix.cat("./templates/" + action.template).addCallback(function(template) {
        res.sendHeader(200, {'Content-Type': 'text/html'});
        res.sendBody(Mustache.to_html(template, action.view));
        res.finish();
      });
    }
  });
}).listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');