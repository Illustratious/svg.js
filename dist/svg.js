/*!
* SVG.js - A lightweight library for manipulating and animating SVG.
* @version 1.0.0-rc.10
* http://www.svgjs.com
*
* @copyright Wout Fierens <wout@impinc.co.uk>
* @license MIT
*
* BUILT: Tue Jul 22 2014 13:34:24 GMT+0200 (CEST)
*/
;(function() {

// The main wrapping element
var SVG = this.SVG = function(element) {
  if (SVG.supported) {
    element = new SVG.Doc(element)

    if (!SVG.parser)
      SVG.prepare(element)

    return element
  }
}

// Default namespaces
SVG.ns    = 'http://www.w3.org/2000/svg'
SVG.xmlns = 'http://www.w3.org/2000/xmlns/'
SVG.xlink = 'http://www.w3.org/1999/xlink'

// Element id sequence
SVG.did  = 1000

// Get next named element id
SVG.eid = function(name) {
  return 'Svgjs' + capitalize(name) + (SVG.did++)
}

// Method for element creation
SVG.create = function(name) {
  /* create element */
  var element = document.createElementNS(this.ns, name)
  
  /* apply unique id */
  element.setAttribute('id', this.eid(name))
  
  return element
}

// Method for extending objects
SVG.extend = function() {
  var modules, methods, key, i
  
  /* get list of modules */
  modules = [].slice.call(arguments)
  
  /* get object with extensions */
  methods = modules.pop()
  
  for (i = modules.length - 1; i >= 0; i--)
    if (modules[i])
      for (key in methods)
        modules[i].prototype[key] = methods[key]

  /* make sure SVG.Set inherits any newly added methods */
  if (SVG.Set && SVG.Set.inherit)
    SVG.Set.inherit()
}

// Initialize parsing element
SVG.prepare = function(element) {
  /* select document body and create invisible svg element */
  var body = document.getElementsByTagName('body')[0]
    , draw = (body ? new SVG.Doc(body) : element.nested()).size(2, 0)
    , path = SVG.create('path')

  /* insert parsers */
  draw.node.appendChild(path)

  /* create parser object */
  SVG.parser = {
    body: body || element.parent()
  , draw: draw.style('opacity:0;position:fixed;left:100%;top:100%;overflow:hidden')
  , poly: draw.polyline().node
  , path: path
  }
}

// svg support test
SVG.supported = (function() {
  return !! document.createElementNS &&
         !! document.createElementNS(SVG.ns,'svg').createSVGRect
})()

if (!SVG.supported) return false

// Invent new element
SVG.invent = function(config) {
	/* create element initializer */
	var initializer = typeof config.create == 'function' ?
		config.create :
		function() {
			this.constructor.call(this, SVG.create(config.create))
		}

	/* inherit prototype */
	if (config.inherit)
		initializer.prototype = new config.inherit

	/* extend with methods */
	if (config.extend)
		SVG.extend(initializer, config.extend)

	/* attach construct method to parent */
	if (config.construct)
		SVG.extend(config.parent || SVG.Container, config.construct)

	return initializer
}
// Adopt existing svg elements
SVG.adopt = function(node) {
  // Make sure a node isn't already adopted
  if (node.instance) return node.instance

  // Initialize variables
  var element

  // Adopt with element-specific settings
  if (node.nodeName == 'svg')
    element = node.parentNode instanceof SVGElement ? new SVG.Nested : new SVG.Doc
  else if (node.nodeName == 'lineairGradient')
    element = new SVG.Gradient('lineair')
  else if (node.nodeName == 'radialGradient')
    element = new SVG.Gradient('radial')
  else if (SVG[capitalize(node.nodeName)])
    element = new SVG[capitalize(node.nodeName)]
  else
    element = new SVG.Element(node)

  // Ensure references
  element.type  = node.nodeName
  element.node  = node
  node.instance = element

  // SVG.Class specific preparations
  if (element instanceof SVG.Doc)
    element.namespace().defs()

  return element
}
// Storage for regular expressions
SVG.regex = {
  /* parse unit value */
  unit:             /^(-?[\d\.]+)([a-z%]{0,2})$/
  
  /* parse hex value */
, hex:              /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
  
  /* parse rgb value */
, rgb:              /rgb\((\d+),(\d+),(\d+)\)/
  
  /* parse reference id */
, reference:        /#([a-z0-9\-_]+)/i

  /* test hex value */
, isHex:            /^#[a-f0-9]{3,6}$/i
  
  /* test rgb value */
, isRgb:            /^rgb\(/
  
  /* test css declaration */
, isCss:            /[^:]+:[^;]+;?/
  
  /* test for blank string */
, isBlank:          /^(\s+)?$/
  
  /* test for numeric string */
, isNumber:         /^-?[\d\.]+$/

  /* test for percent value */
, isPercent:        /^-?[\d\.]+%$/

  /* test for image url */
, isImage:          /\.(jpg|jpeg|png|gif)(\?[^=]+.*)?/i
  
  /* test for namespaced event */
, isEvent:          /^[\w]+:[\w]+$/

}
SVG.utils = {
  // Map function
  map: function(array, block) {
    var i
      , il = array.length
      , result = []

    for (i = 0; i < il; i++)
      result.push(block(array[i]))
    
    return result
  }

  // Degrees to radians
, radians: function(d) {
		return d % 360 * Math.PI / 180
	}
	// Radians to degrees
, degrees: function(r) {
		return r * 180 / Math.PI % 360
	}

}

SVG.defaults = {
  // Default attribute values
  attrs: {
    /* fill and stroke */
    'fill-opacity':     1
  , 'stroke-opacity':   1
  , 'stroke-width':     0
  , 'stroke-linejoin':  'miter'
  , 'stroke-linecap':   'butt'
  , fill:               '#000000'
  , stroke:             '#000000'
  , opacity:            1
    /* position */
  , x:                  0
  , y:                  0
  , cx:                 0
  , cy:                 0
    /* size */  
  , width:              0
  , height:             0
    /* radius */  
  , r:                  0
  , rx:                 0
  , ry:                 0
    /* gradient */  
  , offset:             0
  , 'stop-opacity':     1
  , 'stop-color':       '#000000'
    /* text */
  , 'font-size':        16
  , 'font-family':      'Helvetica, Arial, sans-serif'
  , 'text-anchor':      'start'
  }
  
}
// Module for color convertions
SVG.Color = function(color) {
  var match
  
  /* initialize defaults */
  this.r = 0
  this.g = 0
  this.b = 0
  
  /* parse color */
  if (typeof color === 'string') {
    if (SVG.regex.isRgb.test(color)) {
      /* get rgb values */
      match = SVG.regex.rgb.exec(color.replace(/\s/g,''))
      
      /* parse numeric values */
      this.r = parseInt(match[1])
      this.g = parseInt(match[2])
      this.b = parseInt(match[3])
      
    } else if (SVG.regex.isHex.test(color)) {
      /* get hex values */
      match = SVG.regex.hex.exec(fullHex(color))

      /* parse numeric values */
      this.r = parseInt(match[1], 16)
      this.g = parseInt(match[2], 16)
      this.b = parseInt(match[3], 16)

    }
    
  } else if (typeof color === 'object') {
    this.r = color.r
    this.g = color.g
    this.b = color.b
    
  }
    
}

SVG.extend(SVG.Color, {
  // Default to hex conversion
  toString: function() {
    return this.toHex()
  }
  // Build hex value
, toHex: function() {
    return '#'
      + compToHex(this.r)
      + compToHex(this.g)
      + compToHex(this.b)
  }
  // Build rgb value
, toRgb: function() {
    return 'rgb(' + [this.r, this.g, this.b].join() + ')'
  }
  // Calculate true brightness
, brightness: function() {
    return (this.r / 255 * 0.30)
         + (this.g / 255 * 0.59)
         + (this.b / 255 * 0.11)
  }
  // Make color morphable
, morph: function(color) {
    this.destination = new SVG.Color(color)

    return this
  }
  // Get morphed color at given position
, at: function(pos) {
    /* make sure a destination is defined */
    if (!this.destination) return this

    /* normalise pos */
    pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

    /* generate morphed color */
    return new SVG.Color({
      r: ~~(this.r + (this.destination.r - this.r) * pos)
    , g: ~~(this.g + (this.destination.g - this.g) * pos)
    , b: ~~(this.b + (this.destination.b - this.b) * pos)
    })
  }
  
})

// Testers

// Test if given value is a color string
SVG.Color.test = function(color) {
  color += ''
  return SVG.regex.isHex.test(color)
      || SVG.regex.isRgb.test(color)
}

// Test if given value is a rgb object
SVG.Color.isRgb = function(color) {
  return color && typeof color.r == 'number'
               && typeof color.g == 'number'
               && typeof color.b == 'number'
}

// Test if given value is a color
SVG.Color.isColor = function(color) {
  return SVG.Color.isRgb(color) || SVG.Color.test(color)
}
// Module for array conversion
SVG.Array = function(array, fallback) {
  array = (array || []).valueOf()

  /* if array is empty and fallback is provided, use fallback */
  if (array.length == 0 && fallback)
    array = fallback.valueOf()

  /* parse array */
  this.value = this.parse(array)
}

SVG.extend(SVG.Array, {
  // Make array morphable
  morph: function(array) {
    this.destination = this.parse(array)

    /* normalize length of arrays */
    if (this.value.length != this.destination.length) {
      var lastValue       = this.value[this.value.length - 1]
        , lastDestination = this.destination[this.destination.length - 1]

      while(this.value.length > this.destination.length)
        this.destination.push(lastDestination)
      while(this.value.length < this.destination.length)
        this.value.push(lastValue)
    }

    return this
  }
  // Clean up any duplicate points
, settle: function() {
    /* find all unique values */
    for (var i = 0, il = this.value.length, seen = []; i < il; i++)
      if (seen.indexOf(this.value[i]) == -1)
        seen.push(this.value[i])

    /* set new value */
    return this.value = seen
  }
  // Get morphed array at given position
, at: function(pos) {
    /* make sure a destination is defined */
    if (!this.destination) return this

    /* generate morphed array */
    for (var i = 0, il = this.value.length, array = []; i < il; i++)
      array.push(this.value[i] + (this.destination[i] - this.value[i]) * pos)

    return new SVG.Array(array)
  }
  // Convert array to string
, toString: function() {
    return this.value.join(' ')
  }
  // Real value
, valueOf: function() {
    return this.value
  }
  // Parse whitespace separated string
, parse: function(array) {
    array = array.valueOf()

    /* if already is an array, no need to parse it */
    if (Array.isArray(array)) return array

    return this.split(array)
  }
  // Strip unnecessary whitespace
, split: function(string) {
    return string.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g,'').split(' ') 
  }
  // Reverse array
, reverse: function() {
    this.value.reverse()

    return this
  }

})
// Poly points array
SVG.PointArray = function(array, fallback) {
  this.constructor.call(this, array, fallback || [[0,0]])
}

// Inherit from SVG.Array
SVG.PointArray.prototype = new SVG.Array

SVG.extend(SVG.PointArray, {
  // Convert array to string
  toString: function() {
    /* convert to a poly point string */
    for (var i = 0, il = this.value.length, array = []; i < il; i++)
      array.push(this.value[i].join(','))

    return array.join(' ')
  }
  // Convert array to line object
, toLine: function() {
    return {
      x1: this.value[0][0]
    , y1: this.value[0][1]
    , x2: this.value[1][0]
    , y2: this.value[1][1]
    }
  }
  // Get morphed array at given position
, at: function(pos) {
    /* make sure a destination is defined */
    if (!this.destination) return this

    /* generate morphed point string */
    for (var i = 0, il = this.value.length, array = []; i < il; i++)
      array.push([
        this.value[i][0] + (this.destination[i][0] - this.value[i][0]) * pos
      , this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos
      ])

    return new SVG.PointArray(array)
  }
  // Parse point string
, parse: function(array) {
    array = array.valueOf()

    /* if already is an array, no need to parse it */
    if (Array.isArray(array)) return array

    /* split points */
    array = this.split(array)

    /* parse points */
    for (var i = 0, il = array.length, p, points = []; i < il; i++) {
      p = array[i].split(',')
      points.push([parseFloat(p[0]), parseFloat(p[1])])
    }

    return points
  }
  // Move point string
, move: function(x, y) {
    var box = this.bbox()

    /* get relative offset */
    x -= box.x
    y -= box.y

    /* move every point */
    if (!isNaN(x) && !isNaN(y))
      for (var i = this.value.length - 1; i >= 0; i--)
        this.value[i] = [this.value[i][0] + x, this.value[i][1] + y]

    return this
  }
  // Resize poly string
, size: function(width, height) {
    var i, box = this.bbox()

    /* recalculate position of all points according to new size */
    for (i = this.value.length - 1; i >= 0; i--) {
      this.value[i][0] = ((this.value[i][0] - box.x) * width)  / box.width  + box.x
      this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.y
    }

    return this
  }
  // Get bounding box of points
, bbox: function() {
    SVG.parser.poly.setAttribute('points', this.toString())

    return SVG.parser.poly.getBBox()
  }

})
// Path points array
SVG.PathArray = function(array, fallback) {
  this.constructor.call(this, array, fallback || [['M', 0, 0]])
}

// Inherit from SVG.Array
SVG.PathArray.prototype = new SVG.Array

SVG.extend(SVG.PathArray, {
  // Convert array to string
  toString: function() {
    return arrayToString(this.value)
  }
  // Move path string
, move: function(x, y) {
		/* get bounding box of current situation */
		var box = this.bbox()
		
    /* get relative offset */
    x -= box.x
    y -= box.y

    if (!isNaN(x) && !isNaN(y)) {
      /* move every point */
      for (var l, i = this.value.length - 1; i >= 0; i--) {
        l = this.value[i][0]

        if (l == 'M' || l == 'L' || l == 'T')  {
          this.value[i][1] += x
          this.value[i][2] += y

        } else if (l == 'H')  {
          this.value[i][1] += x

        } else if (l == 'V')  {
          this.value[i][1] += y

        } else if (l == 'C' || l == 'S' || l == 'Q')  {
          this.value[i][1] += x
          this.value[i][2] += y
          this.value[i][3] += x
          this.value[i][4] += y

          if (l == 'C')  {
            this.value[i][5] += x
            this.value[i][6] += y
          }

        } else if (l == 'A')  {
          this.value[i][6] += x
          this.value[i][7] += y
        }

      }
    }

    return this
  }
  // Resize path string
, size: function(width, height) {
		/* get bounding box of current situation */
		var i, l, box = this.bbox()

    /* recalculate position of all points according to new size */
    for (i = this.value.length - 1; i >= 0; i--) {
      l = this.value[i][0]

      if (l == 'M' || l == 'L' || l == 'T')  {
        this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
        this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y

      } else if (l == 'H')  {
        this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x

      } else if (l == 'V')  {
        this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.y

      } else if (l == 'C' || l == 'S' || l == 'Q')  {
        this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
        this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y
        this.value[i][3] = ((this.value[i][3] - box.x) * width)  / box.width  + box.x
        this.value[i][4] = ((this.value[i][4] - box.y) * height) / box.height + box.y

        if (l == 'C')  {
          this.value[i][5] = ((this.value[i][5] - box.x) * width)  / box.width  + box.x
          this.value[i][6] = ((this.value[i][6] - box.y) * height) / box.height + box.y
        }

      } else if (l == 'A')  {
        /* resize radii */
        this.value[i][1] = (this.value[i][1] * width)  / box.width
        this.value[i][2] = (this.value[i][2] * height) / box.height

        /* move position values */
        this.value[i][6] = ((this.value[i][6] - box.x) * width)  / box.width  + box.x
        this.value[i][7] = ((this.value[i][7] - box.y) * height) / box.height + box.y
      }

    }

    return this
  }
  // Absolutize and parse path to array
, parse: function(array) {
    /* if it's already is a patharray, no need to parse it */
    if (array instanceof SVG.PathArray) return array.valueOf()

    /* prepare for parsing */
    var i, il, x0, y0, x1, y1, x2, y2, s, seg, segs
      , x = 0
      , y = 0
    
    /* populate working path */
    SVG.parser.path.setAttribute('d', typeof array === 'string' ? array : arrayToString(array))
    
    /* get segments */
    segs = SVG.parser.path.pathSegList

    for (i = 0, il = segs.numberOfItems; i < il; ++i) {
      seg = segs.getItem(i)
      s = seg.pathSegTypeAsLetter

      /* yes, this IS quite verbose but also about 30 times faster than .test() with a precompiled regex */
      if (s == 'M' || s == 'L' || s == 'H' || s == 'V' || s == 'C' || s == 'S' || s == 'Q' || s == 'T' || s == 'A') {
        if ('x' in seg) x = seg.x
        if ('y' in seg) y = seg.y

      } else {
        if ('x1' in seg) x1 = x + seg.x1
        if ('x2' in seg) x2 = x + seg.x2
        if ('y1' in seg) y1 = y + seg.y1
        if ('y2' in seg) y2 = y + seg.y2
        if ('x'  in seg) x += seg.x
        if ('y'  in seg) y += seg.y

        if (s == 'm')
          segs.replaceItem(SVG.parser.path.createSVGPathSegMovetoAbs(x, y), i)
        else if (s == 'l')
          segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoAbs(x, y), i)
        else if (s == 'h')
          segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoHorizontalAbs(x), i)
        else if (s == 'v')
          segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoVerticalAbs(y), i)
        else if (s == 'c')
          segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i)
        else if (s == 's')
          segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i)
        else if (s == 'q')
          segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i)
        else if (s == 't')
          segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i)
        else if (s == 'a')
          segs.replaceItem(SVG.parser.path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i)
        else if (s == 'z' || s == 'Z') {
          x = x0
          y = y0
        }
      }

      /* record the start of a subpath */
      if (s == 'M' || s == 'm') {
        x0 = x
        y0 = y
      }
    }

    /* build internal representation */
    array = []
    segs  = SVG.parser.path.pathSegList
    
    for (i = 0, il = segs.numberOfItems; i < il; ++i) {
      seg = segs.getItem(i)
      s = seg.pathSegTypeAsLetter
      x = [s]

      if (s == 'M' || s == 'L' || s == 'T')
        x.push(seg.x, seg.y)
      else if (s == 'H')
        x.push(seg.x)
      else if (s == 'V')
        x.push(seg.y)
      else if (s == 'C')
        x.push(seg.x1, seg.y1, seg.x2, seg.y2, seg.x, seg.y)
      else if (s == 'S')
        x.push(seg.x2, seg.y2, seg.x, seg.y)
      else if (s == 'Q')
        x.push(seg.x1, seg.y1, seg.x, seg.y)
      else if (s == 'A')
        x.push(seg.r1, seg.r2, seg.angle, seg.largeArcFlag | 0, seg.sweepFlag | 0, seg.x, seg.y)

      /* store segment */
      array.push(x)
    }
    
    return array
  }
  // Get bounding box of path
