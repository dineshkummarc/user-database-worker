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
    
    console.log("change")
    console.log( JSON.stringify(change, "", 2) )
    
    if(error !== null) {
      
      console.log("error")
      console.log( JSON.stringify(error, "", 2) )
      
      // todo report error
      return;
    }

    if(change.doc && change.doc.name) {
      var name;
      if(config.name_munge_function) {
        name = config.name_munge_function(change.doc.name);
      } else {
        name = change.doc.name;
      }
      
      console.log("creating database for: " + name)
      
      that._createDatabase(name);
    }
    
    if (change.deleted) {
      name = change.id.split(":").pop()
      console.log("dropping database of: " + name)
      that._dropDatabase(name);
    };
  };

  var changes = new CouchDBChanges(config);
  changes.follow("_users", change_cb, follow_options, changes_options);
}

CreateDatabaseExternal.prototype._createDatabase = function(name) {
  var urlobj = url.parse(this._config.server);
  urlobj.auth = this._config.admin.user + ":" + this._config.admin.pass;
  
  // encode "/" => "%2F"
  var db_name = name.replace(/\//g, '%2F')
  
  urlobj.pathname = "/" + db_name;
  var request_options = {
    url: url.format(urlobj),
    method: "PUT"
  };
  
  console.log("sending createDB request")
  
  request(request_options, function(error, response, response_body) {
    if(error !== null) {
      // set error in user doc
      
      console.log("error creating user db")
      console.log( JSON.stringify(error, "", 2) )
      
      return
    }
    
    urlobj.pathname += "/_security"
    var request_options = {
      url: url.format(urlobj),
      method: "PUT",
      json: {"admins":{"names":[],"roles":[]},"readers":{"names":[name],"roles":[]}}
    };
    
    console.log("sending security request")
    
    request(request_options, function(error, response, response_body) {
      if(error !== null) {
        // set error in user doc

        console.log("error setting user db security")
        console.log( JSON.stringify(error, "", 2) )

        return
      }
      
      console.log("security created")
      
    });
  });
};

CreateDatabaseExternal.prototype._dropDatabase = function(name) {
  var urlobj = url.parse(this._config.server);
  urlobj.auth = this._config.admin.user + ":" + this._config.admin.pass;
  
  // encode "/" => "%2F"
  var db_name = name.replace(/\//g, '%2F')
  
  urlobj.pathname = "/" + db_name;
  var request_options = {
    url: url.format(urlobj),
    method: "DELETE"
  };
  
  console.log("sending dropDB request")
  
  request(request_options, function(error, response, response_body) {
    if(error !== null) {
      // set error in user doc
      
      console.log("error deleting user db")
      console.log( JSON.stringify(error, "", 2) )
      
      return
    }
    
    console.log("database killed")
  });
};
