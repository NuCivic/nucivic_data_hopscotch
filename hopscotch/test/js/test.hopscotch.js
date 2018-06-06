/* globals describe:false */
/* globals it:false */
/* globals hopscotch:false */
/* globals expect:false */
// This test suite assumes that the browser has document.querySelector.

var hasSessionStorage = typeof window.sessionStorage !== 'undefined',

$body = $(document.body),

setState = function(name,value,days) {
  var expires = '',
      date;

  if (hasSessionStorage) {
    sessionStorage.setItem(name, value);
  }
  else {
    if (days) {
      date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = '; expires='+date.toGMTString();
    }
    document.cookie = name+'='+value+expires+'; path=/';
  }
},

getState = function(name) {
  var nameEQ,
      ca,
      i,
      c,
      state;

  if (hasSessionStorage) {
    state = sessionStorage.getItem(name);
  }
  else {
    nameEQ = name + '=';
    ca = document.cookie.split(';');
    for(i=0;i < ca.length;i++) {
      c = ca[i];
      while (c.charAt(0)===' ') {c = c.substring(1,c.length);}
      if (c.indexOf(nameEQ) === 0) {
        state = c.substring(nameEQ.length,c.length);
        break;
      }
    }
  }

  return state;
},

clearState = function(name) {
  if (hasSessionStorage) {
    sessionStorage.removeItem(name);
  }
  else {
    this.setState(name,'',-1);
  }
},

setup = function() {
  clearState('hopscotch-test-tour');
};

setup();

// ==========================
// BEGIN TESTS
// ==========================