, bbox: function() {
    SVG.parser.path.setAttribute('d', this.toString())

    return SVG.parser.path.getBBox()
  }

})
// Module for unit convertions
SVG.Number = function(value) {

  /* initialize defaults */
  this.value = 0
  this.unit = ''

  /* parse value */
  if (typeof value === 'number') {
    /* ensure a valid numeric value */
    this.value = isNaN(value) ? 0 : !isFinite(value) ? (value < 0 ? -3.4e+38 : +3.4e+38) : value

  } else if (typeof value === 'string') {
    var match = value.match(SVG.regex.unit)

    if (match) {
      /* make value numeric */
      this.value = parseFloat(match[1])
    
      /* normalize percent value */
      if (match[2] == '%')
        this.value /= 100
      else if (match[2] == 's')
        this.value *= 1000
    
      /* store unit */
      this.unit = match[2]
    }

  } else {
    if (value instanceof SVG.Number) {
      this.value = value.value
      this.unit  = value.unit
    }
  }

}

SVG.extend(SVG.Number, {
  // Stringalize
  toString: function() {
    return (
      this.unit == '%' ?
        ~~(this.value * 1e8) / 1e6:
      this.unit == 's' ?
        this.value / 1e3 :
        this.value
    ) + this.unit
  }
, // Convert to primitive
  valueOf: function() {
    return this.value
  }
  // Add number
, plus: function(number) {
    this.value = this + new SVG.Number(number)

    return this
  }
  // Subtract number
, minus: function(number) {
    return this.plus(-new SVG.Number(number))
  }
  // Multiply number
, times: function(number) {
    this.value = this * new SVG.Number(number)

    return this
  }
  // Divide number
, divide: function(number) {
    this.value = this / new SVG.Number(number)

    return this
  }
  // Convert to different unit
, to: function(unit) {
    if (typeof unit === 'string')
      this.unit = unit

    return this
  }
  // Make number morphable
, morph: function(number) {
    this.destination = new SVG.Number(number)

    return this
  }
  // Get morphed number at given position
, at: function(pos) {
    /* make sure a destination is defined */
    if (!this.destination) return this

    /* generate new morphed number */
    return new SVG.Number(this.destination)
        .minus(this)
        .times(pos)
        .plus(this)
  }

})

SVG.ViewBox = function(element) {
  var x, y, width, height
    , wm   = 1 /* width multiplier */
    , hm   = 1 /* height multiplier */
    , box  = element.bbox()
    , view = (element.attr('viewBox') || '').match(/-?[\d\.]+/g)
    , we   = element
    , he   = element

  /* get dimensions of current node */
  width  = new SVG.Number(element.width())
  height = new SVG.Number(element.height())

  /* find nearest non-percentual dimensions */
  while (width.unit == '%') {
    wm *= width.value
    width = new SVG.Number(we instanceof SVG.Doc ? we.parent().offsetWidth : we.parent().width())
    we = we.parent()
  }
  while (height.unit == '%') {
    hm *= height.value
    height = new SVG.Number(he instanceof SVG.Doc ? he.parent().offsetHeight : he.parent().height())
    he = he.parent()
  }
  
  /* ensure defaults */
  this.x      = box.x
  this.y      = box.y
  this.width  = width  * wm
  this.height = height * hm
  this.zoom   = 1
  
  if (view) {
    /* get width and height from viewbox */
    x      = parseFloat(view[0])
    y      = parseFloat(view[1])
    width  = parseFloat(view[2])
    height = parseFloat(view[3])
    
    /* calculate zoom accoring to viewbox */
    this.zoom = ((this.width / this.height) > (width / height)) ?
      this.height / height :
      this.width  / width

    /* calculate real pixel dimensions on parent SVG.Doc element */
    this.x      = x
    this.y      = y
    this.width  = width
    this.height = height
    
  }
  
}

//
SVG.extend(SVG.ViewBox, {
  // Parse viewbox to string
  toString: function() {
    return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height
  }
  
})

