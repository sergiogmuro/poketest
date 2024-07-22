(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; };
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
  defineProperty(
    GeneratorFunctionPrototype,
    "constructor",
    { value: GeneratorFunction, configurable: true }
  );
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    defineProperty(this, "_invoke", { value: enqueue });
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per GeneratorResume behavior specified since ES2015:
        // ES2015 spec, step 3: https://262.ecma-international.org/6.0/#sec-generatorresume
        // Latest spec, step 2: https://tc39.es/ecma262/#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method;
    var method = delegate.iterator[methodName];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method, or a missing .next method, always terminate the
      // yield* loop.
      context.delegate = null;

      // Note: ["return"] must be used for ES3 parsing compatibility.
      if (methodName === "throw" && delegate.iterator["return"]) {
        // If the delegate iterator has a return method, give it a
        // chance to clean up.
        context.method = "return";
        context.arg = undefined;
        maybeInvokeDelegate(delegate, context);

        if (context.method === "throw") {
          // If maybeInvokeDelegate(context) changed context.method from
          // "return" to "throw", let that override the TypeError below.
          return ContinueSentinel;
        }
      }
      if (methodName !== "return") {
        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a '" + methodName + "' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(val) {
    var object = Object(val);
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable != null) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    throw new TypeError(typeof iterable + " is not iterable");
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{}],2:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
require("regenerator-runtime/runtime");
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function isModernBrowser() {
  return 'fetch' in window && 'Promise' in window && 'URLSearchParams' in window;
}
function showIncompatibilityMessage() {
  var messageDiv = document.getElementById('incompatible-browser');
  messageDiv.style.display = 'flex';
}
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

// Ocultar el loading
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}
function showCursor() {
  document.body.style.cursor = 'inherit';
}
function hideCursor() {
  document.body.style.cursor = 'none';
}
function showErrorPopup(error) {
  var errorPopup = document.getElementById('error-popup');
  var errorDetails = document.getElementById('error-details');
  errorDetails.innerText = error;
  errorPopup.style.display = 'block';
}

