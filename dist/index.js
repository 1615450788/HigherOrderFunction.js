import hash from 'object-hash';
import { inRange, clamp } from 'lodash';
import retry from 'retry';

const md5 = (v, options = {}) => hash(v, { algorithm: "md5", ...options });
const cacheWarpper = (fn, options) => {
  const {
    params = (...arg) => arg,
    key = (...arg) => md5(arg, options),
    storage = new Map(),
    debug = false
  } = options || {};
  return async (...arg) => {
    const cacheKey = await key(...await params(...arg));
    const cacheValue = await storage.get(cacheKey);
    if (cacheValue) {
      debug && console.log("Cache found", { cacheKey, cacheValue });
      return cacheValue;
    } else {
      debug && console.log("Cache not found", { cacheKey });
      const result = await fn(...arg);
      await storage.set(cacheKey, result);
      return result;
    }
  };
};

var inherits = require("inherits");
var EventEmitter = require("events").EventEmitter;
function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }
  EventEmitter.call(this);
  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.timeout = options.timeout || 0;
  this.autostart = options.autostart || false;
  this.results = options.results || null;
  this.pending = 0;
  this.session = 0;
  this.running = false;
  this.jobs = [];
  this.timers = {};
}
inherits(Queue, EventEmitter);
var arrayMethods = [
  "pop",
  "shift",
  "indexOf",
  "lastIndexOf"
];
arrayMethods.forEach(function(method) {
  Queue.prototype[method] = function() {
    return Array.prototype[method].apply(this.jobs, arguments);
  };
});
Queue.prototype.slice = function(begin, end) {
  this.jobs = this.jobs.slice(begin, end);
  return this;
};
Queue.prototype.reverse = function() {
  this.jobs.reverse();
  return this;
};
var arrayAddMethods = [
  "push",
  "unshift",
  "splice"
];
arrayAddMethods.forEach(function(method) {
  Queue.prototype[method] = function() {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    if (this.autostart) {
      this.start();
    }
    return methodResult;
  };
});
Object.defineProperty(Queue.prototype, "length", {
  get: function() {
    return this.pending + this.jobs.length;
  }
});
Queue.prototype.start = function(cb) {
  if (cb) {
    callOnErrorOrEnd.call(this, cb);
  }
  this.running = true;
  if (this.pending >= this.concurrency) {
    return;
  }
  if (this.jobs.length === 0) {
    if (this.pending === 0) {
      done.call(this);
    }
    return;
  }
  var self = this;
  var job = this.jobs.shift();
  var once = true;
  var session = this.session;
  var timeoutId = null;
  var didTimeout = false;
  var resultIndex = null;
  var timeout = job.hasOwnProperty("timeout") ? job.timeout : this.timeout;
  function next(err, result) {
    if (once && self.session === session) {
      once = false;
      self.pending--;
      if (timeoutId !== null) {
        delete self.timers[timeoutId];
        clearTimeout(timeoutId);
      }
      if (err) {
        self.emit("error", err, job);
      } else if (didTimeout === false) {
        if (resultIndex !== null) {
          self.results[resultIndex] = Array.prototype.slice.call(arguments, 1);
        }
        self.emit("success", result, job);
      }
      if (self.session === session) {
        if (self.pending === 0 && self.jobs.length === 0) {
          done.call(self);
        } else if (self.running) {
          self.start();
        }
      }
    }
  }
  if (timeout) {
    timeoutId = setTimeout(function() {
      didTimeout = true;
      if (self.listeners("timeout").length > 0) {
        self.emit("timeout", next, job);
      } else {
        next();
      }
    }, timeout);
    this.timers[timeoutId] = timeoutId;
  }
  if (this.results) {
    resultIndex = this.results.length;
    this.results[resultIndex] = null;
  }
  this.pending++;
  self.emit("start", job);
  var promise = job(next);
  if (promise && promise.then && typeof promise.then === "function") {
    promise.then(function(result) {
      return next(null, result);
    }).catch(function(err) {
      return next(err || true);
    });
  }
  if (this.running && this.jobs.length > 0) {
    this.start();
  }
};
Queue.prototype.stop = function() {
  this.running = false;
};
Queue.prototype.end = function(err) {
  clearTimers.call(this);
  this.jobs.length = 0;
  this.pending = 0;
  done.call(this, err);
};
function clearTimers() {
  for (var key in this.timers) {
    var timeoutId = this.timers[key];
    delete this.timers[key];
    clearTimeout(timeoutId);
  }
}
function callOnErrorOrEnd(cb) {
  var self = this;
  this.on("error", onerror);
  this.on("end", onend);
  function onerror(err) {
    self.end(err);
  }
  function onend(err) {
    self.removeListener("error", onerror);
    self.removeListener("end", onend);
    cb(err, this.results);
  }
}
function done(err) {
  this.session++;
  this.running = false;
  this.emit("end", err);
}

const queueWarpper = (fn, options) => {
  const {
    concurrency = 6,
    failAbort = true,
    debug = false,
    elastic: { enable = false, idealDuration = 1e4 } = {}
  } = options || {};
  const startConcurrency = enable ? 1 : concurrency;
  const queueIns = new Queue({
    concurrency: startConcurrency,
    autostart: true
  });
  if (enable && concurrency > 1) {
    queueIns.on("start", (job) => {
      job._startTime = Number(new Date());
      job._concurrency = queueIns.concurrency;
    });
    queueIns.on("success", (result, job) => {
      if (job._concurrency !== queueIns.concurrency)
        return;
      const duration = Number(new Date()) - job._startTime;
      let nowConcurrency = queueIns.concurrency;
      if (inRange(duration, idealDuration * 0.9, idealDuration * 1.1))
        return;
      if (duration < idealDuration) {
        nowConcurrency++;
      } else {
        nowConcurrency--;
      }
      nowConcurrency = clamp(nowConcurrency, 1, concurrency);
      if (queueIns.concurrency !== nowConcurrency) {
        queueIns.concurrency = nowConcurrency;
      }
      debug && console.log("queueWarpper success", {
        duration,
        start: job._startTime,
        nowConcurrency
      });
    });
  }
  let errorHandler = () => {
  };
  if (failAbort) {
    errorHandler = () => {
      debug && console.log("queueWarpper error", queueIns);
      queueIns.end();
    };
  }
  queueIns.start();
  return (...arg) => {
    return new Promise((resolve, reject) => {
      queueIns.push(async () => {
        try {
          const result = await fn(...arg);
          resolve(result);
        } catch (err) {
          errorHandler();
          reject(err);
        }
      });
    });
  };
};

function retryWarpper(cb, options) {
  const { debug = false, retries = 2 } = options || {};
  var operation = retry.operation({ ...options, retries });
  return (...arg) => new Promise((resolve, reject) => {
    operation.attempt(async () => {
      try {
        const attempts = operation.attempts();
        if (attempts > 1) {
          debug && console.log("\u4EFB\u52A1\u6267\u884C\u5931\u8D25\uFF0C\u6B63\u5728\u91CD\u8BD5\uFF0C\u5F53\u524D\u91CD\u8BD5\u6B21\u6570:", attempts - 1, "; \u6700\u5927\u91CD\u8BD5\u6B21\u6570\uFF1A", retries);
        }
        const result = await cb(...arg);
        resolve(result);
      } catch (error) {
        if (operation.retry(error)) {
          return;
        }
        reject(operation.errors());
      }
    });
  });
}

export { cacheWarpper, queueWarpper, retryWarpper };