SVG.Element = SVG.invent({
  // Initialize node
  create: function(node) {
    // Make stroke value accessible dynamically
    this._stroke = SVG.defaults.attrs.stroke

    // Create circular reference
    if (this.node = node) {
      this.type = node.nodeName
      this.node.instance = this

      // Store current attribute value
      this._stroke = node.getAttribute('stroke') || this._stroke
    }
  }

  // Add class methods
, extend: {
    // Move over x-axis
    x: function(x) {
      if (x != null) {
        x = new SVG.Number(x)
        x.value /= this.transform('scaleX')
      }
      return this.attr('x', x)
    }
    // Move over y-axis
  , y: function(y) {
      if (y != null) {
        y = new SVG.Number(y)
        y.value /= this.transform('scaleY')
      }
      return this.attr('y', y)
    }
    // Move by center over x-axis
  , cx: function(x) {
      return x == null ? this.x() + this.width() / 2 : this.x(x - this.width() / 2)
    }
    // Move by center over y-axis
  , cy: function(y) {
      return y == null ? this.y() + this.height() / 2 : this.y(y - this.height() / 2)
    }
    // Move element to given x and y values
  , move: function(x, y) {
      return this.x(x).y(y)
    }
    // Move element by its center
  , center: function(x, y) {
      return this.cx(x).cy(y)
    }
    // Set width of element
  , width: function(width) {
      return this.attr('width', width)
    }
    // Set height of element
  , height: function(height) {
      return this.attr('height', height)
    }
    // Set element size to given width and height
  , size: function(width, height) {
      var p = proportionalSize(this.bbox(), width, height)

      return this
        .width(new SVG.Number(p.width))
        .height(new SVG.Number(p.height))
    }
    // Clone element
  , clone: function() {
      return assignNewId(this.node.cloneNode(true))
    }
    // Remove element
  , remove: function() {
      if (this.parent())
        this.parent().removeElement(this)
      
      return this
    }
    // Replace element
  , replace: function(element) {
      this.after(element).remove()

      return element
    }
    // Add element to given container and return self
  , addTo: function(parent) {
      return parent.put(this)
    }
    // Add element to given container and return container
  , putIn: function(parent) {
      return parent.add(this)
    }
    // Get / set id
  , id: function(id) {
      return this.attr('id', id)
    }
    // Checks whether the given point inside the bounding box of the element
  , inside: function(x, y) {
      var box = this.bbox()
      
      return x > box.x
          && y > box.y
          && x < box.x + box.width
          && y < box.y + box.height
    }
    // Show element
  , show: function() {
      return this.style('display', '')
    }
    // Hide element
  , hide: function() {
      return this.style('display', 'none')
    }
    // Is element visible?
  , visible: function() {
      return this.style('display') != 'none'
    }
    // Return id on string conversion
  , toString: function() {
      return this.attr('id')
    }
    // Return array of classes on the node
  , classes: function() {
      var attr = this.attr('class')

      return attr == null ? [] : attr.trim().split(/\s+/)
    }
    // Return true if class exists on the node, false otherwise
  , hasClass: function(name) {
      return this.classes().indexOf(name) != -1
    }
    // Add class to the node
  , addClass: function(name) {
      if (!this.hasClass(name)) {
        var array = this.classes()
        array.push(name)
        this.attr('class', array.join(' '))
      }

      return this
    }
    // Remove class from the node
  , removeClass: function(name) {
      if (this.hasClass(name)) {
        this.attr('class', this.classes().filter(function(c) {
          return c != name
        }).join(' '))
      }

      return this
    }
    // Toggle the presence of a class on the node
  , toggleClass: function(name) {
      return this.hasClass(name) ? this.removeClass(name) : this.addClass(name)
    }
    // Get referenced element form attribute value
  , reference: function(attr) {
      return SVG.get(this.attr(attr))
    }
    // Returns the parent element instance
  , parent: function(type) {
      // Get parent element
      var parent = SVG.adopt(this.node.parentNode)

      // If a specific type is given, find a parent with that class
      if (type)
        while (!(parent instanceof type))
          parent = SVG.adopt(parent.node.parentNode)

      return parent
    }
    // Get parent document
  , doc: function(type) {
      return this.parent(type || SVG.Doc)
    }
    // Returns the svg node to call native svg methods on it
  , native: function() {
      return this.node
    }
  }
})

SVG.BBox = SVG.invent({
  // Initialize
  create: function(element) {
    var box

    // Initialize zero box
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0
    
    // Get values if element is given
    if (element) {
      // Get current extracted transformations
      var t = new SVG.Matrix(element).extract()
      
      // Find native bbox
      if (element.node.getBBox)
        box = element.node.getBBox()
      // Mimic bbox
      else
        box = {
          x:      element.node.clientLeft
        , y:      element.node.clientTop
        , width:  element.node.clientWidth
        , height: element.node.clientHeight
        }
      
      // Include translations on x an y
      this.x = box.x + t.x
      this.y = box.y + t.y
      
      // Plain width and height
      this.width  = box.width  * t.scaleX
      this.height = box.height * t.scaleY
    }

    // Add center, right and bottom
    fullBox(this)
  }

  // define Parent
, parent: SVG.Element

  // Constructor
, construct: {
    // Get bounding box
    bbox: function() {
      return new SVG.BBox(this)
    }
  }

})

SVG.RBox = SVG.invent({
  // Initialize
  create: function(element) {
    var box = {}

    // Initialize zero box
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0
    
    if (element) {
      var e = element.doc().parent()
        , zoom = 1
      
      // Actual, native bounding box
      box = element.node.getBoundingClientRect()
      
      // Get screen offset
      this.x = box.left
      this.y = box.top
      
      // Subtract parent offset
      this.x -= e.offsetLeft
      this.y -= e.offsetTop
      
      while (e = e.offsetParent) {
        this.x -= e.offsetLeft
        this.y -= e.offsetTop
      }
      
      // Calculate cumulative zoom from svg documents
      e = element
      while (e.parent && (e = e.parent())) {
        if (e.viewbox) {
          zoom *= e.viewbox().zoom
          this.x -= e.x() || 0
          this.y -= e.y() || 0
        }
      }
    }
    
    // Recalculate viewbox distortion
    // this.x /= zoom
    // this.y /= zoom
    this.width  = box.width  /= zoom
    this.height = box.height /= zoom
    
    // Offset by window scroll position, because getBoundingClientRect changes when window is scrolled
    this.x += window.scrollX
    this.y += window.scrollY

    // Add center, right and bottom
    fullBox(this)
  }

  // define Parent
, parent: SVG.Element

  // Constructor
, construct: {
    // Get rect box
    rbox: function() {
      return new SVG.RBox(this)
    }
  }

})

// Add universal merge method
;[SVG.BBox, SVG.RBox].forEach(function(c) {

  SVG.extend(c, {
    // Merge rect box with another, return a new instance
    merge: function(box) {
      var b = new c()

      // Merge box
      b.x      = Math.min(this.x, box.x)
      b.y      = Math.min(this.y, box.y)
      b.width  = Math.max(this.x + this.width,  box.x + box.width)  - b.x
      b.height = Math.max(this.y + this.height, box.y + box.height) - b.y
      
      return fullBox(b)
    }

  })

})

SVG.Matrix = SVG.invent({
	// Initialize
	create: function(source) {
		var i, base = arrayToMatrix([1, 0, 0, 1, 0, 0])

		// Ensure source as object
		source = source && source.node && source.node.getCTM ?
			source.node.getCTM() :
		typeof source === 'string' ?
			arrayToMatrix(source.replace(/\s/g, '').split(',')) :
		arguments.length == 6 ?
			arrayToMatrix([].slice.call(arguments)) :
		typeof source === 'object' ?
			source : base

		// Merge source
		for (i = abcdef.length - 1; i >= 0; i--)
			this[abcdef[i]] = typeof source[abcdef[i]] === 'number' ?
				source[abcdef[i]] : base[abcdef[i]]
		
	}
	
	// Add methods
, extend: {
		// Extract individual transformations
	  extract: function() {
			// Find transform points
			var px 		= deltaTransformPoint(this, 0, 1)
				, py 		= deltaTransformPoint(this, 1, 0)
				, skewX = 180 / Math.PI * Math.atan2(px.y, px.x) - 90
	
			return {
				// Translation
				x: 				this.e
			, y: 				this.f
				// Skew
			, skewX: 		skewX
			, skewY: 		180 / Math.PI * Math.atan2(py.y, py.x)
				// Scale
			, scaleX: 	Math.sqrt(this.a * this.a + this.b * this.b)
			, scaleY: 	Math.sqrt(this.c * this.c + this.d * this.d)
				// Rotation
			, rotation: skewX
			}
		}
		// Multiply
	, multiply: function(matrix) {
			return new SVG.Matrix(this.native().multiply(matrix.native()))
		}
		// Inverse
	, inverse: function() {
			return new SVG.Matrix(this.native().inverse())
		}
		// Translate
	, translate: function(x, y) {
			return new SVG.Matrix(this.native().translate(x || 0, y || 0))	
		}
		// Scale
	, scale: function(x, y, cx, cy) {
			// Support universal scale
			if (arguments.length == 1 || arguments.length == 3)
				y = x
			if (arguments.length == 3) {
				cy = cx
				cx = y
			}

			return this
				.multiply(new SVG.Matrix(1, 0, 0, 1, cx || 0, cy || 0))
				.multiply(new SVG.Matrix(x, 0, 0, y, 0, 0))
				.multiply(new SVG.Matrix(1, 0, 0, 1, -cx || 0, -cy || 0))
		}
		// Rotate
	, rotate: function(d, cx, cy) {
			// Convert degrees to radians
			d = SVG.utils.radians(d)
			
			return this
				.multiply(new SVG.Matrix(1, 0, 0, 1, cx || 0, cy || 0))
				.multiply(new SVG.Matrix(Math.cos(d), Math.sin(d), -Math.sin(d), Math.cos(d), 0, 0))
				.multiply(new SVG.Matrix(1, 0, 0, 1, -cx || 0, -cy || 0))
		}
		// Flip
	, flip: function(a) {
			return new SVG.Matrix(this.native()['flip' + a.toUpperCase()]())
		}
		// Skew
	, skew: function(x, y, cx, cy) {
			// IMPLEMENT SKEW CENTER POINT
			return new SVG.Matrix(this.native().skewX(x || 0).skewY(y || 0))
		}
		// Convert this to SVGMatrix
	, native: function() {
			// Create new matrix
			var i, matrix = SVG.parser.draw.node.createSVGMatrix()
	
			// Update with current values
			for (i = abcdef.length - 1; i >= 0; i--)
				matrix[abcdef[i]] = this[abcdef[i]]

			return matrix
		}
		// Convert array to string
	, toString: function() {
			return 'matrix(' + [this.a, this.b, this.c, this.d, this.e, this.f].join() + ')'
		}
	}

	// Define parent
, parent: SVG.Element

	// Add parent method
, construct: {
		// Get current matrix
		ctm: function() {
			return new SVG.Matrix(this)
		}
	
	}

})
SVG.extend(SVG.Element, {
  // Set svg element attribute
  attr: function(a, v, n) {
    // Act as full getter
    if (a == null) {
      // Get an object of attributes
      a = {}
      v = this.node.attributes
      for (n = v.length - 1; n >= 0; n--)
        a[v[n].nodeName] = SVG.regex.isNumber.test(v[n].nodeValue) ? parseFloat(v[n].nodeValue) : v[n].nodeValue
      
      return a
      
    } else if (typeof a == 'object') {
      // Apply every attribute individually if an object is passed
      for (v in a) this.attr(v, a[v])
      
    } else if (v === null) {
        // Remove value
        this.node.removeAttribute(a)
      
    } else if (v == null) {
      // Act as a getter if the first and only argument is not an object
      v = this.node.getAttribute(a)
      return v == null ? 
        SVG.defaults.attrs[a] :
      SVG.regex.isNumber.test(v) ?
        parseFloat(v) : v
    
    } else {
      // BUG FIX: some browsers will render a stroke if a color is given even though stroke width is 0
      if (a == 'stroke-width')
        this.attr('stroke', parseFloat(v) > 0 ? this._stroke : null)
      else if (a == 'stroke')
        this._stroke = v

      // Convert image fill and stroke to patterns
      if (a == 'fill' || a == 'stroke') {
        if (SVG.regex.isImage.test(v))
          v = this.doc().defs().image(v, 0, 0)

        if (v instanceof SVG.Image)
          v = this.doc().defs().pattern(0, 0, function() {
            this.add(v)
          })
      }
      
      // Ensure correct numeric values (also accepts NaN and Infinity)
      if (typeof v === 'number')
        v = new SVG.Number(v)

      // Ensure full hex color
      else if (SVG.Color.isColor(v))
        v = new SVG.Color(v)
      
      // Parse array values
      else if (Array.isArray(v))
        v = new SVG.Array(v)

      // If the passed attribute is leading...
      if (a == 'leading') {
        // ... call the leading method instead
        if (this.leading)
          this.leading(v)
      } else {
        // Set given attribute on node
        typeof n === 'string' ?
          this.node.setAttributeNS(n, a, v.toString()) :
          this.node.setAttribute(a, v.toString())
      }
      
      // Rebuild if required
      if (this.rebuild && (a == 'font-size' || a == 'x'))
        this.rebuild(a, v)
    }
    
    return this
  }
})
SVG.extend(SVG.Element, {
	// Add transformations
	transform: function(o) {
		// Full getter
		if (o == null)
			return this.ctm().extract()

		// Singular getter
		else if (typeof o === 'string')
			return this.ctm().extract()[o]

		// Get current matrix
		var matrix = new SVG.Matrix(this)

		// Act on matrix
		if (o.a != null)
			matrix = matrix.multiply(new SVG.Matrix(o))
		
		// Act on rotate
		else if (o.rotation)
			matrix = matrix.rotate(
				o.rotation
			, o.cx == null ? this.bbox().cx : o.cx
			, o.cy == null ? this.bbox().cy : o.cy
			)

		// Act on scale
		else if (o.scale != null || o.scaleX != null || o.scaleY != null)
			matrix = matrix.scale(
				o.scale != null ? o.scale : o.scaleX != null ? o.scaleX : 1
			, o.scale != null ? o.scale : o.scaleY != null ? o.scaleY : 1
			, o.cx 		!= null ? o.cx 		: this.bbox().x
			, o.cy 		!= null ? o.cy 		: this.bbox().y
			)

		// Act on skew
		else if (o.skewX || o.skewY)
			matrix = matrix.skew(o.skewX, o.skewY)

		// Act on translate
		else if (o.x || o.y)
			matrix = matrix.translate(o.x, o.y)

		return this.attr('transform', matrix)
	}
	// Reset all transformations
, untransform: function() {
		return this.attr('transform', null)
	}

})
SVG.extend(SVG.Element, {
  // Dynamic style generator
  style: function(s, v) {
    if (arguments.length == 0) {
      /* get full style */
      return this.node.style.cssText || ''
    
    } else if (arguments.length < 2) {
      /* apply every style individually if an object is passed */
      if (typeof s == 'object') {
        for (v in s) this.style(v, s[v])
      
      } else if (SVG.regex.isCss.test(s)) {
        /* parse css string */
        s = s.split(';')

        /* apply every definition individually */
        for (var i = 0; i < s.length; i++) {
          v = s[i].split(':')
          this.style(v[0].replace(/\s+/g, ''), v[1])
        }
      } else {
        /* act as a getter if the first and only argument is not an object */
        return this.node.style[camelCase(s)]
      }
    
    } else {
      this.node.style[camelCase(s)] = v === null || SVG.regex.isBlank.test(v) ? '' : v
    }
    
    return this
  }
})
SVG.Parent = SVG.invent({
  // Initialize node
  create: function(element) {
    this.constructor.call(this, element)
  }

  // Inherit from
, inherit: SVG.Element

  // Add class methods
, extend: {
    // Returns all child elements
    children: function() {
      return SVG.utils.map(this.node.childNodes, function(node) {
        return SVG.adopt(node)
      })
    }
    // Add given element at a position
  , add: function(element, i) {
      if (!this.has(element)) {
        // Define insertion index if none given
        i = i == null ? this.children().length : i
        
        // Add element references
        this.node.insertBefore(element.node, this.node.childNodes[i] || null)
      }

      return this
    }
    // Basically does the same as `add()` but returns the added element instead
  , put: function(element, i) {
      this.add(element, i)
      return element
    }
    // Checks if the given element is a child
  , has: function(element) {
      return this.index(element) >= 0
    }
    // Gets index of given element
  , index: function(element) {
      return this.children().indexOf(element)
    }
    // Get a element at the given index
  , get: function(i) {
      return this.children()[i]
    }
    // Get first child, skipping the defs node
  , first: function() {
      return this.children()[0]
    }
    // Get the last child
  , last: function() {
      return this.children()[this.children().length - 1]
    }
    // Iterates over all children and invokes a given block
  , each: function(block, deep) {
      var i, il
        , children = this.children()
      
      for (i = 0, il = children.length; i < il; i++) {
        if (children[i] instanceof SVG.Element)
          block.apply(children[i], [i, children])

        if (deep && (children[i] instanceof SVG.Container))
          children[i].each(block, deep)
      }
    
      return this
    }
    // Remove a child element at a position
  , removeElement: function(element) {
      this.node.removeChild(element.node)
      
      return this
    }
    // Remove all elements in this container
  , clear: function() {
      // Remove children
      while(this.node.hasChildNodes())
        this.node.removeChild(this.node.lastChild)
      
      // Remove defs reference
      delete this._defs

      return this
    }
  , // Get defs
    defs: function() {
      return this.doc().defs()
    }
  }
  
})

