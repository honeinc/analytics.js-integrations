
/**
 * Module dependencies.
 */

var del = require('obj-case').del;
var integration = require('analytics.js-integration');

/**
 * Expose `FullStory` integration.
 *
 * https://www.fullstory.com/docs/developer
 */

var FullStory = module.exports = integration('FullStory')
  .option('org', '')
  .option('debug', false)
  .tag('<script src="https://www.fullstory.com/s/fs.js"></script>')

/**
 * Initialize.
 */

FullStory.prototype.initialize = function(){
  var self = this;
  window['_fs_debug'] = this.options.debug;
  window['_fs_host'] = 'www.fullstory.com';
  window['_fs_org'] = this.options.org;

  (function(m,n,e,t,l,o,g,y){
    g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
    g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){FS(l,v)};
    g.setSessionVars=function(v){FS('session',v)};g.setPageVars=function(v){FS('page',v)};
    self.ready();
    self.load();
  })(window,document,'FS','script','user');
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

FullStory.prototype.loaded = function(){
  return !! window.FS;
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

FullStory.prototype.identify = function(identify){
  var id = identify.userId() || identify.anonymousId();
  var traits = identify.traits();
  del(traits, "id");
  if (identify.name()) {
    traits.displayName = identify.name();
    del(traits, "name");
  }
  window.FS.identify(id, traits);
};