// Captura de errores globales
window.onerror = function (message, source, lineno, colno, error) {
  var errorMessage = "Error: ".concat(message, "\nSource: ").concat(source, "\nLine: ").concat(lineno, ", Column: ").concat(colno, "\nStack Trace: ").concat(error ? error.stack : 'N/A');
  showErrorPopup(errorMessage);
  return false; // Prevent the default browser error handler
};
var REWIND_FORWARD_TIME_SECONDS = 15;
var SECONDS_REMAINING_NEXT_EPISODE = 30;
var CONTAINER_SESSIONS_LIST_ID = '#sessions-list';
var CONTAINER_EPISODES_LIST_ID = '#episodes-list';
var BASE_URL = 'https://pokemon-project.com';
var MOVIES_URL = '/peliculas/';
var BASE_MOVIES_URL_LIST = BASE_URL + MOVIES_URL;
var LATIN_URL = '/episodios/latino';
var BASE_LATIN_URL_LIST = BASE_URL + LATIN_URL;
var SERIE_URL = '/serie-ash';
var BASE_LATIN_URL_VIDEO = BASE_URL + '/descargas/epis';
var titleName = '';
var videoUrl = null;
var isInVideo = false;
var nextLink = null;
document.addEventListener('DOMContentLoaded', function () {
  if (!isModernBrowser()) {
    showIncompatibilityMessage();
  }
  var content = document.getElementById('content');
  var nextEpisodeBtn = document.getElementById('next-episode');
  function fetchHTML(_x) {
    return _fetchHTML.apply(this, arguments);
  }
  function _fetchHTML() {
    _fetchHTML = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url) {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              showLoading();
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, true);
              xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                  hideLoading();
                  if (xhr.status === 200) {
                    var text = xhr.responseText;
                    var parser = new DOMParser();
                    resolve(parser.parseFromString(text, 'text/html'));
                  } else {
                    showErrorPopup("Failed to fetch: ".concat(url, "\nError: HTTP status ").concat(xhr.status));
                    reject(new Error("HTTP error! status: ".concat(xhr.status)));
                  }
                }
              };
              xhr.send();
            }));
          case 1:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _fetchHTML.apply(this, arguments);
  }
  function setTitleName(name) {
    titleName = name;
  }
  function setVideoUrl(url) {
    videoUrl = url;
  }
  function getCurrentTime() {
    return new Date().getTime();
  }
  function isCacheValid(cacheKey) {
    var lastUpdateTime = localStorage.getItem("".concat(cacheKey, "_cacheUpdateTime"));
    if (lastUpdateTime) {
      var currentTime = getCurrentTime();
      var timeElapsed = currentTime - parseInt(lastUpdateTime);
      var oneHourInMillis = 60 * 60 * 1000 * 12; // 12 horas en milisegundos
      return timeElapsed < oneHourInMillis;
    }
    return false;
  }
  function loadData(_x2, _x3, _x4, _x5) {
    return _loadData.apply(this, arguments);
  }
  function _loadData() {
    _loadData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(cacheKey, url, containerClass, title) {
      var isMovie,
        containerDiv,
        cachedData,
        doc,
        elements,
        dataMap,
        _args2 = arguments;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            isMovie = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : false;
            showLoading();
            content.querySelector('#lists').style.display = 'flex';
            content.querySelector('#menu').style.display = 'inline-flex';
            containerDiv = content.querySelector("".concat(containerClass));
            if (!isCacheValid(cacheKey)) {
              _context2.next = 11;
              break;
            }
            console.log('CACHE DATA KEY ' + cacheKey);
            cachedData = JSON.parse(localStorage.getItem("cached_".concat(cacheKey, "_").concat(url)));
            if (!cachedData) {
              _context2.next = 11;
              break;
            }
            displayData(cachedData, containerDiv, title, isMovie);
            return _context2.abrupt("return");
          case 11:
            console.log('URL TO LOAD DATA ' + url);
            _context2.next = 14;
            return fetchHTML(url);
          case 14:
            doc = _context2.sent;
            elements = doc.querySelectorAll('.real-table tbody tr a');
            dataMap = {};
            elements.forEach(function (item) {
              var itemName = item.innerText;
              var itemLink = item.href;
              if (dataMap[itemLink]) {
                dataMap[itemLink].push(itemName);
              } else {
                dataMap[itemLink] = [itemName];
              }
            });
            localStorage.setItem("".concat(cacheKey, "_cacheUpdateTime"), getCurrentTime());
            localStorage.setItem("cached_".concat(cacheKey, "_").concat(url), JSON.stringify(dataMap));
            displayData(dataMap, containerDiv, title, isMovie);
          case 21:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return _loadData.apply(this, arguments);
  }
  function getVideoCacheKey(videoUrl) {
    // console.log(videoUrl)
    return "pokemon-video-time-".concat(videoUrl);
  }
  function displayData(dataMap, containerDiv, title, isMovie) {
    hideLoading();
    content.querySelector("#title").innerText = title;
    containerDiv.innerHTML = '';
    var index = 0;
    for (var _i = 0, _Object$entries = Object.entries(dataMap); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        itemLink = _Object$entries$_i[0],
        itemNames = _Object$entries$_i[1];
      index = index + 1;
      var progress = null;
      var total = null;
      var a = document.createElement('a');
      var itemNamesTrimmed = itemNames.map(function (name) {
        return name.trim();
      });
      var itemName = itemNamesTrimmed.join(' ');
      itemName = "".concat(index, ". ").concat(itemName);
      var newId = void 0;
      var newUrl = void 0;
      if (isMovie) {
        console.log(itemLink);
        var link = extractMovie(itemLink);
        videoUrl = buildMovieVideoUrl(index);
        console.log('URL ' + videoUrl);
        var videoKey = getVideoCacheKey(videoUrl);
        var savedTime = localStorage.getItem(videoKey);
        if (savedTime) {
          var savedProgress = JSON.parse(savedTime);
          progress = savedProgress.c;
          total = savedProgress.t;
        }
        newId = "t".concat(link);
        newUrl = '?movies=movies&movie-name=' + link + '&movie-id=' + index;
      } else {
        var seasonAndEpisode = extractSeasonAndEpisode(itemLink);
        var season = seasonAndEpisode.season;
        var episode = seasonAndEpisode.episode;
        if ("#".concat(containerDiv.id) === CONTAINER_EPISODES_LIST_ID) {
          var _videoUrl = null;
          if (season && episode) {
            _videoUrl = buildVideoUrl(season, episode);
          }
          var _videoKey = getVideoCacheKey(_videoUrl);
          var _savedTime = localStorage.getItem(_videoKey);
          if (_savedTime) {
            var _savedProgress = JSON.parse(_savedTime);
            progress = _savedProgress.c;
            total = _savedProgress.t;
          }
        }
        newId = "t".concat(season);
        newUrl = '?season=' + season;
        if (episode) {
          newUrl += '&episode=' + episode;
          newId += "-e".concat(episode);
        }
      }
      a.innerText = itemName;
      a.id = newId;
      a.href = newUrl;
      var divProgress = document.createElement('div');
      divProgress.className = 'list-progress';
      a.appendChild(divProgress);
      if (progress) {
        var percentage = parseFloat(progress) / total * 100;
        divProgress.style.background = "linear-gradient(to right, #f05656 ".concat(percentage, "%, transparent ").concat(percentage, "%)");
      }
      containerDiv.appendChild(a);
    }
    console.log("LOAD LIST FOR " + title);
  }
  function extractSeason(url) {
    var regex = /temporada-(\d+)/;
    var match = url.match(regex);
    if (match) {
      return parseInt(match[1]);
    }
    return null;
  }
  function extractEpisode(url) {
    var regex = /episodio-(\d+)/;
    var match = url.match(regex);
    if (match) {
      return parseInt(match[1]);
    }
    return null;
  }
  function extractMovie(url) {
    return url.replace(BASE_MOVIES_URL_LIST, '');
  }
  function extractSeasonAndEpisode(url) {
    return {
      season: extractSeason(url),
      episode: extractEpisode(url)
    };
  }
  function buildMovieVideoUrl(num) {
    return "https://s3.pokemon-project.com/descargas/epis/peliculas/1/P".concat(num, "_ESP.mp4");
  }
  function buildVideoUrl(season, episode) {
    return "".concat(BASE_LATIN_URL_VIDEO).concat(SERIE_URL, "/t").concat(season.toString().padStart(2, '0'), "/t").concat(season.toString().padStart(2, '0'), "_e").concat(episode.toString().padStart(2, '0'), ".es-la.mp4");
  }
  function setupVideoPlayer(url) {
    isInVideo = true;
    setVideoUrl(url);
    content.querySelector('#lists').style.display = 'none';
    content.querySelector('#menu').style.display = 'none';
    var videoContainer = content.querySelector('#video-container');
    var videoElement = videoContainer.querySelector('#pokemon-video');
    videoElement.style.height = '100vh';
    videoElement.addEventListener('waiting', showLoading);
    videoElement.addEventListener('playing', hideLoading);
    videoContainer.appendChild(videoElement);
    videoElement.autoplay = true;
    videoElement.src = url;
    // videoElement.requestFullscreen()

    videoFunctions(videoElement);
    hideCursor();
    console.log("SET TITLE  " + titleName);
    content.querySelector("#title").innerText = titleName;
  }
  function videoFunctions(videoElement) {
    var customVideoPlayer = document.getElementById('video');
    var playPauseButton = document.getElementById('play-pause');
    var rewindButton = document.getElementById('rewind');
    var fastForwardButton = document.getElementById('fast-forward');
    var exitFullscreenButton = document.getElementById('exit-fullscreen');
    var progressBar = document.getElementById('progress-bar');
    var controls = document.getElementById('controls');
    var progressTime = document.getElementById('progress-time');
    var totalDuration = document.getElementById('duration-total');
    function restartFadeOutAnimation() {
      showCursor();
      controls.classList.remove('fade-out-element');
      document.getElementById('title').classList.remove('fade-out-element');
      void controls.offsetWidth; // Truco para reiniciar la animación
      controls.classList.add('fade-out-element');
      document.getElementById('title').classList.add('fade-out-element');
      controls.addEventListener('animationend', function () {
        hideCursor();
      });
    }
    document.body.classList.add('video');
    restartFadeOutAnimation();
    customVideoPlayer.classList.remove('hidden');
    if (videoElement) {
      var videoKey = getVideoCacheKey(videoUrl);
      var savedTime = localStorage.getItem(videoKey);
      if (savedTime) {
        videoElement.currentTime = parseFloat(JSON.parse(savedTime).c) - 3;
      }
      videoElement.addEventListener('timeupdate', function () {
        var currentTime = videoElement.currentTime;
        var duration = videoElement.duration;
        if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
          progressBar.value = currentTime / duration * 100;
          localStorage.setItem(videoKey, "{\"c\": \"".concat(videoElement.currentTime, "\", \"t\": \"").concat(videoElement.duration, "\"}"));
          updateVideoTime();

          // Mostrar el botón "Siguiente episodio" cuando falten 20 segundos
          var timeRemaining = videoElement.duration - videoElement.currentTime;
          if (timeRemaining <= SECONDS_REMAINING_NEXT_EPISODE && !document.getElementById('next-episode-btn')) {
            showNextEpisodeButton();
          } else {
            hideNextEpisodeButton();
          }
          if (timeRemaining < 1) {
            exitPlayer();
          }
        }
      });
    }
    function updateVideoTime() {
      progressTime.innerHTML = formatTime(videoElement.currentTime);
      totalDuration.innerHTML = formatTime(videoElement.duration);
    }
    function formatTime(seconds) {
      var minutes = Math.floor(seconds / 60);
      var remainingSeconds = Math.floor(seconds % 60);
      return "".concat(minutes.toString().padStart(2, '0'), ":").concat(remainingSeconds.toString().padStart(2, '0'));
    }
    function exitPlayer() {
      // const customVideoPlayer = document.getElementById('video');
      // const titleElement = document.getElementById('title');
      //
      // videoElement.pause();
      //
      // showCursor();
      // restartFadeOutAnimation();
      //
      // customVideoPlayer.classList.add('hidden');
      // titleElement.classList.remove('fade-out-element');
      // document.body.classList.remove('video');
      // // window.history.back();
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('movies')) {
        window.location.href = '?movies=movies';
      } else {
        window.location.href = '?season=' + urlParams.get('season');
      }
    }
    function playPauseVideo() {
      var allowPause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (videoElement.paused || !allowPause) {
        videoElement.play();
        playPauseButton.innerText = 'Pause';
      } else {
        videoElement.pause();
        playPauseButton.innerText = 'Play';
      }
      restartFadeOutAnimation();
    }
    function rewindVideo() {
      videoElement.currentTime -= REWIND_FORWARD_TIME_SECONDS;
      restartFadeOutAnimation();
    }
    function forwardVideo() {
      videoElement.currentTime += REWIND_FORWARD_TIME_SECONDS;
      restartFadeOutAnimation();
    }
    progressBar.addEventListener('input', function () {
      videoElement.currentTime = progressBar.value / 100 * videoElement.duration;
    });
    playPauseButton.addEventListener('click', function () {
      playPauseVideo();
    });
    rewindButton.addEventListener('click', function () {
      rewindVideo();
    });
    fastForwardButton.addEventListener('click', function () {
      forwardVideo();
    });
    exitFullscreenButton.addEventListener('click', function () {
      exitPlayer();
    });
    document.addEventListener('keydown', function (event) {
      if (!isInVideo) return false;
      console.log('keydown');
      restartFadeOutAnimation();
      var keyActions = {
        'ArrowLeft': rewindVideo,
        'ArrowRight': forwardVideo,
        ' ': playPauseVideo,
        'Escape': exitPlayer,
        'Backspace': exitPlayer,
        'Enter': playPauseVideo
      };
      if (keyActions[event.key]) {
        keyActions[event.key]();
      }
    });

    // videoElement.addEventListener('click', () => {
    //     playPauseVideo()
    // });

    document.addEventListener('mousemove', function () {
      restartFadeOutAnimation();
    });
    var simulateClick = function simulateClick(e) {
      if (e.target.id === 'video-container' || e.target.id === 'pokemon-video') {
        playPauseVideo();
      }
    };
    document.addEventListener('click', simulateClick);
    document.dispatchEvent(new MouseEvent('click'));
    videoElement.addEventListener('canplaythrough', function () {
      document.dispatchEvent(new KeyboardEvent('Enter'));
      playPauseVideo(false);
    });
  }
  function playVideo(videoUrl) {
    console.log("Reproduciendo video desde: ".concat(videoUrl));
    setupVideoPlayer(videoUrl);
  }
  function playEpisodeVideo(season, episode) {
    content.querySelector("#title").innerText = titleName;
    console.log('PLAYING EPISODE');
    if (season && episode) {
      nextLink = getNextEpisodeLink(season, episode);
      console.log("next episode", nextLink);
      var _videoUrl2 = buildVideoUrl(season, episode);
      var currentElement = document.getElementById("t".concat(season, "-e").concat(episode));
      setTitleName(currentElement.innerText.trim());
      playVideo(_videoUrl2);
    } else {
      console.error('No se pudo extraer la temporada y episodio de la URL.');
    }
  }
  function playMovieVideo(movieName, id) {
    content.querySelector("#title").innerText = titleName;
    console.log('PLAYING EPISODE');
    if (movieName && id) {
      var currentElement = document.getElementById("t".concat(movieName));
      setTitleName(currentElement.innerText.trim());
      videoUrl = buildMovieVideoUrl(id);
      playVideo(videoUrl);
    } else {
      console.error('No se pudo extraer la temporada y episodio de la URL.');
    }
  }
  function showNextEpisodeButton() {
    if (nextLink) {
      nextEpisodeBtn.classList.remove('hidden');
      nextEpisodeBtn.addEventListener('click', function () {
        window.location.href = nextLink;
      });
      nextEpisodeBtn.addEventListener('animationend', function () {
        window.location.href = nextLink;
      });
      document.addEventListener('click', function () {
        nextEpisodeBtn.remove();
      });
    }
  }
  function hideNextEpisodeButton() {
    nextEpisodeBtn.classList.add('hidden');
  }
  function getNextEpisodeLink(season, episode) {
    var allLinks = Array.from(document.querySelectorAll("".concat(CONTAINER_EPISODES_LIST_ID, " a")));
    if (allLinks.length > episode) {
      return '?season=' + season + '&episode=' + ++episode;
    }
    return null;
  }
  function handleURLChange() {
    isInVideo = false;
    showCursor();
    document.getElementById('title').classList.remove('fade-out-element');
    document.getElementById('next-episode').classList.add('hidden');
    document.body.classList.remove('video');
    var urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    // MOVIES
    if (urlParams.get('movies')) {
      loadData('movies', BASE_MOVIES_URL_LIST, CONTAINER_SESSIONS_LIST_ID, 'PELICULAS', true).then(function () {
        if (urlParams.get('movie-name') && urlParams.get('movie-id')) {
          playMovieVideo(urlParams.get('movie-name'), urlParams.get('movie-id'));
        }
      });
      return false;
    }
    var season = urlParams.get('season');
    var episode = urlParams.get('episode');

    // LOADING SERIES LIST
    loadData('series', BASE_LATIN_URL_LIST + SERIE_URL, CONTAINER_SESSIONS_LIST_ID, 'TEMPORADAS').then(function () {
      if (season) {
        console.log(document.querySelector("#t".concat(season)));
        document.querySelector("#t".concat(season)).classList.add('selected');
        var hash = "/temporada-".concat(season);
        console.log("SEASON HASH " + hash);
        // LOADING EPISODES LIST
        loadData('episodes', BASE_LATIN_URL_LIST + SERIE_URL + hash, CONTAINER_EPISODES_LIST_ID, 'EPISODIOS').then(function () {
          if (episode) {
            var _hash = "/temporada-".concat(season, "/episodio-").concat(episode);
            console.log("PLAYING HASH " + _hash);
            // PLAYING VIDEO
            playEpisodeVideo(season, episode);
          }
        });
      }
    });
  }
  window.addEventListener('popstate', handleURLChange);

  // Initial Loading
  handleURLChange();
});

},{"regenerator-runtime/runtime":1}]},{},[2]);