SVG.Container = SVG.invent({
  // Initialize node
  create: function(element) {
    this.constructor.call(this, element)
  }

  // Inherit from
, inherit: SVG.Parent

  // Add class methods
, extend: {
    // Get the viewBox and calculate the zoom value
    viewbox: function(v) {
      if (arguments.length == 0)
        /* act as a getter if there are no arguments */
        return new SVG.ViewBox(this)
      
      /* otherwise act as a setter */
      v = arguments.length == 1 ?
        [v.x, v.y, v.width, v.height] :
        [].slice.call(arguments)
      
      return this.attr('viewBox', v)
    }
  }
  
})
SVG.extend(SVG.Parent, SVG.Text, {
  // Import svg SVG data
  svg: function(svg) {
    // create temporary div to receive svg content
    var element = document.createElement('div')

    if (svg) {
      // strip away newlines and properly close tags
      svg = svg
        .replace(/\n/, '')
        .replace(/<(\w+)([^<]+?)\/>/g, '<$1$2></$1>')

      // ensure SVG wrapper for correct element type casting
      element.innerHTML = '<svg>' + svg + '</svg>'

      // transplant content from well to target
      for (var i = element.firstChild.childNodes.length - 1; i >= 0; i--)
        if (element.firstChild.childNodes[i].nodeType == 1)
          this.node.appendChild(element.firstChild.childNodes[i])

      return this

    } else {
      // clone element and its contents
      var clone  = this.node.cloneNode(true)

      // add target to clone
      element.appendChild(clone)

      return element.innerHTML
    }
  }
})
SVG.FX = SVG.invent({
  // Initialize FX object
  create: function(element) {
    /* store target element */
    this.target = element
  }

  // Add class methods
, extend: {
    // Add animation parameters and start animation
    animate: function(d, ease, delay) {
      var akeys, tkeys, skeys, key
        , element = this.target
        , fx = this
      
      /* dissect object if one is passed */
      if (typeof d == 'object') {
        delay = d.delay
        ease = d.ease
        d = d.duration
      }

      /* ensure default duration and easing */
      d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf()
      ease = ease || '<>'

      /* process values */
      fx.to = function(pos) {
        var i

        /* normalise pos */
        pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

        /* collect attribute keys */
        if (akeys == null) {
          akeys = []
          for (key in fx.attrs)
            akeys.push(key)

          /* make sure morphable elements are scaled, translated and morphed all together */
          if (element.morphArray && (fx._plot || akeys.indexOf('points') > -1)) {
            /* get destination */
            var box
              , p = new element.morphArray(fx._plot || fx.attrs.points || element.array)

            /* add size */
            if (fx._size) p.size(fx._size.width.to, fx._size.height.to)

            /* add movement */
            box = p.bbox()
            if (fx._x) p.move(fx._x.to, box.y)
            else if (fx._cx) p.move(fx._cx.to - box.width / 2, box.y)

            box = p.bbox()
            if (fx._y) p.move(box.x, fx._y.to)
            else if (fx._cy) p.move(box.x, fx._cy.to - box.height / 2)

            /* delete element oriented changes */
            delete fx._x
            delete fx._y
            delete fx._cx
            delete fx._cy
            delete fx._size

            fx._plot = element.array.morph(p)
          }
        }

        /* collect transformation keys */
        if (tkeys == null) {
          tkeys = []
          for (key in fx.trans)
            tkeys.push(key)
        }

        /* collect style keys */
        if (skeys == null) {
          skeys = []
          for (key in fx.styles)
            skeys.push(key)
        }

        /* apply easing */
        pos = ease == '<>' ?
          (-Math.cos(pos * Math.PI) / 2) + 0.5 :
        ease == '>' ?
          Math.sin(pos * Math.PI / 2) :
        ease == '<' ?
          -Math.cos(pos * Math.PI / 2) + 1 :
        ease == '-' ?
          pos :
        typeof ease == 'function' ?
          ease(pos) :
          pos
        
        /* run plot function */
        if (fx._plot) {
          element.plot(fx._plot.at(pos))

        } else {
          /* run all x-position properties */
          if (fx._x)
            element.x(fx._x.at(pos))
          else if (fx._cx)
            element.cx(fx._cx.at(pos))

          /* run all y-position properties */
          if (fx._y)
            element.y(fx._y.at(pos))
          else if (fx._cy)
            element.cy(fx._cy.at(pos))

          /* run all size properties */
          if (fx._size)
            element.size(fx._size.width.at(pos), fx._size.height.at(pos))
        }

        /* run all viewbox properties */
        if (fx._viewbox)
          element.viewbox(
            fx._viewbox.x.at(pos)
          , fx._viewbox.y.at(pos)
          , fx._viewbox.width.at(pos)
          , fx._viewbox.height.at(pos)
          )

        /* run leading property */
        if (fx._leading)
          element.leading(fx._leading.at(pos))

        /* animate attributes */
        for (i = akeys.length - 1; i >= 0; i--)
          element.attr(akeys[i], at(fx.attrs[akeys[i]], pos))

        /* animate transformations */
        for (i = tkeys.length - 1; i >= 0; i--)
          element.transform(tkeys[i], at(fx.trans[tkeys[i]], pos))

        /* animate styles */
        for (i = skeys.length - 1; i >= 0; i--)
          element.style(skeys[i], at(fx.styles[skeys[i]], pos))

        /* callback for each keyframe */
        if (fx._during)
          fx._during.call(element, pos, function(from, to) {
            return at({ from: from, to: to }, pos)
          })
      }
      
      if (typeof d === 'number') {
        /* delay animation */
        this.timeout = setTimeout(function() {
          var start = new Date().getTime()

          /* initialize situation object */
          fx.situation = {
            interval: 1000 / 60
          , start:    start
          , play:     true
          , finish:   start + d
          , duration: d
          }

          /* render function */
          fx.render = function() {
            
            if (fx.situation.play === true) {
              // This code was borrowed from the emile.js micro framework by Thomas Fuchs, aka MadRobby.
              var time = new Date().getTime()
                , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d
              
              /* process values */
              fx.to(pos)
              
              /* finish off animation */
              if (time > fx.situation.finish) {
                if (fx._plot)
                  element.plot(new SVG.PointArray(fx._plot.destination).settle())

                if (fx._loop === true || (typeof fx._loop == 'number' && fx._loop > 1)) {
                  if (typeof fx._loop == 'number')
                    --fx._loop
                  fx.animate(d, ease, delay)
                } else {
                  fx._after ? fx._after.apply(element, [fx]) : fx.stop()
                }

              } else {
                requestAnimFrame(fx.render)
              }
            } else {
              requestAnimFrame(fx.render)
            }
            
          }

          /* start animation */
          fx.render()
          
        }, new SVG.Number(delay).valueOf())
      }
      
      return this
    }
    // Get bounding box of target element
  , bbox: function() {
      return this.target.bbox()
    }
    // Add animatable attributes
  , attr: function(a, v) {
      if (typeof a == 'object') {
        for (var key in a)
          this.attr(key, a[key])
      
      } else {
        var from = this.target.attr(a)

        this.attrs[a] = SVG.Color.isColor(from) ?
          new SVG.Color(from).morph(v) :
        SVG.regex.unit.test(from) ?
          new SVG.Number(from).morph(v) :
          { from: from, to: v }
      }
      
      return this
    }
    // Add animatable transformations
  , transform: function(o, v) {
      // if (arguments.length == 1) {
      //   /* parse matrix string */
      //   o = parseMatrix(o)
        
      //   /* dlete matrixstring from object */
      //   delete o.matrix
        
      //   /* store matrix values */
      //   for (v in o)
      //     this.trans[v] = { from: this.target.trans[v], to: o[v] }
        
      // } else {
      //   /* apply transformations as object if key value arguments are given*/
      //   var transform = {}
      //   transform[o] = v
        
      //   this.transform(transform)
      // }
      
      // return this
    }
    // Add animatable styles
  , style: function(s, v) {
      if (typeof s == 'object')
        for (var key in s)
          this.style(key, s[key])
      
      else
        this.styles[s] = { from: this.target.style(s), to: v }
      
      return this
    }
    // Animatable x-axis
  , x: function(x) {
      this._x = new SVG.Number(this.target.x()).morph(x)
      
      return this
    }
    // Animatable y-axis
  , y: function(y) {
      this._y = new SVG.Number(this.target.y()).morph(y)
      
      return this
    }
    // Animatable center x-axis
  , cx: function(x) {
      this._cx = new SVG.Number(this.target.cx()).morph(x)
      
      return this
    }
    // Animatable center y-axis
  , cy: function(y) {
      this._cy = new SVG.Number(this.target.cy()).morph(y)
      
      return this
    }
    // Add animatable move
  , move: function(x, y) {
      return this.x(x).y(y)
    }
    // Add animatable center
  , center: function(x, y) {
      return this.cx(x).cy(y)
    }
    // Add animatable size
  , size: function(width, height) {
      if (this.target instanceof SVG.Text) {
        /* animate font size for Text elements */
        this.attr('font-size', width)
        
      } else {
        /* animate bbox based size for all other elements */
        var box = this.target.bbox()

        this._size = {
          width:  new SVG.Number(box.width).morph(width)
        , height: new SVG.Number(box.height).morph(height)
        }
      }
      
      return this
    }
    // Add animatable plot
  , plot: function(p) {
      this._plot = p

      return this
    }
    // Add leading method
  , leading: function(value) {
      if (this.target._leading)
        this._leading = new SVG.Number(this.target._leading).morph(value)

      return this
    }
    // Add animatable viewbox
  , viewbox: function(x, y, width, height) {
      if (this.target instanceof SVG.Container) {
        var box = this.target.viewbox()
        
        this._viewbox = {
          x:      new SVG.Number(box.x).morph(x)
        , y:      new SVG.Number(box.y).morph(y)
        , width:  new SVG.Number(box.width).morph(width)
        , height: new SVG.Number(box.height).morph(height)
        }
      }
      
      return this
    }
    // Add animateable gradient update
  , update: function(o) {
      if (this.target instanceof SVG.Stop) {
        if (o.opacity != null) this.attr('stop-opacity', o.opacity)
        if (o.color   != null) this.attr('stop-color', o.color)
        if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))
      }

      return this
    }
    // Add callback for each keyframe
  , during: function(during) {
      this._during = during
      
      return this
    }
    // Callback after animation
  , after: function(after) {
      this._after = after
      
      return this
    }
    // Make loopable
  , loop: function(times) {
      this._loop = times || true

      return this
    }
    // Stop running animation
  , stop: function(fulfill) {
      /* fulfill animation */
      if (fulfill === true) {

        this.animate(0)

        if (this._after)
          this._after.apply(this.target, [this])

      } else {
        /* stop current animation */
        clearTimeout(this.timeout)

        /* reset storage for properties that need animation */
        this.attrs     = {}
        this.trans     = {}
        this.styles    = {}
        this.situation = {}

        /* delete destinations */
        delete this._x
        delete this._y
        delete this._cx
        delete this._cy
        delete this._size
        delete this._plot
        delete this._loop
        delete this._after
        delete this._during
        delete this._leading
        delete this._viewbox
      }
      
      return this
    }
    // Pause running animation
  , pause: function() {
      if (this.situation.play === true) {
        this.situation.play  = false
        this.situation.pause = new Date().getTime()
      }

      return this
    }
    // Play running animation
  , play: function() {
      if (this.situation.play === false) {
        var pause = new Date().getTime() - this.situation.pause
        
        this.situation.finish += pause
        this.situation.start  += pause
        this.situation.play    = true
      }

      return this
    }
    
  }

  // Define parent class
