(function (w, $) {
	"use strict";
	w.requestAnimFrame = (function(){
		return w.requestAnimationFrame ||
			w.webkitRequestAnimationFrame ||
			w.mozRequestAnimationFrame ||
			function (callback) {
			w.setTimeout(callback, 1000 / 60);
		};
	} ());

	w.isTouchDevice = ('ontouchstart' in w);

	w.MarioGame = function (el) {
		return this.init(el);
	};
	w.MarioGame.prototype = (function () {
		var buildPositionString = function (shelf) {
				return shelf.left + 'px ' + shelf.top + 'px'
			},
			flagShelf = function (shelf) {
				shelf.flag = Math.round((shelf.left + this.half) / this.size) * this.size - this.half;
				if (shelf.flag > this.bgWidth) shelf.flag -= this.bgWidth;
				shelf.num = this.bgWidth;
			},
			slideShelf = function (shelf) {
				var speed = shelf.speed;
				if (shelf.flag) {
					speed = Math.max(Math.round(speed * (shelf.num / this.bgWidth)), 1);
					shelf.num -= speed;
				}
				if (shelf.reverse) {
					shelf.left += speed;
					if (shelf.left > this.bgWidth) shelf.left -= this.bgWidth;
				} else {
					shelf.left -= speed;
					if (shelf.left < 0) shelf.left += this.bgWidth;
				}
				shelf.$el.css('background-position', buildPositionString(shelf));
				if (shelf.left === shelf.flag && speed <= shelf.speed / 3) {
					shelf.inMotion = false;
					return;
				}
				startSliding.call(this, shelf);
			},
			startSliding = function (shelf) {
				var self = this;
				w.requestAnimFrame(function () { slideShelf.call(self, shelf); });
			},
			trigger = function () {
				if (!this.topShelf.flag && this.topShelf.inMotion) {
					flagShelf.call(this, this.topShelf);
					return;
				}
				if (!this.middleShelf.flag && this.middleShelf.inMotion) {
					flagShelf.call(this, this.middleShelf);
					return;
				}
				if (!this.bottomShelf.flag && this.bottomShelf.inMotion) {
					flagShelf.call(this, this.bottomShelf);
					return;
				}
				reset.call(this);
			},
			reset = function () {
				this.topShelf.flag = null;
				this.middleShelf.flag = null;
				this.bottomShelf.flag = null;
				if (!this.topShelf.inMotion) {
					this.topShelf.inMotion = true;
					startSliding.call(this, this.topShelf);
				}
				if (!this.middleShelf.inMotion) {
					this.middleShelf.inMotion = true;
					startSliding.call(this, this.middleShelf);
				}
				if (!this.bottomShelf.inMotion) {
					this.bottomShelf.inMotion = true;
					startSliding.call(this, this.bottomShelf);
				}
			},
			resizeBg = function () {
				this.middleShelf.top = this.size * -.33;
				this.bottomShelf.top = this.size * -.67;
				this.topShelf.$el.css({
					backgroundPosition: buildPositionString(this.topShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.middleShelf.$el.css({
					backgroundPosition: buildPositionString(this.middleShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.bottomShelf.$el.css({
					backgroundPosition: buildPositionString(this.bottomShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.topShelf.left = this.middleShelf.left = this.bottomShelf.left = this.half;
				this.topShelf.flag = this.middleShelf.flag = this.bottomShelf.flag = null;
				this.topShelf.speed = this.middleShelf.speed = Math.round(15 * this.speedRatio);
				this.bottomShelf.speed = Math.round(20 * this.speedRatio);
			},
			buildShelves = function () {
				var shelf = {
					inMotion: false,
					left: this.half,
					speed: Math.round(15 * this.speedRatio),
					reverse: false,
					flag: null
				};
				this.topShelf = $.extend({}, shelf, { top: 0, $el: $('<div class="shelf topShelf" />') });
				this.topShelf.$el.css({
					backgroundImage: 'url("' + this.tile + '")',
					backgroundPosition: buildPositionString(this.topShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.$el.append(this.topShelf.$el);
				this.middleShelf = $.extend({}, shelf, { reverse: true, top: this.size * -.33, $el: $('<div class="shelf middleShelf" />') });
				this.middleShelf.$el.css({
					backgroundImage: 'url("' + this.tile + '")',
					backgroundPosition: buildPositionString(this.middleShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.$el.append(this.middleShelf.$el);
				this.bottomShelf = $.extend({}, shelf, { speed: Math.round(20 * this.speedRatio), top: this.size * -.67, $el: $('<div class="shelf bottomShelf" />') });
				this.bottomShelf.$el.css({
					backgroundImage: 'url("' + this.tile + '")',
					backgroundPosition: buildPositionString(this.bottomShelf),
					backgroundSize: this.bgWidth + 'px ' + this.size + 'px'
				});
				this.$el.append(this.bottomShelf.$el);
			},
			calculateSize = function () {
				this.size = Math.round(this.$el.width() / 2);
				this.half = Math.floor(this.size / 2);
				this.bgWidth = this.size * this.count;
				this.$el.css('height', this.size + 'px');
				this.speedRatio = this.size / 500;
			},
			bindEvents = function () {
				var self = this,
					bind = (w.isTouchDevice) ? 'touchstart' : 'mousedown';
				this.$el.bind(bind, function () {
					trigger.call(self);
				});
				$(w).resize(function () {
					calculateSize.call(self);
					resizeBg.call(self);
				});
			},
			init = function (el) {
				this.$el = $(el);
				this.count = parseInt(this.$el.attr('data-count') || 5, 10);
				this.tile = this.$el.attr('data-tile') || "";
				calculateSize.call(this);
				buildShelves.call(this);
				reset.call(this);
				bindEvents.call(this);
				return this;
			};
		return {
			init: init
		};
	} ());
} (window, jQuery));