/**
 * Module Dependencies
 */

var computed = window.getComputedStyle;
var domify = require('domify');
var event = require('event');
var raf = require('raf');

/**
 * Template
 */

var tpl = domify(require('./template'));

/**
 * Export `Resize`
 */

module.exports = Resize;

/**
 * Initialize `Resize`
 */

function Resize(parent, fn) {
  if (!(this instanceof Resize)) return new Resize(parent, fn);
  this.parent = parent;
  this.fn = fn || function() {};

  // ensure that the parent has relative positioning
  if ('static' == computed(parent).position) {
    parent.style.position = 'relative';
  }

  // only load the element once
  var el = this.el = parent.querySelector('.resize-triggers') || tpl.cloneNode(true);
  !el.parentNode && parent.appendChild(el);

  // set up the children
  this.expand = el.firstElementChild;
  this.contract = el.lastElementChild;
  this.expandChild = this.expand.firstElementChild;

  // raf id
  this.raf = null;

  // previous resize
  this.prev = {};

  // reset the triggers
  this.reset();

  this.onscroll = this.scroll.bind(this);

  // set up the binding
  event.bind(parent, 'scroll', this.onscroll, true);
};

/**
 * Unbind the resize event handlers
 *
 * @return {Resize}
 * @api public
 */

Resize.prototype.unbind = function() {
  event.unbind(this.parent, 'scroll', this.onscroll, true);
  return this;
};

/**
 * Reset the triggers
 *
 * @return {Resize} self
 * @api private
 */

Resize.prototype.reset = function() {
  var expandChild = this.expandChild;
  var contract = this.contract;
  var expand = this.expand;

  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + 'px';
  expandChild.style.height = expand.offsetHeight + 1 + 'px';
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
    
  return this;
}

/**
 * Check the triggers
 *
 * @return {Boolean}
 * @api private
 */

Resize.prototype.check = function() {
  var prev = this.prev;
  var parent = this.parent;

  return parent.offsetWidth != prev.width
      || parent.offsetHeight != prev.height;
};

/**
 * Scroll event
 *
 * @param {Event} e
 * @return {Resize}
 * @api private
 */

Resize.prototype.scroll = function(e) {
  var self = this;
  this.reset();
  this.raf && raf.cancel(this.raf);
  this.raf = raf(function() { self.trigger(e); });
};

/**
 * Trigger the resize `fn`
 *
 * @param {Event} e
 * @return {Resize}
 * @api private
 */

Resize.prototype.trigger = function(e) {
  if (!this.check()) return this;
  var parent = this.parent;
  this.prev.width = parent.offsetWidth;
  this.prev.height = parent.offsetHeight;
  this.fn.call(parent, e);
  return this;
};