, parent: SVG.Element

  // Add method to parent elements
, construct: {
    // Get fx module or create a new one, then animate with given duration and ease
    animate: function(d, ease, delay) {
      return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay)
    }
    // Stop current animation; this is an alias to the fx instance
  , stop: function(fulfill) {
      if (this.fx)
        this.fx.stop(fulfill)
      
      return this
    }
    // Pause current animation
  , pause: function() {
      if (this.fx)
        this.fx.pause()

      return this
    }
    // Play paused current animation
  , play: function() {
      if (this.fx)
        this.fx.play()

      return this
    }
    
  }
})

//
SVG.extend(SVG.Element, SVG.FX, {
  // Relative move over x axis
  dx: function(x) {
    return this.x((this.target || this).x() + x)
  }
  // Relative move over y axis
, dy: function(y) {
    return this.y((this.target || this).y() + y)
  }
  // Relative move over x and y axes
, dmove: function(x, y) {
    return this.dx(x).dy(y)
  }

})
// Add events to elements
;[  'click'
  , 'dblclick'
  , 'mousedown'
  , 'mouseup'
  , 'mouseover'
  , 'mouseout'
  , 'mousemove'
  , 'mouseenter'
  , 'mouseleave'
  , 'touchstart'
  , 'touchmove'
  , 'touchleave'
  , 'touchend'
  , 'touchcancel' ].forEach(function(event) {
  
  /* add event to SVG.Element */
  SVG.Element.prototype[event] = function(f) {
    var self = this
    
    /* bind event to element rather than element node */
    this.node['on' + event] = typeof f == 'function' ?
      function() { return f.apply(self, arguments) } : null
    
    return this
  }
  
})

// Initialize events and listeners stack
SVG.events = {}
SVG.listeners = {}

// Event constructor
SVG.registerEvent = function(event) {
  if (!SVG.events[event])
    SVG.events[event] = new CustomEvent(event)
}

// Add event binder in the SVG namespace
SVG.on = function(node, event, listener) {
  var l = listener.bind(node.instance || node)
  SVG.listeners[listener] = l
  node.addEventListener(event, l, false)
}

// Add event unbinder in the SVG namespace
SVG.off = function(node, event, listener) {
  node.removeEventListener(event, SVG.listeners[listener], false)
  delete SVG.listeners[listener]
}

//
SVG.extend(SVG.Element, {
  // Bind given event to listener
  on: function(event, listener) {
    SVG.on(this.node, event, listener)
    
    return this
  }
  // Unbind event from listener
, off: function(event, listener) {
    SVG.off(this.node, event, listener)
    
    return this
  }
  // Fire given event
, fire: function(event, data) {
    // Add detail data to event
    SVG.events[event].detail = data
    
    // Dispatch event
    this.node.dispatchEvent(SVG.events[event])

    // Remove detail
    delete SVG.events[event].detail

    return this
  }
})

SVG.Defs = SVG.invent({
  // Initialize node
  create: 'defs'

  // Inherit from
, inherit: SVG.Container
  
})
SVG.G = SVG.invent({
  // Initialize node
  create: 'g'

  // Inherit from
, inherit: SVG.Container
  
  // Add class methods
, extend: {
    // Move over x-axis
    x: function(x) {
      return x == null ? this.transform('x') : this.transform({ x: -this.x() + x })
    }
    // Move over y-axis
  , y: function(y) {
      return y == null ? this.transform('y') : this.transform({ y: -this.y() + y })
    }
    // Move by center over x-axis
  , cx: function(x) {
      return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
    }
    // Move by center over y-axis
  , cy: function(y) {
      return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
    }
  }
  
  // Add parent method
, construct: {
    // Create a group element
    group: function() {
      return this.put(new SVG.G)
    }
  }
})
// ### This module adds backward / forward functionality to elements.

//
SVG.extend(SVG.Element, {
  // Get all siblings, including myself
  siblings: function() {
    return this.parent().children()
  }
  // Get the curent position siblings
, position: function() {
    return this.parent().index(this)
  }
  // Get the next element (will return null if there is none)
, next: function() {
    return this.siblings()[this.position() + 1]
  }
  // Get the next element (will return null if there is none)
, previous: function() {
    return this.siblings()[this.position() - 1]
  }
  // Send given element one step forward
, forward: function() {
    var i = this.position() + 1
      , p = this.parent()

    // Move node one step forward
    p.removeElement(this).add(this, i)

    // Make sure defs node is always at the top
    if (p instanceof SVG.Doc)
      p.node.appendChild(p.defs().node)

    return this
  }
  // Send given element one step backward
, backward: function() {
    var i = this.position()
    
    if (i > 0)
      this.parent().removeElement(this).add(this, i - 1)

    return this
  }
  // Send given element all the way to the front
, front: function() {
    var p = this.parent()

    // Move node forward
    p.node.appendChild(this.node)

    // Make sure defs node is always at the top
    if (p instanceof SVG.Doc)
      p.node.appendChild(p.defs().node)

    return this
  }
  // Send given element all the way to the back
, back: function() {
    if (this.position() > 0)
      this.parent().removeElement(this).add(this, 0)
    
    return this
  }
  // Inserts a given element before the targeted element
, before: function(element) {
    element.remove()

    var i = this.position()
    
    this.parent().add(element, i)

    return this
  }
  // Insters a given element after the targeted element
, after: function(element) {
    element.remove()
    
    var i = this.position()
    
    this.parent().add(element, i + 1)

    return this
  }

})
SVG.Mask = SVG.invent({
  // Initialize node
  create: function() {
    this.constructor.call(this, SVG.create('mask'))

    /* keep references to masked elements */
    this.targets = []
  }

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Unmask all masked elements and remove itself
    remove: function() {
      /* unmask all targets */
      for (var i = this.targets.length - 1; i >= 0; i--)
        if (this.targets[i])
          this.targets[i].unmask()
      delete this.targets

      /* remove mask from parent */
      this.parent().removeElement(this)
      
      return this
    }
  }
  
  // Add parent method
, construct: {
    // Create masking element
    mask: function() {
      return this.defs().put(new SVG.Mask)
    }
  }
})


SVG.extend(SVG.Element, {
  // Distribute mask to svg element
  maskWith: function(element) {
    /* use given mask or create a new one */
    this.masker = element instanceof SVG.Mask ? element : this.parent().mask().add(element)

    /* store reverence on self in mask */
    this.masker.targets.push(this)
    
    /* apply mask */
    return this.attr('mask', 'url("#' + this.masker.attr('id') + '")')
  }
  // Unmask element
, unmask: function() {
    delete this.masker
    return this.attr('mask', null)
  }
  
})

SVG.ClipPath = SVG.invent({
  // Initialize node
  create: function() {
    this.constructor.call(this, SVG.create('clipPath'))

    /* keep references to clipped elements */
    this.targets = []
  }

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Unclip all clipped elements and remove itself
    remove: function() {
      /* unclip all targets */
      for (var i = this.targets.length - 1; i >= 0; i--)
        if (this.targets[i])
          this.targets[i].unclip()
      delete this.targets

      /* remove clipPath from parent */
      this.parent().removeElement(this)
      
      return this
    }
  }
  
  // Add parent method
, construct: {
    // Create clipping element
    clip: function() {
      return this.defs().put(new SVG.ClipPath)
    }
  }
})

