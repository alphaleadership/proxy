var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ultron/index.js
var require_ultron = __commonJS({
  "node_modules/ultron/index.js"(exports2, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var id = 0;
    function Ultron(ee) {
      if (!(this instanceof Ultron))
        return new Ultron(ee);
      this.id = id++;
      this.ee = ee;
    }
    Ultron.prototype.on = function on(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.on(event, fn, context);
      return this;
    };
    Ultron.prototype.once = function once(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.once(event, fn, context);
      return this;
    };
    Ultron.prototype.remove = function remove() {
      var args = arguments, ee = this.ee, event;
      if (args.length === 1 && "string" === typeof args[0]) {
        args = args[0].split(/[, ]+/);
      } else if (!args.length) {
        if (ee.eventNames) {
          args = ee.eventNames();
        } else if (ee._events) {
          args = [];
          for (event in ee._events) {
            if (has.call(ee._events, event))
              args.push(event);
          }
          if (Object.getOwnPropertySymbols) {
            args = args.concat(Object.getOwnPropertySymbols(ee._events));
          }
        }
      }
      for (var i = 0; i < args.length; i++) {
        var listeners = ee.listeners(args[i]);
        for (var j = 0; j < listeners.length; j++) {
          event = listeners[j];
          if (event.listener) {
            if (event.listener.__ultron !== this.id)
              continue;
          } else if (event.__ultron !== this.id) {
            continue;
          }
          ee.removeListener(args[i], event);
        }
      }
      return this;
    };
    Ultron.prototype.destroy = function destroy() {
      if (!this.ee)
        return false;
      this.remove();
      this.ee = null;
      return true;
    };
    module2.exports = Ultron;
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/async-limiter/index.js
var require_async_limiter = __commonJS({
  "node_modules/async-limiter/index.js"(exports2, module2) {
    "use strict";
    function Queue(options) {
      if (!(this instanceof Queue)) {
        return new Queue(options);
      }
      options = options || {};
      this.concurrency = options.concurrency || Infinity;
      this.pending = 0;
      this.jobs = [];
      this.cbs = [];
      this._done = done.bind(this);
    }
    var arrayAddMethods = [
      "push",
      "unshift",
      "splice"
    ];
    arrayAddMethods.forEach(function(method) {
      Queue.prototype[method] = function() {
        var methodResult = Array.prototype[method].apply(this.jobs, arguments);
        this._run();
        return methodResult;
      };
    });
    Object.defineProperty(Queue.prototype, "length", {
      get: function() {
        return this.pending + this.jobs.length;
      }
    });
    Queue.prototype._run = function() {
      if (this.pending === this.concurrency) {
        return;
      }
      if (this.jobs.length) {
        var job = this.jobs.shift();
        this.pending++;
        job(this._done);
        this._run();
      }
      if (this.pending === 0) {
        while (this.cbs.length !== 0) {
          var cb = this.cbs.pop();
          process.nextTick(cb);
        }
      }
    };
    Queue.prototype.onDone = function(cb) {
      if (typeof cb === "function") {
        this.cbs.push(cb);
        this._run();
      }
    };
    function done() {
      this.pending--;
      this._run();
    }
    module2.exports = Queue;
  }
});

// node_modules/ws/lib/BufferUtil.js
var require_BufferUtil = __commonJS({
  "node_modules/ws/lib/BufferUtil.js"(exports2, module2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var Buffer2 = safeBuffer.Buffer;
    var concat = (list, totalLength) => {
      const target = Buffer2.allocUnsafe(totalLength);
      var offset = 0;
      for (var i = 0; i < list.length; i++) {
        const buf = list[i];
        buf.copy(target, offset);
        offset += buf.length;
      }
      return target;
    };
    try {
      const bufferUtil = require("bufferutil");
      module2.exports = Object.assign({ concat }, bufferUtil.BufferUtil || bufferUtil);
    } catch (e) {
      const mask = (source, mask2, output, offset, length) => {
        for (var i = 0; i < length; i++) {
          output[offset + i] = source[i] ^ mask2[i & 3];
        }
      };
      const unmask = (buffer, mask2) => {
        const length = buffer.length;
        for (var i = 0; i < length; i++) {
          buffer[i] ^= mask2[i & 3];
        }
      };
      module2.exports = { concat, mask, unmask };
    }
  }
});

// node_modules/ws/lib/PerMessageDeflate.js
var require_PerMessageDeflate = __commonJS({
  "node_modules/ws/lib/PerMessageDeflate.js"(exports2, module2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var Limiter = require_async_limiter();
    var zlib = require("zlib");
    var bufferUtil = require_BufferUtil();
    var Buffer2 = safeBuffer.Buffer;
    var TRAILER = Buffer2.from([0, 0, 255, 255]);
    var EMPTY_BLOCK = Buffer2.from([0]);
    var kWriteInProgress = Symbol("write-in-progress");
    var kPendingClose = Symbol("pending-close");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var kOwner = Symbol("owner");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} options.serverNoContextTakeover Request/accept disabling
       *     of server context takeover
       * @param {Boolean} options.clientNoContextTakeover Advertise/acknowledge
       *     disabling of client context takeover
       * @param {(Boolean|Number)} options.serverMaxWindowBits Request/confirm the
       *     use of a custom server window size
       * @param {(Boolean|Number)} options.clientMaxWindowBits Advertise support
       *     for, or request, a custom client window size
       * @param {Number} options.level The value of zlib's `level` param
       * @param {Number} options.memLevel The value of zlib's `memLevel` param
       * @param {Number} options.threshold Size (in bytes) below which messages
       *     should not be compressed
       * @param {Number} options.concurrencyLimit The number of concurrent calls to
       *     zlib
       * @param {Boolean} isServer Create the instance in either server or client
       *     mode
       * @param {Number} maxPayload The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter({ concurrency });
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create extension parameters offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept extension offer.
       *
       * @param {Array} paramsList Extension parameters
       * @return {Object} Accepted configuration
       * @public
       */
      accept(paramsList) {
        paramsList = this.normalizeParams(paramsList);
        var params;
        if (this._isServer) {
          params = this.acceptAsServer(paramsList);
        } else {
          params = this.acceptAsClient(paramsList);
        }
        this.params = params;
        return params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          if (this._inflate[kWriteInProgress]) {
            this._inflate[kPendingClose] = true;
          } else {
            this._inflate.close();
            this._inflate = null;
          }
        }
        if (this._deflate) {
          if (this._deflate[kWriteInProgress]) {
            this._deflate[kPendingClose] = true;
          } else {
            this._deflate.close();
            this._deflate = null;
          }
        }
      }
      /**
       * Accept extension offer from client.
       *
       * @param {Array} paramsList Extension parameters
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(paramsList) {
        const accepted = {};
        const result = paramsList.some((params) => {
          if (this._options.serverNoContextTakeover === false && params.server_no_context_takeover || this._options.serverMaxWindowBits === false && params.server_max_window_bits || typeof this._options.serverMaxWindowBits === "number" && typeof params.server_max_window_bits === "number" && this._options.serverMaxWindowBits > params.server_max_window_bits || typeof this._options.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return;
          }
          if (this._options.serverNoContextTakeover || params.server_no_context_takeover) {
            accepted.server_no_context_takeover = true;
          }
          if (this._options.clientNoContextTakeover || this._options.clientNoContextTakeover !== false && params.client_no_context_takeover) {
            accepted.client_no_context_takeover = true;
          }
          if (typeof this._options.serverMaxWindowBits === "number") {
            accepted.server_max_window_bits = this._options.serverMaxWindowBits;
          } else if (typeof params.server_max_window_bits === "number") {
            accepted.server_max_window_bits = params.server_max_window_bits;
          }
          if (typeof this._options.clientMaxWindowBits === "number") {
            accepted.client_max_window_bits = this._options.clientMaxWindowBits;
          } else if (this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === "number") {
            accepted.client_max_window_bits = params.client_max_window_bits;
          }
          return true;
        });
        if (!result)
          throw new Error("Doesn't support the offered configuration");
        return accepted;
      }
      /**
       * Accept extension response from server.
       *
       * @param {Array} paramsList Extension parameters
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(paramsList) {
        const params = paramsList[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Invalid value for "client_no_context_takeover"');
        }
        if (typeof this._options.clientMaxWindowBits === "number" && (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits) || this._options.clientMaxWindowBits === false && params.client_max_window_bits) {
          throw new Error('Invalid value for "client_max_window_bits"');
        }
        return params;
      }
      /**
       * Normalize extensions parameters.
       *
       * @param {Array} paramsList Extension parameters
       * @return {Array} Normalized extensions parameters
       * @private
       */
      normalizeParams(paramsList) {
        return paramsList.map((params) => {
          Object.keys(params).forEach((key) => {
            var value = params[key];
            if (value.length > 1) {
              throw new Error(`Multiple extension parameters for ${key}`);
            }
            value = value[0];
            switch (key) {
              case "server_no_context_takeover":
              case "client_no_context_takeover":
                if (value !== true) {
                  throw new Error(`invalid extension parameter value for ${key} (${value})`);
                }
                params[key] = true;
                break;
              case "server_max_window_bits":
              case "client_max_window_bits":
                if (typeof value === "string") {
                  value = parseInt(value, 10);
                  if (Number.isNaN(value) || value < zlib.Z_MIN_WINDOWBITS || value > zlib.Z_MAX_WINDOWBITS) {
                    throw new Error(`invalid extension parameter value for ${key} (${value})`);
                  }
                }
                if (!this._isServer && value === true) {
                  throw new Error(`Missing extension parameter value for ${key}`);
                }
                params[key] = value;
                break;
              default:
                throw new Error(`Not defined extension parameter (${key})`);
            }
          });
          return params;
        });
      }
      /**
       * Decompress data. Concurrency limited by async-limiter.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.push((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited by async-limiter.
       *
       * @param {Buffer} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.push((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({ windowBits });
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate[kOwner] = this;
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate[kWriteInProgress] = true;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (fin && this.params[`${endpoint}_no_context_takeover`] || this._inflate[kPendingClose]) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kWriteInProgress] = false;
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {Buffer} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        if (!data || data.length === 0) {
          process.nextTick(callback, null, EMPTY_BLOCK);
          return;
        }
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            memLevel: this._options.memLevel,
            level: this._options.level,
            flush: zlib.Z_SYNC_FLUSH,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kWriteInProgress] = true;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          var data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin)
            data2 = data2.slice(0, data2.length - 4);
          if (fin && this.params[`${endpoint}_no_context_takeover`] || this._deflate[kPendingClose]) {
            this._deflate.close();
            this._deflate = null;
          } else {
            this._deflate[kWriteInProgress] = false;
            this._deflate[kTotalLength] = 0;
            this._deflate[kBuffers] = [];
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kOwner]._maxPayload < 1 || this[kTotalLength] <= this[kOwner]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new Error("max payload size exceeded");
      this[kError].closeCode = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kOwner]._inflate = null;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/EventTarget.js
var require_EventTarget = __commonJS({
  "node_modules/ws/lib/EventTarget.js"(exports2, module2) {
    "use strict";
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @param {Object} target A reference to the target to which the event was dispatched
       */
      constructor(type, target) {
        this.target = target;
        this.type = type;
      }
    };
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
       * @param {WebSocket} target A reference to the target to which the event was dispatched
       */
      constructor(data, target) {
        super("message", target);
        this.data = data;
      }
    };
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {Number} code The status code explaining why the connection is being closed
       * @param {String} reason A human-readable string explaining why the connection is closing
       * @param {WebSocket} target A reference to the target to which the event was dispatched
       */
      constructor(code, reason, target) {
        super("close", target);
        this.wasClean = target._closeFrameReceived && target._closeFrameSent;
        this.reason = reason;
        this.code = code;
      }
    };
    var OpenEvent = class extends Event {
      /**
       * Create a new `OpenEvent`.
       *
       * @param {WebSocket} target A reference to the target to which the event was dispatched
       */
      constructor(target) {
        super("open", target);
      }
    };
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} method A string representing the event type to listen for
       * @param {Function} listener The listener to add
       * @public
       */
      addEventListener(method, listener) {
        if (typeof listener !== "function")
          return;
        function onMessage(data) {
          listener.call(this, new MessageEvent(data, this));
        }
        function onClose(code, message) {
          listener.call(this, new CloseEvent(code, message, this));
        }
        function onError(event) {
          event.type = "error";
          event.target = this;
          listener.call(this, event);
        }
        function onOpen() {
          listener.call(this, new OpenEvent(this));
        }
        if (method === "message") {
          onMessage._listener = listener;
          this.on(method, onMessage);
        } else if (method === "close") {
          onClose._listener = listener;
          this.on(method, onClose);
        } else if (method === "error") {
          onError._listener = listener;
          this.on(method, onError);
        } else if (method === "open") {
          onOpen._listener = listener;
          this.on(method, onOpen);
        } else {
          this.on(method, listener);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} method A string representing the event type to remove
       * @param {Function} listener The listener to remove
       * @public
       */
      removeEventListener(method, listener) {
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i] === listener || listeners[i]._listener === listener) {
            this.removeListener(method, listeners[i]);
          }
        }
      }
    };
    module2.exports = EventTarget;
  }
});

