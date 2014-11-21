
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var localstorage = require('store');
var protocol = require('protocol');
var utm = require('utm-params');
var ads = require('ad-params');
var send = require('send-json');
var cookie = require('cookie');
var clone = require('clone');
var uuid = require('uuid');
var top = require('top-domain');
var extend = require('extend');
var json = require('segmentio/json@1.0.0');

/**
 * Cookie options
 */

var options = {
  maxage: 31536000000, // 1y
  secure: false,
  path: '/'
};

/**
 * Expose `Hone` integration.
 */

var Hone = exports = module.exports = integration('Hone')
  .option('apiKey', '');

function noop ( ) { }

/**
 * Get the store.
 *
 * @return {Function}
 */

exports.storage = function(){
  return cookie;
};

/**
 * Expose global for testing.
 */

exports.global = window;

/**
 * Initialize.
 *
 * https://github.com/segmentio/segmentio/blob/master/modules/segmentjs/segment.js/v1/segment.js
 *
 * @param {Object} page
 */

Hone.prototype.initialize = function(page){
  var self = this;
  this.ready();
  this.analytics.on('invoke', function(msg){
    var action = msg.action();
    var listener = 'on' + msg.action();
    self.debug('%s %o', action, msg);
    if (self[listener]) self[listener](msg);
    self.ready();
  });
};

/**
 * Loaded.
 *
 * @return {Boolean}
 */

Hone.prototype.loaded = function(){
  return true;
};

/**
 * Page.
 *
 * @param {Page} page
 */

Hone.prototype.onpage = function(page){
  this.send('/Events.json', page.json());
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Hone.prototype.onidentify = noop;

/**
 * Group.
 *
 * @param {Group} group
 */

Hone.prototype.ongroup = noop;

/**
 * Track.
 *
 * @param {Track} track
 */

Hone.prototype.ontrack = function(track){
  this.send('/Events.json', track.json() );
};

/**
 * Alias.
 *
 * @param {Alias} alias
 */

Hone.prototype.onalias = noop;

/**
 * Send `obj` to `path`.
 *
 * @param {String} path
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

Hone.prototype.send = function(path, msg, fn){
  var url = '/api/1.0/' + path; // this should be local
  var headers = { 'Content-Type': 'application/json' };
  var fn = fn || noop;
  var self = this;

  // send
  send(url, msg, headers, function(err, res){
    self.debug('sent %O, received %O', msg, arguments);
    if (err) return fn(err);
    res.url = url;
    fn(null, res);
  });
};

/**
 * Gets/sets cookies on the appropriate domain.
 *
 * @param {String} name
 * @param {Mixed} val
 */

Hone.prototype.cookie = function(name, val){
  var store = Hone.storage();
  if (arguments.length === 1) return store(name);
  var global = exports.global;
  var href = global.location.href;
  var domain = '.' + top(href);
  if ('.' == domain) domain = '';
  this.debug('store domain %s -> %s', href, domain);
  var opts = clone(options);
  opts.domain = domain;
  this.debug('store %s, %s, %o', name, val, opts);
  store(name, val, opts);
  if (store(name)) return;
  delete opts.domain;
  this.debug('fallback store %s, %s, %o', name, val, opts);
  store(name, val, opts);
};

/**
 * Add referrerId to context.
 *
 * TODO: remove.
 *
 * @param {Object} query
 * @param {Object} ctx
 * @api private
 */

Hone.prototype.referrerId = function(query, ctx){
  var stored = this.cookie('s:context.referrer');
  var ad;

  if (stored) stored = json.parse(stored);
  if (query) ad = ads(query);

  ad = ad || stored;

  if (!ad) return;
  ctx.referrer = extend(ctx.referrer || {}, ad);
  this.cookie('s:context.referrer', json.stringify(ad));
}

/**
 * Get the scheme.
 *
 * The function returns `http:`
 * if the protocol is `http:` and
 * `https:` for other protocols.
 *
 * @return {String}
 */

function scheme(){
  return 'http:' == protocol()
    ? 'http:'
    : 'https:';
}

/**
 * Noop
 */

function noop(){}