//
SVG.extend(SVG.Element, {
  // Distribute clipPath to svg element
  clipWith: function(element) {
    /* use given clip or create a new one */
    this.clipper = element instanceof SVG.ClipPath ? element : this.parent().clip().add(element)

    /* store reverence on self in mask */
    this.clipper.targets.push(this)
    
    /* apply mask */
    return this.attr('clip-path', 'url("#' + this.clipper.attr('id') + '")')
  }
  // Unclip element
, unclip: function() {
    delete this.clipper
    return this.attr('clip-path', null)
  }
  
})
SVG.Gradient = SVG.invent({
  // Initialize node
  create: function(type) {
    this.constructor.call(this, SVG.create(type + 'Gradient'))
    
    /* store type */
    this.type = type
  }

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // From position
    from: function(x, y) {
      return this.type == 'radial' ?
        this.attr({ fx: new SVG.Number(x), fy: new SVG.Number(y) }) :
        this.attr({ x1: new SVG.Number(x), y1: new SVG.Number(y) })
    }
    // To position
  , to: function(x, y) {
      return this.type == 'radial' ?
        this.attr({ cx: new SVG.Number(x), cy: new SVG.Number(y) }) :
        this.attr({ x2: new SVG.Number(x), y2: new SVG.Number(y) })
    }
    // Radius for radial gradient
  , radius: function(r) {
      return this.type == 'radial' ?
        this.attr({ r: new SVG.Number(r) }) :
        this
    }
    // Add a color stop
  , at: function(offset, color, opacity) {
      return this.put(new SVG.Stop).update(offset, color, opacity)
    }
    // Update gradient
  , update: function(block) {
      /* remove all stops */
      this.clear()
      
      /* invoke passed block */
      if (typeof block == 'function')
        block.call(this, this)
      
      return this
    }
    // Return the fill id
  , fill: function() {
      return 'url(#' + this.id() + ')'
    }
    // Alias string convertion to fill
  , toString: function() {
      return this.fill()
    }
  }
  
  // Add parent method
, construct: {
    // Create gradient element in defs
    gradient: function(type, block) {
      return this.defs().gradient(type, block)
    }
  }
})

SVG.extend(SVG.Defs, {
  // define gradient
  gradient: function(type, block) {
    return this.put(new SVG.Gradient(type)).update(block)
  }
  
})

SVG.Stop = SVG.invent({
  // Initialize node
  create: 'stop'

  // Inherit from
, inherit: SVG.Element

  // Add class methods
, extend: {
    // add color stops
    update: function(o) {
      if (typeof o == 'number' || o instanceof SVG.Number) {
        o = {
          offset:  arguments[0]
        , color:   arguments[1]
        , opacity: arguments[2]
        }
      }

      /* set attributes */
      if (o.opacity != null) this.attr('stop-opacity', o.opacity)
      if (o.color   != null) this.attr('stop-color', o.color)
      if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))

      return this
    }
  }

})

SVG.Pattern = SVG.invent({
  // Initialize node
  create: 'pattern'

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Return the fill id
	  fill: function() {
	    return 'url(#' + this.id() + ')'
	  }
	  // Update pattern by rebuilding
	, update: function(block) {
			/* remove content */
      this.clear()
      
      /* invoke passed block */
      if (typeof block == 'function')
      	block.call(this, this)
      
      return this
		}
	  // Alias string convertion to fill
	, toString: function() {
	    return this.fill()
	  }
  }
  
  // Add parent method
, construct: {
    // Create pattern element in defs
	  pattern: function(width, height, block) {
	    return this.defs().pattern(width, height, block)
	  }
  }
})

SVG.extend(SVG.Defs, {
  // Define gradient
  pattern: function(width, height, block) {
    return this.put(new SVG.Pattern).update(block).attr({
      x:            0
    , y:            0
    , width:        width
    , height:       height
    , patternUnits: 'userSpaceOnUse'
    })
  }

})
SVG.Doc = SVG.invent({
  // Initialize node
  create: function(element) {
    if (element) {
      /* ensure the presence of a dom element */
      element = typeof element == 'string' ?
        document.getElementById(element) :
        element
      
      /* If the target is an svg element, use that element as the main wrapper.
         This allows svg.js to work with svg documents as well. */
      if (element.nodeName == 'svg') {
        this.constructor.call(this, element)
      } else {
        this.constructor.call(this, SVG.create('svg'))
        element.appendChild(this.node)
      }
      
      /* set svg element attributes and ensure defs node */
      this.namespace().size('100%', '100%').defs()
    }
  }

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Add namespaces
    namespace: function() {
      return this
        .attr({ xmlns: SVG.ns, version: '1.1' })
        .attr('xmlns:xlink', SVG.xlink, SVG.xmlns)
    }
    // Creates and returns defs element
  , defs: function() {
      if (!this._defs) {
        var defs

        // Find or create a defs element in this instance
        if (defs = this.node.getElementsByTagName('defs')[0])
          this._defs = SVG.adopt(defs)
        else
          this._defs = new SVG.Defs

        // Make sure the defs node is at the end of the stack
        this.node.appendChild(this._defs.node)
      }

      return this._defs
    }
    // custom parent method
  , parent: function() {
      return this.node.parentNode.nodeName == '#document' ? null : this.node.parentNode
    }
  }
  
})

// Fix for possible sub-pixel offset. See:
// https://bugzilla.mozilla.org/show_bug.cgi?id=608812
SVG.extend(SVG.Doc, {
  // Callback
  spof: function() {
    if (this.doSpof) {
      var pos = this.node.getScreenCTM()
      
      if (pos)
        this
          .style('left', (-pos.e % 1) + 'px')
          .style('top',  (-pos.f % 1) + 'px')
    }
    
    return this
  }

  // Sub-pixel offset enabler
, fixSubPixelOffset: function() {
    var self = this

    // Enable spof
    this.doSpof = true

    // Make sure sub-pixel offset is fixed every time the window is resized
    SVG.on(window, 'resize', function() { self.spof() })

    return this.spof()
  }
  
})
SVG.Shape = SVG.invent({
  // Initialize node
  create: function(element) {
	  this.constructor.call(this, element)
	}

  // Inherit from
, inherit: SVG.Element

})

SVG.Symbol = SVG.invent({
  // Initialize node
  create: 'symbol'

  // Inherit from
, inherit: SVG.Container

  // Add parent method
, construct: {
    // Create a new symbol
    symbol: function() {
      return this.defs().put(new SVG.Symbol)
    }
  }
  
})
SVG.Use = SVG.invent({
  // Initialize node
  create: 'use'

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // Use element as a reference
    element: function(element) {
      /* store target element */
      this.target = element

      /* set lined element */
      return this.attr('href', '#' + element, SVG.xlink)
    }
  }
  
  // Add parent method
, construct: {
    // Create a use element
    use: function(element) {
      return this.put(new SVG.Use).element(element)
    }
  }
})
SVG.Rect = SVG.invent({
	// Initialize node
  create: 'rect'

	// Inherit from
, inherit: SVG.Shape
	
	// Add parent method
, construct: {
  	// Create a rect element
  	rect: function(width, height) {
  	  return this.put(new SVG.Rect().size(width, height))
  	}
	}
})
SVG.Circle = SVG.invent({
  // Initialize node
  create: 'circle'

  // Inherit from
, inherit: SVG.Shape

  // Add parent method
, construct: {
    // Create circle element, based on ellipse
    circle: function(size) {
      return this.put(new SVG.Circle).rx(new SVG.Number(size).divide(2)).move(0, 0)
    }
  }
})

SVG.extend(SVG.Circle, SVG.FX, {
  // Radius x value
  rx: function(rx) {
    return this.attr('r', rx)
  }
  // Alias radius x value
, ry: function(ry) {
    return this.rx(ry)
  }
})

SVG.Ellipse = SVG.invent({
  // Initialize node
  create: 'ellipse'

  // Inherit from
, inherit: SVG.Shape

  // Add parent method
, construct: {
    // Create an ellipse
    ellipse: function(width, height) {
      return this.put(new SVG.Ellipse).size(width, height).move(0, 0)
    }
  }
})

SVG.extend(SVG.Ellipse, SVG.Rect, SVG.FX, {
  // Radius x value
  rx: function(rx) {
    return this.attr('rx', rx)
  }
  // Radius y value
, ry: function(ry) {
    return this.attr('ry', ry)
  }
})

// Add common method
SVG.extend(SVG.Circle, SVG.Ellipse, {
    // Move over x-axis
    x: function(x) {
      return x == null ? this.cx() - this.rx() : this.cx(x + this.rx())
    }
    // Move over y-axis
  , y: function(y) {
      return y == null ? this.cy() - this.ry() : this.cy(y + this.ry())
    }
    // Move by center over x-axis
  , cx: function(x) {
      return x == null ? this.attr('cx') : this.attr('cx', new SVG.Number(x).divide(this.transform('scaleX')))
    }
    // Move by center over y-axis
  , cy: function(y) {
      return y == null ? this.attr('cy') : this.attr('cy', new SVG.Number(y).divide(this.transform('scaleY')))
    }
    // Set width of element
  , width: function(width) {
      return width == null ? this.rx() * 2 : this.rx(new SVG.Number(width).divide(2))
    }
    // Set height of element
  , height: function(height) {
      return height == null ? this.ry() * 2 : this.ry(new SVG.Number(height).divide(2))
    }
    // Custom size function
  , size: function(width, height) {
      var p = proportionalSize(this.bbox(), width, height)

      return this
        .rx(new SVG.Number(p.width).divide(2))
        .ry(new SVG.Number(p.height).divide(2))
    }
})
SVG.Line = SVG.invent({
  // Initialize node
  create: 'line'

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // Get array
    array: function() {
      return new SVG.PointArray([
        [ this.attr('x1'), this.attr('y1') ]
      , [ this.attr('x2'), this.attr('y2') ]
      ])
    }
    // Overwrite native plot() method
  , plot: function(x1, y1, x2, y2) {
      if (arguments.length == 4)
        x1 = { x1: x1, y1: y1, x2: x2, y2: y2 }
      else 
        x1 = new SVG.PointArray(x1).toLine()

      return this.attr(x1)
    }
    // Move by left top corner
  , move: function(x, y) {
      return this.attr(this.array().move(x, y).toLine())
    }
    // Set element size to given width and height
  , size: function(width, height) {
      var p = proportionalSize(this.bbox(), width, height)

      return this.attr(this.array().size(p.width, p.height).toLine())
    }
  }
  
  // Add parent method
, construct: {
    // Create a line element
    line: function(x1, y1, x2, y2) {
      return this.put(new SVG.Line).plot(x1, y1, x2, y2)
    }
  }
})

SVG.Polyline = SVG.invent({
  // Initialize node
  create: 'polyline'

  // Inherit from
, inherit: SVG.Shape
  
  // Add parent method
, construct: {
    // Create a wrapped polyline element
    polyline: function(p) {
      return this.put(new SVG.Polyline).plot(p)
    }
  }
})

SVG.Polygon = SVG.invent({
  // Initialize node
  create: 'polygon'

  // Inherit from
, inherit: SVG.Shape
  
  // Add parent method
, construct: {
    // Create a wrapped polygon element
    polygon: function(p) {
      return this.put(new SVG.Polygon).plot(p)
    }
  }
})

