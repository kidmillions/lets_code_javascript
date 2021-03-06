// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");
	var failFast = require("./fail_fast.js");
	var assert = require("../shared/_assert.js");
	var quixote = require("./vendor/quixote-0.7.0.js");

	var WHITE = "rgb(255, 255, 255)";
	var DARK_GRAY = "rgb(89, 89, 89)";
	var GRAY = "rgb(229, 229, 229)";
	var DARKENED_GRAY = "rgb(217, 217, 217)";
	var MEDIUM_GRAY = "rgb(167, 169, 171)";

	var BACKGROUND_BLUE = "rgb(65, 169, 204)";
	var DARK_BLUE = "rgb(13, 87, 109)";
	var MEDIUM_BLUE = "rgb(0, 121, 156)";
	var DARKENED_MEDIUM_BLUE = "rgb(0, 111, 143)";

	var BODY_TEXT_WEIGHT = "300";
	var JOIN_US_BUTTON_WEIGHT = "400";
	var CLEAR_BUTTON_WEIGHT = "600";
	var HEADLINE_WEIGHT = "600";

	var IOS_BROWSER_WIDTH = 980;
	var IOS_BROWSER_LANDSCAPE_HEIGHT = 661;

	var STANDARD_FONT = "alwyn-new-rounded-web, Helvetica, sans-serif";
	var CORNER_ROUNDING = "2px";
	var BUTTON_DROP_SHADOW = " 0px 1px 0px 0px";

	describe("Home page", function() {
		var frame;
		var page;

		var logo;
		var tagline;
		var drawingAreaArrow;
		var drawingArea;
		var clearButton;
		var footer;
		var joinUs;

		before(function(done) {
			var options = {
				src: "/base/src/client/index.html",
				width: IOS_BROWSER_WIDTH,
				height: IOS_BROWSER_LANDSCAPE_HEIGHT
			};
			frame = quixote.createFrame(options, done);
		});

		after(function() {
			frame.remove();
		});

		beforeEach(function() {
			frame.reset();

			page = frame.page();
			logo = frame.get("#logo");
			tagline = frame.get("#tagline");
			drawingAreaArrow = frame.get("#drawing-area-arrow");
			drawingArea = frame.get("#drawing-area");
			clearButton = frame.get("#clear-button");
			footer = frame.get("#footer");
			joinUs = frame.get("#join-us");
		});

		it("fits perfectly within viewport", function() {
			var viewport = frame.viewport();
			page.assert({
				width: viewport.width,
				height: viewport.height
			});
		});

		it("has a blue background", function() {
			var body = frame.body();
			assert.equal(backgroundColor(body), BACKGROUND_BLUE);
		});

		it("centers logo at top of page", function() {
			logo.assert({
				center: page.center,
				top: 12
			});

			assert.equal(fontWeight(logo), HEADLINE_WEIGHT, "font weight");
			assert.equal(fontSize(logo), "22px", "font size");
			assert.equal(textColor(logo), WHITE, "text color");
		});

		it("centers tagline directly below logo", function() {
			tagline.assert({
				center: page.center,
				top: logo.bottom.plus(5)
			});

			assert.equal(fontFamily(tagline), STANDARD_FONT, "font family");
			assert.equal(fontWeight(tagline), BODY_TEXT_WEIGHT, "font weight");
			assert.equal(fontSize(tagline), "14px", "font size");
			assert.equal(textColor(tagline), DARK_BLUE, "text color");
		});

		it("centers drawing area below tagline", function() {
			drawingArea.assert({
				center: page.center,
				top: tagline.bottom.plus(10),
				width: page.width
			});

			assert.equal(backgroundColor(drawingArea), WHITE, "background color");
			if (browser.supportsBorderRadiusCss()) assert.equal(roundedCorners(drawingArea), CORNER_ROUNDING, "corners");
		});

		it("centers an arrow at top of drawing area", function() {
			drawingAreaArrow.assert({
				center: page.center,
				top: drawingArea.top
			});
			assert.equal(under(drawingAreaArrow, drawingArea), false, "drawing area arrow should be over drawing area");

			assert.equal(backgroundImage(drawingAreaArrow), "/images/arrow.png", "background image");
			assert.equal(drawingAreaArrow.getRawStyle("background-repeat"), "no-repeat", "background repeat");
			assert.equal(backgroundPosition(drawingAreaArrow), "center", "background position");
		});

		it("positions clear screen button at top right of drawing area", function() {
			clearButton.assert({
				top: drawingArea.top.plus(15),
				right: drawingArea.right.minus(15),
				height: 30,
				width: 70
			});
			assert.equal(under(clearButton, drawingArea), false, "clear button should be over drawing area");

			assert.equal(textColor(clearButton), DARK_GRAY, "text color");
			assert.equal(backgroundColor(clearButton), GRAY, "background color");
			//assert.equal(hasBorder(oldClearButton), false);
			//assert.equal(isTextVerticallyCentered(oldClearButton), true);

			assert.equal(fontFamily(clearButton), STANDARD_FONT, "font family");
			assert.equal(fontWeight(clearButton), CLEAR_BUTTON_WEIGHT, "font weight");
			assert.equal(fontSize(clearButton), "12px", "font size");

			if (browser.supportsBorderRadiusCss()) assert.equal(roundedCorners(clearButton), CORNER_ROUNDING);
			//assert.equal(dropShadowOf(oldClearButton), MEDIUM_GRAY + BUTTON_DROP_SHADOW);

			//assert.equal(textIsUnderlined(oldClearButton), false);
			//assert.equal(textIsUppercase(oldClearButton), true);
		});

		function backgroundColor(element) {
			return normalizeColorString(element.getRawStyle("background-color"));
		}

		function fontFamily(element) {
			var family = element.getRawStyle("font-family");
			family = family.replace(/\"/g, '');

			var fonts = family.split(",");
			for (var i = 0; i < fonts.length; i++) {
				fonts[i] = trim(fonts[i]);
			}

			return fonts.join(", ");
		}

		// Based on MDN code at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
		function trim(str) {
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		  return str.replace(rtrim, '');
		}

		function fontWeight(element) {
			var weight = element.getRawStyle("font-weight");
			if (weight === "normal") weight = "400";
			return weight.toString();
		}

		function fontSize(element) {
			return element.getRawStyle("font-size");
		}

		function textColor(element) {
			return normalizeColorString(element.getRawStyle("color"));
		}

		function roundedCorners(element) {
			// We can't just look at border-radius because it returns "" on Firefox and IE 9
			var topLeft = element.getRawStyle("border-top-left-radius");
			var topRight = element.getRawStyle("border-top-right-radius");
			var bottomLeft = element.getRawStyle("border-bottom-left-radius");
			var bottomRight = element.getRawStyle("border-bottom-right-radius");

			if (topLeft === topRight && topLeft === bottomLeft && topLeft === bottomRight) return topLeft;
			else return topLeft + " " + topRight + " " + bottomRight + " " + bottomLeft;
		}

		function under(element, relativeToElement) {
			var elementZ = getZIndex(element);
			var relativeZ = getZIndex(relativeToElement);

			if (elementZ === relativeZ) return !isElementAfterElementInDomTree();
			else return (elementZ < relativeZ);

			function getZIndex(element) {
				var z = element.getRawStyle("z-index");
				if (z === "auto") z = 0;
				return z;
			}

			function isElementAfterElementInDomTree() {
				var elementNode = element.toDomElement();
				var relativeNode = relativeToElement.toDomElement();

				var foundRelative = false;
				var elementAfterRelative = false;
				for (var child = elementNode.parentNode.firstChild; child !== null; child = child.nextSibling) {
					if (child === elementNode) {
						if (foundRelative) elementAfterRelative = true;
					}
					if (child === relativeNode) foundRelative = true;
				}
				failFast.unlessTrue(foundRelative, "can't yet compare elements that have same z-index and are not siblings");
				return elementAfterRelative;
			}
		}

		function backgroundImage(element) {
			var url = element.getRawStyle("background-image");

			var parsedUrl = url.match(/^url\("?http:\/\/(.+?)(\/.*?)"?\)$/);    // strip off domain
			if (parsedUrl === null) throw new Error("could not parse URL: " + url);

			return parsedUrl[2];
		}

		function backgroundPosition(element) {
			var position = element.getRawStyle("background-position");

			if (position === "" || position === "50%" || position === "50% 50%") return "center";
			else return position;
		}

	});

	describe("Home page (old tests)", function() {
		if (browser.doesNotComputeStyles()) return;

		var oldFrame;
		var oldFrameDom;

		var oldLogo;
		var oldTagline;
		var oldDrawingAreaArrow;
		var oldDrawingArea;
		var oldClearButton;
		var oldFooter;
		var oldJoinUs;


		before(function(done) {
			oldFrame = HtmlElement.fromHtml("<iframe width='1200px' height='1000px' src='/base/src/client/index.html'></iframe>");
			oldFrameDom = oldFrame.toDomElement();
			oldFrameDom.addEventListener("load", function() {
				oldLogo = getElement("logo");
				oldTagline = getElement("tagline");
				oldDrawingAreaArrow = getElement("drawing-area-arrow");
				oldDrawingArea = getElement("drawing-area");
				oldClearButton = getElement("clear-button");
				oldFooter = getElement("footer");
				oldJoinUs = getElement("join-us");

				done();
			});
			oldFrame.appendSelfToBody();
		});

		after(function() {
			oldFrame.remove();
		});

		function getElement(id) {
			return oldFrameDom.contentDocument.getElementById(id);
		}

		it("darkens the 'clear' button when the user hovers over it", function() {
			applyClass(oldClearButton, "_hover_", function() {
				assert.equal(oldBackgroundColorOf(oldClearButton), DARKENED_GRAY);
			});
		});

		it("'clear' button appears to depress when user activates it", function() {
			applyClass(oldClearButton, "_active_", function() {
				assert.equal(elementPixelsOverlappingTopOfElement(oldClearButton, oldDrawingArea), 16);
				assert.equal(dropShadowOf(oldClearButton), "none");
			});
		});

		it("centers footer below the drawing area", function() {
			assert.equal(isContentCenteredInPage(oldFooter), true);
			assert.equal(elementPixelsBelowElement(oldFooter, oldDrawingArea), 13);

			assert.equal(fontFamilyOf(oldFooter), STANDARD_FONT);
			assert.equal(fontWeightOf(oldFooter), BODY_TEXT_WEIGHT);
			assert.equal(fontSizeOf(oldFooter), "15px");
			assert.equal(textColorOf(oldFooter), WHITE);
		});

		it("centers 'join us' button below footer", function() {
			assert.equal(isContentCenteredInPage(oldJoinUs), true);
			assert.equal(elementPixelsBelowElement(oldJoinUs, oldFooter), 13);

			assert.equal(textColorOf(oldJoinUs), WHITE);
			assert.equal(oldBackgroundColorOf(oldJoinUs), MEDIUM_BLUE);

			assert.equal(fontFamilyOf(oldJoinUs), STANDARD_FONT);
			assert.equal(fontWeightOf(oldJoinUs), JOIN_US_BUTTON_WEIGHT);
			assert.equal(fontSizeOf(oldJoinUs), "16px");

			assert.equal(elementHeightInPixels(oldJoinUs), 35);
			assert.equal(elementWidthInPixels(oldJoinUs), 175);
			assert.equal(isTextVerticallyCentered(oldJoinUs), true);

			assert.equal(roundedCornersOf(oldJoinUs), CORNER_ROUNDING);
			assert.equal(dropShadowOf(oldJoinUs), DARK_BLUE + BUTTON_DROP_SHADOW);

			assert.equal(textIsUnderlined(oldJoinUs), false);
			assert.equal(textIsUppercase(oldJoinUs), true);
		});

		it("darkens the 'join us' button when the user hovers over it", function() {
			applyClass(oldJoinUs, "_hover_", function() {
				assert.equal(oldBackgroundColorOf(oldJoinUs), DARKENED_MEDIUM_BLUE);
			});
		});

		it("'join us' button appears to depress when user activates it", function() {
			applyClass(oldJoinUs, "_active_", function() {
				assert.equal(elementPixelsBelowElement(oldJoinUs, oldFooter), 14);
				assert.equal(dropShadowOf(oldJoinUs), "none");
			});
		});

		function isContentCenteredInPage(domElement) {
			if (!isElementCenteredInPage(domElement)) return false;

			var style = window.getComputedStyle(domElement);
			var textAlign = style.getPropertyValue("text-align");

			return textAlign === "center";
		}

		function isElementCenteredInPage(domElement) {
			var frameBody = oldFrameDom.contentDocument.body;

			var bodyStyle = oldFrameDom.contentWindow.getComputedStyle(frameBody);
			var bodyLeftMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-left"));
			var bodyRightMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-right"));

			// We can't just base the document width on the frame width because that doesn't account for scroll bars.
			var bodyBoundingBox = frameBody.getBoundingClientRect();
			var documentLeft = bodyBoundingBox.left - bodyLeftMarginWidth;
			var documentRight = bodyBoundingBox.right + bodyRightMarginWidth;

			var elementBoundingBox = getBoundingBox(domElement);
			var elementLeft = elementBoundingBox.left;
			var elementRight = elementBoundingBox.right;

			var documentCenter = (documentRight - documentLeft) / 2;
			var elementCenter = elementLeft + ((elementRight - elementLeft) / 2);

//			console.log("*** CENTER: element width", elementBoundingBox.width);
//			console.log("documentLeft", documentLeft);
//			console.log("documentRight", documentRight);
//			console.log("elementLeft", elementLeft);
//			console.log("elementRight", elementRight);
//			console.log("documentCenter", documentCenter);
//			console.log("elementCenter", elementCenter);

			var offset = Math.abs(documentCenter - elementCenter);
			var success = (offset <= 0.5);

//			console.log(success ? "✔ SUCCESS" : "✘ FAILURE");

			return success;
		}

		function elementPixelsFromTopOfPage(domElement) {
			return getBoundingBox(domElement).top;
		}

		function elementHeightInPixels(domElement) {
			return getBoundingBox(domElement).height;
		}

		function elementWidthInPixels(domElement) {
			return getBoundingBox(domElement).width;
		}

		function elementPixelsBelowElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domElement).top - getBoundingBox(domRelativeToElement).bottom);
		}

		function elementPixelsOverlappingTopOfElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domElement).top - getBoundingBox(domRelativeToElement).top);
		}

		function elementPixelsOverlappingRightOfElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domRelativeToElement).right - getBoundingBox(domElement).right);
		}

		function isElementBehindElement(domElement, domRelativeToElement) {
			var elementZ = getZIndex(domElement);
			var relativeZ = getZIndex(domRelativeToElement);

			if (elementZ === relativeZ) return !isElementAfterElementInDomTree();
			else return (elementZ < relativeZ);

			function getZIndex(domElement) {
				var z = getComputedProperty(domElement, "z-index");
				if (z === "auto") z = 0;
				return z;
			}

			function isElementAfterElementInDomTree() {
				var elementNode = domElement;
				var relativeNode = domRelativeToElement;
				var foundRelative = false;
				var elementAfterRelative = false;
				for (var child = elementNode.parentNode.firstChild; child !== null; child = child.nextSibling) {
					if (child === elementNode) {
						if (foundRelative) elementAfterRelative = true;
					}
					if (child === relativeNode) foundRelative = true;
				}
				failFast.unlessTrue(foundRelative, "can't yet compare elements that have same z-index and are not siblings");
				return elementAfterRelative;
			}
		}

		function isTextVerticallyCentered(domElement) {
			var elementHeight = getBoundingBox(domElement).height;
			var lineHeight = getComputedProperty(domElement, "line-height");

			return elementHeight + "px" === lineHeight;
		}

		function oldBackgroundColorOf(domElement) {
			return getComputedProperty(domElement, "background-color");
		}

		function fontFamilyOf(domElement) {
			var family = getComputedProperty(domElement, "font-family");
			family = family.replace(/\"/g, '');

			var fonts = family.split(",").map(function(font) {
				return font.trim();
			});

			return fonts.join(", ");
		}

		function fontWeightOf(domElement) {
			var weight = getComputedProperty(domElement, "font-weight");
			if (weight === "normal") weight = "400";
			return weight;
		}

		function fontSizeOf(domElement) {
			return getComputedProperty(domElement, "font-size");
		}

		function textColorOf(domElement) {
			return getComputedProperty(domElement, "color");
		}

		function hasBorder(domElement) {
			var top = getComputedProperty(domElement, "border-top-style");
			var right = getComputedProperty(domElement, "border-right-style");
			var bottom = getComputedProperty(domElement, "border-bottom-style");
			var left = getComputedProperty(domElement, "border-left-style");
			return !(top === "none" && right === "none" && bottom === "none" && left === "none");
		}

		function textIsUnderlined(domElement) {
			var style = getComputedProperty(domElement, "text-decoration");
			return style.indexOf("none") !== 0;
		}

		function textIsUppercase(domElement) {
			return getComputedProperty(domElement, "text-transform") === "uppercase";
		}

		function roundedCornersOf(domElement) {
			// We can't just look at border-radius because it returns "" on Firefox and IE 9
			var topLeft = getComputedProperty(domElement, "border-top-left-radius");
			var topRight = getComputedProperty(domElement, "border-top-right-radius");
			var bottomLeft = getComputedProperty(domElement, "border-bottom-left-radius");
			var bottomRight = getComputedProperty(domElement, "border-bottom-right-radius");

			if (topLeft === topRight && topLeft === bottomLeft && topLeft === bottomRight) return topLeft;
			else return topLeft + " " + topRight + " " + bottomRight + " " + bottomLeft;
		}

		function dropShadowOf(domElement) {
			var shadow = getComputedProperty(domElement, "box-shadow");

			// When there is no drop shadow, most browsers say 'none', but IE 9 gives a color and nothing else.
			// We handle that case here.
			if (shadow === "white") return "none";
			if (shadow.match(/^#[0-9a-f]{6}$/)) return "none";      // look for '#' followed by six hex digits

			// The standard value seems to be "rgb(r, g, b) Wpx Xpx Ypx Zpx",
			// but IE 9 gives us "Wpx Xpx Ypx Zpx #rrggbb". We need to normalize it.
			// BTW, we don't support multiple shadows yet
			var groups = shadow.match(/^([^#]+) (#......)/);   // get everything before the '#' and the r, g, b
			if (groups === null) return shadow;   // There was no '#', so we assume we're not on IE 9 and everything's fine

			return normalizeColorString(groups[2]) + " " + groups[1];
		}

		function getBoundingBox(domElement) {
			return domElement.getBoundingClientRect();
		}

		function getComputedProperty(domElement, propertyName) {
			var style = window.getComputedStyle(domElement);
			return style.getPropertyValue(propertyName);
		}

		function applyClass(domElement, className, fn) {
			var oldClassName = domElement.className;
			try {
				domElement.className += className;
				forceReflow(domElement);

				fn();
			}
			finally {
				domElement.className = oldClassName;
				forceReflow(domElement);
			}
		}

		function forceReflow(domElement) {
			var makeLintHappy = domElement.offsetHeight;
		}

		function pixelsToInt(pixels) {
			return parseInt(pixels, 10);
		}

	});

	function normalizeColorString(color) {
		if (color === "white") return "rgb(255, 255, 255)";

		var colorGroups = color.match(/^#(..)(..)(..)/);    // look for presence of #rrggbb string
		if (colorGroups === null) return color;   // if doesn't match, assume we have rgb() string

		var r = parseInt(colorGroups[1], 16);
		var g = parseInt(colorGroups[2], 16);
		var b = parseInt(colorGroups[3], 16);
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}

}());
