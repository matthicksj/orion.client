/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define require setTimeout window */

define(['examples/textview/demoSetup'], function(mSetup) {

	var tests = {};
	
	function log() {
		if (window.log) {
			window.log.apply(this, arguments);
		}
	}
	
	function setupView(text, lang) {
		var options = null;
		if (!mSetup.view) {
			/* When sync is used to create the view the stylesheet should not include paths (as they are loaded in style elements and relative to the html) */
			options = {
				sync: true,
				stylesheet: [
					"/orion/textview/textview.css", 
					"/orion/textview/rulers.css", 
					"/orion/textview/annotations.css", 
					"/examples/textview/textstyler.css", 
					"/examples/editor/htmlStyles.css"
				],
				fullSelection: true,
				tabSize: 4
			};
		}
		return mSetup.setupView(text, lang, options);
	}
	
	function getDeferred () {
		var dojo = tests.noDojo ? null : require("dojo");
		if (dojo) {
			return new dojo.Deferred();
		}
		return null;
	}
	
	function resolve(d) {
		if (d && d.resolve) {
			d.resolve(true);
		}
		return d;
	}
	
	function doAction(action, max) {
		var d = getDeferred();
		var view = mSetup.view || setupView(mSetup.getFile("/examples/textview/text.txt"), "java");
		var model = view.getModel();
		if (action.toLowerCase().indexOf("down") !== -1) {
			view.setSelection(0, 0);
		} else {
			var charCount = model.getCharCount();
			view.setSelection(charCount, charCount);
		}
		view.focus();
		var start = new Date().getTime();
		function t() {
			var caretLine = model.getLineAtOffset(view.getCaretOffset());
			view.invokeAction(action);
			if (model.getLineAtOffset(view.getCaretOffset()) !== caretLine && (max === undefined || --max > 0)) {
				setTimeout(t, 0);
			} else {
				resolve(d);
				log("time(",action,")=", (new Date().getTime() - start));
			}
		}
		t();
		return d;
	}
	
	tests.testPageDown = function () {
		return doAction("pageDown");
	};
	tests.testSelectPageDown = function () {
		return doAction("selectPageDown");
	};
	tests.testPageUp = function () {
		return doAction("pageUp");
	};
	tests.testSelectPageUp = function () {
		return doAction("selectPageUp");
	};
	tests.testLineDown = function () {
		return doAction("lineDown", 300);
	};
	tests.testSelectLineDown = function () {
		return doAction("selectLineDown", 300);
	};
	tests.testLineUp = function () {
		return doAction("lineUp", 300);
	};
	tests.testSelectLineUp = function () {
		return doAction("selectLineUp", 300);
	};
	
	tests.testCaretUpDown = function () {
		var d = getDeferred();
		var buffer = "", i;
		for (i = 0; i < 256;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}
		buffer += "\n";
		for (i = 0; i < 256;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}

		var max = 50;
		var view = setupView(buffer, "js");
		var start = new Date().getTime();
		var caretLine = 0;
		function t() {
			if (caretLine === 0) {
				view.invokeAction("lineDown");
				caretLine = 1;
			} else {
				view.invokeAction("lineUp");
				caretLine = 0;
			}
			if (--max > 0) {			
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(CaretUpDown)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	
	tests.testInsertText = function () {
		var d = getDeferred();
		var buffer = "", i;
		for (i = 0; i < 512;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}

		var max = 10;
		var view = setupView(buffer, "js");
		var start = new Date().getTime();
		function t() {
			view.setText("a", 0, 0);
			if (--max > 0) {			
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(InsertText)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	
	tests.testAppendText = function () {
		var d = getDeferred();
		var buffer = "", i;
		for (i = 0; i < 512;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}

		var max = 10;
		var view = setupView(buffer, "js");
		var start = new Date().getTime();
		function t() {
			var charCount = view.getModel().getCharCount();
			view.setText("a", charCount, charCount);
			if (--max > 0) {			
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(AppendText)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	
	tests.testChangeText = function () {
		var d = getDeferred();
		var buffer = "", i;
		for (i = 0; i < 1024;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}

		var max = 10;
		var view = setupView(buffer, "js");
		var offset = 8, insert = false;
		var start = new Date().getTime();
		function t() {
			if (insert) {
				view.setText("f", offset, offset);
			} else {
				view.setText("", offset, offset+1);
			}
			insert = !insert;
			if (--max > 0) {			
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(ChangeText)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	
	tests.testCaretNextPrevious = function () {
		var d = getDeferred();
		var buffer = "", i;
		for (i = 0; i < 256;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}
		buffer += "\n";
		for (i = 0; i < 256;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}

		var max = 30;
		var view = setupView(buffer, "js");
		var start = new Date().getTime();
		var caret = buffer.indexOf("{"), initialCaret = caret;
		view.setCaretOffset(caret);
		function t() {
			if (caret === initialCaret) {
				view.invokeAction("charNext");
				caret++;
			} else {
				view.invokeAction("charPrevious");
				caret--;
			}
			if (--max > 0) {			
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(CaretNextPrevious)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	
	tests.testScrollLeft = function () {
		var d = getDeferred();
		var buffer = "";
		for (var i = 0; i < 1000;i++) {
			buffer += "var id; function() {return 30;} var foo; ";
		}
		var max = 256;
		var view = setupView(buffer, "js");
		var start = new Date().getTime();
		var hscroll = -1;
		function t() {
			var newHscroll = view.getHorizontalPixel();
			if (newHscroll !== hscroll && --max > 0) {			
				hscroll = newHscroll;
				view.setHorizontalPixel(hscroll + 4);
				setTimeout(t, 0);
			} else {
				resolve(d);
				log ("time(setHorizontalPixel)=", (new Date().getTime() - start));
			}
		}
		view.focus();
		t();
		return d;
	};
	tests.testGetLocationAtOffset = function () {
		var d = getDeferred();
		var count = 10;
		var buffer = "";
		for (var i = 0; i < 10;i++) {
			buffer += "var nada for nada function " + i + " ";
		}
		//test hit test without any styles
		var view = setupView(buffer, null);
		view.focus();
		var start = new Date().getTime();
		var length = buffer.length;
		function t() {
			for (var j = 0; j < length;j++) {
				view.getLocationAtOffset(j);
			}
			if (--count > 0) {
				setTimeout(t, 0);
			} else {
				resolve(d);
				log("time(getLocationAtOffset)=" + (new Date().getTime() - start));
			}
		}
		t();
		return d;
	};
	tests.testGetLocationAtOffsetStyled = function () {
		var d = getDeferred();
		var count = 10;
		var buffer = "";
		for (var i = 0; i < 10;i++) {
			buffer += "var nada for nada function " + i + " ";
		}
		//test hit test with styles
		var view = setupView(buffer, "js");
		view.focus();
		var start = new Date().getTime();
		var length = buffer.length;
		function t() {
			for (var j = 0; j < length;j++) {
				view.getLocationAtOffset(j);
			}
			if (--count > 0) {
				setTimeout(t, 0);
			} else {
				resolve(d);
				log("time(getLocationAtOffset)[styled]=" + (new Date().getTime() - start));
			}
		}
		t();
		return d;
	};
	tests.testGetOffsetAtLocation = function () {
		var d = getDeferred();
		var count = 100;
		var buffer = "";
		for (var i = 0; i < 3;i++) {
			buffer += "var nada for nada function " + i + " ";
		}
		//test hit test without any styles
		var view = setupView(buffer, null);
		view.focus();
		var location = view.getLocationAtOffset(buffer.length);
		var start = new Date().getTime();
		function t() {
			for (var j = 0; j < location.x; j++) {
				view.getOffsetAtLocation(j, location.y);
			}
			if (--count > 0) {
				setTimeout(t, 0);
			} else {
				resolve(d);
				log("time(getOffseAtLocation)=" + (new Date().getTime() - start));
			}
		}
		t();
		return d;
	};
	tests.testGetOffsetAtLocationStyled = function () {
		var d = getDeferred();
		var count = 100;
		var buffer = "";
		for (var i = 0; i < 3;i++) {
			buffer += "var nada for nada function " + i + " ";
		}
		//test hit test with styles
		var view = setupView(buffer, "js");
		view.focus();
		var location = view.getLocationAtOffset(buffer.length);
		var start = new Date().getTime();
		function t() {
			for (var j = 0; j < location.x; j++) {
				view.getOffsetAtLocation(j, location.y);
			}
			if (--count > 0) {
				setTimeout(t, 0);
			} else {
				resolve(d);
				log("time(getOffseAtLocation)[styled]=" + (new Date().getTime() - start));
			}
		}
		t();
		return d;
	};
	
	return tests;
});