// Add polygon-specific functions
SVG.extend(SVG.Polyline, SVG.Polygon, {
  // Get array
  array: function() {
    return this._array || (this._array = new SVG.PointArray(this.attr('points')))
  }
  // Plot new path
, plot: function(p) {
    return this.attr('points', (this._array = new SVG.PointArray(p)))
  }
  // Move by left top corner
, move: function(x, y) {
    return this.attr('points', this.array().move(x, y))
  }
  // Set element size to given width and height
, size: function(width, height) {
    var p = proportionalSize(this.bbox(), width, height)

    return this.attr('points', this.array().size(p.width, p.height))
  }

})
// unify all point to point elements
SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, {
  // Define morphable array
  morphArray:  SVG.PointArray
  // Move by left top corner over x-axis
, x: function(x) {
    return x == null ? this.bbox().x : this.move(x, this.bbox().y)
  }
  // Move by left top corner over y-axis
, y: function(y) {
    return y == null ? this.bbox().y : this.move(this.bbox().x, y)
  }
  // Set width of element
, width: function(width) {
    var b = this.bbox()

    return width == null ? b.width : this.size(width, b.height)
  }
  // Set height of element
, height: function(height) {
    var b = this.bbox()

    return height == null ? b.height : this.size(b.width, height) 
  }
})
SVG.Path = SVG.invent({
  // Initialize node
  create: 'path'

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // Define morphable array
    morphArray:  SVG.PathArray
    // Get array
  , array: function() {
      return this._array || (this._array = new SVG.PathArray(this.attr('d')))
    }
    // Plot new poly points
  , plot: function(p) {
      return this.attr('d', (this._array = new SVG.PathArray(p)))
    }
    // Move by left top corner
  , move: function(x, y) {
      return this.attr('d', this.array().move(x, y))
    }
    // Move by left top corner over x-axis
  , x: function(x) {
      return x == null ? this.bbox().x : this.move(x, this.bbox().y)
    }
    // Move by left top corner over y-axis
  , y: function(y) {
      return y == null ? this.bbox().y : this.move(this.bbox().x, y)
    }
    // Set element size to given width and height
  , size: function(width, height) {
      var p = proportionalSize(this.bbox(), width, height)
      
      return this.attr('d', this.array().size(p.width, p.height))
    }
    // Set width of element
  , width: function(width) {
      return width == null ? this.bbox().width : this.size(width, this.bbox().height)
    }
    // Set height of element
  , height: function(height) {
      return height == null ? this.bbox().height : this.size(this.bbox().width, height)
    }
    
  }
  
  // Add parent method
, construct: {
    // Create a wrapped path element
    path: function(d) {
      return this.put(new SVG.Path).plot(d)
    }
  }
})
SVG.Image = SVG.invent({
  // Initialize node
  create: 'image'

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // (re)load image
    load: function(url) {
      if (!url) return this

      var self = this
        , img  = document.createElement('img')
      
      /* preload image */
      img.onload = function() {
        var p = self.doc(SVG.Pattern)

        /* ensure image size */
        if (self.width() == 0 && self.height() == 0)
          self.size(img.width, img.height)

        /* ensure pattern size if not set */
        if (p && p.width() == 0 && p.height() == 0)
          p.size(self.width(), self.height())
        
        /* callback */
        if (typeof self._loaded === 'function')
          self._loaded.call(self, {
            width:  img.width
          , height: img.height
          , ratio:  img.width / img.height
          , url:    url
          })
      }

      return this.attr('href', (img.src = this.src = url), SVG.xlink)
    }
    // Add loade callback
  , loaded: function(loaded) {
      this._loaded = loaded
      return this
    }
  }
  
  // Add parent method
, construct: {
    // Create image element, load image and set its size
    image: function(source, width, height) {
      return this.put(new SVG.Image).load(source).size(width || 0, height || width || 0)
    }
  }

})

SVG.Text = SVG.invent({
  // Initialize node
  create: function() {
    this.constructor.call(this, SVG.create('text'))
    
    this._leading = new SVG.Number(1.3)    /* store leading value for rebuilding */
    this._rebuild = true                   /* enable automatic updating of dy values */
    this._build   = false                  /* disable build mode for adding multiple lines */

    /* set default font */
    this.attr('font-family', SVG.defaults.attrs['font-family'])
  }

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // Move over x-axis
    x: function(x) {
      /* act as getter */
      if (x == null)
        return this.attr('x')
      
      /* move lines as well if no textPath is present */
      if (!this.textPath)
        this.lines.each(function() { if (this.newLined) this.x(x) })

      return this.attr('x', x)
    }
    // Move over y-axis
  , y: function(y) {
      var oy = this.attr('y')
        , o  = typeof oy === 'number' ? oy - this.bbox().y : 0

      /* act as getter */
      if (y == null)
        return typeof oy === 'number' ? oy - o : oy

      return this.attr('y', typeof y === 'number' ? y + o : y)
    }
    // Move center over x-axis
  , cx: function(x) {
      return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
    }
    // Move center over y-axis
  , cy: function(y) {
      return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
    }
    // Set the text content
  , text: function(text) {
      /* act as getter */
      if (typeof text === 'undefined') return this.content
      
      /* remove existing content */
      this.clear().build(true)
      
      if (typeof text === 'function') {
        /* call block */
        text.call(this, this)

      } else {
        /* store text and make sure text is not blank */
        text = (this.content = text).split('\n')
        
        /* build new lines */
        for (var i = 0, il = text.length; i < il; i++)
          this.tspan(text[i]).newLine()
      }
      
      /* disable build mode and rebuild lines */
      return this.build(false).rebuild()
    }
    // Set font size
  , size: function(size) {
      return this.attr('font-size', size).rebuild()
    }
    // Set / get leading
  , leading: function(value) {
      /* act as getter */
      if (value == null)
        return this._leading
      
      /* act as setter */
      this._leading = new SVG.Number(value)
      
      return this.rebuild()
    }
    // Rebuild appearance type
  , rebuild: function(rebuild) {
      /* store new rebuild flag if given */
      if (typeof rebuild == 'boolean')
        this._rebuild = rebuild

      /* define position of all lines */
      if (this._rebuild) {
        var self = this
        
        this.lines.each(function() {
          if (this.newLined) {
            if (!this.textPath)
              this.attr('x', self.attr('x'))
            this.attr('dy', self._leading * new SVG.Number(self.attr('font-size'))) 
          }
        })

        this.fire('rebuild')
      }

      return this
    }
    // Enable / disable build mode
  , build: function(build) {
      this._build = !!build
      return this
    }
  }
  
  // Add parent method
, construct: {
    // Create text element
    text: function(text) {
      return this.put(new SVG.Text).text(text)
    }
    // Create plain text element
  , plain: function(text) {
      return this.put(new SVG.Text).plain(text)
    }
  }

})

SVG.Tspan = SVG.invent({
  // Initialize node
  create: 'tspan'

  // Inherit from
, inherit: SVG.Shape

  // Add class methods
, extend: {
    // Set text content
    text: function(text) {
      typeof text === 'function' ? text.call(this, this) : this.plain(text)

      return this
    }
    // Shortcut dx
  , dx: function(dx) {
      return this.attr('dx', dx)
    }
    // Shortcut dy
  , dy: function(dy) {
      return this.attr('dy', dy)
    }
    // Create new line
  , newLine: function() {
      /* fetch text parent */
      var t = this.doc(SVG.Text)

      /* mark new line */
      this.newLined = true

      /* apply new hy¡n */
      return this.dy(t._leading * t.attr('font-size')).attr('x', t.x())
    }
  }
  
})

SVG.extend(SVG.Text, SVG.Tspan, {
  // Create plain text node
  plain: function(text) {
    /* clear if build mode is disabled */
    if (this._build === false)
      this.clear()

    /* create text node */
    this.node.appendChild(document.createTextNode((this.content = text)))
    
    return this
  }
  // Create a tspan
, tspan: function(text) {
    var node  = (this.textPath || this).node
      , tspan = new SVG.Tspan

    /* clear if build mode is disabled */
    if (this._build === false)
      this.clear()
    
    /* add new tspan and reference */
    node.appendChild(tspan.node)

    /* only first level tspans are considered to be "lines" */
    if (this instanceof SVG.Text)
      this.lines.add(tspan)

    return tspan.text(text)
  }
  // Clear all lines
, clear: function() {
    var node = (this.textPath || this).node

    /* remove existing child nodes */
    while (node.hasChildNodes())
      node.removeChild(node.lastChild)
    
    /* reset content references  */
    if (this instanceof SVG.Text) {
      delete this.lines
      this.lines = new SVG.Set
      this.content = ''
    }
    
    return this
  }
  // Get length of text element
, length: function() {
    return this.node.getComputedTextLength()
  }
})

// Register rebuild event
SVG.registerEvent('rebuild')

SVG.TextPath = SVG.invent({
  // Initialize node
  create: 'textPath'

  // Inherit from
, inherit: SVG.Element

  // Define parent class
, parent: SVG.Text

  // Add parent method
, construct: {
    // Create path for text to run on
    path: function(d) {
      /* create textPath element */
      this.textPath = new SVG.TextPath

      /* move lines to textpath */
      while(this.node.hasChildNodes())
        this.textPath.node.appendChild(this.node.firstChild)

      /* add textPath element as child node */
      this.node.appendChild(this.textPath.node)

      /* create path in defs */
      this.track = this.doc().defs().path(d)

      /* create circular reference */
      this.textPath.parent = this

      /* link textPath to path and add content */
      this.textPath.attr('href', '#' + this.track, SVG.xlink)

      return this
    }
    // Plot path if any
  , plot: function(d) {
      if (this.track) this.track.plot(d)
      return this
    }
  }
})
SVG.Nested = SVG.invent({
  // Initialize node
  create: function() {
    this.constructor.call(this, SVG.create('svg'))
    
    this.style('overflow', 'visible')
  }

  // Inherit from
, inherit: SVG.Container
  
  // Add parent method
, construct: {
    // Create nested svg document
    nested: function() {
      return this.put(new SVG.Nested)
    }
  }
})
SVG.A = SVG.invent({
  // Initialize node
  create: 'a'

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Link url
    to: function(url) {
      return this.attr('href', url, SVG.xlink)
    }
    // Link show attribute
  , show: function(target) {
      return this.attr('show', target, SVG.xlink)
    }
    // Link target attribute
  , target: function(target) {
      return this.attr('target', target)
    }
  }
  
  // Add parent method
, construct: {
    // Create a hyperlink element
    link: function(url) {
      return this.put(new SVG.A).to(url)
    }
  }
})

SVG.extend(SVG.Element, {
  // Create a hyperlink element
  linkTo: function(url) {
    var link = new SVG.A

    if (typeof url == 'function')
      url.call(link, link)
    else
      link.to(url)

    return this.parent().put(link).put(this)
  }
  
})
SVG.Marker = SVG.invent({
  // Initialize node
  create: 'marker'

  // Inherit from
, inherit: SVG.Container

  // Add class methods
, extend: {
    // Set width of element
    width: function(width) {
      return this.attr('markerWidth', width)
    }
    // Set height of element
  , height: function(height) {
      return this.attr('markerHeight', height)
    }
    // Set marker refX and refY
  , ref: function(x, y) {
      return this.attr('refX', x).attr('refY', y)
    }
    // Update marker
  , update: function(block) {
      /* remove all content */
      this.clear()
      
      /* invoke passed block */
      if (typeof block == 'function')
        block.call(this, this)
      
      return this
    }
    // Return the fill id
  , toString: function() {
      return 'url(#' + this.id() + ')'
    }
  }

  // Add parent method
, construct: {
    marker: function(width, height, block) {
      // Create marker element in defs
      return this.defs().marker(width, height, block)
    }
  }

})

SVG.extend(SVG.Defs, {
  // Create marker
  marker: function(width, height, block) {
    // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
    return this.put(new SVG.Marker)
      .size(width, height)
      .ref(width / 2, height / 2)
      .viewbox(0, 0, width, height)
      .attr('orient', 'auto')
      .update(block)
  }
  
})

SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, SVG.Path, {
  // Create and attach markers
  marker: function(marker, width, height, block) {
    var attr = ['marker']

    // Build attribute name
    if (marker != 'all') attr.push(marker)
    attr = attr.join('-')

    // Set marker attribute
    marker = arguments[1] instanceof SVG.Marker ?
      arguments[1] :
      this.doc().marker(width, height, block)
    
    return this.attr(attr, marker)
  }
  
})
// Define list of available attributes for stroke and fill
var sugar = {
  stroke: ['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset']
, fill:   ['color', 'opacity', 'rule']
, prefix: function(t, a) {
    return a == 'color' ? t : t + '-' + a
  }
}

