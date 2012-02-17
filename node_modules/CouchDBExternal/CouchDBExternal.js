module.exports = CouchDBExternal;
function CouchDBExternal(server) {
  this._server = server;
  var stdin = process.stdin;
  stdin.resume();
  stdin.setEncoding("utf8");
  stdin.on("data", function(chunk) {
    console.warn("stdin on data: '" + chunk + "'");
  });

  stdin.on("exit", function() {
    console.warn("external create_user_database stopping…");
    process.exit(0);
  });

  console.warn("external create_user_database started…");
}