describe('Hopscotch', function() {
  describe('#isActive', function() {
    it('should default to not active', function() {
      expect(hopscotch.isActive).to.not.be.ok();
    });

    it('should be active once a tour is started', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      expect(hopscotch.isActive).to.be.ok();
      hopscotch.endTour();
    });
  });

  describe('#startTour', function() {
    it('should create a div for the HopscotchBubble and append to the body', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      expect(document.querySelector('.hopscotch-bubble')).to.be.ok(); // does the bubble exist on the page?
      hopscotch.endTour();
    });

    it('should start the tour at the specified step when a step number is supplied as an argument', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ]
      }, 1);
      expect(hopscotch.getCurrStepNum()).to.be(1);
    });

    it('should throw an exception when trying to start the tour at a non-existent step', function() {
      try {
        hopscotch.startTour({
          id: 'hopscotch-test-tour',
          steps: [
            {
              target: 'shopping-list',
              orientation: 'left',
              title: 'Shopping List',
              content: 'It\'s a shopping list'
            }
          ]
        }, 10);
      }
      catch (e) {
        expect(true).to.be.ok();
        hopscotch.endTour();
        return;
      }
      expect(false).to.be.ok();
      hopscotch.endTour();
    });

    it('should be possible to destroy and recreate target elements and rerun a tour', function(){
      var tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'dynamic-target',
            orientation: 'left',
            title: 'Dynamic target',
            content: 'It comes and goes, talking of Michelangelo'
          },
        ]
      };

      hopscotch.startTour(tour);
      expect(hopscotch.isActive).to.not.be.ok();
      hopscotch.endTour();

      $("body").append("<div id='dynamic-target'></div>");
      hopscotch.startTour(tour);
      expect(hopscotch.isActive).to.be.ok();
      hopscotch.endTour();

      $("#dynamic-target").remove();
      hopscotch.startTour(tour);
      expect(hopscotch.isActive).to.not.be.ok();
      hopscotch.endTour();

      $("body").append("<div id='dynamic-target'></div>");
      hopscotch.startTour(tour);
      expect(hopscotch.isActive).to.be.ok();
      hopscotch.endTour();

      $("#dynamic-target").remove();
    });
  });

  describe('#endTour', function() {
    it('should set the isActive flag to false', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      expect(hopscotch.isActive).to.be.ok();
      hopscotch.endTour();
      expect(hopscotch.isActive).to.not.be.ok();
    });

    it('should hide the hopscotch bubble', function() {
      var $el;
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      $el = $('.hopscotch-bubble');
      expect($el.length).to.be.ok();
      expect($el.hasClass('hide')).to.not.be.ok(); // should not be hidden
      hopscotch.endTour();
      expect($el.hasClass('hide')).to.be.ok(); // should be hidden
    });
  });

  describe('#showStep', function() {
    it('should show the given step when showStep() is called', function() {
      var content;
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ]
      });
      hopscotch.showStep(2);
      expect(hopscotch.getCurrStepNum()).to.be(2);
      content = $('.hopscotch-bubble-content .hopscotch-content').html();
      expect(content).to.be('It\'s Mocha');
      hopscotch.endTour();
    });
  });

  describe('Tour Options', function() {
    it('should use bubbleWidth passed into tour definition', function() {
      var el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ],
        bubbleWidth: 888
      });
      el = document.querySelector('.hopscotch-bubble-container');
      expect(parseInt(el.style.width, 10)).to.be(888);
      hopscotch.endTour();
    });

    it('should use bubblePadding passed into tour definition', function() {
      var el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ],
        bubblePadding: 8
      });
      el = document.querySelector('.hopscotch-bubble-container');
      expect(parseInt(el.style.padding, 10)).to.be(8);
      hopscotch.endTour();
    });

    it('should show the Close (X) button by default', function() {
      var $el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      $el = $('.hopscotch-bubble-close');
      expect($el.length).to.be(1);
      expect($el.hasClass('hide-all')).to.not.be.ok();
      expect($el.hasClass('hide')).to.not.be.ok();
      hopscotch.endTour();
    });

    it('should hide the Close (X) button if specified', function() {
      var $el;

      hopscotch.configure({
        showCloseButton: false
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      $el = $('.hopscotch-bubble-close');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });

    it('should hide the Previous button by default', function() {
      var $el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      }, 1);
      $el = $('.hopscotch-prev');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });

    it('should show the Previous button if specified', function() {
      var $el;

      hopscotch.configure({
        showPrevButton: true
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      }, 1);
      $el = $('.hopscotch-prev');
      expect($el.length).to.be(1);
      hopscotch.endTour();
    });

    it('should hide the Previous button on the first step, even if showPrevButton is specified', function() {
      var $el;

      hopscotch.configure({
        showPrevButton: true
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      });
      $el = $('.hopscotch-prev');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });

    it('should show the Next button by default', function() {
      var $el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      });
      $el = $('.hopscotch-next');
      expect($el.length).to.be(1);
      hopscotch.endTour();
    });

    it('should hide the Next button if specified', function() {
      var $el;

      hopscotch.configure({
        showNextButton: false
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      });
      $el = $('.hopscotch-next');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });

    it('last step of tour should use Done label for next button', function() {
      var $el;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      }, 1);
      $el = $('.hopscotch-next');
      expect($el.html()).to.be('Done');
      hopscotch.endTour();
    });

    it('should skip to the next step if the target element for the current step doesn\'t exist', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'nonexistent',
            orientation: 'left',
            title: 'This target shouldn\'t exist',
            content: 'If it does, then I\'ve made a huge mistake.'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      });
      expect(hopscotch.isActive).to.be.ok();
      expect(hopscotch.getCurrStepNum()).to.be(1);
      hopscotch.endTour();
    });

    it('should not skip to the next step if the target element if skipIfNoElement is set to false', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'nonexistent',
            orientation: 'left',
            title: 'This target shouldn\'t exist',
            content: 'If it does, then I\'ve made a huge mistake.'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ],
        skipIfNoElement: false
      });
      expect(hopscotch.isActive).to.not.be.ok();
      hopscotch.endTour();
    });

    it('supports arbitrary selectors as targets', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'div#shopping-list li[id]',
            orientation: 'left',
            title: 'Shopping List Item',
            content: 'It\'s a thing on my shopping list'
          }
        ]
      });
      expect(hopscotch.isActive).to.be.ok();
      hopscotch.endTour();
    });

    it('should use the i18n strings provided in calls to configure()', function() {
      hopscotch.configure({
        i18n: {
          nextBtn: 'n',
          prevBtn: 'p',
          skipBtn: 's',
          doneBtn: 'd',
          stepNums: [ 'one', 'two', 'three' ]
        }
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ],
        showPrevButton: true
      });

      expect($('.hopscotch-next').html()).to.be('n');
      expect($('.hopscotch-bubble-number').html()).to.be('one');
      hopscotch.nextStep();
      expect($('.hopscotch-prev').html()).to.be('p');
      expect($('.hopscotch-next').html()).to.be('d');
      expect($('.hopscotch-bubble-number').html()).to.be('two');
      hopscotch.endTour();
      hopscotch.resetDefaultI18N();
    });
  });

  describe('Saving state', function() {
    it('should create state in either sessionStorage or cookie once tour is started', function() {
      expect(getState('hopscotch.tour.state')).to.not.be.ok();
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      expect(getState('hopscotch.tour.state')).to.be('hopscotch-test-tour:0');
      hopscotch.endTour();
    });

    it('should use the cookie/sessionStorage name provided in calls to configure()', function() {
      hopscotch.configure({
        cookieName: 'tourstate'
      });
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ],
        showPrevButton: true
      });
      expect(getState('tourstate')).to.be('hopscotch-test-tour:0');
      hopscotch.endTour();
      hopscotch.resetDefaultOptions();
    });

    it('should detect state when starting a tour and begin the tour on the specified step', function() {
      setState('hopscotch.tour.state', 'hopscotch-test-tour:1');
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ],
        skipIfNoElement: false
      });
      //TODO:fix this unit test
      //expect(hopscotch.getCurrStepNum()).to.be(1);
      hopscotch.endTour();
    });
  });

  describe('#refreshBubblePosition', function() {
    it('recalculates the position of the bubble afer moving the element', function() {
      hopscotch.startTour({
        id: 'hopscotch-test-refresh-bubble-position',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ]
      });

      var bubbleDomElement = document.querySelector('.hopscotch-bubble');
      var bubbleTop = bubbleDomElement.style['top'];
      var bubbleLeft = bubbleDomElement.style['left'];

      document.getElementById('shopping-list').style.setProperty('margin-top', '100px');
      document.getElementById('shopping-list').style.setProperty('margin-left', '100px');

      hopscotch.refreshBubblePosition();

      expect(bubbleDomElement.style['top']).to.not.eql(bubbleTop);
      expect(bubbleDomElement.style['left']).to.not.eql(bubbleLeft);
      hopscotch.endTour();

      document.getElementById('shopping-list').style.setProperty('margin-top', null);
      document.getElementById('shopping-list').style.setProperty('margin-left', null);
    });
  });

  describe('Custom render methods', function(){
    var mockTour = {
          id: 'hopscotch-test-tour',
          steps: [
            {
              target: 'shopping-list',
              orientation: 'left',
              title: 'Shopping List',
              content: 'It\'s a shopping list'
            },
            {
              target: 'shopping-list',
              orientation: 'left',
              title: 'Shopping List',
              content: 'It\'s a shopping list'
            }
          ],
          skipIfNoElement: false
        },
        mockCallout = {
          id: 'shopping-callout',
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List Callout',
          content: 'It\'s a shopping list'
        },
        renderMethod = sinon.stub().returns('<h1>Content!</h1><div class="hopscotch-arrow"></div>');

    before(function(){
      sinon.spy(hopscotch.templates, 'bubble_default');
      hopscotch.templates.customTemplate = sinon.stub().returns('<h1>Content!</h1><div class="hopscotch-arrow"></div>');
    });

    afterEach(function(){
      hopscotch.endTour();
      hopscotch.getCalloutManager().removeAllCallouts();
      hopscotch.templates.bubble_default.reset();
      hopscotch.templates.customTemplate.reset();
      renderMethod.reset();
      hopscotch.setRenderer('bubble_default');
    });

    after(function(){
      delete hopscotch.templates.customTemplate;
      hopscotch.templates.bubble_default.restore();
    });

    it('setRenderer() should allow setting a global renderer within the hopscotch.templates namespace', function(){
      hopscotch.setRenderer('customTemplate');
      
      hopscotch.startTour(mockTour);
      expect(hopscotch.templates.customTemplate.calledOnce).to.be.ok();
      expect(renderMethod.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();

      hopscotch.endTour();
      hopscotch.templates.customTemplate.reset();

      hopscotch.getCalloutManager().createCallout(mockCallout);
      expect(hopscotch.templates.customTemplate.calledOnce).to.be.ok();
      expect(renderMethod.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('setRenderer() should allow setting a global custom render method', function(){
      hopscotch.setRenderer(renderMethod);
      hopscotch.startTour(mockTour);

      expect(renderMethod.calledOnce).to.be.ok();
      expect(hopscotch.templates.customTemplate.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();

      hopscotch.endTour();
      renderMethod.reset();

      hopscotch.getCalloutManager().createCallout(mockCallout);
      expect(renderMethod.calledOnce).to.be.ok();
      expect(hopscotch.templates.customTemplate.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('Should accept a custom renderer in hopscotch.templates set via tour config', function(){
      var augmentedData = $.extend({}, mockTour, {customRenderer: 'customTemplate'});
      hopscotch.startTour(augmentedData);

      expect(hopscotch.templates.customTemplate.calledOnce).to.be.ok();
      expect(renderMethod.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('Should accept a custom renderer method set via tour config', function(){
      var augmentedData = $.extend({}, mockTour, {customRenderer: renderMethod});
      hopscotch.startTour(augmentedData);

      expect(renderMethod.calledOnce).to.be.ok();
      expect(hopscotch.templates.customTemplate.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('Should accept a custom renderer in hopscotch.templates set via new callout config', function(){
      var augmentedData = $.extend({}, mockCallout, {customRenderer: 'customTemplate'});
      hopscotch.getCalloutManager().createCallout(augmentedData);

      expect(hopscotch.templates.customTemplate.calledOnce).to.be.ok();
      expect(renderMethod.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('Should accept a custom renderer method set via new callout config', function(){
      var augmentedData = $.extend({}, mockCallout, {customRenderer: renderMethod});
      hopscotch.getCalloutManager().createCallout(augmentedData);

      expect(renderMethod.calledOnce).to.be.ok();
      expect(hopscotch.templates.customTemplate.calledOnce).to.not.be.ok();
      expect(hopscotch.templates.bubble_default.calledOnce).to.not.be.ok();
    });

    it('Render methods should receive custom data from tours', function(){
      var augmentedData = $.extend({}, mockTour, {customData: {foo: 'bar'}}),
          callArgs;
      $.extend(augmentedData.steps[0], {customData: {stepSpecific: 'data'}});

      hopscotch.startTour(augmentedData);
      expect(hopscotch.templates.bubble_default.calledOnce).to.be.ok();

      callArgs = hopscotch.templates.bubble_default.args[0][0];
      expect(callArgs.tour.customData.foo).to.be('bar');
      expect(callArgs.step.customData.stepSpecific).to.be('data');
    });

    it('Render methods should receive custom data from callouts', function(){
      var augmentedData = $.extend({}, mockCallout, {customData: {foo: 'bar'}}),
          callArgs;

      hopscotch.getCalloutManager().createCallout(augmentedData);
      expect(hopscotch.templates.bubble_default.calledOnce).to.be.ok();

      callArgs = hopscotch.templates.bubble_default.args[0][0];
      expect(callArgs.tour.customData.foo).to.be('bar');
      expect(callArgs.step.customData.foo).to.be('bar');
    });

    it('Render methods should receive the unsafe flag when set', function(){
      var augmentedData = $.extend({}, mockTour, {unsafe: true}),
          callArgs;

      hopscotch.startTour(augmentedData);
      expect(hopscotch.templates.bubble_default.calledOnce).to.be.ok();

      callArgs = hopscotch.templates.bubble_default.args[0][0];
      expect(callArgs.tour.unsafe).to.be(true);
    });

    it('Should be able to override default escaping method using setEscaper()', function(){
      var augmentedData = $.extend({}, mockTour, {unsafe: true}),
          customEscaper = sinon.stub().returnsArg(0);

      hopscotch.setEscaper(customEscaper);
      hopscotch.startTour(augmentedData);
      expect(hopscotch.templates.bubble_default.calledOnce).to.be.ok();

      expect(customEscaper.calledTwice).to.be.ok();
    });
  });
});

/**
 * While not directly controlled, properties of the Hopscotch Bubble are controlled by Hopscotch step options.
 * These are specified in the tour definition.
 */
describe('HopscotchBubble', function() {
  describe('Title and Content', function() {
    it('should show the Title of the step', function() {
      var title;
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      title = document.querySelector('.hopscotch-bubble-content h3').innerHTML;
      expect(title).to.be('Shopping List');
    });

    it('should show the Content of the step', function() {
      var content;
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        } ]
      });
      content = document.querySelector('.hopscotch-bubble-content .hopscotch-content').innerHTML;
      expect(content).to.be('It\'s a shopping list');
      hopscotch.endTour();
    });
  });

  describe('z-index', function(){
    var bubble;
    it('should set z-index if provided', function(){
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [ {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list',
          zindex: 100
        },
        {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list',
          zindex: 0
        },
        {
          target: 'shopping-list',
          orientation: 'left',
          title: 'Shopping List',
          content: 'It\'s a shopping list'
        }]
      });
      bubble = document.querySelector('.hopscotch-bubble');
      expect(bubble.style.zIndex).to.be('100');

      hopscotch.nextStep();
      bubble = document.querySelector('.hopscotch-bubble');
      expect(bubble.style.zIndex).to.be('0');

      hopscotch.nextStep();
      bubble = document.querySelector('.hopscotch-bubble');
      expect(bubble.style.zIndex).to.be('auto');

      hopscotch.endTour();
    });
  });

  describe('Buttons', function() {
    it('should show Skip button when specified', function() {
      var $nextBtnEl;

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showSkip: true
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ]
      });
      $nextBtnEl = $('.hopscotch-next');
      expect($nextBtnEl.length).to.be(1);
      expect($nextBtnEl.html()).to.be('Skip');
      hopscotch.endTour();
    });

    it('should hide Previous button when specified', function() {
      var $el,
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showPrevBtn: false
          }
        ]
      };

      hopscotch.startTour(tour);
      $el = $('.hopscotch-prev');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });

    it('should hide Next button when specified', function() {
      var $el,
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showNextButton: false
          }
        ]
      };

      hopscotch.startTour(tour);
      $el = $('.hopscotch-next');
      expect($el.length).to.be(0);
      hopscotch.endTour();
    });
  });

  describe('Callbacks', function() {
    it('should invoke onStart callback when starting the tour', function() {
      var testClassName = 'testingOnNext';

      expect($body.hasClass(testClassName)).to.not.be.ok();
      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ],
        onStart: function() {
          $body.addClass(testClassName);
        }
      });
      expect($body.hasClass(testClassName)).to.be.ok();
      hopscotch.endTour();
      $body.removeClass(testClassName);
    });

    it('should invoke onNext callback of current step when going to the next step', function() {
      var testClassName = 'testingOnNext',
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            onNext: function() {
              $body.addClass(testClassName);
            }
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ]
      };

      expect($body.hasClass(testClassName)).to.not.be.ok();
      hopscotch.startTour(tour);
      hopscotch.nextStep();
      expect($body.hasClass(testClassName)).to.be.ok();
      hopscotch.endTour();
      $body.removeClass(testClassName);
    });

    it('should invoke onPrev callback of current step when going to the prev step', function() {
      var testClassName = 'testingOnPrev',
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha',
            onPrev: function() {
              $body.addClass(testClassName);
            }
          }
        ]
      };

      expect($body.hasClass(testClassName)).to.not.be.ok();
      hopscotch.startTour(tour, 1);
      hopscotch.prevStep();
      expect($('body').hasClass(testClassName)).to.be.greaterThan(-1);
      hopscotch.endTour();
      $body.removeClass(testClassName);
    });

    it('should invoke onEnd callback of current step when ending the tour', function() {
      var testClassName = 'testingOnNext',
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          }
        ],
        onEnd: function() {
          $body.addClass(testClassName);
        }
      };

      expect($body.hasClass(testClassName)).to.not.be.ok();
      hopscotch.startTour(tour);
      hopscotch.endTour();
      expect($body.hasClass(testClassName)).to.be.ok();
      $body.removeClass(testClassName);
    });

    it('should detect when a callback changes the state of a tour and not go to the next step when detected', function() {
      var tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            onNext: function() {
              hopscotch.showStep(2);
            }
          },
          {
            target: 'milk',
            orientation: 'left',
            title: 'Milk',
            content: 'It\'s milk'
          },
          {
            target: 'eggs',
            orientation: 'left',
            title: 'Eggs',
            content: 'It\'s eggs'
          }
        ]
      };

      hopscotch.startTour(tour);
      hopscotch.nextStep();
      expect(hopscotch.getCurrStepNum()).to.be(2);
      hopscotch.endTour();
    });

    it('should invoke the CTA callback when the CTA button is clicked', function() {
      var testClassName = "testingCTAButton",
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showCTAButton: true,
            ctaLabel: 'test',
            onCTA: function() {
              $body.addClass(testClassName);
            }
          }
        ]
      };

      expect($body.hasClass(testClassName)).to.not.be.ok();
      hopscotch.startTour(tour);
      $('.hopscotch-cta').click();
      expect($body.hasClass(testClassName)).to.be.ok();
      hopscotch.endTour(tour);
      $body.removeClass(testClassName);
    });

    it('should remove the CTA callback after advancing to the next step', function() {
      var testClassName1 = "testingCTAButton1",
      testClassName2 = "testingCTAButton2",
      tour = {
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showCTAButton: true,
            ctaLabel: 'test',
            onCTA: function() {
              $body.addClass(testClassName1);
            }
          },
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list',
            showCTAButton: true,
            ctaLabel: 'test',
            onCTA: function() {
              $body.addClass(testClassName2);
            }
          }
        ]
      };

      expect($body.hasClass(testClassName1)).to.not.be.ok();
      expect($body.hasClass(testClassName2)).to.not.be.ok();
      hopscotch.startTour(tour);
      hopscotch.nextStep();
      $('.hopscotch-cta').click();
      expect($body.hasClass(testClassName1)).to.not.be.ok();
      expect($body.hasClass(testClassName2)).to.be.ok();
      hopscotch.endTour(tour);
      $body.removeClass(testClassName1).removeClass(testClassName2);
    });

    it('should be able to invoke a callback that was registered as a helper', function() {
      var testClassName = 'testingOnNext',
          helperName = 'addClassToBody';

      hopscotch.registerHelper(helperName, function() {
        $body.addClass(testClassName);
      });
      expect($body.hasClass(testClassName)).to.not.be.ok();

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ],
        onStart: helperName
      });

      expect($body.hasClass(testClassName)).to.be.ok();
      hopscotch.endTour();
      $body.removeClass(testClassName);
      hopscotch.unregisterHelper(helperName);
    });

    it('should be able to invoke more than one helper callbacks', function() {
      var testClassName1 = 'testingOnNext1',
          testClassName2 = 'testingOnNext2',
          testClassName3 = 'testingOnNext3',
          helperName1    = 'addClassToBody1',
          helperName2    = 'addClassToBody2',
          helperName3    = 'addClassToBody3';

      hopscotch.registerHelper(helperName1, function() {
        $body.addClass(testClassName1);
      });
      hopscotch.registerHelper(helperName2, function() {
        $body.addClass(testClassName2);
      });
      hopscotch.registerHelper(helperName3, function() {
        $body.addClass(testClassName3);
      });

      expect($body.hasClass(testClassName1)).to.not.be.ok();
      expect($body.hasClass(testClassName2)).to.not.be.ok();
      expect($body.hasClass(testClassName3)).to.not.be.ok();

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ],
        onStart: [[helperName1], [helperName2], [helperName3]]
      });

      expect($body.hasClass(testClassName1)).to.be.ok();
      expect($body.hasClass(testClassName2)).to.be.ok();
      expect($body.hasClass(testClassName3)).to.be.ok();
      hopscotch.endTour();
      $body.removeClass(testClassName1)
           .removeClass(testClassName2)
           .removeClass(testClassName3);
      hopscotch.unregisterHelper(helperName1);
      hopscotch.unregisterHelper(helperName2);
      hopscotch.unregisterHelper(helperName3);
    });

    it('should be able to invoke a helper with arguments', function() {
      var testClassName = 'testingOnNext',
          helperName = 'addClassToBody';

      hopscotch.registerHelper(helperName, function(className) {
        $body.addClass(className);
      });

      expect($body.hasClass(testClassName)).to.not.be.ok();

      hopscotch.startTour({
        id: 'hopscotch-test-tour',
        steps: [
          {
            target: 'shopping-list',
            orientation: 'left',
            title: 'Shopping List',
            content: 'It\'s a shopping list'
          },
          {
            target: 'mocha',
            orientation: 'top',
            title: 'Mocha',
            content: 'It\'s Mocha'
          }
        ],
        onStart: [helperName, testClassName]
      });

      expect($body.hasClass(testClassName)).to.be.ok();
      hopscotch.endTour();
      $body.removeClass(testClassName);
      hopscotch.unregisterHelper(helperName);
    });
  });
});

