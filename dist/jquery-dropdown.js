/*! jquery dropdown - v0.1.1 - 2013-12-11
* https://github.com/amazingSurge/jquery-dropdown
* Copyright (c) 2013 amazingSurge; Licensed MIT */
/* global jQuery */

(function($) {

    var Dropdown = $.dropdown = function(element, options) {
        this.element = element;
        this.$element = $(element);
        this.$parent = this.$element.parent();

        // options
        var meta_data = [];
        $.each(this.$element.data(), function(k, v) {
            var re = new RegExp("^dropdown", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });
        this.options = $.extend(true, {}, Dropdown.defaults, options, meta_data);
        this.namespace = this.options.namespace;
        this.classes = {
            skin: this.namespace + '_' + this.options.skin,
            show: this.namespace + '_show',
            trigger: this.namespace + '-trigger',
            mask: this.namespace + '-mask',
            wrapper: this.namespace +  '-wrapper',
            panel: this.namespace + '-panel',
            disabled: this.namespace + '_disabled'
        };

        // skin
        if (this.options.skin !== null) {
            this.$element.addClass(this.classes.skin);
        }

        this.$children = this.$element.children();

        // content
        this.$panel = this._parse(this.options.panel);

        //state
        this.isShow = false;
        this.disabled = false;

        //init
        this.init();
    };

    Dropdown.prototype = {
        constructor: Dropdown,
        init: function() {
            var self = this;
            this.$parent.addClass(this.classes.wrapper);
            this.$element.addClass(this.namespace).addClass(this.classes.trigger);
            this.$panel.addClass(this.classes.panel);

            this.$element.on('click.dropdown', function() {
                self.toggle.call(self);
                return false;
            });

            this.$panel.on('click.dropdown', 'li', function() {
                if (typeof self.options.onChange === 'function') {
                    self.options.onChange.call(self, $(this));
                }
                if (self.options.imitateSelect) {
                    self.setText($(this));
                }
                self.$element.trigger('dropdown::onChange', $(this));
                self.hide();
                return false;
            });

            if (typeof this.options.onInit === 'function') {
                this.options.onInit.call(this,this);
            }
            this.$element.trigger('dropdown::init', this);
        },
        show: function() {
            var self = this;
            if (this.disabled) {
                return;
            }
            if (this.options.clickoutHide) {
                this._generateMask();
            }
            
            $(window).on('resize.dropdown', function() {
                self._position();
                return false;
            });
            this.isShow = true;
            this.$element.addClass(this.classes.show);
            this.$panel.addClass(this.classes.show);
            
            this._position();

            if (typeof this.options.onShow === 'function') {
                this.options.onShow.call(this,this);
            }
            this.$element.trigger('dropdown::show', this);
        },
        hide: function() {
            this.isShow = false;
            if (this.options.clickoutHide) {
                this._clearMask();
            }
            
            this.$element.removeClass(this.classes.show);
            this.$panel.removeClass(this.classes.show);
            $(document).off('mousedown.dropdown');

            if (typeof this.options.onHide === 'function') {
                this.options.onHide.call(this,this);
            }
            this.$element.trigger('dropdown::hide', this);
        },
        setText: function($item) {
            this.$element.text($item.text());
            if (this.$children.length) {
                this.$children.appendTo(this.$element);
            }
        },
        _generateMask: function() {
            var self = this;
            this.$mask = $('<div></div>').addClass(this.classes.mask).appendTo(this.$parent);
            this.$mask.on('click.dropdown',function() {
                self.hide();
                return false;
            });
        },
        _clearMask: function() {
            if (this.$mask) {
                this.$mask.off('.dropdown');
                this.$mask.remove();
                this.$mask = null;
            }
        },
        toggle: function() {
            if (this.isShow) {
                this.hide();
            } else {
                this.show();
            } 
        },
        _position: function() {
            var offset = this.$element.offset(),
                height = this.$element.outerHeight(),
                width = this.$element.outerWidth(),
                panelWidth = this.$panel.outerWidth(true),
                panelHeight = this.$panel.outerHeight(true),
                top, left;

            if (panelHeight + height + offset.top > $(window).height() + $(window).scrollTop()) {
                top =  - panelHeight;
            } else {
                top = height;
            }
            if (panelWidth + offset.left > $(window).width() + $(window).scrollLeft()) {
                left = width - panelWidth;
            } else {
                left = 0;
            }
            this.$panel.css({
                position: 'absolute',
                top: top,
                left: left
            });
        },
        _parse: function(string) {
            if (string.indexOf('+') >= 0) {
                return this.$element.next();
            } else {
                return $(this.options.panel);
            }
        },

        // common  method
        enable: function() {
            this.disabled = false;
            this.$wrapper.removeClass(this.classes.disabled);
        },
        disable: function() {
            this.disabled = true;
            this.$wrapper.addClass(this.classes.disabled);d
        },
        destory: function() {
            this.hide();
            this.$element.off('.dropdown');
            this.$element.remove();
            $(window).off('.dropdown');
        }
    };

    Dropdown.defaults = {
        namespace: 'dropdown',
        skin: null,
        panel: '+', //jquery selector to find content in the page, or '+' means adjacent siblings
        clickoutHide: true, //When clicking outside of the dropdown, trigger hide event
        imitateSelect: false,//let select value show in trigger bar

        //callback comes with corresponding event
        onInit: null,
        onShow: null,
        onHide: null,
        onChange: null
    };

    $.fn.dropdown = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'dropdown');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'dropdown')) {
                    $.data(this, 'dropdown', new Dropdown(this, options));
                }
            });
        }
    };
}(jQuery));
