/**
 * Created by krause on 2014-10-25.
 */

function BubbleSet() {
  var thatBS = this;

  function Rectangle(_rect) {
    var that = this;
    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    var centroidDistance = 0;

    this.rect = function(r) {
      if(!arguments.length) return {
        x: x,
        y: y,
        width: width,
        height: height
      };
      x = r.x;
      y = r.y;
      width = r.width;
      height = r.height;
    };
    this.minX = function() {
      return x;
    };
    this.minY = function() {
      return y;
    };
    this.maxX = function() {
      return x + width;
    };
    this.maxY = function() {
      return y + height;
    };
    this.centerX = function() {
      return x + width * 0.5;
    };
    this.centerY = function() {
      return y + height * 0.5;
    };
    this.width = function() {
      return width;
    };
    this.height = function() {
      return height;
    };
    this.centroidDistance = function(cd) {
      if(!arguments.length) return centroidDistance;
      centroidDistance = cd;
    };
    this.cmp = function(rect) {
      if(centroidDistance < rect.centroidDistance()) return -1;
      if(centroidDistance > rect.centroidDistance()) return 0;
      return 0;
    };
    this.add = function(rect) {
      var tmpx = Math.min(that.minX(), rect.minX());
      var tmpy = Math.min(that.minY(), rect.minY());
      var maxX = Math.max(that.maxX(), rect.maxX());
      var maxY = Math.max(that.maxY(), rect.maxY());
      x = tmpx;
      y = tmpy;
      width = maxX - x;
      height = maxY - y;
    };
    this.contains = function(p) {
      var px = p.x();
      if(px < x || px >= x + width) return false;
      var py = p.y();
      return !(py < y || py >= y + height);
    };
    this.intersects = function(rect) {
      if(that.width() <= 0 || that.height() <= 0 || rect.width() <= 0 || rect.height() <= 0) return false;
      return (rect.maxX() > that.minX() &&
              rect.maxY() > that.minY() &&
              rect.minX() < that.maxX() &&
              rect.minY() < that.maxY());
    };
    this.intersectsLine = function(line) {
      var x1 = line.x1();
      var y1 = line.y1();
      var x2 = line.x2();
      var y2 = line.y2();
      // taken from JDK 8 java.awt.geom.Rectangle2D.Double#intersectsLine(double, double, double, double)
      var out1;
      var out2;
      if((out2 = that.outcode(x2, y2)) === 0) {
        return true;
      }
      while((out1 = that.outcode(x1, y1)) !== 0) {
        if((out1 & out2) !== 0) {
          return false;
        }
        if((out1 & (Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT)) !== 0) {
          var x = that.minX();
          if((out1 & Rectangle.OUT_RIGHT) !== 0) {
            x += that.width();
          }
          y1 = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
          x1 = x;
        } else {
          var y = that.minY();
          if((out1 & Rectangle.OUT_BOTTOM) !== 0) {
            y += that.height();
          }
          x1 = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
          y1 = y;
        }
      }
      return true;
    };
    this.outcode = function(px, py) {
      // taken from JDK 8 java.awt.geom.Rectangle2D.Double#outcode(double, double)
      var out = 0;
      if(width <= 0) {
        out |= Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT;
      } else if(px < x) {
        out |= Rectangle.OUT_LEFT;
      } else if(px > x + width) {
        out |= Rectangle.OUT_RIGHT;
      }
      if(height <= 0) {
        out |= Rectangle.OUT_TOP | Rectangle.OUT_BOTTOM;
      } else if (py < y) {
        out |= Rectangle.OUT_TOP;
      } else if (py > y + height) {
        out |= Rectangle.OUT_BOTTOM;
      }
      return out;
    };

    if(arguments.length && _rect) {
      this.rect(_rect);
    }
  } // Rectangle
  Rectangle.prototype.toString = function() {
    return "Rectangle[x=" + this.minX() + ", y=" + this.minY() + ", w=" + this.width() + ", h=" + this.height() + "]";
  };
  Rectangle.OUT_LEFT = 1;
  Rectangle.OUT_TOP = 2;
  Rectangle.OUT_RIGHT = 4;
  Rectangle.OUT_BOTTOM = 8;

  function Point(ax, ay) {
    var x = ax;
    var y = ay;
    this.x = function(_) {
      if(!arguments.length) return x;
      x = _;
    };
    this.y = function(_) {
      if(!arguments.length) return y;
      y = _;
    };
    this.distanceSq = function(p) {
      return (p.x() - x) * (p.x() - x) + (p.y() - y) * (p.y() - y);
    };
    this.get = function() {
      return [ x, y ];
    };
  } // Point
  Point.doublePointsEqual = function(p1, p2, delta) {
    return p1.distanceSq(p2) < delta * delta;
  };

  function PointList(size) {
    var els = 0;
    var arr = [];
    arr.length = size; // pre-allocating
    var set = {};

    function hash(p) {
      return p.x() + "x" + p.y();
    }

    this.add = function(p) {
      set[hash(p)] = p;
      arr[els] = p;
      els += 1;
    };
    this.contains = function(p) {
      var test = set[hash(p)];
      if(!test) return false;
      return test.x() == p.x() && test.y() == p.y();
    };
    this.isFirst = function(p) {
      if(!els) return false;
      var test = arr[0];
      return test.x() == p.x() && test.y() == p.y();
    };
    this.list = function() {
      return arr.filter(function(p) {
        return p;
      }).map(function(p) {
        return p.get();
      });
    };
    this.clear = function() {
      for(var i = 0;i < arr.length;i += 1) {
        arr[i] = null; // nulling is cheaper than deleting or reallocating
      }
      set = {};
      els = 0;
    };
    this.get = function(ix) {
      return arr[ix];
    };
    this.size = function() {
      return els;
    };
  }; // PointList

  function Line(_p1, _p2) {
    var that = this;
    var p1 = _p1;
    var p2 = _p2;

    this.rect = function() {
      var minX = Math.min(p1.x(), p2.x());
      var minY = Math.min(p1.y(), p2.y());
      var maxX = Math.max(p1.x(), p2.x());
      var maxY = Math.max(p1.y(), p2.y());
      var res = new Rectangle({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
      return res;
    }
    this.x1 = function() {
      return p1.x();
    };
    this.x2 = function() {
      return p2.x();
    };
    this.y1 = function() {
      return p1.y();
    };
    this.y2 = function() {
      return p2.y();
    };
    this.p1 = function(_p1) {
      if(!arguments.length) return p1;
      p1 = _p1;
    };
    this.p2 = function(_p2) {
      if(!arguments.length) return p2;
      p2 = _p2;
    };
    // whether an infinite line to positive x from the point p will cut through the line
    this.cuts = function(p) {
      var y1 = that.y1();
      var y2 = that.y2();
      if(y1 == y2) return false;
      var y = p.y();
      if((y < y1 && y <= y2) || (y > y1 && y >= y2)) return false;
      var x = p.x();
      var x1 = that.x1();
      var x2 = that.x2();
      if(x > x1 && x >= x2) return false;
      if(x < x1 && x <= x2) return true;
      var cross = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
      return x <= cross;
    };
    this.ptSegDistSq = function(x, y) {
      return Line.ptSegDistSq(that.x1(), that.y1(), that.x2(), that.y2(), x, y);
    };
  }; // Line
  Line.ptSegDistSq = function(lx1, ly1, lx2, ly2, x, y) {
    // taken from JDK 8 java.awt.geom.Line2D#ptSegDistSq(double, double, double, double, double, double)
    var x1 = lx1;
    var y1 = ly1;
    var x2 = lx2 - x1;
    var y2 = ly2 - y1;
    var px = x - x1;
    var py = y - y1;
    var dotprod = px * x2 + py * y2;
    var projlenSq;
    if(dotprod <= 0) {
      projlenSq = 0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;
      if(dotprod <= 0) {
        projlenSq = 0;
      } else {
        projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
      }
    }
    var lenSq = px * px + py * py - projlenSq;
    if(lenSq < 0) {
      lenSq = 0;
    }
    return lenSq;
  };

  function Area(width, height) {
    var size = width * height;
    var buff = new Float32Array(size);

    this.get = function(x, y) {
      if(x < 0 || x >= width || y < 0 || y >= height) return Number.NaN;
      return buff[x + y * width];
    };
    this.set = function(x, y, v) {
      buff[x + y * width] = v;
    };
    this.width = function() {
      return width;
    };
    this.height = function() {
      return height;
    };
  } // Area

  function Intersection(p, s) {
    var point = p;
    var state = s;

    this.getState = function() {
      return state;
    };
    this.getPoint = function() {
      return point;
    };
  } // Intersection
  Intersection.POINT = 1;
  Intersection.PARALLEL = 2;
  Intersection.COINCIDENT = 3;
  Intersection.NONE = 4;
  Intersection.intersectLineLine = function(la, lb) {
    var uaT = (lb.x2() - lb.x1()) * (la.y1() - lb.y1())
            - (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    var ubT = (la.x2() - la.x1()) * (la.y1() - lb.y1())
            - (la.y2() - la.y1()) * (la.x1() - lb.x1());
    var uB  = (lb.y2() - lb.y1()) * (la.x2() - la.x1())
            - (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if(uB) {
      var ua = uaT / uB;
      var ub = ubT / uB;
      if(0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        var p = new Point(la.x1() + ua * (la.x2() - la.x1()), la.y1() + ua * (la.y2() - la.y1()));
        return new Intersection(p, Intersection.POINT);
      }
      return new Intersection(null, Intersection.NONE);
    }
    return new Intersection(null, (uaT == 0 || ubT == 0) ? Intersection.COINCIDENT : Intersection.PARALLEL);
  };
  Intersection.fractionAlongLineA = function(la, lb) {
    var uaT = (lb.x2() - lb.x1()) * (la.y1() - lb.y1())
            - (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    var ubT = (la.x2() - la.x1()) * (la.y1() - lb.y1())
            - (la.y2() - la.y1()) * (la.x1() - lb.x1());
    var uB  = (lb.y2() - lb.y1()) * (la.x2() - la.x1())
            - (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if(uB) {
      var ua = uaT / uB;
      var ub = ubT / uB;
      if(0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        return ua;
      }
    }
    return Number.POSITIVE_INFINITY;
  };
  Intersection.fractionToLineCenter = function(bounds, line) {
    var minDistance = Number.POSITIVE_INFINITY;
    var countIntersections = 0;

    function testLine(xa, ya, xb, yb) {
      var testDistance = Intersection.fractionAlongLineA(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      testDistance = Math.abs(testDistance - 0.5);
      if((testDistance >= 0) && (testDistance <= 1)) {
        countIntersections += 1;
        if(testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    }

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if(countIntersections == 0) return -1;
    return minDistance;
  };
  Intersection.fractionToLineEnd = function(bounds, line) {
    var minDistance = Number.POSITIVE_INFINITY;
    var countIntersections = 0;

    function testLine(xa, ya, xb, yb) {
      var testDistance = Intersection.fractionAlongLineA(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      if((testDistance >= 0) && (testDistance <= 1)) {
        countIntersections += 1;
        if(testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    }

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if(countIntersections == 0) return -1;
    return minDistance;
  };
  Intersection.testIntersection = function(line, bounds, intersections) {
    var countIntersections = 0;

    function fillIntersection(ix, xa, ya, xb, yb) {
      intersections[ix] = Intersection.intersectLineLine(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      if(intersections[ix].getState == Intersection.POINT) {
        countIntersections += 1;
      }
    }

    // top
    fillIntersection(0, bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    fillIntersection(1, bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    // bottom
    fillIntersection(2, bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    // right
    fillIntersection(3, bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    return countIntersections;
  };

  function MarchingSquares(contour, potentialArea, step, t) {
    var direction = MarchingSquares.S;
    var threshold = t;
    var marched = false;

    function updateDir(x, y, dir, res) {
      var v = potentialArea.get(x, y);
      if(isNaN(v)) return v;
      if(v > threshold) return dir + res;
      return dir;
    }

    function getState(x, y) {
      var dir = 0;
      dir = updateDir(x, y, dir, 1);
      dir = updateDir(x + 1, y, dir, 2);
      dir = updateDir(x, y + 1, dir, 4);
      dir = updateDir(x + 1, y + 1, dir, 8);
      if(isNaN(dir)) {
        console.warn("marched out of bounds: " + x + " " + y + " bounds: " + potentialArea.width() + " " + potentialArea.height());
        return -1;
      }
      return dir;
    }

    function doMarch(xpos, ypos) {
      var x = xpos;
      var y = ypos;
      for(;;) { // iterative version of end recursion
        var p = new Point(x * step, y * step);
        // check if we're back where we started
        if(contour.contains(p)) {
          if(!contour.isFirst(p)) {
            // encountered a loop but haven't returned to start; will change
            // direction using conditionals and continue back to start
          } else {
            return true;
          }
        } else {
          contour.add(p);
        }
        var state = getState(x, y);
        // x, y are upper left of 2X2 marching square
        switch(state) {
          case -1:
            return true; // Marched out of bounds
          case 0:
          case 3:
          case 2:
          case 7:
            direction = MarchingSquares.E;
            break;
          case 12:
          case 14:
          case 4:
            direction = MarchingSquares.W;
            break;
          case 6:
            direction = (direction == MarchingSquares.N) ? MarchingSquares.W : MarchingSquares.E;
            break;
          case 1:
          case 13:
          case 5:
            direction = MarchingSquares.N;
            break;
          case 9:
            direction = (direction == MarchingSquares.E) ? MarchingSquares.N : MarchingSquares.S;
            break;
          case 10:
          case 8:
          case 11:
            direction = MarchingSquares.S;
            break;
          default:
            console.warn("Marching squares invalid state: " + state);
            return true;
        }

        switch(direction) {
          case MarchingSquares.N:
            y -= 1; // up
            break;
          case MarchingSquares.S:
            y += 1; // down
            break;
          case MarchingSquares.W:
            x -= 1; // left
            break;
          case MarchingSquares.E:
            x += 1; // right
            break;
          default:
            console.warn("Marching squares invalid state: " + state);
            return true;
        }
      }
      console.warn("should not be reachable...");
      return true;
    }

    this.march = function() {
      for(var x = 0;x < potentialArea.width() && !marched;x += 1) {
        for(var y = 0;y < potentialArea.height() && !marched;y += 1) {
          if(potentialArea.get(x, y) > threshold && getState(x, y) != 15) {
            marched = doMarch(x, y);
          }
        }
      }
      return marched;
    };
  } // MarchingSquares
  MarchingSquares.N = 0;
  MarchingSquares.S = 1;
  MarchingSquares.E = 2;
  MarchingSquares.W = 3;

  var maxRoutingIterations = BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS;
  var maxMarchingIterations = BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS;
  var pixelGroup = BubbleSet.DEFAULT_PIXEL_GROUP;
  var edgeR0 = BubbleSet.DEFAULT_EDGE_R0;
  var edgeR1 = BubbleSet.DEFAULT_EDGE_R1;
  var nodeR0 = BubbleSet.DEFAULT_NODE_R0;
  var nodeR1 = BubbleSet.DEFAULT_NODE_R1;
  var morphBuffer = BubbleSet.DEFAULT_MORPH_BUFFER;
  var skip = BubbleSet.DEFAULT_SKIP;

  this.maxRoutingIterations = function(_) {
    if(!arguments.length) return maxRoutingIterations;
    maxRoutingIterations = _;
  };
  this.maxMarchingIterations = function(_) {
    if(!arguments.length) return maxMarchingIterations;
    maxMarchingIterations = _;
  };
  this.pixelGroup = function(_) {
    if(!arguments.length) return pixelGroup;
    pixelGroup = _;
  };
  this.edgeR0 = function(_) {
    if(!arguments.length) return edgeR0;
    edgeR0 = _;
  };
  this.edgeR1 = function(_) {
    if(!arguments.length) return edgeR1;
    edgeR1 = _;
  };
  this.nodeR0 = function(_) {
    if(!arguments.length) return nodeR0;
    nodeR0 = _;
  };
  this.nodeR1 = function(_) {
    if(!arguments.length) return nodeR1;
    nodeR1 = _;
  };
  this.morphBuffer = function(_) {
    if(!arguments.length) return morphBuffer;
    morphBuffer = _;
  };
  this.skip = function(_) {
    if(!arguments.length) return skip;
    skip = _;
  };

  var threshold = 1;
  var nodeInfluenceFactor = 1;
  var edgeInfluenceFactor = 1;
  var negativeNodeInfluenceFactor = -0.8;
  var activeRegion = null;
  var virtualEdges = [];
  var potentialArea = null;

  var lastThreshold = Number.NaN;

  this.createOutline = function(members, nonmem, edges) {
    if(!members.length) return [];

    var memberItems = members.map(function(m) {
      return new Rectangle(m);
    });
    var nonMembers = nonmem.map(function(m) {
      return new Rectangle(m);
    });

    // calculate and store virtual edges
    thatBS.calculateVirtualEdges(memberItems, nonMembers);

    edges && edges.forEach(function(e) {
      virtualEdges.push(new Line(new Point(e.x1, e.y1), new Point(e.x2, e.y2)));
    });

    activeRegion = null;
    memberItems.forEach(function(m) {
      if(!activeRegion) {
        activeRegion = new Rectangle(m.rect());
      } else {
        activeRegion.add(m);
      }
    });

    virtualEdges.forEach(function(l) {
      activeRegion.add(l.rect());
    });

    activeRegion.rect({
      x: activeRegion.minX() - Math.max(edgeR1, nodeR1) - morphBuffer,
      y: activeRegion.minY() - Math.max(edgeR1, nodeR1) - morphBuffer,
      width: activeRegion.width() + 2 * Math.max(edgeR1, nodeR1) + 2 * morphBuffer,
      height: activeRegion.height() + 2 * Math.max(edgeR1, nodeR1) + 2 * morphBuffer,
    });

    potentialArea = new Area(Math.ceil(activeRegion.width() / pixelGroup), Math.ceil(activeRegion.height() / pixelGroup));

    var estLength = (Math.floor(activeRegion.width()) + Math.floor(activeRegion.height())) * 2;
    var surface = new PointList(estLength);

    var tempThreshold = threshold;
    var tempNegativeNodeInfluenceFactor = negativeNodeInfluenceFactor;
    var tempNodeInfluenceFactor = nodeInfluenceFactor;
    var tempEdgeInfluenceFactor = edgeInfluenceFactor;

    var iterations = 0;

    // add the aggregate and all it's members and virtual edges
    thatBS.fillPotentialArea(activeRegion, memberItems, nonMembers, potentialArea);

    // try to march, check if surface contains all items
    while((!thatBS.calculateContour(surface, activeRegion, memberItems, nonMembers, potentialArea)) && (iterations < maxMarchingIterations)) {
      surface.clear();
      iterations += 1;

      // reduce negative influences first; this will allow the surface to
      // pass without making it fatter all around (which raising the threshold does)
      if(iterations <= maxMarchingIterations * 0.5) {
        threshold *= 0.95;
        nodeInfluenceFactor *= 1.2;
        edgeInfluenceFactor *= 1.2;
        thatBS.fillPotentialArea(activeRegion, memberItems, nonMembers, potentialArea);
      }

      // after half the iterations, start increasing positive energy and lowering the threshold
      if(iterations > maxMarchingIterations * 0.5) {
        if(negativeNodeInfluenceFactor != 0) {
          threshold *= 0.95;
          negativeNodeInfluenceFactor *= 0.8;
          thatBS.fillPotentialArea(activeRegion, memberItems, nonMembers, potentialArea);
        }
      }
    }

    lastThreshold = threshold;
    threshold = tempThreshold;
    negativeNodeInfluenceFactor = tempNegativeNodeInfluenceFactor;
    nodeInfluenceFactor = tempNodeInfluenceFactor;
    edgeInfluenceFactor = tempEdgeInfluenceFactor;

    // start with global SKIP value, but decrease skip amount if there aren't enough points in the surface
    var thisSkip = skip;
    // prepare viz attribute array
    var size = surface.size();

    if(thisSkip > 1) {
      size = Math.floor(surface.size() / thisSkip);
      // if we reduced too much (fewer than three points in reduced surface) reduce skip and try again
      while((size < 3) && (thisSkip > 1)) {
        thisSkip -= 1;
        size = Math.floor(surface.size() / thisSkip);
      }
    }

    // add the offset of the active area to the coordinates
    var xcorner = activeRegion.minX();
    var ycorner = activeRegion.minY();

    var fhull = new PointList(size);
    // copy hull values
    for(var i = 0, j = 0;j < size;j += 1,i += thisSkip) {
      fhull.add(new Point(surface.get(i).x() + xcorner, surface.get(i).y() + ycorner));
    }

    if(!debug) {
      // getting rid of unused memory preventing a memory leak
      activeRegion = null;
      potentialArea = null;
    }

    return fhull.list();
  };
  var debug = false;
  this.debug = function(_) {
    if(!arguments.length) return debug;
    debug = !!_;
  }
  // call after createOutline
  this.debugPotentialArea = function() {
    debug || console.warn("debug mode should be activated");
    var rects = [];
    for(var x = 0;x < potentialArea.width();x += 1) {
      for(var y = 0;y < potentialArea.height();y += 1) {
        rects.push({
          x: x * pixelGroup + Math.floor(activeRegion.minX()),
          y: y * pixelGroup + Math.floor(activeRegion.minY()),
          width: pixelGroup,
          height: pixelGroup,
          value: potentialArea.get(x, y),
          threshold: lastThreshold,
        });
      }
    }
    return rects;
  };
  this.calculateContour = function(contour, bounds, members, nonMembers, potentialArea) {
    // if no surface could be found stop
    if(!new MarchingSquares(contour, potentialArea, pixelGroup, threshold).march()) return false;
    return thatBS.testContainment(contour, bounds, members, nonMembers)[0];
  };
  this.testContainment = function(contour, bounds, members, nonMembers) {
    // precise bounds checking
    // copy hull values
    var g = [];
    var gbounds = null;

    function contains(g, p) {
      var line = null;
      var first = null;
      var crossings = 0;
      g.forEach(function(cur) {
        if(!line) {
          line = new Line(cur, cur);
          first = cur;
          return;
        }
        line.p1(line.p2());
        line.p2(cur);
        if(line.cuts(p)) {
          crossings += 1;
        }
      });
      if(first) {
        line.p1(line.p2());
        line.p2(first);
        if(line.cuts(p)) {
          crossings += 1;
        }
      }
      return crossings % 2 == 1;
    }

    // start with global SKIP value, but decrease skip amount if there
    // aren't enough points in the surface
    var thisSkip = skip;
    // prepare viz attribute array
    var size = contour.size();
    if(thisSkip > 1) {
      size = contour.size() / thisSkip;
      // if we reduced too much (fewer than three points in reduced surface) reduce skip and try again
      while((size < 3) && (thisSkip > 1)) {
        thisSkip--;
        size = contour.size() / thisSkip;
      }
    }

    var xcorner = bounds.minX();
    var ycorner = bounds.minY();

    // simulate the surface we will eventually draw, using straight segments (approximate, but fast)
    for(var i = 0;i < size - 1;i += 1) {
      var px = contour.get(i * thisSkip).x() + xcorner;
      var py = contour.get(i * thisSkip).y() + ycorner;
      var r = {
        x: px,
        y: py,
        width: 0,
        height: 0
      };
      if(!gbounds) {
        gbounds = new Rectangle(r);
      } else {
        gbounds.add(new Rectangle(r));
      }
      g.push(new Point(px, py));
    }

    var containsAll = true;
    var containsExtra = false;
    if(gbounds) {
      members.forEach(function(item) {
        var p = new Point(item.centerX(), item.centerY());
        // check rough bounds
        containsAll = containsAll && gbounds.contains(p);
        // check precise bounds if rough passes
        containsAll = containsAll && contains(g, p);
      });
      nonMembers.forEach(function(item) {
        var p = new Point(item.centerX(), item.centerY());
        // check rough bounds
        if(gbounds.contains(p)) {
          // check precise bounds if rough passes
          if(contains(g, p)) {
            containsExtra = true;
          }
        }
      });
    }
    return [ containsAll, containsExtra ];
  };
  this.fillPotentialArea = function(activeArea, members, nonMembers, potentialArea) {
    var influenceFactor = 0;
    // add all positive energy (included items) first, as negative energy
    // (morphing) requires all positives to be already set
    if(nodeInfluenceFactor) {
      members.forEach(function(item) {
        // add node energy
        influenceFactor = nodeInfluenceFactor;
        var nodeRDiff = nodeR0 - nodeR1;
        // using inverse a for numerical stability
        var inva = nodeRDiff * nodeRDiff;
        var r = new Rectangle({
          x: item.minX() - activeArea.minX(),
          y: item.minY() - activeArea.minY(),
          width: item.width(),
          height: item.height(),
        });
        thatBS.calculateRectangleInfluence(potentialArea, influenceFactor / inva, nodeR1, r);
      }); // end processing node items of this aggregate
    } // end processing positive node energy

    if(edgeInfluenceFactor) {
      // add the influence of all the virtual edges
      influenceFactor = edgeInfluenceFactor;
      var inva = ((edgeR0 - edgeR1) * (edgeR0 - edgeR1));

      if(virtualEdges.length > 0) {
        thatBS.calculateLinesInfluence(potentialArea, influenceFactor / inva, edgeR1, virtualEdges, activeArea);
      }
    }

    // calculate negative energy contribution for all other visible items within bounds
    if(negativeNodeInfluenceFactor) {
      nonMembers.forEach(function(item) {
        // if item is within influence bounds, add potential
        if(activeArea.intersects(item)) {
          // subtract influence
          influenceFactor = negativeNodeInfluenceFactor;
          var nodeRDiff = nodeR0 - nodeR1;
          // using inverse a for numerical stability
          var inva = nodeRDiff * nodeRDiff;
          var r = new Rectangle({
            x: item.minX() - activeArea.minX(),
            y: item.minY() - activeArea.minY(),
            width: item.width(),
            height: item.height(),
          });
          thatBS.calculateRectangleInfluence(potentialArea, influenceFactor / inva, nodeR1, r);
        }
      });
    }
  };
  this.calculateCentroidDistances = function(items) {
    var totalx = 0;
    var totaly = 0;
    var nodeCount = 0;
    items.forEach(function(item) {
      totalx += item.centerX();
      totaly += item.centerY();
      nodeCount += 1;
    });
    totalx /= nodeCount;
    totaly /= nodeCount;
    items.forEach(function(item) {
      var diffX = totalx - item.centerX();
      var diffY = totaly - item.centerY();
      item.centroidDistance(Math.sqrt(diffX * diffX + diffY * diffY));
    });
  };
  this.calculateVirtualEdges = function(items, nonMembers) {
    var visited = [];
    virtualEdges = [];
    thatBS.calculateCentroidDistances(items);
    items.sort(function(a, b) {
      return a.cmp(b);
    });

    items.forEach(function(item) {
      var lines = thatBS.connectItem(nonMembers, item, visited);
      lines.forEach(function(l) {
        virtualEdges.push(l);
      });
      visited.push(item);
    });
  }

  this.connectItem = function(nonMembers, item, visited) {
    var scannedLines = [];
    var linesToCheck = [];

    var itemCenter = new Point(item.centerX(), item.centerY());
    var closestNeighbour = null;
    var minLengthSq = Number.POSITIVE_INFINITY;
    // discover the nearest neighbour with minimal interference items
    visited.forEach(function(neighbourItem) {
      var nCenter = new Point(neighbourItem.centerX(), neighbourItem.centerY());
      var distanceSq = itemCenter.distanceSq(nCenter);

      var completeLine = new Line(itemCenter, nCenter);
      // augment distance by number of interfering items
      var numberInterferenceItems = thatBS.countInterferenceItems(nonMembers, completeLine);

      // TODO is there a better function to consider interference in nearest-neighbour checking? This is hacky
      if(distanceSq * (numberInterferenceItems + 1) * (numberInterferenceItems + 1) < minLengthSq) {
        closestNeighbour = neighbourItem;
        minLengthSq = distanceSq * (numberInterferenceItems + 1) * (numberInterferenceItems + 1);
      }
    });

    // if there is a visited closest neighbour, add straight line between
    // them to the positive energy to ensure connected clusters
    if(closestNeighbour) {
      var completeLine = new Line(itemCenter, new Point(closestNeighbour.centerX(), closestNeighbour.centerY()));
      // route the edge around intersecting nodes not in set
      linesToCheck.push(completeLine);

      var hasIntersection = true;
      var iterations = 0;
      var intersections = [];
      intersections.length = 4;
      var numIntersections = 0;
      while(hasIntersection && iterations < maxRoutingIterations) {
        hasIntersection = false;
        while(!hasIntersection && linesToCheck.length) {
          var line = linesToCheck.pop();
          // resolve intersections in order along edge
          var closestItem = thatBS.getCenterItem(nonMembers, line);
          if(closestItem) {
            numIntersections = Intersection.testIntersection(line, closestItem, intersections);
            // 2 intersections = line passes through item
            if(numIntersections == 2) {
              var tempMorphBuffer = morphBuffer;
              var movePoint = thatBS.rerouteLine(closestItem, tempMorphBuffer, intersections, true);
              // test the movePoint already exists
              var foundFirst = thatBS.pointExists(movePoint, linesToCheck) || thatBS.pointExists(movePoint, scannedLines);
              var pointInside = thatBS.isPointInsideNonMember(movePoint, nonMembers);
              // prefer first corner, even if buffer becomes very small
              while(!foundFirst && pointInside && (tempMorphBuffer >= 1)) {
                // try a smaller buffer
                tempMorphBuffer /= 1.5;
                movePoint = thatBS.rerouteLine(closestItem, tempMorphBuffer, intersections, true);
                foundFirst = thatBS.pointExists(movePoint, linesToCheck) || thatBS.pointExists(movePoint, scannedLines);
                pointInside = thatBS.isPointInsideNonMember(movePoint, nonMembers);
              }

              if(movePoint && (!foundFirst) && (!pointInside)) {
                // add 2 rerouted lines to check
                linesToCheck.push(new Line(line.p1(), movePoint));
                linesToCheck.push(new Line(movePoint, line.p2()));
                // indicate intersection found
                hasIntersection = true;
              }

              // if we didn't find a valid point around the
              // first corner, try the second
              if(!hasIntersection) {
                tempMorphBuffer = morphBuffer;
                movePoint = thatBS.rerouteLine(closestItem, tempMorphBuffer, intersections, false);
                var foundSecond = thatBS.pointExists(movePoint, linesToCheck) || thatBS.pointExists(movePoint, scannedLines);
                pointInside = thatBS.isPointInsideNonMember(movePoint, nonMembers);
                // if both corners have been used, stop; otherwise gradually reduce buffer and try second corner
                while(!foundSecond && pointInside && (tempMorphBuffer >= 1)) {
                  // try a smaller buffer
                  tempMorphBuffer /= 1.5;
                  movePoint = thatBS.rerouteLine(closestItem, tempMorphBuffer, intersections, false);
                  foundSecond = thatBS.pointExists(movePoint, linesToCheck) || thatBS.pointExists(movePoint, scannedLines);
                  pointInside = thatBS.isPointInsideNonMember(movePoint, nonMembers);
                }

                if(movePoint && (!foundSecond)) {
                  // add 2 rerouted lines to check
                  linesToCheck.push(new Line(line.p1(), movePoint));
                  linesToCheck.push(new Line(movePoint, line.p2()));
                  // indicate intersection found
                  hasIntersection = true;
                }
              }
            }
          } // end check of closest item

          // no intersection found, mark this line as completed
          if(!hasIntersection) {
            scannedLines.push(line);
          }
          iterations += 1;
        } // end inner loop - out of lines or found an intersection
      } // end outer loop - no more intersections or out of iterations

      // finalize any that were not rerouted (due to running out of
      // iterations) or if we aren't morphing
      while(linesToCheck.length) {
        scannedLines.push(linesToCheck.pop());
      }

      // try to merge consecutive lines if possible
      while(scannedLines.length) {
        var line1 = scannedLines.pop();
        if(scannedLines.length) {
          var line2 = scannedLines.pop();
          var mergeLine = new Line(line1.p1(), line2.p2());
          // resolve intersections in order along edge
          var closestItem = thatBS.getCenterItem(nonMembers, mergeLine);
          // merge most recent line and previous line
          if(!closestItem) {
            scannedLines.push(mergeLine);
          } else {
            linesToCheck.push(line1);
            scannedLines.push(line2);
          }
        } else {
          linesToCheck.push(line1);
        }
      }
      scannedLines = linesToCheck;
    }
    return scannedLines;
  };
  this.isPointInsideNonMember = function(point, nonMembers) {
    return nonMembers.some(function(testRectangle) {
      return testRectangle.contains(point);
    });
  };
  this.pointExists = function(pointToCheck, lines) {
    var found = false;
    lines.forEach(function(checkEndPointsLine) {
      if(found) return;
      if(Point.doublePointsEqual(checkEndPointsLine.p1(), pointToCheck, 1e-3)) {
        found = true;
      }
      if(Point.doublePointsEqual(checkEndPointsLine.p2(), pointToCheck, 1e-3)) {
        found = true;
      }
    });
    return found;
  };
  this.calculatePointInfluence = function(potentialArea, factor, r1, pointx, pointy) {
    var p = new Point(pointx, pointy);
    // for every point in potentialArea, calculate distance to point and add influence
    for(var x = 0;x < potentialArea.width();x += 1) {
      for(var y = 0;y < potentialArea.height();y += 1) {
        var temp = new Point(x * pixelGroup, y * pixelGroup);
        var distanceSq = p.distanceSq(temp);
        // only influence if less than r1
        if(distanceSq < r1 * r1) {
          var dr = Math.sqrt(distanceSq) - r1;
          potentialArea.set(x, y, potentialArea.get(x, y) + factor * dr * dr);
        }
      }
    }
  };
  this.getCenterItem = function(items, testLine) {
    var minDistance = Number.POSITIVE_INFINITY;
    var closestItem = null;

    items.forEach(function(interferenceItem) {
      if(interferenceItem.intersectsLine(testLine)) {
        var distance = Intersection.fractionToLineCenter(interferenceItem, testLine);
        // find closest intersection
        if(distance >= 0 && distance < minDistance) {
          closestItem = interferenceItem;
          minDistance = distance;
        }
      }
    });
    return closestItem;
  };
  this.countInterferenceItems = function(interferenceItems, testLine) {
    var count = 0;
    interferenceItems.forEach(function(interferenceItem) {
      if(interferenceItem.intersectsLine(testLine)) {
        if(Intersection.fractionToLineCenter(interferenceItem, testLine) >= 0) {
          count += 1;
        }
      }
    });
    return count;
  };
  this.calculateLinesInfluence = function(potentialArea, influenceFactor, r1, lines, activeRegion) {
    var r = null;
    // calculate active region for the lines
    lines.forEach(function(line) {
      if(!r) {
        r = line.rect();
      } else {
        r.add(line.rect());
      }
    });
    if(!r) return;
    // offset the rectangle by the bubble set bounds to put into 0, 0 space for potentialArea
    r.rect({
      x: r.minX() - activeRegion.minX(),
      y: r.minY() - activeRegion.minY(),
      width: r.width(),
      height: r.height(),
    });
    // find the affected subregion of potentialArea
    var startX = Math.min(Math.max(0, Math.floor((r.minX() - r1) / pixelGroup)), potentialArea.width() - 1);
    var startY = Math.min(Math.max(0, Math.floor((r.minY() - r1) / pixelGroup)), potentialArea.height() - 1);
    var endX = Math.min(potentialArea.width() - 1, Math.max(0, Math.floor((r.minX() + r.width() + r1) / pixelGroup)));
    var endY = Math.min(potentialArea.height(), Math.max(0, Math.floor((r.minY() + r.height() + r1) / pixelGroup)));
    // for every point in active part of potentialArea, calculate distance to nearest point on line and add influence
    for(var x = startX;x < endX;x += 1) {
      for(var y = startY;y < endY;y += 1) {
        // if we are adding negative energy, skip if not already
        // positive; positives have already been added first, and adding
        // negative to <=0 will have no affect on surface
        if(influenceFactor < 0 && potentialArea.get(x, y) <= 0) {
          continue;
        }
        // convert back to screen coordinates
        var tempX = x * pixelGroup + activeRegion.minX();
        var tempY = y * pixelGroup + activeRegion.minY();
        var minDistanceSq = Number.POSITIVE_INFINITY;
        lines.forEach(function(line) {
          // use squared distance for comparison
          var distanceSq = line.ptSegDistSq(tempX, tempY);
          if(distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
          }
        });
        // only influence if less than r1
        if(minDistanceSq < r1 * r1) {
          var mdr = Math.sqrt(minDistanceSq) - r1;
          potentialArea.set(x, y, potentialArea.get(x, y) + influenceFactor * mdr * mdr);
        }
      }
    }
  };
  this.calculateRectangleInfluence = function(potentialArea, influenceFactor, r1, rect) {
    // find the affected subregion of potentialArea
    var startX = Math.min(Math.max(0, Math.floor((rect.minX() - r1) / pixelGroup)), potentialArea.width() - 1);
    var startY = Math.min(Math.max(0, Math.floor((rect.minY() - r1) / pixelGroup)), potentialArea.height() - 1);
    var endX = Math.min(potentialArea.width() - 1, Math.max(0, Math.floor((rect.maxX() + r1) / pixelGroup)));
    var endY = Math.min(potentialArea.height(), Math.max(0, Math.floor((rect.maxY() + r1) / pixelGroup)));
    // for every point in active subregion of potentialArea, calculate
    // distance to nearest point on rectangle and add influence
    for(var x = startX;x < endX;x += 1) {
      for(var y = startY;y < endY;y += 1) {
        // if we are adding negative energy, skip if not already
        // positive; positives have already been added first, and adding
        // negative to <= 0 will have no affect on surface
        if(influenceFactor < 0 && potentialArea.get(x, y) <= 0) {
          continue;
        }
        // convert back to screen coordinates
        var tempX = x * pixelGroup;
        var tempY = y * pixelGroup;
        var distanceSq;
        // test current point to see if it is inside rectangle
        if(rect.contains(new Point(tempX, tempY))) {
          distanceSq = 0;
        } else {
          // which edge of rectangle is closest
          var outcode = rect.outcode(tempX, tempY);
          var p = new Point(tempX, tempY);
          // top
          if((outcode & Rectangle.OUT_TOP) === Rectangle.OUT_TOP) {
            // and left
            if((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
              // linear distance from upper left corner
              distanceSq = p.distanceSq(new Point(rect.minX(), rect.minY()));
            } else {
              // and right
              if((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
                // linear distance from upper right corner
                distanceSq = p.distanceSq(new Point(rect.maxX(), rect.minY()));
              } else {
                // distance from top line segment
                distanceSq = Line.ptSegDistSq(rect.minX(), rect.minY(), rect.maxX(), rect.minY(), tempX, tempY);
              }
            }
          } else {
            // bottom
            if((outcode & Rectangle.OUT_BOTTOM) === Rectangle.OUT_BOTTOM) {
              // and left
              if((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
                // linear distance from lower left corner
                distanceSq = p.distanceSq(new Point(rect.minX(), rect.maxY()));
              } else {
                // and right
                if((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
                  // linear distance from lower right corner
                  distanceSq = p.distanceSq(new Point(rect.maxX(), rect.maxY()));
                } else {
                  // distance from bottom line segment
                  distanceSq = Line.ptSegDistSq(rect.minX(), rect.maxY(), rect.maxX(), rect.maxY(), tempX, tempY);
                }
              }
            } else {
              // left only
              if((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
                // linear distance from left edge
                distanceSq = Line.ptSegDistSq(rect.minX(), rect.minY(), rect.minX(), rect.maxY(), tempX, tempY);
              } else {
                // right only
                if((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
                  // linear distance from right edge
                  distanceSq = Line.ptSegDistSq(rect.maxX(), rect.minY(), rect.maxX(), rect.maxY(), tempX, tempY);
                }
              }
            }
          }
        }
        // only influence if less than r1
        if(distanceSq < r1 * r1) {
          var dr = Math.sqrt(distanceSq) - r1;
          potentialArea.set(x, y, potentialArea.get(x, y) + influenceFactor * dr * dr);
        }
      }
    }
  };
  this.rerouteLine = function(rectangle, rerouteBuffer, intersections, wrapNormal) {
    var topIntersect = intersections[0];
    var leftIntersect = intersections[1];
    var bottomIntersect = intersections[2];
    var rightIntersect = intersections[3];

    // wrap around the most efficient way
    if(wrapNormal) {
      // left side
      if(leftIntersect.getState() === Intersection.POINT) {
        if(topIntersect.getState() === Intersection.POINT) // triangle, must go around top left
          return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
        if(bottomIntersect.getState() === Intersection.POINT) // triangle, must go around bottom left
          return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
        // else through left to right, calculate areas
        var totalArea = rectangle.height() * rectangle.width();
        // top area
        var topArea = rectangle.width() * (((leftIntersect.getPoint().y() - rectangle.minY())
                    + (rightIntersect.getPoint().y() - rectangle.minY())) * 0.5);
        if(topArea < totalArea * 0.5) {
          // go around top (the side which would make a greater movement)
          if(leftIntersect.getPoint().y() > rightIntersect.getPoint().y()) // top left
            return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
          // top right
          return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
        }
        // go around bottom
        if(leftIntersect.getPoint().y() < rightIntersect.getPoint().y()) // bottom left
          return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
        // bottom right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      }
      // right side
      if(rightIntersect.getState() === Intersection.POINT) {
        if(topIntersect.getState() === Intersection.POINT) // triangle, must go around top right
          return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
        if(bottomIntersect.getState() === Intersection.POINT) // triangle, must go around bottom right
          return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      }
      // else through top to bottom, calculate areas
      var totalArea = rectangle.height() * rectangle.width();
      var leftArea = rectangle.height() * (((topIntersect.getPoint().x() - rectangle.minX()) + (rightIntersect.getPoint().x() - rectangle.minX())) * 0.5);
      if(leftArea < totalArea * 0.5) {
        // go around left
        if(topIntersect.getPoint().x() > bottomIntersect.getPoint().x()) // top left
          return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
        // bottom left
        return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      }
      // go around right
      if(topIntersect.getPoint().x() < bottomIntersect.getPoint().x()) // top right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
      // bottom right
      return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
    }
    // wrap around opposite (usually because the first move caused a problem)
    if(leftIntersect.getState() === Intersection.POINT) {
      if(topIntersect.getState() === Intersection.POINT) // triangle, must go around bottom right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      if(bottomIntersect.getState() === Intersection.POINT) // triangle, must go around top right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
      // else through left to right, calculate areas
      var totalArea = rectangle.height() * rectangle.width();
      var topArea = rectangle.width() * (((leftIntersect.getPoint().y() - rectangle.minY()) + (rightIntersect.getPoint().y() - rectangle.minY())) * 0.5);
      if(topArea < totalArea * 0.5) {
        // go around bottom (the side which would make a lesser movement)
        if(leftIntersect.getPoint().y() > rightIntersect.getPoint().y()) // bottom right
          return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
        // bottom left
        return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      }
      // go around top
      if(leftIntersect.getPoint().y() < rightIntersect.getPoint().y()) // top right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
      // top left
      return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
    }
    if(rightIntersect.getState() === Intersection.POINT) {
      if(topIntersect.getState() === Intersection.POINT) // triangle, must go around bottom left
        return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      if(bottomIntersect.getState() === Intersection.POINT) // triangle, must go around top left
        return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
    }
    // else through top to bottom, calculate areas
    var totalArea = rectangle.height() * rectangle.width();
    var leftArea = rectangle.height() * (((topIntersect.getPoint().x() - rectangle.minX()) + (rightIntersect.getPoint().x() - rectangle.minX())) * 0.5);
    if(leftArea < totalArea * 0.5) {
      // go around right
      if(topIntersect.getPoint().x() > bottomIntersect.getPoint().x()) // bottom right
        return new Point(rectangle.maxX() + rerouteBuffer, rectangle.maxY() + rerouteBuffer);
      // top right
      return new Point(rectangle.maxX() + rerouteBuffer, rectangle.minY() - rerouteBuffer);
    }
    // go around left
    if(topIntersect.getPoint().x() < bottomIntersect.getPoint().x()) // bottom left
      return new Point(rectangle.minX() - rerouteBuffer, rectangle.maxY() + rerouteBuffer);
    // top left
    return new Point(rectangle.minX() - rerouteBuffer, rectangle.minY() - rerouteBuffer);
  };
} // BubbleSet
BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS = 100;
BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS = 20;
BubbleSet.DEFAULT_PIXEL_GROUP = 4;
BubbleSet.DEFAULT_EDGE_R0 = 10;
BubbleSet.DEFAULT_EDGE_R1 = 20;
BubbleSet.DEFAULT_NODE_R0 = 15;
BubbleSet.DEFAULT_NODE_R1 = 50;
BubbleSet.DEFAULT_MORPH_BUFFER = BubbleSet.DEFAULT_NODE_R0;
BubbleSet.DEFAULT_SKIP = 8;