/* Add sugar for fill and stroke */
;['fill', 'stroke'].forEach(function(m) {
  var i, extension = {}
  
  extension[m] = function(o) {
    if (typeof o == 'string' || SVG.Color.isRgb(o) || (o && typeof o.fill === 'function'))
      this.attr(m, o)

    else
      /* set all attributes from sugar.fill and sugar.stroke list */
      for (i = sugar[m].length - 1; i >= 0; i--)
        if (o[sugar[m][i]] != null)
          this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]])
    
    return this
  }
  
  SVG.extend(SVG.Element, SVG.FX, extension)
  
})

SVG.extend(SVG.Element, SVG.FX, {
  // Rotation
  rotate: function(d, cx, cy) {
    return this.transform({ rotation: d, cx: cx, cy: cy })
  }
  // Skew
, skew: function(x, y) {
    return this.transform({ skewX: x, skewY: y })
  }
  // Scale
, scale: function(x, y, cx, cy) {
    return arguments.length == 1  || arguments.length == 3 ?
      this.transform({ scale: x,  cx: y, cy: cx }) :
      this.transform({ scaleX: x, scaleY: y, cx: cx, cy: cy })
  }
  // Translate
, translate: function(x, y) {
    return this.transform({ x: x, y: y })
  }
  // Matrix
, matrix: function(m) {
    return this.attr('transform', new SVG.Matrix(m))
  }
  // Opacity
, opacity: function(value) {
    return this.attr('opacity', value)
  }
})

SVG.extend(SVG.Rect, SVG.Ellipse, SVG.Circle, SVG.FX, {
  // Add x and y radius
  radius: function(x, y) {
    return this.rx(x).ry(y == null ? x : y)
  }
})

SVG.extend(SVG.Path, {
  // Get path length
  length: function() {
    return this.node.getTotalLength()
  }
  // Get point at length
, pointAt: function(length) {
    return this.node.getPointAtLength(length)
  }
})

SVG.extend(SVG.Parent, SVG.Text, SVG.FX, {
  // Set font 
  font: function(o) {
    for (var k in o)
      k == 'leading' ?
        this.leading(o[k]) :
      k == 'anchor' ?
        this.attr('text-anchor', o[k]) :
      k == 'size' || k == 'family' || k == 'weight' || k == 'stretch' || k == 'variant' || k == 'style' ?
        this.attr('font-'+ k, o[k]) :
        this.attr(k, o[k])
    
    return this
  }
})


SVG.Set = SVG.invent({
  // Initialize
  create: function(members) {
    // Set initial state
    Array.isArray(members) ?this.members = members : this.clear()
  }

  // Add class methods
, extend: {
    // Add element to set
    add: function() {
      var i, il, elements = [].slice.call(arguments)

      for (i = 0, il = elements.length; i < il; i++)
        this.members.push(elements[i])
      
      return this
    }
    // Remove element from set
  , remove: function(element) {
      var i = this.index(element)
      
      /* remove given child */
      if (i > -1)
        this.members.splice(i, 1)

      return this
    }
    // Iterate over all members
  , each: function(block) {
      for (var i = 0, il = this.members.length; i < il; i++)
        block.apply(this.members[i], [i, this.members])

      return this
    }
    // Restore to defaults
  , clear: function() {
      /* initialize store */
      this.members = []

      return this
    }
    // Checks if a given element is present in set
  , has: function(element) {
      return this.index(element) >= 0
    }
    // retuns index of given element in set
  , index: function(element) {
      return this.members.indexOf(element)
    }
    // Get member at given index
  , get: function(i) {
      return this.members[i]
    }
    // Get first member
  , first: function() {
      return this.get(0)
    }
    // Get last member
  , last: function() {
      return this.get(this.members.length - 1)
    }
    // Default value
  , valueOf: function() {
      return this.members
    }
    // Get the bounding box of all members included or empty box if set has no items
  , bbox: function(){
      var box = new SVG.BBox()

      /* return an empty box of there are no members */
      if (this.members.length == 0)
        return box

      /* get the first rbox and update the target bbox */
      var rbox = this.members[0].rbox()
      box.x      = rbox.x
      box.y      = rbox.y
      box.width  = rbox.width
      box.height = rbox.height

      this.each(function() {
        /* user rbox for correct position and visual representation */
        box = box.merge(this.rbox())
      })

      return box
    }
  }
  
  // Add parent method
, construct: {
    // Create a new set
    set: function(members) {
      return new SVG.Set(members)
    }
  }
})

SVG.SetFX = SVG.invent({
  // Initialize node
  create: function(set) {
    /* store reference to set */
    this.set = set
  }

})

// Alias methods
SVG.Set.inherit = function() {
  var m
    , methods = []
  
  /* gather shape methods */
  for(var m in SVG.Shape.prototype)
    if (typeof SVG.Shape.prototype[m] == 'function' && typeof SVG.Set.prototype[m] != 'function')
      methods.push(m)

  /* apply shape aliasses */
  methods.forEach(function(method) {
    SVG.Set.prototype[method] = function() {
      for (var i = 0, il = this.members.length; i < il; i++)
        if (this.members[i] && typeof this.members[i][method] == 'function')
          this.members[i][method].apply(this.members[i], arguments)

      return method == 'animate' ? (this.fx || (this.fx = new SVG.SetFX(this))) : this
    }
  })

  /* clear methods for the next round */
  methods = []

  /* gather fx methods */
  for(var m in SVG.FX.prototype)
    if (typeof SVG.FX.prototype[m] == 'function' && typeof SVG.SetFX.prototype[m] != 'function')
      methods.push(m)

  /* apply fx aliasses */
  methods.forEach(function(method) {
    SVG.SetFX.prototype[method] = function() {
      for (var i = 0, il = this.set.members.length; i < il; i++)
        this.set.members[i].fx[method].apply(this.set.members[i].fx, arguments)

      return this
    }
  })
}



//
SVG.extend(SVG.Element, {
	// Store data values on svg nodes
  data: function(a, v, r) {
  	if (typeof a == 'object') {
  		for (v in a)
  			this.data(v, a[v])

    } else if (arguments.length < 2) {
      try {
        return JSON.parse(this.attr('data-' + a))
      } catch(e) {
        return this.attr('data-' + a)
      }
      
    } else {
      this.attr(
        'data-' + a
      , v === null ?
          null :
        r === true || typeof v === 'string' || typeof v === 'number' ?
          v :
          JSON.stringify(v)
      )
    }
    
    return this
  }
})
SVG.extend(SVG.Element, {
  // Remember arbitrary data
  remember: function(k, v) {
    /* remember every item in an object individually */
    if (typeof arguments[0] == 'object')
      for (var v in k)
        this.remember(v, k[v])

    /* retrieve memory */
    else if (arguments.length == 1)
      return this.memory()[k]

    /* store memory */
    else
      this.memory()[k] = v

    return this
  }

  // Erase a given memory
, forget: function() {
    if (arguments.length == 0)
      this._memory = {}
    else
      for (var i = arguments.length - 1; i >= 0; i--)
        delete this.memory()[arguments[i]]

    return this
  }

  // Initialize or return local memory object
, memory: function() {
    return this._memory || (this._memory = {})
  }

})
// Method for getting an element by id
SVG.get = function(id) {
  var node = document.getElementById(idFromReference(id) || id)
  if (node) return SVG.adopt(node)
}

// Select elements by query string
SVG.select = function(query, parent) {
  return new SVG.Set(
    SVG.utils.map((parent || document).querySelectorAll(query), function(node) {
      return SVG.adopt(node)
    })
  )
}

SVG.extend(SVG.Parent, {
  // Scoped select method
  select: function(query) {
    return SVG.select(query, this.node)
  }

})

// Use AMD or CommonJS if either is present
if (typeof define === 'function' && define.amd)
  define(function() { return SVG })
else if (typeof exports !== 'undefined')
  exports.SVG = SVG
// Convert dash-separated-string to camelCase
function camelCase(s) { 
	return s.toLowerCase().replace(/-(.)/g, function(m, g) {
		return g.toUpperCase()
	})
}

// Capitalize first letter of a string
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

// Ensure to six-based hex 
function fullHex(hex) {
	return hex.length == 4 ?
		[ '#',
			hex.substring(1, 2), hex.substring(1, 2)
		, hex.substring(2, 3), hex.substring(2, 3)
		, hex.substring(3, 4), hex.substring(3, 4)
		].join('') : hex
}

// Component to hex value
function compToHex(comp) {
	var hex = comp.toString(16)
	return hex.length == 1 ? '0' + hex : hex
}

// Calculate proportional width and height values when necessary
function proportionalSize(box, width, height) {
	if (width == null || height == null) {
		if (height == null)
			height = box.height / box.width * width
		else if (width == null)
			width = box.width / box.height * height
	}
	
	return {
		width:  width
	, height: height
	}
}

// Delta transform point
function deltaTransformPoint(matrix, x, y) {
	return {
		x: x * matrix.a + y * matrix.c + 0
	, y: x * matrix.b + y * matrix.d + 0
	}
}

// Map matrix array to object
function arrayToMatrix(a) {
	return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] }
}

// Calculate position according to from and to
function at(o, pos) {
	/* number recalculation (don't bother converting to SVG.Number for performance reasons) */
	return typeof o.from == 'number' ?
		o.from + (o.to - o.from) * pos :
	
	/* instance recalculation */
	o instanceof SVG.Color || o instanceof SVG.Number ? o.at(pos) :
	
	/* for all other values wait until pos has reached 1 to return the final value */
	pos < 1 ? o.from : o.to
}

// PathArray Helpers
function arrayToString(a) {
	for (var i = 0, il = a.length, s = ''; i < il; i++) {
		s += a[i][0]

		if (a[i][1] != null) {
			s += a[i][1]

			if (a[i][2] != null) {
				s += ' '
				s += a[i][2]

				if (a[i][3] != null) {
					s += ' '
					s += a[i][3]
					s += ' '
					s += a[i][4]

					if (a[i][5] != null) {
						s += ' '
						s += a[i][5]
						s += ' '
						s += a[i][6]

						if (a[i][7] != null) {
							s += ' '
							s += a[i][7]
						}
					}
				}
			}
		}
	}
	
	return s + ' '
}

// Deep new id assignment
function assignNewId(node) {
	// Do the same for SVG child nodes as well
	for (var i = node.childNodes.length - 1; i >= 0; i--)
		if (node.childNodes[i] instanceof SVGElement)
			assignNewId(node.childNodes[i])

	return SVG.adopt(node).id(SVG.eid(node.nodeName))
}

// Add more bounding box properties
function fullBox(b) {
	b.x2 = b.x + b.width
	b.y2 = b.y + b.height
	b.cx = b.x + b.width / 2
	b.cy = b.y + b.height / 2

	return b
}

// Get id from reference string
function idFromReference(url) {
	var m = url.toString().match(SVG.regex.reference)

	if (m) return m[1]
}

// Create matrix array for looping
var abcdef = 'abcdef'.split('')

// Shim layer with setTimeout fallback by Paul Irish
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame    ||
					window.msRequestAnimationFrame     ||
					function (c) { window.setTimeout(c, 1000 / 60) }
})()
// Add CustomEvent to IE9 and IE10 
if (typeof CustomEvent !== 'function') {
  // Code from: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
  function CustomEvent (event, options) {
    options = options || { bubbles: false, cancelable: false, detail: undefined }
    var e = document.createEvent('CustomEvent')
    e.initCustomEvent(event, options.bubbles, options.cancelable, options.detail)
    return e
  }

  CustomEvent.prototype = window.Event.prototype

  window.CustomEvent = CustomEvent
}
}).call(this);