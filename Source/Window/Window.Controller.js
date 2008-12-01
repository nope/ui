/*
Class: UI.Controller
	base class for controllers.

License:
	MIT-style license.

Require:
	UI/Windows.js

*/

UI.Controller = {};

/*
Class: UI.Window.Controller
	The window controller class of the <http://app.floor.ch> floor apps framework
	Creates a new window controller

License:
	MIT-style license.

Require:
	UI/Windows.js

*/

UI.Controller.Window = new Class({
	Singleton			: true,
	//Extends			: UI.Controller,
	Implements 			: [Events, Options],
	
	options: {
		className		: 'ui-winman',
		version			: '0.1a',
		zBase			: 2000,
		zStep			: 10,
		cascade			: {
			start		: {
				x		: 51,
				y		: 101
			},
			step: {
				x		: 20,
				y		: 20
			}
		},
		stack			: {
			offsetWidth : 4,		
			offsetHeight: 4			
		}
	},
	
	initialize: function(options){
		this.setOptions();
		
		UI.elements.window = new Array();

		this.zIndex = this.options.zBase;
		
		window.addEvent('resize', function(){ 	this.resizeMaximizedWindow(); }.bind(this));
	},


	/*
	  Function: register
	  
	   	Add passing window to the manage list
	   
	  Arguments: window Object
	  
	 */	
	
	register: function(win) {
		UI.elements.window.push(win);
		win.element.setStyle('zIndex', this.zIndex);
		this.zIndex += this.options.zStep;
	},
	
	/*
	  Function: close
	  
	   Destroy the window class instance
	   
	  Arguments: window Object
	  
	 */	
	
	close: function(elementClass) {
		elementClass.hide();
		elementClass.fireEvent('onClose');
		for (var i = UI.elements.window.length - 1; i >= 0; i--) {
			if (UI.elements.window[i] == elementClass) {
				elementClass.destroy();
				delete UI.elements.window[i];
				UI.elements.window = UI.elements.window.clean();
			}
		}
		this.focus();
	},
	
	/*
	  Function: focus
	  
	   	Increment max z-index and blur active window
	   
	  Arguments: window Object
	  
	 */	
	
	focus: function(win) {
		if (!$defined(win)) {
			//make next highest window focus
			var zIndex = 0;
			var window;
			for (var i = UI.elements.window.length - 1; i >= 0; i--) {
				var windowZIndex = UI.elements.window[i].element.getStyle('zIndex');
				if (windowZIndex >= zIndex && !UI.elements.window[i].minimized) {
					window = UI.elements.window[i];
					zIndex = windowZIndex;
				}
			}
			if (window) window.focus();
		} else if (win && this.active != win) {
			if (this.active && !this.active.minimized) this.blur(this.active);
			
			this.zIndex += this.options.zStep;
			win.element.style.zIndex = this.zIndex;
			
			this.active = win;
			win.fireEvent('focus');
		}
	},
	
	/*
	  Function: blur
	  
	   	blur active window
	   
	  Arguments: window Object
	  
	 */	
	
	blur: function(win) {
		if ($defined(win) && !win.minimized) {
			win.setState('inactive');
			win.fireEvent('onBlur');
		} else if (this.active) {
			this.blur(this.active);
		}
	},

	
	/*
	  Function: resizeMaximizedWindow
	  
	   	Propagate click from shadow offset to the back window 
	  
	 */	
	 	
	setMinimizedLocation: function() {
		var x = 4;
		
		UI.elements.window.each(function(w,i) {
			if (w.state == 'minimized') {
				x = x + w.element.getStyle('width').toInt() + 4;
			}
		});
		
		return x;
	},

	/*
	  Function: resizeMaximizedWindow
	  
	   	Set new maximized size for all mamimized window 
	
	
	  
	 */	
	
	resizeMaximizedWindow: function() {
		UI.elements.window.each(function(win,i) {
			if (win.state == 'maximized') {
				win.setSize({
					height	: window.getHeight()-53,
					width	: window.getWidth()
				});
			}
		});
	},

	/*
	  Function: getCascadeLocation
	  
	   	Calculate the location of the window in the cascade
	  
	  Arguments : window Object
	  
	  Return
	  		Hash of location coordinates { left : 100, top : 100 }
	  
	*/

	
	getCascadeLocation: function(win) {
		var location = {
			left : this.options.cascade.start.x.toInt(),
			top : this.options.cascade.start.y.toInt()
		}
		UI.elements.window.each(function(w,i) {
			if (w.state != 'minimized' && w.options.location == 'cascade') {
				location.left += this.options.cascade.step.x;
				location.top += this.options.cascade.step.y;
			}
		},this);
		
		return location;
	},
	
	
	/*
	  Function: propagateUnderShadow
	  
	   	Propagate click from shadow offset to the back window 
	  
	 */
	
	propagateUnderShadow : function(e) {
		var x = e.client.x;
		var y = e.client.y;
		var z = 0;
		var s = '';
		UI.elements.window.each(function(w,i) {
			c = w.element.getCoordinates();
			if ( c.left <= x && x <= c.left + c.width && c.top <= y && y < c.top + c.height) {
				if ( w.element.getStyle('z-index') > z ) {
					z = w.element.getStyle('z-index');
					s = w;
				}
				s.focus();
			}
		});
	},


	/*
	  Function: resetCascade
	  
	   	Reset all window location and set a cascade
	  
	 */
	
	resetCascade: function() {
		UI.elements.window.each(function(w,i) {
			console.log(w.state);
			
			if (w.state == 'normalized') {
				w.setStyles(getCascadePosition(w));
				w.location = 'cascade';
			}
		});
	}
	
});