describe('HopscotchCalloutManager', function() {
  describe('CalloutManager', function() {
    it('should create no more than one instance of the callout manager', function() {
      var mgr = hopscotch.getCalloutManager();
      expect(mgr).to.be(hopscotch.getCalloutManager());
    });
    it('should create a callout using createCallout() and remove it with removeCallout()', function() {
      var mgr = hopscotch.getCalloutManager(),
          $el;

      mgr.createCallout({
        id: 'shopping-callout',
        target: 'shopping-list',
        orientation: 'left',
        title: 'Shopping List Callout',
        content: 'It\'s a shopping list'
      });

      $el = $('.hopscotch-bubble.hopscotch-callout');
      expect($el.length).to.be(1);
      expect($el.html().indexOf('Shopping List Callout')).to.be.greaterThan(-1);
      mgr.removeCallout('shopping-callout');
      expect($('.hopscotch-bubble.hopscotch-callout').length).to.be(0);
    });
    it('should remove all callouts using removeAllCallouts()', function() {
      var mgr = hopscotch.getCalloutManager(),
          callout;

      mgr.createCallout({
        id: 'shopping-callout',
        target: 'shopping-list',
        orientation: 'left',
        title: 'Shopping List Callout',
        content: 'It\'s a shopping list'
      });
      mgr.createCallout({
        id: 'shopping-callout2',
        target: 'shopping-list',
        orientation: 'left',
        title: 'Shopping List Callout',
        content: 'It\'s a shopping list'
      });
      mgr.createCallout({
        id: 'shopping-callout3',
        target: 'shopping-list',
        orientation: 'left',
        title: 'Shopping List Callout',
        content: 'It\'s a shopping list'
      });

      expect($('.hopscotch-bubble.hopscotch-callout').length).to.be(3);
      mgr.removeAllCallouts();
      expect($('.hopscotch-bubble.hopscotch-callout').length).to.be(0);
    });
    it('should return instance of HopscotchBubble using getCallout()', function() {
      var mgr = hopscotch.getCalloutManager(),
          callout;

      callout = mgr.createCallout({
        id: 'shopping-callout',
        target: 'shopping-list',
        orientation: 'left',
        title: 'Shopping List Callout',
        content: 'It\'s a shopping list'
      });

      // Test the existence of some known methods of HopscotchBubble
      expect(callout.render).to.be.ok();
      expect(callout.destroy).to.be.ok();
      expect(callout.setPosition).to.be.ok();
      mgr.removeCallout('shopping-callout');
    });
  });
});
