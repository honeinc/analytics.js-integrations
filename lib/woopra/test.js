
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var plugin = require('./');

describe('Woopra', function(){
  var Woopra = plugin.Integration;
  var woopra;
  var analytics;
  var options = {
    domain: 'x',
    outgoingTracking: false
  };

  beforeEach(function(){
    analytics = new Analytics;
    woopra = new Woopra(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(woopra);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    woopra.reset();
  });

  it('should have the right settings', function(){
    var Test = integration('Woopra')
      .readyOnLoad()
      .global('woopra')
      .option('domain', '')
      .option('cookieName', 'wooTracker')
      .option('cookieDomain', null)
      .option('cookiePath', '/')
      .option('ping', true)
      .option('pingInterval', 12000)
      .option('idleTimeout', 300000)
      .option('downloadTracking', true)
      .option('outgoingTracking', true)
      .option('outgoingIgnoreSubdomain', true)
      .option('downloadPause', 200)
      .option('outgoingPause', 400)
      .option('ignoreQueryUrl', true)
      .option('hideCampaign', false);

    analytics.validate(Woopra, Test);
  });
  
  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(woopra, 'load');
    });

    afterEach(function(){
      woopra.reset();
    });

    describe('#initialize', function(){
      it('should create a woopra object', function(){
        analytics.assert(!window.woopra);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.woopra);
      });

      it('should configure woopra', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window.woopra._e, [
          ['config', 'domain', 'x'],
          ['config', 'outgoing_tracking', false],
          ['config', 'cookie_name', 'wooTracker'],
          ['config', 'cookie_path', '/'],
          ['config', 'ping', true],
          ['config', 'ping_interval', 12000],
          ['config', 'idle_timeout', 300000],
          ['config', 'download_tracking', true],
          ['config', 'outgoing_ignore_subdomain', true],
          ['config', 'download_pause', 200],
          ['config', 'outgoing_pause', 400],
          ['config', 'ignore_query_url', true],
          ['config', 'hide_campaign', false]
        ]);
      });

      it('should not send options if they are null, or empty', function(){
        woopra.options.domain = '';
        woopra.options.cookieName = '';
        woopra.options.cookiePath = null;
        woopra.options.ping = null;
        woopra.options.pingInterval = null;
        woopra.options.idleTimeout = null;
        woopra.options.downloadTracking = null;
        woopra.options.outgoingTracking = null;
        woopra.options.outgoingIgnoreSubdomain = null;
        woopra.options.downloadPause = '';
        woopra.options.outgoingPause = '';
        woopra.options.ignoreQueryUrl = null;
        woopra.options.hideCampaign = null;
        analytics.initialize();
        analytics.page();
        analytics.deepEqual([], window.woopra._e);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(woopra.load);
      });
    });

    describe('#loaded', function(){
      it('should test window.woopra.loaded', function(){
        window.woopra = {};
        analytics.assert(!woopra.loaded());
        window.woopra.loaded = true;
        analytics.assert(woopra.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(woopra, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.woopra, 'track');
      });

      it('should send a page view', function(){
        analytics.page();
        analytics.called(window.woopra.track, 'pv', {
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.href
        });
      });

      it('should send a title', function(){
        analytics.page(null, null, { title: 'title' });
        analytics.called(window.woopra.track, 'pv', {
          title: 'title',
          path: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
          url: window.location.href
        });
      });

      it('should prefer a name', function(){
        analytics.page(null, 'name', { title: 'title' });
        analytics.called(window.woopra.track, 'pv', {
          title: 'name',
          name: 'name',
          path: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
          url: window.location.href
        });
      });

      it('should prefer a category and name', function(){
        analytics.page('category', 'name', { title: 'title' });
        analytics.called(window.woopra.track, 'pv', {
          title: 'category name',
          category: 'category',
          name: 'name',
          path: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
          url: window.location.href
        });
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.woopra, 'identify');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.woopra.identify, { id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify(null, { trait: true });
        analytics.called(window.woopra.identify, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.woopra.identify, { id: 'id', trait: true });
      });

      it('should alias the name properly', function(){
        analytics.identify('id', {
          firstName: 'firstName',
          lastName: 'lastName'
        });
        analytics.called(window.woopra.identify, {
          name: 'firstName lastName',
          firstName: 'firstName',
          lastName: 'lastName',
          id: 'id'
        });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.woopra, 'track');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.woopra.track, 'event');
      });

      it('should send properties', function(){
        analytics.track('event', { property: 'Property' });
        analytics.called(window.woopra.track, 'event', { property: 'Property' });
      });
    });
  });
});