var CouchDBExternal = require("CouchDBExternal");
var CouchDBChanges = require("CouchDBChanges");

var request = require("request");
var util = require("util");
var url = require("url");

module.exports = CreateDatabaseExternal;
util.inherits(CreateDatabaseExternal, CouchDBExternal);

function CreateDatabaseExternal(config) {
  CouchDBExternal.call(this, config.server);
  this._config = config;

  var follow_options = {
    persistent_since: true,
    persistent_since_storage: config.persistent_since_storage || "/tmp"
  };

  var changes_options = {
    include_docs: true
  };

  var that = this;
  var change_cb = function(error, change) {
    if(error !== null) {
      // todo report error
      return;
    }

    if(change.doc && change.doc.name) {
      that._createDatabase(change.doc.name);
    }
  };

  var changes = new CouchDBChanges(config.server);
  changes.follow("_users", change_cb, follow_options, changes_options);
}

CreateDatabaseExternal.prototype._createDatabase = function(name) {
  var urlobj = url.parse(this._config.server);
  urlobj.auth = this._config.admin.user + ":" + this._config.admin.pass;
  urlobj.pathname = name;
  var request_options = {
    url: url.format(urlobj),
    method: "PUT"
  };
  request(request_options, function(error, response, response_body) {
    if(error !== null) {
      // set error in user doc
    }
  });
};
