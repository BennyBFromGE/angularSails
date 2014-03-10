/**
 * angular-socket-io v0.4.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */


'use strict';


describe('sailsSocketFactory:', function () {

  beforeEach(module('angularSails.io'));

  var sailsSocket,
      scope,
      $timeout,
      $browser,
      mockIoSocket,
      sailsSocketFactory,
      spy;

  beforeEach(inject(function (_sailsSocketFactory_, _$browser_, $rootScope, _$timeout_) {

    sailsSocketFactory = _sailsSocketFactory_;
    $browser = _$browser_;
    $timeout = _$timeout_;
    scope = $rootScope.$new();
    spy = jasmine.createSpy('emitSpy');
    mockIoSocket = io.connect();
    sailsSocket = sailsSocketFactory({
      ioSocket: mockIoSocket,
      scope: scope
    });
  }));


  describe('socket.on(ev,callback)', function () {

    it('should apply asynchronously', function () {
      sailsSocket.on('event', spy);

      mockIoSocket.emit('event');

      expect(spy).not.toHaveBeenCalled();
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

  });


  describe('#emit', function () {

    it('should call the delegate socket\'s emit', function () {
      spyOn(mockIoSocket, 'emit');

      sailsSocket.emit('event', {foo: 'bar'});

      expect(mockIoSocket.emit).toHaveBeenCalled();
    });

  });


  describe('#removeListener', function () {

    it('should not call after removing an event', function () {
      sailsSocket.on('event', spy);
      sailsSocket.removeListener('event', spy);

      mockIoSocket.emit('event');

      expect($browser.deferredFns.length).toBe(0);
    });

  });


  describe('#forward', function () {

    it('should forward events', function () {
      sailsSocket.forward('event');

      scope.$on('sails:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

    it('should forward an array of events', function () {
      sailsSocket.forward(['e1', 'e2']);

      scope.$on('sails:e1', spy);
      scope.$on('sails:e2', spy);

      mockIoSocket.emit('e1');
      mockIoSocket.emit('e2');
      $timeout.flush();
      expect(spy.callCount).toBe(2);
    });

    it('should remove watchers when the scope is removed', function () {

      sailsSocket.forward('event');
      scope.$on('sails:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();

      scope.$destroy();
      spy.reset();
      mockIoSocket.emit('event');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should use the specified prefix', inject(function (sailsSocketFactory) {
      var sailsSocket = sailsSocketFactory({
        ioSocket: mockIoSocket,
        scope: scope,
        prefix: 'custom:'
      });

      sailsSocket.forward('event');

      scope.$on('custom:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    }));

    it('should forward to the specified scope when one is provided', function () {
      var child = scope.$new();
      spyOn(child, '$broadcast');
      sailsSocket.forward('event', child);

      scope.$on('socket:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(child.$broadcast).toHaveBeenCalled();
    });
  });

});