// node_modules/ws/lib/Extensions.js
var require_Extensions = __commonJS({
  "node_modules/ws/lib/Extensions.js"(exports2, module2) {
    "use strict";
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function push(dest, name2, elem) {
      if (Object.prototype.hasOwnProperty.call(dest, name2))
        dest[name2].push(elem);
      else
        dest[name2] = [elem];
    }
    function parse2(header) {
      const offers = {};
      if (header === void 0 || header === "")
        return offers;
      var params = {};
      var mustUnescape = false;
      var isEscaping = false;
      var inQuotes = false;
      var extensionName;
      var paramName;
      var start = -1;
      var end = -1;
      for (var i = 0; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1)
              throw new Error(`unexpected character at index ${i}`);
            if (end === -1)
              end = i;
            const name2 = header.slice(start, end);
            if (code === 44) {
              push(offers, name2, params);
              params = {};
            } else {
              extensionName = name2;
            }
            start = end = -1;
          } else {
            throw new Error(`unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1)
              throw new Error(`unexpected character at index ${i}`);
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = {};
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new Error(`unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new Error(`unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new Error(`unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1)
              throw new Error(`unexpected character at index ${i}`);
            if (end === -1)
              end = i;
            var value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = {};
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new Error(`unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes)
        throw new Error("unexpected end of input");
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, {});
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(value) {
      return Object.keys(value).map((token) => {
        var paramsList = value[token];
        if (!Array.isArray(paramsList))
          paramsList = [paramsList];
        return paramsList.map((params) => {
          return [token].concat(Object.keys(params).map((k) => {
            var p = params[k];
            if (!Array.isArray(p))
              p = [p];
            return p.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse: parse2 };
  }
});

// node_modules/ws/lib/Constants.js
var require_Constants = __commonJS({
  "node_modules/ws/lib/Constants.js"(exports2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var Buffer2 = safeBuffer.Buffer;
    exports2.BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    exports2.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    exports2.EMPTY_BUFFER = Buffer2.alloc(0);
    exports2.NOOP = () => {
    };
  }
});

// node_modules/ws/lib/Validation.js
var require_Validation = __commonJS({
  "node_modules/ws/lib/Validation.js"(exports2, module2) {
    "use strict";
    try {
      const isValidUTF8 = require("utf-8-validate");
      module2.exports = typeof isValidUTF8 === "object" ? isValidUTF8.Validation.isValidUTF8 : isValidUTF8;
    } catch (e) {
      module2.exports = () => true;
    }
  }
});

// node_modules/ws/lib/ErrorCodes.js
var require_ErrorCodes = __commonJS({
  "node_modules/ws/lib/ErrorCodes.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      isValidErrorCode: function(code) {
        return code >= 1e3 && code <= 1013 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
      },
      1e3: "normal",
      1001: "going away",
      1002: "protocol error",
      1003: "unsupported data",
      1004: "reserved",
      1005: "reserved for extensions",
      1006: "reserved for extensions",
      1007: "inconsistent or invalid data",
      1008: "policy violation",
      1009: "message too big",
      1010: "extension handshake missing",
      1011: "an unexpected condition prevented the request from being fulfilled",
      1012: "service restart",
      1013: "try again later"
    };
  }
});

// node_modules/ws/lib/Receiver.js
var require_Receiver = __commonJS({
  "node_modules/ws/lib/Receiver.js"(exports2, module2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var PerMessageDeflate = require_PerMessageDeflate();
    var isValidUTF8 = require_Validation();
    var bufferUtil = require_BufferUtil();
    var ErrorCodes = require_ErrorCodes();
    var constants = require_Constants();
    var Buffer2 = safeBuffer.Buffer;
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var Receiver = class {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} extensions An object containing the negotiated extensions
       * @param {Number} maxPayload The maximum allowed message length
       * @param {String} binaryType The type for binary data
       */
      constructor(extensions, maxPayload, binaryType) {
        this._binaryType = binaryType || constants.BINARY_TYPES[0];
        this._extensions = extensions || {};
        this._maxPayload = maxPayload | 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._mask = null;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._cleanupCallback = null;
        this._hadError = false;
        this._dead = false;
        this._loop = false;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        this.onping = null;
        this.onpong = null;
        this._state = GET_INFO;
      }
      /**
       * Consumes bytes from the available buffered data.
       *
       * @param {Number} bytes The number of bytes to consume
       * @return {Buffer} Consumed bytes
       * @private
       */
      readBuffer(bytes) {
        var offset = 0;
        var dst;
        var l;
        this._bufferedBytes -= bytes;
        if (bytes === this._buffers[0].length)
          return this._buffers.shift();
        if (bytes < this._buffers[0].length) {
          dst = this._buffers[0].slice(0, bytes);
          this._buffers[0] = this._buffers[0].slice(bytes);
          return dst;
        }
        dst = Buffer2.allocUnsafe(bytes);
        while (bytes > 0) {
          l = this._buffers[0].length;
          if (bytes >= l) {
            this._buffers[0].copy(dst, offset);
            offset += l;
            this._buffers.shift();
          } else {
            this._buffers[0].copy(dst, offset, 0, bytes);
            this._buffers[0] = this._buffers[0].slice(bytes);
          }
          bytes -= l;
        }
        return dst;
      }
      /**
       * Checks if the number of buffered bytes is bigger or equal than `n` and
       * calls `cleanup` if necessary.
       *
       * @param {Number} n The number of bytes to check against
       * @return {Boolean} `true` if `bufferedBytes >= n`, else `false`
       * @private
       */
      hasBufferedBytes(n) {
        if (this._bufferedBytes >= n)
          return true;
        this._loop = false;
        if (this._dead)
          this.cleanup(this._cleanupCallback);
        return false;
      }
      /**
       * Adds new data to the parser.
       *
       * @public
       */
      add(data) {
        if (this._dead)
          return;
        this._bufferedBytes += data.length;
        this._buffers.push(data);
        this.startLoop();
      }
      /**
       * Starts the parsing loop.
       *
       * @private
       */
      startLoop() {
        this._loop = true;
        while (this._loop) {
          switch (this._state) {
            case GET_INFO:
              this.getInfo();
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16();
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64();
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData();
              break;
            default:
              this._loop = false;
          }
        }
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @private
       */
      getInfo() {
        if (!this.hasBufferedBytes(2))
          return;
        const buf = this.readBuffer(2);
        if ((buf[0] & 48) !== 0) {
          this.error(new Error("RSV2 and RSV3 must be clear"), 1002);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          this.error(new Error("RSV1 must be clear"), 1002);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            this.error(new Error("RSV1 must be clear"), 1002);
            return;
          }
          if (!this._fragmented) {
            this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
            return;
          } else {
            this._opcode = this._fragmented;
          }
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            this.error(new Error("FIN must be set"), 1002);
            return;
          }
          if (compressed) {
            this.error(new Error("RSV1 must be clear"), 1002);
            return;
          }
          if (this._payloadLength > 125) {
            this.error(new Error("invalid payload length"), 1002);
            return;
          }
        } else {
          this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
          return;
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          this.haveLength();
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @private
       */
      getPayloadLength16() {
        if (!this.hasBufferedBytes(2))
          return;
        this._payloadLength = this.readBuffer(2).readUInt16BE(0, true);
        this.haveLength();
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @private
       */
      getPayloadLength64() {
        if (!this.hasBufferedBytes(8))
          return;
        const buf = this.readBuffer(8);
        const num = buf.readUInt32BE(0, true);
        if (num > Math.pow(2, 53 - 32) - 1) {
          this.error(new Error("max payload size exceeded"), 1009);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4, true);
        this.haveLength();
      }
      /**
       * Payload length has been read.
       *
       * @private
       */
      haveLength() {
        if (this._opcode < 8 && this.maxPayloadExceeded(this._payloadLength)) {
          return;
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (!this.hasBufferedBytes(4))
          return;
        this._mask = this.readBuffer(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @private
       */
      getData() {
        var data = constants.EMPTY_BUFFER;
        if (this._payloadLength) {
          if (!this.hasBufferedBytes(this._payloadLength))
            return;
          data = this.readBuffer(this._payloadLength);
          if (this._masked)
            bufferUtil.unmask(data, this._mask);
        }
        if (this._opcode > 7) {
          this.controlMessage(data);
        } else if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data);
        } else if (this.pushFragment(data)) {
          this.dataMessage();
        }
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @private
       */
      decompress(data) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) {
            this.error(err, err.closeCode === 1009 ? 1009 : 1007);
            return;
          }
          if (this.pushFragment(buf))
            this.dataMessage();
          this.startLoop();
        });
      }
      /**
       * Handles a data message.
       *
       * @private
       */
      dataMessage() {
        if (this._fin) {
          const messageLength = this._messageLength;
          const fragments = this._fragments;
          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragmented = 0;
          this._fragments = [];
          if (this._opcode === 2) {
            var data;
            if (this._binaryType === "nodebuffer") {
              data = toBuffer(fragments, messageLength);
            } else if (this._binaryType === "arraybuffer") {
              data = toArrayBuffer2(toBuffer(fragments, messageLength));
            } else {
              data = fragments;
            }
            this.onmessage(data);
          } else {
            const buf = toBuffer(fragments, messageLength);
            if (!isValidUTF8(buf)) {
              this.error(new Error("invalid utf8 sequence"), 1007);
              return;
            }
            this.onmessage(buf.toString());
          }
        }
        this._state = GET_INFO;
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @private
       */
      controlMessage(data) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this.onclose(1e3, "");
            this._loop = false;
            this.cleanup(this._cleanupCallback);
          } else if (data.length === 1) {
            this.error(new Error("invalid payload length"), 1002);
          } else {
            const code = data.readUInt16BE(0, true);
            if (!ErrorCodes.isValidErrorCode(code)) {
              this.error(new Error(`invalid status code: ${code}`), 1002);
              return;
            }
            const buf = data.slice(2);
            if (!isValidUTF8(buf)) {
              this.error(new Error("invalid utf8 sequence"), 1007);
              return;
            }
            this.onclose(code, buf.toString());
            this._loop = false;
            this.cleanup(this._cleanupCallback);
          }
          return;
        }
        if (this._opcode === 9)
          this.onping(data);
        else
          this.onpong(data);
        this._state = GET_INFO;
      }
      /**
       * Handles an error.
       *
       * @param {Error} err The error
       * @param {Number} code Close code
       * @private
       */
      error(err, code) {
        this.onerror(err, code);
        this._hadError = true;
        this._loop = false;
        this.cleanup(this._cleanupCallback);
      }
      /**
       * Checks payload size, disconnects socket when it exceeds `maxPayload`.
       *
       * @param {Number} length Payload length
       * @private
       */
      maxPayloadExceeded(length) {
        if (length === 0 || this._maxPayload < 1)
          return false;
        const fullLength = this._totalPayloadLength + length;
        if (fullLength <= this._maxPayload) {
          this._totalPayloadLength = fullLength;
          return false;
        }
        this.error(new Error("max payload size exceeded"), 1009);
        return true;
      }
      /**
       * Appends a fragment in the fragments array after checking that the sum of
       * fragment lengths does not exceed `maxPayload`.
       *
       * @param {Buffer} fragment The fragment to add
       * @return {Boolean} `true` if `maxPayload` is not exceeded, else `false`
       * @private
       */
      pushFragment(fragment) {
        if (fragment.length === 0)
          return true;
        const totalLength = this._messageLength + fragment.length;
        if (this._maxPayload < 1 || totalLength <= this._maxPayload) {
          this._messageLength = totalLength;
          this._fragments.push(fragment);
          return true;
        }
        this.error(new Error("max payload size exceeded"), 1009);
        return false;
      }
      /**
       * Releases resources used by the receiver.
       *
       * @param {Function} cb Callback
       * @public
       */
      cleanup(cb) {
        this._dead = true;
        if (!this._hadError && (this._loop || this._state === INFLATING)) {
          this._cleanupCallback = cb;
        } else {
          this._extensions = null;
          this._fragments = null;
          this._buffers = null;
          this._mask = null;
          this._cleanupCallback = null;
          this.onmessage = null;
          this.onclose = null;
          this.onerror = null;
          this.onping = null;
          this.onpong = null;
          if (cb)
            cb();
        }
      }
    };
    module2.exports = Receiver;
    function toBuffer(fragments, messageLength) {
      if (fragments.length === 1)
        return fragments[0];
      if (fragments.length > 1)
        return bufferUtil.concat(fragments, messageLength);
      return constants.EMPTY_BUFFER;
    }
    function toArrayBuffer2(buf) {
      if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
  }
});

// node_modules/ws/lib/Sender.js
var require_Sender = __commonJS({
  "node_modules/ws/lib/Sender.js"(exports2, module2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var crypto = require("crypto");
    var PerMessageDeflate = require_PerMessageDeflate();
    var bufferUtil = require_BufferUtil();
    var ErrorCodes = require_ErrorCodes();
    var constants = require_Constants();
    var Buffer2 = safeBuffer.Buffer;
    var Sender = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {net.Socket} socket The connection socket
       * @param {Object} extensions An object containing the negotiated extensions
       */
      constructor(socket, extensions) {
        this._extensions = extensions || {};
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {Buffer} data The data to frame
       * @param {Object} options Options object
       * @param {Number} options.opcode The opcode
       * @param {Boolean} options.readOnly Specifies whether `data` can be modified
       * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
       * @param {Boolean} options.mask Specifies whether or not to mask `data`
       * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
       * @return {Buffer[]} The framed data as a list of `Buffer` instances
       * @public
       */
      static frame(data, options) {
        const merge = data.length < 1024 || options.mask && options.readOnly;
        var offset = options.mask ? 6 : 2;
        var payloadLength = data.length;
        if (data.length >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (data.length > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer2.allocUnsafe(merge ? data.length + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        if (payloadLength === 126) {
          target.writeUInt16BE(data.length, 2, true);
        } else if (payloadLength === 127) {
          target.writeUInt32BE(0, 2, true);
          target.writeUInt32BE(data.length, 6, true);
        }
        if (!options.mask) {
          target[1] = payloadLength;
          if (merge) {
            data.copy(target, offset);
            return [target];
          }
          return [target, data];
        }
        const mask = crypto.randomBytes(4);
        target[1] = payloadLength | 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (merge) {
          bufferUtil.mask(data, mask, target, offset, data.length);
          return [target];
        }
        bufferUtil.mask(data, mask, data, 0, data.length);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {(Number|undefined)} code The status code component of the body
       * @param {String} data The message component of the body
       * @param {Boolean} mask Specifies whether or not to mask the message
       * @param {Function} cb Callback
       * @public
       */
      close(code, data, mask, cb) {
        var buf;
        if (code === void 0) {
          code = 1e3;
        } else if (typeof code !== "number" || !ErrorCodes.isValidErrorCode(code)) {
          throw new Error("first argument must be a valid error code number");
        }
        if (data === void 0 || data === "") {
          if (code === 1e3) {
            buf = constants.EMPTY_BUFFER;
          } else {
            buf = Buffer2.allocUnsafe(2);
            buf.writeUInt16BE(code, 0, true);
          }
        } else {
          buf = Buffer2.allocUnsafe(2 + Buffer2.byteLength(data));
          buf.writeUInt16BE(code, 0, true);
          buf.write(data, 2);
        }
        if (this._deflating) {
          this.enqueue([this.doClose, buf, mask, cb]);
        } else {
          this.doClose(buf, mask, cb);
        }
      }
      /**
       * Frames and sends a close message.
       *
       * @param {Buffer} data The message to send
       * @param {Boolean} mask Specifies whether or not to mask `data`
       * @param {Function} cb Callback
       * @private
       */
      doClose(data, mask, cb) {
        this.sendFrame(_Sender.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 8,
          mask,
          readOnly: false
        }), cb);
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Specifies whether or not to mask `data`
       * @public
       */
      ping(data, mask) {
        var readOnly = true;
        if (!Buffer2.isBuffer(data)) {
          if (data instanceof ArrayBuffer) {
            data = Buffer2.from(data);
          } else if (ArrayBuffer.isView(data)) {
            data = viewToBuffer(data);
          } else {
            data = Buffer2.from(data);
            readOnly = false;
          }
        }
        if (this._deflating) {
          this.enqueue([this.doPing, data, mask, readOnly]);
        } else {
          this.doPing(data, mask, readOnly);
        }
      }
      /**
       * Frames and sends a ping message.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Specifies whether or not to mask `data`
       * @param {Boolean} readOnly Specifies whether `data` can be modified
       * @private
       */
      doPing(data, mask, readOnly) {
        this.sendFrame(_Sender.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 9,
          mask,
          readOnly
        }));
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Specifies whether or not to mask `data`
       * @public
       */
      pong(data, mask) {
        var readOnly = true;
        if (!Buffer2.isBuffer(data)) {
          if (data instanceof ArrayBuffer) {
            data = Buffer2.from(data);
          } else if (ArrayBuffer.isView(data)) {
            data = viewToBuffer(data);
          } else {
            data = Buffer2.from(data);
            readOnly = false;
          }
        }
        if (this._deflating) {
          this.enqueue([this.doPong, data, mask, readOnly]);
        } else {
          this.doPong(data, mask, readOnly);
        }
      }
      /**
       * Frames and sends a pong message.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Specifies whether or not to mask `data`
       * @param {Boolean} readOnly Specifies whether `data` can be modified
       * @private
       */
      doPong(data, mask, readOnly) {
        this.sendFrame(_Sender.frame(data, {
          fin: true,
          rsv1: false,
          opcode: 10,
          mask,
          readOnly
        }));
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} options.compress Specifies whether or not to compress `data`
       * @param {Boolean} options.binary Specifies whether `data` is binary or text
       * @param {Boolean} options.fin Specifies whether the fragment is the last one
       * @param {Boolean} options.mask Specifies whether or not to mask `data`
       * @param {Function} cb Callback
       * @public
       */
      send(data, options, cb) {
        var opcode = options.binary ? 2 : 1;
        var rsv1 = options.compress;
        var readOnly = true;
        if (!Buffer2.isBuffer(data)) {
          if (data instanceof ArrayBuffer) {
            data = Buffer2.from(data);
          } else if (ArrayBuffer.isView(data)) {
            data = viewToBuffer(data);
          } else {
            data = Buffer2.from(data);
            readOnly = false;
          }
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate) {
            rsv1 = data.length >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            fin: options.fin,
            rsv1,
            opcode,
            mask: options.mask,
            readOnly
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(_Sender.frame(data, {
            fin: options.fin,
            rsv1: false,
            opcode,
            mask: options.mask,
            readOnly
          }), cb);
        }
      }
      /**
       * Dispatches a data message.
       *
       * @param {Buffer} data The message to send
       * @param {Boolean} compress Specifies whether or not to compress `data`
       * @param {Object} options Options object
       * @param {Number} options.opcode The opcode
       * @param {Boolean} options.readOnly Specifies whether `data` can be modified
       * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
       * @param {Boolean} options.mask Specifies whether or not to mask `data`
       * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
       * @param {Function} cb Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this._deflating = false;
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[1].length;
          params[0].apply(this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[1].length;
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {Buffer[]} list The frame to send
       * @param {Function} cb Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender;
    function viewToBuffer(view) {
      const buf = Buffer2.from(view.buffer);
      if (view.byteLength !== view.buffer.byteLength) {
        return buf.slice(view.byteOffset, view.byteOffset + view.byteLength);
      }
      return buf;
    }
  }
});

// node_modules/ws/lib/WebSocket.js
var require_WebSocket = __commonJS({
  "node_modules/ws/lib/WebSocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var crypto = require("crypto");
    var Ultron = require_ultron();
    var https = require("https");
    var http = require("http");
    var url = require("url");
    var PerMessageDeflate = require_PerMessageDeflate();
    var EventTarget = require_EventTarget();
    var Extensions = require_Extensions();
    var constants = require_Constants();
    var Receiver = require_Receiver();
    var Sender = require_Sender();
    var protocolVersions = [8, 13];
    var closeTimeout = 30 * 1e3;
    var WebSocket = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {String} address The URL to which to connect
       * @param {(String|String[])} protocols The subprotocols
       * @param {Object} options Connection options
       */
      constructor(address, protocols, options) {
        super();
        if (!protocols) {
          protocols = [];
        } else if (typeof protocols === "string") {
          protocols = [protocols];
        } else if (!Array.isArray(protocols)) {
          options = protocols;
          protocols = [];
        }
        this.readyState = _WebSocket.CONNECTING;
        this.bytesReceived = 0;
        this.extensions = {};
        this.protocol = "";
        this._binaryType = constants.BINARY_TYPES[0];
        this._finalize = this.finalize.bind(this);
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = "";
        this._closeTimer = null;
        this._finalized = false;
        this._closeCode = 1006;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        this._ultron = null;
        if (Array.isArray(address)) {
          initAsServerClient.call(this, address[0], address[1], options);
        } else {
          initAsClient.call(this, address, protocols, options);
        }
      }
      get CONNECTING() {
        return _WebSocket.CONNECTING;
      }
      get CLOSING() {
        return _WebSocket.CLOSING;
      }
      get CLOSED() {
        return _WebSocket.CLOSED;
      }
      get OPEN() {
        return _WebSocket.OPEN;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        var amount = 0;
        if (this._socket) {
          amount = this._socket.bufferSize + this._sender._bufferedBytes;
        }
        return amount;
      }
      /**
       * This deviates from the WHATWG interface since ws doesn't support the required
       * default "blob" type (instead we define a custom "nodebuffer" type).
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (constants.BINARY_TYPES.indexOf(type) < 0)
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {net.Socket} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @private
       */
      setSocket(socket, head) {
        socket.setTimeout(0);
        socket.setNoDelay();
        this._receiver = new Receiver(this.extensions, this._maxPayload, this.binaryType);
        this._sender = new Sender(socket, this.extensions);
        this._ultron = new Ultron(socket);
        this._socket = socket;
        this._ultron.on("close", this._finalize);
        this._ultron.on("error", this._finalize);
        this._ultron.on("end", this._finalize);
        if (head.length > 0)
          socket.unshift(head);
        this._ultron.on("data", (data) => {
          this.bytesReceived += data.length;
          this._receiver.add(data);
        });
        this._receiver.onmessage = (data) => this.emit("message", data);
        this._receiver.onping = (data) => {
          this.pong(data, !this._isServer, true);
          this.emit("ping", data);
        };
        this._receiver.onpong = (data) => this.emit("pong", data);
        this._receiver.onclose = (code, reason) => {
          this._closeFrameReceived = true;
          this._closeMessage = reason;
          this._closeCode = code;
          if (!this._finalized)
            this.close(code, reason);
        };
        this._receiver.onerror = (error, code) => {
          this._closeMessage = "";
          this._closeCode = code;
          this.readyState = _WebSocket.CLOSING;
          this.emit("error", error);
          this.finalize(true);
        };
        this.readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Clean up and release internal resources.
       *
       * @param {(Boolean|Error)} error Indicates whether or not an error occurred
       * @private
       */
      finalize(error) {
        if (this._finalized)
          return;
        this.readyState = _WebSocket.CLOSING;
        this._finalized = true;
        if (typeof error === "object")
          this.emit("error", error);
        if (!this._socket)
          return this.emitClose();
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
        this._ultron.destroy();
        this._ultron = null;
        this._socket.on("error", constants.NOOP);
        if (!error)
          this._socket.end();
        else
          this._socket.destroy();
        this._socket = null;
        this._sender = null;
        this._receiver.cleanup(() => this.emitClose());
        this._receiver = null;
      }
      /**
       * Emit the `close` event.
       *
       * @private
       */
      emitClose() {
        this.readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
        if (this.extensions[PerMessageDeflate.extensionName]) {
          this.extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this.extensions = null;
        this.removeAllListeners();
      }
      /**
       * Pause the socket stream.
       *
       * @public
       */
      pause() {
        if (this.readyState !== _WebSocket.OPEN)
          throw new Error("not opened");
        this._socket.pause();
      }
      /**
       * Resume the socket stream
       *
       * @public
       */
      resume() {
        if (this.readyState !== _WebSocket.OPEN)
          throw new Error("not opened");
        this._socket.resume();
      }
      /**
       * Start a closing handshake.
       *
       *            +----------+     +-----------+   +----------+
       *     + - - -|ws.close()|---->|close frame|-->|ws.close()|- - - -
       *            +----------+     +-----------+   +----------+       |
       *     |      +----------+     +-----------+         |
       *            |ws.close()|<----|close frame|<--------+            |
       *            +----------+     +-----------+         |
       *  CLOSING         |              +---+             |         CLOSING
       *                  |          +---|fin|<------------+
       *     |            |          |   +---+                          |
       *                  |          |   +---+      +-------------+
       *     |            +----------+-->|fin|----->|ws.finalize()| - - +
       *                             |   +---+      +-------------+
       *     |     +-------------+   |
       *      - - -|ws.finalize()|<--+
       *           +-------------+
       *
       * @param {Number} code Status code explaining why the connection is closing
       * @param {String} data A string explaining why the connection is closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          this._req.abort();
          this.finalize(new Error("closed before the connection is established"));
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && this._closeFrameReceived)
            this._socket.end();
          return;
        }
        this.readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (!this._finalized) {
            if (this._closeFrameReceived)
              this._socket.end();
            this._closeTimer = setTimeout(this._finalize, closeTimeout, true);
          }
        });
      }
      /**
       * Send a ping message.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Indicates whether or not to mask `data`
       * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
       * @public
       */
      ping(data, mask, failSilently) {
        if (this.readyState !== _WebSocket.OPEN) {
          if (failSilently)
            return;
          throw new Error("not opened");
        }
        if (typeof data === "number")
          data = data.toString();
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || constants.EMPTY_BUFFER, mask);
      }
      /**
       * Send a pong message.
       *
       * @param {*} data The message to send
       * @param {Boolean} mask Indicates whether or not to mask `data`
       * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
       * @public
       */
      pong(data, mask, failSilently) {
        if (this.readyState !== _WebSocket.OPEN) {
          if (failSilently)
            return;
          throw new Error("not opened");
        }
        if (typeof data === "number")
          data = data.toString();
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || constants.EMPTY_BUFFER, mask);
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} options.compress Specifies whether or not to compress `data`
       * @param {Boolean} options.binary Specifies whether `data` is binary or text
       * @param {Boolean} options.fin Specifies whether the fragment is the last one
       * @param {Boolean} options.mask Specifies whether or not to mask `data`
       * @param {Function} cb Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (this.readyState !== _WebSocket.OPEN) {
          if (cb)
            cb(new Error("not opened"));
          else
            throw new Error("not opened");
          return;
        }
        if (typeof data === "number")
          data = data.toString();
        const opts = Object.assign({
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true
        }, options);
        if (!this.extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || constants.EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          this._req.abort();
          this.finalize(new Error("closed before the connection is established"));
          return;
        }
        this.finalize(true);
      }
    };
    WebSocket.CONNECTING = 0;
    WebSocket.OPEN = 1;
    WebSocket.CLOSING = 2;
    WebSocket.CLOSED = 3;
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket.prototype, `on${method}`, {
        /**
         * Return the listener of the event.
         *
         * @return {(Function|undefined)} The event listener or `undefined`
         * @public
         */
        get() {
          const listeners = this.listeners(method);
          for (var i = 0; i < listeners.length; i++) {
            if (listeners[i]._listener)
              return listeners[i]._listener;
          }
        },
        /**
         * Add a listener for the event.
         *
         * @param {Function} listener The listener to add
         * @public
         */
        set(listener) {
          const listeners = this.listeners(method);
          for (var i = 0; i < listeners.length; i++) {
            if (listeners[i]._listener)
              this.removeListener(method, listeners[i]);
          }
          this.addEventListener(method, listener);
        }
      });
    });
    WebSocket.prototype.addEventListener = EventTarget.addEventListener;
    WebSocket.prototype.removeEventListener = EventTarget.removeEventListener;
    module2.exports = WebSocket;
    function initAsServerClient(socket, head, options) {
      this.protocolVersion = options.protocolVersion;
      this._maxPayload = options.maxPayload;
      this.extensions = options.extensions;
      this.protocol = options.protocol;
      this._isServer = true;
      this.setSocket(socket, head);
    }
    function initAsClient(address, protocols, options) {
      options = Object.assign({
        protocolVersion: protocolVersions[1],
        protocol: protocols.join(","),
        perMessageDeflate: true,
        handshakeTimeout: null,
        localAddress: null,
        headers: null,
        family: null,
        origin: null,
        agent: null,
        host: null,
        //
        // SSL options.
        //
        checkServerIdentity: null,
        rejectUnauthorized: null,
        passphrase: null,
        ciphers: null,
        ecdhCurve: null,
        cert: null,
        key: null,
        pfx: null,
        ca: null
      }, options);
      if (protocolVersions.indexOf(options.protocolVersion) === -1) {
        throw new Error(
          `unsupported protocol version: ${options.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      this.protocolVersion = options.protocolVersion;
      this._isServer = false;
      this.url = address;
      const serverUrl = url.parse(address);
      const isUnixSocket = serverUrl.protocol === "ws+unix:";
      if (!serverUrl.host && (!isUnixSocket || !serverUrl.path)) {
        throw new Error("invalid url");
      }
      const isSecure = serverUrl.protocol === "wss:" || serverUrl.protocol === "https:";
      const key = crypto.randomBytes(16).toString("base64");
      const httpObj = isSecure ? https : http;
      var perMessageDeflate;
      const requestOptions = {
        port: serverUrl.port || (isSecure ? 443 : 80),
        host: serverUrl.hostname,
        path: "/",
        headers: {
          "Sec-WebSocket-Version": options.protocolVersion,
          "Sec-WebSocket-Key": key,
          "Connection": "Upgrade",
          "Upgrade": "websocket"
        }
      };
      if (options.headers)
        Object.assign(requestOptions.headers, options.headers);
      if (options.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          options.perMessageDeflate !== true ? options.perMessageDeflate : {},
          false
        );
        requestOptions.headers["Sec-WebSocket-Extensions"] = Extensions.format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (options.protocol) {
        requestOptions.headers["Sec-WebSocket-Protocol"] = options.protocol;
      }
      if (options.origin) {
        if (options.protocolVersion < 13) {
          requestOptions.headers["Sec-WebSocket-Origin"] = options.origin;
        } else {
          requestOptions.headers.Origin = options.origin;
        }
      }
      if (options.host)
        requestOptions.headers.Host = options.host;
      if (serverUrl.auth)
        requestOptions.auth = serverUrl.auth;
      if (options.localAddress)
        requestOptions.localAddress = options.localAddress;
      if (options.family)
        requestOptions.family = options.family;
      if (isUnixSocket) {
        const parts = serverUrl.path.split(":");
        requestOptions.socketPath = parts[0];
        requestOptions.path = parts[1];
      } else if (serverUrl.path) {
        if (serverUrl.path.charAt(0) !== "/") {
          requestOptions.path = `/${serverUrl.path}`;
        } else {
          requestOptions.path = serverUrl.path;
        }
      }
      var agent = options.agent;
      if (options.rejectUnauthorized != null || options.checkServerIdentity || options.passphrase || options.ciphers || options.ecdhCurve || options.cert || options.key || options.pfx || options.ca) {
        if (options.passphrase)
          requestOptions.passphrase = options.passphrase;
        if (options.ciphers)
          requestOptions.ciphers = options.ciphers;
        if (options.ecdhCurve)
          requestOptions.ecdhCurve = options.ecdhCurve;
        if (options.cert)
          requestOptions.cert = options.cert;
        if (options.key)
          requestOptions.key = options.key;
        if (options.pfx)
          requestOptions.pfx = options.pfx;
        if (options.ca)
          requestOptions.ca = options.ca;
        if (options.checkServerIdentity) {
          requestOptions.checkServerIdentity = options.checkServerIdentity;
        }
        if (options.rejectUnauthorized != null) {
          requestOptions.rejectUnauthorized = options.rejectUnauthorized;
        }
        if (!agent)
          agent = new httpObj.Agent(requestOptions);
      }
      if (agent)
        requestOptions.agent = agent;
      this._req = httpObj.get(requestOptions);
      if (options.handshakeTimeout) {
        this._req.setTimeout(options.handshakeTimeout, () => {
          this._req.abort();
          this.finalize(new Error("opening handshake has timed out"));
        });
      }
      this._req.on("error", (error) => {
        if (this._req.aborted)
          return;
        this._req = null;
        this.finalize(error);
      });
      this._req.on("response", (res) => {
        if (!this.emit("unexpected-response", this._req, res)) {
          this._req.abort();
          this.finalize(new Error(`unexpected server response (${res.statusCode})`));
        }
      });
      this._req.on("upgrade", (res, socket, head) => {
        this.emit("headers", res.headers, res);
        if (this.readyState !== WebSocket.CONNECTING)
          return;
        this._req = null;
        const digest = crypto.createHash("sha1").update(key + constants.GUID, "binary").digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          socket.destroy();
          return this.finalize(new Error("invalid server key"));
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        const protList = (options.protocol || "").split(/, */);
        var protError;
        if (!options.protocol && serverProt) {
          protError = "server sent a subprotocol even though none requested";
        } else if (options.protocol && !serverProt) {
          protError = "server sent no subprotocol even though requested";
        } else if (serverProt && protList.indexOf(serverProt) === -1) {
          protError = "server responded with an invalid protocol";
        }
        if (protError) {
          socket.destroy();
          return this.finalize(new Error(protError));
        }
        if (serverProt)
          this.protocol = serverProt;
        if (perMessageDeflate) {
          try {
            const serverExtensions = Extensions.parse(
              res.headers["sec-websocket-extensions"]
            );
            if (serverExtensions[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(
                serverExtensions[PerMessageDeflate.extensionName]
              );
              this.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            socket.destroy();
            this.finalize(new Error("invalid Sec-WebSocket-Extensions header"));
            return;
          }
        }
        this.setSocket(socket, head);
      });
    }
  }
});

// node_modules/ws/lib/WebSocketServer.js
var require_WebSocketServer = __commonJS({
  "node_modules/ws/lib/WebSocketServer.js"(exports2, module2) {
    "use strict";
    var safeBuffer = require_safe_buffer();
    var EventEmitter = require("events");
    var crypto = require("crypto");
    var Ultron = require_ultron();
    var http = require("http");
    var url = require("url");
    var PerMessageDeflate = require_PerMessageDeflate();
    var Extensions = require_Extensions();
    var constants = require_Constants();
    var WebSocket = require_WebSocket();
    var Buffer2 = safeBuffer.Buffer;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {String} options.host The hostname where to bind the server
       * @param {Number} options.port The port where to bind the server
       * @param {http.Server} options.server A pre-created HTTP/S server to use
       * @param {Function} options.verifyClient An hook to reject connections
       * @param {Function} options.handleProtocols An hook to handle protocols
       * @param {String} options.path Accept only connections matching this path
       * @param {Boolean} options.noServer Enable no server mode
       * @param {Boolean} options.clientTracking Specifies whether or not to track clients
       * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
       * @param {Number} options.maxPayload The maximum allowed message size
       * @param {Function} callback A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = Object.assign({
          maxPayload: 100 * 1024 * 1024,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null
        }, options);
        if (options.port == null && !options.server && !options.noServer) {
          throw new TypeError("missing or invalid options");
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(options.port, options.host, options.backlog, callback);
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          this._ultron = new Ultron(this._server);
          this._ultron.on("listening", () => this.emit("listening"));
          this._ultron.on("error", (err) => this.emit("error", err));
          this._ultron.on("upgrade", (req, socket, head) => {
            this.handleUpgrade(req, socket, head, (client) => {
              this.emit("connection", client, req);
            });
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking)
          this.clients = /* @__PURE__ */ new Set();
        this.options = options;
      }
      /**
       * Close the server.
       *
       * @param {Function} cb Callback
       * @public
       */
      close(cb) {
        if (this.clients) {
          for (const client of this.clients)
            client.terminate();
        }
        const server = this._server;
        if (server) {
          this._ultron.destroy();
          this._ultron = this._server = null;
          if (this.options.port != null)
            return server.close(cb);
        }
        if (cb)
          cb();
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path && url.parse(req.url).pathname !== this.options.path) {
          return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {net.Socket} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketError);
        const version = +req.headers["sec-websocket-version"];
        const extensions = {};
        if (req.method !== "GET" || req.headers.upgrade.toLowerCase() !== "websocket" || !req.headers["sec-websocket-key"] || version !== 8 && version !== 13 || !this.shouldHandle(req)) {
          return abortConnection(socket, 400);
        }
        if (this.options.perMessageDeflate) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = Extensions.parse(
              req.headers["sec-websocket-extensions"]
            );
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            return abortConnection(socket, 400);
          }
        }
        var protocol = (req.headers["sec-websocket-protocol"] || "").split(/, */);
        if (this.options.handleProtocols) {
          protocol = this.options.handleProtocols(protocol, req);
          if (protocol === false)
            return abortConnection(socket, 401);
        } else {
          protocol = protocol[0];
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.connection.authorized || req.connection.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message) => {
              if (!verified)
                return abortConnection(socket, code || 401, message);
              this.completeUpgrade(
                protocol,
                extensions,
                version,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortConnection(socket, 401);
        }
        this.completeUpgrade(protocol, extensions, version, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {String} protocol The chosen subprotocol
       * @param {Object} extensions The accepted extensions
       * @param {Number} version The WebSocket protocol version
       * @param {http.IncomingMessage} req The request object
       * @param {net.Socket} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @private
       */
      completeUpgrade(protocol, extensions, version, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        const key = crypto.createHash("sha1").update(req.headers["sec-websocket-key"] + constants.GUID, "binary").digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${key}`
        ];
        if (protocol)
          headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = Extensions.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        const client = new WebSocket([socket, head], null, {
          maxPayload: this.options.maxPayload,
          protocolVersion: version,
          extensions,
          protocol
        });
        if (this.clients) {
          this.clients.add(client);
          client.on("close", () => this.clients.delete(client));
        }
        socket.removeListener("error", socketError);
        cb(client);
      }
    };
    module2.exports = WebSocketServer2;
    function socketError() {
      this.destroy();
    }
    function abortConnection(socket, code, message) {
      if (socket.writable) {
        message = message || http.STATUS_CODES[code];
        socket.write(
          `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
Connection: close\r
Content-type: text/html\r
Content-Length: ${Buffer2.byteLength(message)}\r
\r
` + message
        );
      }
      socket.removeListener("error", socketError);
      socket.destroy();
    }
  }
});

// node_modules/ws/index.js
var require_ws = __commonJS({
  "node_modules/ws/index.js"(exports2, module2) {
    "use strict";
    var WebSocket = require_WebSocket();
    WebSocket.Server = require_WebSocketServer();
    WebSocket.Receiver = require_Receiver();
    WebSocket.Sender = require_Sender();
    module2.exports = WebSocket;
  }
});

// proxy.ts
var proxy_exports = {};
__export(proxy_exports, {
  default: () => proxy_default
});
module.exports = __toCommonJS(proxy_exports);

// mitm.ts
var import_ws = __toESM(require_ws());
var import_child_process = require("child_process");
var import_path = require("path");
var import_url = require("url");
var import_http = require("http");
var import_https = require("https");
var import_net = require("net");
function waitForPort(port, retries = 10, interval = 500) {
  return new Promise((resolve2, reject) => {
    let retriesRemaining = retries;
    let retryInterval = interval;
    let timer;
    let socket;
    function clearTimerAndDestroySocket() {
      clearTimeout(timer);
      timer;
      if (socket)
        socket.destroy();
      socket;
    }
    function retry() {
      tryToConnect();
    }
    function tryToConnect() {
      clearTimerAndDestroySocket();
      if (--retriesRemaining < 0) {
        reject(new Error("out of retries"));
      }
      socket = (0, import_net.createConnection)(port, "localhost", function() {
        clearTimerAndDestroySocket();
        if (retriesRemaining >= 0)
          resolve2();
      });
      timer = setTimeout(function() {
        retry();
      }, retryInterval);
      socket.on("error", function(err) {
        clearTimerAndDestroySocket();
        setTimeout(retry, retryInterval);
      });
    }
    tryToConnect();
  });
}
function nopInterceptor(m) {
}
var AbstractHTTPHeaders = class {
  _headers;
  // The raw headers, as a sequence of key/value pairs.
  // Since header fields may be repeated, this array may contain multiple entries for the same key.
  get headers() {
    return this._headers;
  }
  constructor(headers) {
    this._headers = headers;
  }
  _indexOfHeader(name2) {
    const headers = this.headers;
    const len = headers.length;
    for (let i = 0; i < len; i++) {
      if (headers[i][0].toLowerCase() === name2) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Get the value of the given header field.
   * If there are multiple fields with that name, this only returns the first field's value!
   * @param name Name of the header field
   */
  getHeader(name2) {
    const index = this._indexOfHeader(name2.toLowerCase());
    if (index !== -1) {
      return this.headers[index][1];
    }
    return "";
  }
  /**
   * Set the value of the given header field. Assumes that there is only one field with the given name.
   * If the field does not exist, it adds a new field with the name and value.
   * @param name Name of the field.
   * @param value New value.
   */
  setHeader(name2, value) {
    const index = this._indexOfHeader(name2.toLowerCase());
    if (index !== -1) {
      this.headers[index][1] = value;
    } else {
      this.headers.push([name2, value]);
    }
  }
  /**
   * Removes the header field with the given name. Assumes that there is only one field with the given name.
   * Does nothing if field does not exist.
   * @param name Name of the field.
   */
  removeHeader(name2) {
    const index = this._indexOfHeader(name2.toLowerCase());
    if (index !== -1) {
      this.headers.splice(index, 1);
    }
  }
  /**
   * Removes all header fields.
   */
  clearHeaders() {
    this._headers = [];
  }
};
var InterceptedHTTPResponse = class extends AbstractHTTPHeaders {
  // The status code of the HTTP response.
  statusCode;
  constructor(metadata) {
    super(metadata.headers);
    this.statusCode = metadata.status_code;
    this.removeHeader("transfer-encoding");
    this.removeHeader("content-encoding");
    this.removeHeader("content-security-policy");
    this.removeHeader("x-webkit-csp");
    this.removeHeader("x-content-security-policy");
  }
  toJSON() {
    return {
      status_code: this.statusCode,
      headers: this.headers
    };
  }
};
var InterceptedHTTPRequest = class extends AbstractHTTPHeaders {
  // HTTP method (GET/DELETE/etc)
  method;
  // The URL as a string.
  rawUrl;
  // The URL as a URL object.
  url;
  constructor(metadata) {
    super(metadata.headers);
    this.method = metadata.method.toLowerCase();
    this.rawUrl = metadata.url;
    this.url = (0, import_url.parse)(this.rawUrl);
  }
};
var InterceptedHTTPMessage = class _InterceptedHTTPMessage {
  /**
   * Unpack from a Buffer received from MITMProxy.
   * @param b
   */
  static FromBuffer(b) {
    const metadataSize = b.readInt32LE(0);
    const requestSize = b.readInt32LE(4);
    const responseSize = b.readInt32LE(8);
    const metadata = JSON.parse(b.toString("utf8", 12, 12 + metadataSize));
    return new _InterceptedHTTPMessage(
      new InterceptedHTTPRequest(metadata.request),
      new InterceptedHTTPResponse(metadata.response),
      b.slice(12 + metadataSize, 12 + metadataSize + requestSize),
      b.slice(12 + metadataSize + requestSize, 12 + metadataSize + requestSize + responseSize)
    );
  }
  request;
  response;
  // The body of the HTTP request.
  requestBody;
  // The body of the HTTP response. Read-only; change the response body via setResponseBody.
  get responseBody() {
    return this._responseBody;
  }
  _responseBody;
  constructor(request, response, requestBody, responseBody) {
    this.request = request;
    this.response = response;
    this.requestBody = requestBody;
    this._responseBody = responseBody;
  }
  /**
   * Changes the body of the HTTP response. Appropriately updates content-length.
   * @param b The new body contents.
   */
  setResponseBody(b) {
    this._responseBody = b;
    this.response.setHeader("content-length", `${b.length}`);
  }
  /**
   * Changes the status code of the HTTP response.
   * @param code The new status code.
   */
  setStatusCode(code) {
    this.response.statusCode = code;
  }
  /**
   * Pack into a buffer for transmission to MITMProxy.
   */
  toBuffer() {
    const metadata = Buffer.from(JSON.stringify(this.response), "utf8");
    const metadataLength = metadata.length;
    const responseLength = this._responseBody.length;
    const rv = Buffer.alloc(8 + metadataLength + responseLength);
    rv.writeInt32LE(metadataLength, 0);
    rv.writeInt32LE(responseLength, 4);
    metadata.copy(rv, 8);
    this._responseBody.copy(rv, 8 + metadataLength);
    return rv;
  }
};
var StashedItem = class {
  constructor(rawUrl, mimeType, data) {
    this.rawUrl = rawUrl;
    this.mimeType = mimeType;
    this.data = data;
  }
  get shortMimeType() {
    let mime = this.mimeType.toLowerCase();
    if (mime.indexOf(";") !== -1) {
      mime = mime.slice(0, mime.indexOf(";"));
    }
    return mime;
  }
  get isHtml() {
    return this.shortMimeType === "text/html";
  }
  get isJavaScript() {
    switch (this.shortMimeType) {
      case "text/javascript":
      case "application/javascript":
      case "text/x-javascript":
      case "application/x-javascript":
        return true;
      default:
        return false;
    }
  }
};
function defaultStashFilter(url, item) {
  return item.isJavaScript || item.isHtml;
}
var MITMProxy = class _MITMProxy {
  static _activeProcesses = [];
  /**
   * Creates a new MITMProxy instance.
   * @param cb Called with intercepted HTTP requests / responses.
   * @param interceptPaths List of paths to completely intercept without sending to the server (e.g. ['/eval'])
   * @param quiet If true, do not print debugging messages (defaults to 'true').
   * @param onlyInterceptTextFiles If true, only intercept text files (JavaScript/HTML/CSS/etc, and ignore media files).
   */
  static async Create(cb = nopInterceptor, interceptPaths = [], quiet = false, onlyInterceptTextFiles = false, ignoreHosts = null) {
    const wss = new import_ws.Server({ port: 8765 });
    const proxyConnected = new Promise((resolve2, reject) => {
      wss.once("connection", () => {
        resolve2();
      });
    });
    const mp = new _MITMProxy(cb, onlyInterceptTextFiles);
    mp._initializeWSS(wss);
    await new Promise((resolve2, reject) => {
      wss.once("listening", () => {
        wss.removeListener("error", reject);
        resolve2();
      });
      wss.once("error", reject);
    });
    try {
      try {
        await waitForPort(8080, 1);
        if (!quiet) {
          console.log(`MITMProxy already running.`);
        }
      } catch (e) {
        if (!quiet) {
          console.log(`MITMProxy not running; starting up mitmproxy.`);
        }
        const scriptArgs = interceptPaths.length > 0 ? ["--set", `intercept=${interceptPaths.join(",")}`] : [];
        scriptArgs.push("--set", `onlyInterceptTextFiles=${onlyInterceptTextFiles}`);
        if (ignoreHosts) {
          scriptArgs.push(`--ignore-hosts`, ignoreHosts);
        }
        const options = ["--anticache", "-s", (0, import_path.resolve)(__dirname, `./scripts/proxy.py`)].concat(scriptArgs);
        if (quiet) {
          options.push("-q");
        }
        options.push("--ssl-insecure");
        console.log(options);
        const mitmProcess = (0, import_child_process.spawn)("mitmdump", options, {
          stdio: "inherit"
        });
        const mitmProxyExited = new Promise((_, reject) => {
          mitmProcess.once("error", reject);
          mitmProcess.once("exit", reject);
        });
        if (_MITMProxy._activeProcesses.push(mitmProcess) === 1) {
          process.on("SIGINT", _MITMProxy._cleanup);
          process.on("exit", _MITMProxy._cleanup);
        }
        mp._initializeMITMProxy(mitmProcess);
        const waitingForPort = waitForPort(8080);
        try {
          await Promise.race([mitmProxyExited, waitingForPort]);
        } catch (e2) {
          if (e2) {
            throw new Error(`mitmdump, which is an executable that ships with mitmproxy, is not on your PATH. Please ensure that you can run mitmdump --version successfully from your command line.`);
          } else {
            throw new Error(`Unable to start mitmproxy: ${e2}`);
          }
        }
      }
      await proxyConnected;
    } catch (e) {
      await new Promise((resolve2) => wss.close(resolve2));
      throw e;
    }
    return mp;
  }
  static _cleanupCalled = false;
  static _cleanup() {
    if (_MITMProxy._cleanupCalled) {
      return;
    }
    _MITMProxy._cleanupCalled = true;
    _MITMProxy._activeProcesses.forEach((p) => {
      p.kill("SIGKILL");
    });
  }
  _stashEnabled = false;
  // Toggle whether or not mitmproxy-node stashes modified server responses.
  // **Not used for performance**, but enables Node.js code to fetch previous server responses from the proxy.
  get stashEnabled() {
    return this._stashEnabled;
  }
  set stashEnabled(v) {
    if (!v) {
      this._stash.clear();
    }
    this._stashEnabled = v;
  }
  _mitmProcess;
  _mitmError;
  _wss;
  cb = function name2(params) {
    return new Promise((resolve2) => {
      resolve2(console.log(params));
    });
  };
  onlyInterceptTextFiles;
  _stash = /* @__PURE__ */ new Map();
  _stashFilter = defaultStashFilter;
  get stashFilter() {
    return this._stashFilter;
  }
  set stashFilter(value) {
    if (typeof value === "function") {
      this._stashFilter = value;
    } else if (value === null) {
      this._stashFilter = defaultStashFilter;
    } else {
      throw new Error(`Invalid stash filter: Expected a function.`);
    }
  }
  constructor(cb, onlyInterceptTextFiles) {
    this.cb = cb;
    this.onlyInterceptTextFiles = onlyInterceptTextFiles;
  }
  _initializeWSS(wss) {
    this._wss = wss;
    this._wss.on("connection", (ws) => {
      ws.on("error", (e) => {
        if (e.code !== "ECONNRESET") {
          console.log(`WebSocket error: ${e}`);
        }
      });
      ws.on("message", async (message) => {
        const original = InterceptedHTTPMessage.FromBuffer(message);
        const rv = this.cb(original);
        if (rv && typeof rv === "object" && rv) {
          await rv;
        }
        if (this._stashEnabled) {
          const item = new StashedItem(original.request.rawUrl, original.response.getHeader("content-type"), original.responseBody);
          if (this._stashFilter(original.request.rawUrl, item)) {
            this._stash.set(original.request.rawUrl, item);
          }
        }
        ws.send(original.toBuffer());
      });
    });
  }
  _initializeMITMProxy(mitmProxy) {
    this._mitmProcess = mitmProxy;
    this._mitmProcess.on("exit", (code, signal) => {
      const index = _MITMProxy._activeProcesses.indexOf(this._mitmProcess);
      if (index !== -1) {
        _MITMProxy._activeProcesses.splice(index, 1);
      }
      if (code !== null) {
        if (code !== 0) {
          this._mitmError = new Error(`Process exited with code ${code}.`);
        }
      } else {
        this._mitmError = new Error(`Process exited due to signal ${signal}.`);
      }
    });
    this._mitmProcess.on("error", (err) => {
      this._mitmError = err;
    });
  }
  /**
   * Retrieves the given URL from the stash.
   * @param url
   */
  getFromStash(url) {
    return this._stash.get(url);
  }
  forEachStashItem(cb) {
    this._stash.forEach(cb);
  }
  /**
   * Requests the given URL from the proxy.
   */
  async proxyGet(urlString) {
    const url = (0, import_url.parse)(urlString);
    const get = url.protocol === "http:" ? import_http.get : import_https.get;
    return new Promise((resolve2, reject) => {
      const req = get({
        headers: {
          host: urlString.split("/")[1]
        },
        host: "localhost",
        port: 8080,
        path: urlString
      }, (res) => {
        const data = new Array();
        res.on("data", (chunk) => {
          data.push(chunk);
        });
        res.on("end", () => {
          const d = Buffer.concat(data);
          resolve2({
            statusCode: res.statusCode,
            headers: res.headers,
            body: d
          });
        });
        res.once("error", reject);
      });
      req.once("error", reject);
    });
  }
  async shutdown() {
    return new Promise((resolve2, reject) => {
      const closeWSS = () => {
        this._wss.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve2();
          }
        });
      };
      if (this._mitmProcess && !this._mitmProcess.killed) {
        this._mitmProcess.once("exit", (code, signal) => {
          closeWSS();
        });
        this._mitmProcess.kill("SIGTERM");
      } else {
        closeWSS();
      }
    });
  }
};

// node_modules/file-type-mime/dist/index.mjs
function getUint16(buffer, offset = 0) {
  const view = getBufferView(buffer, offset, 2);
  return view.getUint16(0, true);
}
function getUint32(buffer, offset = 0) {
  const view = getBufferView(buffer, offset, 4);
  return view.getUint32(0, true);
}
function getString(buffer, offset = 0, length = buffer.byteLength) {
  const slice = buffer.slice(offset, offset + length);
  return decoder.decode(new Uint8Array(slice));
}
function compareBytes(source, sample, offset = 0) {
  if (source.length < sample.length + offset) {
    return false;
  }
  for (const [i, element] of sample.entries()) {
    if (element === null)
      continue;
    if (element !== source[i + offset]) {
      return false;
    }
  }
  return true;
}
function getBufferView(buffer, offset, length) {
  const slice = buffer.slice(offset, offset + length);
  return new DataView(new Uint8Array(slice).buffer);
}
var decoder = new TextDecoder("utf8");
var signatures = [
  [
    "db",
    "application/vnd.sqlite3",
    [
      83,
      81,
      76,
      105,
      116,
      101,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      32,
      51,
      0
    ]
  ],
  ["woff", "font/woff", [119, 79, 70, 70]],
  ["woff2", "font/woff2", [119, 79, 70, 50]],
  ["bmp", "image/bmp", [66, 77]],
  ["gif", "image/gif", [71, 73, 70, 56, 55, 97]],
  ["gif", "image/gif", [71, 73, 70, 56, 57, 97]],
  [
    "heic",
    "image/heic",
    [102, 116, 121, 112, 104, 101, 105],
    { offset: 4 }
  ],
  ["heic", "image/heic", [102, 116, 121, 112, 109], { offset: 4 }],
  ["ico", "image/x-icon", [0, 0, 1, 0]],
  ["jpg", "image/jpeg", [255, 216, 255]],
  ["pdf", "application/pdf", [37, 80, 68, 70, 45]],
  ["png", "image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
  ["7z", "application/x-7z-compressed", [55, 122, 188, 175, 39, 28]],
  [
    "rar",
    "application/x-rar-compressed",
    [82, 97, 114, 33, 26, 7, 0]
  ],
  [
    "rar",
    "application/x-rar-compressed",
    [82, 97, 114, 33, 26, 7, 1, 0]
  ],
  ["rtf", "application/rtf", [123, 92, 114, 116, 102, 49]],
  ["bz2", "application/x-bzip2", [66, 90, 104]],
  ["gz", "application/gzip", [31, 139]],
  [
    "tar",
    "application/x-tar",
    [117, 115, 116, 97, 114, 0, 48, 48],
    { offset: 257 }
  ],
  [
    "tar",
    "application/x-tar",
    [117, 115, 116, 97, 114, 32, 32, 0],
    { offset: 257 }
  ],
  ["tif", "image/tiff", [73, 73, 42, 0]],
  ["tiff", "image/tiff", [77, 77, 0, 42]],
  ["zip", "application/zip", [80, 75, 3, 4], { exact: false }],
  ["zip", "application/zip", [80, 75, 5, 6]],
  ["mp3", "audio/mp3", [255, 251]],
  ["mp3", "audio/mp3", [255, 243]],
  ["mp3", "audio/mp3", [255, 242]],
  ["mp3", "audio/mp3", [73, 68, 51]],
  [
    "mp4",
    "video/mp4",
    [102, 116, 121, 112, 105, 115, 111, 109],
    { offset: 4 }
  ],
  [
    "avi",
    "video/x-msvideo",
    [82, 73, 70, 70, null, null, null, null, 65, 86, 73, 32]
  ],
  [
    "wav",
    "audio/wav",
    [82, 73, 70, 70, null, null, null, null, 87, 65, 86, 69]
  ],
  [
    "ogx",
    "application/ogg",
    [79, 103, 103, 83],
    { exact: false },
    [
      ["oga", "audio/ogg", [127, 70, 76, 65, 67], { offset: 28 }],
      [
        "ogg",
        "audio/ogg",
        [1, 118, 111, 114, 98, 105, 115],
        { offset: 28 }
      ],
      [
        "ogm",
        "video/ogg",
        [1, 118, 105, 100, 101, 111, 0],
        { offset: 28 }
      ],
      [
        "ogv",
        "video/ogg",
        [128, 116, 104, 101, 111, 114, 97],
        { offset: 28 }
      ]
    ]
  ],
  [
    "webp",
    "image/webp",
    [82, 73, 70, 70, null, null, null, null, 87, 69, 66, 80]
  ],
  ["psd", "image/vnd.adobe.photoshop", [56, 66, 80, 83]],
  ["flac", "audio/x-flac", [102, 76, 97, 67]],
  ["wasm", "application/wasm", [0, 97, 115, 109]],
  [
    "deb",
    "application/x-deb",
    [33, 60, 97, 114, 99, 104, 62, 10]
  ],
  ["exe", "application/x-msdownload", [77, 90]],
  ["exe", "application/x-msdownload", [90, 77]],
  ["class", "application/java-vm", [202, 254, 186, 190]]
];
function isText(data) {
  for (let i = 0; i < data.length; i++) {
    try {
      const code = data.charCodeAt(i);
      if (code === 65533 || code <= 8) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}
function parseTxtLikeFiles(buffer) {
  try {
    const data = getString(buffer);
    if (!isText(data)) {
      return void 0;
    }
    try {
      JSON.parse(data);
      return { ext: "json", mime: "application/json" };
    } catch {
      return { ext: "txt", mime: "text/plain" };
    }
  } catch {
    return void 0;
  }
}
function getUpperLimit(signatures2) {
  return flatten(signatures2).map(([_ext, _mime, sample, { offset = 0 } = {}]) => sample.length + offset).reduce((lim, val) => val > lim ? val : lim, 0);
}
function flatten(signatures2) {
  return signatures2.flatMap(
    ([ext, mime, bytes, options = {}, subSignatures = []]) => [
      [ext, mime, bytes, options],
      ...subSignatures
    ]
  );
}
function findMatches(signatures2, { ext, mime }) {
  if (!(ext || mime))
    return [];
  return flatten(signatures2).filter(
    (signature) => signature[0] === ext || signature[1] === mime
  );
}
function parseZipLikeFiles(buffer, result) {
  const size = getUint16(buffer, 26);
  const name2 = getString(buffer, 30, size);
  const [identifier] = name2.split("/");
  const xmlFormat = name2.endsWith(".xml");
  if (identifier === "META-INF") {
    return {
      ext: "jar",
      mime: "application/java-archive"
    };
  }
  if (identifier === "ppt" && xmlFormat) {
    return {
      ext: "pptx",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    };
  }
  if (identifier === "word" && xmlFormat) {
    return {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }
  if (identifier === "xl" && xmlFormat) {
    return {
      ext: "xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };
  }
  if (identifier === "mimetype") {
    return parseOpenDocumentFile(buffer, size) ?? result;
  }
  return result;
}
function parseOpenDocumentFile(buffer, offset) {
  const compressedSize = getUint32(buffer, 18);
  const uncompressedSize = getUint32(buffer, 22);
  const extraFieldLength = getUint16(buffer, 28);
  if (compressedSize === uncompressedSize) {
    const mime = getString(
      buffer,
      30 + offset + extraFieldLength,
      compressedSize
    );
    if (mime === "application/vnd.oasis.opendocument.presentation") {
      return {
        ext: "odp",
        mime
      };
    }
    if (mime === "application/vnd.oasis.opendocument.spreadsheet") {
      return {
        ext: "ods",
        mime
      };
    }
    if (mime === "application/vnd.oasis.opendocument.text") {
      return {
        ext: "odt",
        mime
      };
    }
    if (mime === "application/epub+zip") {
      return {
        ext: "epub",
        mime
      };
    }
  }
  return void 0;
}
var UPPER_LIMIT = getUpperLimit(signatures);
function parse(buffer, { extra = false, hint } = {}) {
  const bytes = new Uint8Array(buffer.slice(0, UPPER_LIMIT));
  if (hint) {
    const matches = findMatches(signatures, hint);
    console.log(matches);
    if (matches.length > 0) {
      const result2 = parseBytes(bytes, matches);
      if (result2 !== void 0) {
        return result2;
      }
    }
  }
  const result = parseBytes(bytes, signatures);
  console.log(result);
  if (result) {
    return result;
  }
  if (extra) {
    return parseExtraTypes(buffer);
  }
  return void 0;
}
function parseBytes(bytes, signatures2) {
  for (const [
    ext,
    mime,
    sample,
    { exact = true, offset = 0 } = {},
    subSignatures = []
  ] of signatures2) {
    if (compareBytes(bytes, sample, offset)) {
      if (ext === "zip" && !exact) {
        return parseZipLikeFiles(bytes.buffer, { ext, mime });
      }
      if (!exact && subSignatures.length) {
        for (const [ext2, mime2, sample2, { offset: offset2 = 0 } = {}] of subSignatures) {
          if (compareBytes(bytes, sample2, offset2)) {
            return { ext: ext2, mime: mime2 };
          }
        }
      }
      return { ext, mime };
    }
  }
  return void 0;
}
function parseExtraTypes(buffer) {
  return parseTxtLikeFiles(buffer);
}

// proxy.ts
var fs = __toESM(require("fs"));
function toArrayBuffer(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}
var name = (m) => {
  const requestBody = m.responseBody;
  fs.writeFileSync("temp.txt", requestBody);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
  let content = toArrayBuffer(fs.readFileSync("temp.txt"));
  console.log(content);
  console.log(parse(content, { extra: true }));
  const extension = parse(content, { extra: true })?.ext || ".txt";
  const filename = `content/${timestamp}.${extension}`;
  fs.renameSync("temp.txt", filename);
};
var proxy_default = name;
console.log(MITMProxy.Create(name, [], false));
/*! Bundled license information:

ws/lib/BufferUtil.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/Validation.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/ErrorCodes.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/Receiver.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/Sender.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/WebSocket.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/WebSocketServer.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/index.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)
*/
