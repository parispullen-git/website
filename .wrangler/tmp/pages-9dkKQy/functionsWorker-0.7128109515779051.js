var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    if (!("__unenv__" in performance)) {
      const proto = Performance.prototype;
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== "constructor" && !(key in performance)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            Object.defineProperty(performance, key, desc);
          }
        }
      }
    }
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// api/_lib/store.js
var require_store = __commonJS({
  "api/_lib/store.js"(exports, module) {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    function newId5(prefix) {
      const rand = Math.random().toString(36).slice(2, 8);
      return `${prefix}_${Date.now().toString(36)}${rand}`;
    }
    __name(newId5, "newId");
    async function listRecords7(env2, collection) {
      const records = [];
      let cursor;
      do {
        const page = await env2.PP_DATA.list({ prefix: `${collection}/`, cursor });
        const batch = await Promise.all(page.keys.map((k) => env2.PP_DATA.get(k.name, "json")));
        records.push(...batch.filter(Boolean));
        cursor = page.list_complete ? void 0 : page.cursor;
      } while (cursor);
      return records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    __name(listRecords7, "listRecords");
    async function getRecord5(env2, collection, id) {
      return env2.PP_DATA.get(`${collection}/${id}`, "json");
    }
    __name(getRecord5, "getRecord");
    async function putRecord6(env2, collection, id, data) {
      await env2.PP_DATA.put(`${collection}/${id}`, JSON.stringify(data));
      return data;
    }
    __name(putRecord6, "putRecord");
    async function deleteRecord5(env2, collection, id) {
      await env2.PP_DATA.delete(`${collection}/${id}`);
    }
    __name(deleteRecord5, "deleteRecord");
    function checkAuth16(env2, payload) {
      const expected = env2.INVOICE_PASSPHRASE_HASH;
      if (!expected) return true;
      return payload && payload.passphraseHash === expected;
    }
    __name(checkAuth16, "checkAuth");
    function json18(status, body) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    }
    __name(json18, "json");
    module.exports = { newId: newId5, listRecords: listRecords7, getRecord: getRecord5, putRecord: putRecord6, deleteRecord: deleteRecord5, checkAuth: checkAuth16, json: json18 };
  }
});

// api/_lib/http.js
var require_http = __commonJS({
  "api/_lib/http.js"(exports, module) {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function toEvent16(request) {
      const url = new URL(request.url);
      const queryStringParameters = {};
      url.searchParams.forEach((v, k) => {
        queryStringParameters[k] = v;
      });
      const headers = {};
      request.headers.forEach((v, k) => {
        headers[k] = v;
      });
      let body = null;
      if (request.method !== "GET" && request.method !== "HEAD") {
        body = await request.text();
      }
      return { httpMethod: request.method, queryStringParameters, headers, body };
    }
    __name(toEvent16, "toEvent");
    module.exports = { toEvent: toEvent16 };
  }
});

// api/_lib/github-file.js
var require_github_file = __commonJS({
  "api/_lib/github-file.js"(exports, module) {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var REPO2 = "parispullen-git/website";
    var BRANCH2 = "main";
    function ghHeaders(env2) {
      return {
        "Authorization": `Bearer ${env2.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "parispullen-dashboard",
        "X-GitHub-Api-Version": "2022-11-28"
      };
    }
    __name(ghHeaders, "ghHeaders");
    function b64ToUtf8(b64) {
      const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    __name(b64ToUtf8, "b64ToUtf8");
    function utf8ToB64(str) {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      bytes.forEach((b) => {
        binary += String.fromCharCode(b);
      });
      return btoa(binary);
    }
    __name(utf8ToB64, "utf8ToB64");
    async function readJsonFile8(env2, path) {
      const url = `https://api.github.com/repos/${REPO2}/contents/${path}?ref=${BRANCH2}`;
      const res = await fetch(url, { headers: ghHeaders(env2) });
      if (!res.ok) {
        const detail = await res.text();
        return { ok: false, status: res.status, error: `GitHub read failed: ${res.status}`, detail };
      }
      const file = await res.json();
      let data;
      try {
        data = JSON.parse(b64ToUtf8(file.content));
      } catch (e) {
        return { ok: false, status: 500, error: `${path} on GitHub is not valid JSON: ${e.message}` };
      }
      return { ok: true, data, sha: file.sha };
    }
    __name(readJsonFile8, "readJsonFile");
    async function writeJsonFile8(env2, path, data, commitMessage) {
      const url = `https://api.github.com/repos/${REPO2}/contents/${path}`;
      const shaRes = await fetch(url + `?ref=${BRANCH2}`, { headers: ghHeaders(env2) });
      if (!shaRes.ok) {
        return { ok: false, status: shaRes.status, error: `Could not read current file sha: ${shaRes.status}` };
      }
      const current = await shaRes.json();
      const body = {
        message: commitMessage,
        content: utf8ToB64(JSON.stringify(data, null, 2) + "\n"),
        sha: current.sha,
        branch: BRANCH2
      };
      const putRes = await fetch(url, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders(env2)),
        body: JSON.stringify(body)
      });
      if (!putRes.ok) {
        const detail = await putRes.text();
        if (putRes.status === 409) {
          return { ok: false, status: 409, error: "The file changed on GitHub since you loaded it. Reload and try again.", detail };
        }
        return { ok: false, status: putRes.status, error: `GitHub write failed: ${putRes.status}`, detail };
      }
      const result = await putRes.json();
      return { ok: true, sha: result.content.sha, commitUrl: result.commit.html_url };
    }
    __name(writeJsonFile8, "writeJsonFile");
    module.exports = { readJsonFile: readJsonFile8, writeJsonFile: writeJsonFile8, REPO: REPO2, BRANCH: BRANCH2 };
  }
});

// api/casefiles-live.js
async function onRequest(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent(request);
  if (!env2.GITHUB_TOKEN) {
    return json(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile(env2, PATH);
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { items: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Bad request body" });
  }
  if (!checkAuth(env2, payload)) {
    return json(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.items)) {
      return json(400, { error: "Missing items array" });
    }
    const result = await writeJsonFile(env2, PATH, payload.items, payload.commitMessage || "Update Case Files via dashboard");
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json(405, { error: "Method not allowed" });
}
var checkAuth, json, toEvent, readJsonFile, writeJsonFile, PATH;
var init_casefiles_live = __esm({
  "api/casefiles-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth, json } = require_store());
    ({ toEvent } = require_http());
    ({ readJsonFile, writeJsonFile } = require_github_file());
    PATH = "data/casefiles.json";
    __name(onRequest, "onRequest");
  }
});

// api/charlotte-live.js
async function onRequest2(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent2(request);
  if (!env2.GITHUB_TOKEN) {
    return json2(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile2(env2, PATH2);
    if (!result.ok) return json2(result.status, { error: result.error, detail: result.detail });
    return json2(200, { items: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json2(400, { error: "Bad request body" });
  }
  if (!checkAuth2(env2, payload)) {
    return json2(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.items)) {
      return json2(400, { error: "Missing items array" });
    }
    const result = await writeJsonFile2(env2, PATH2, payload.items, payload.commitMessage || "Update Charlotte Map via dashboard");
    if (!result.ok) return json2(result.status, { error: result.error, detail: result.detail });
    return json2(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json2(405, { error: "Method not allowed" });
}
var checkAuth2, json2, toEvent2, readJsonFile2, writeJsonFile2, PATH2;
var init_charlotte_live = __esm({
  "api/charlotte-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth2, json: json2 } = require_store());
    ({ toEvent: toEvent2 } = require_http());
    ({ readJsonFile: readJsonFile2, writeJsonFile: writeJsonFile2 } = require_github_file());
    PATH2 = "data/charlotte-locations.json";
    __name(onRequest2, "onRequest");
  }
});

// api/clients.js
async function stripeGet(path, key) {
  const res = await fetch(STRIPE_API + path, { headers: { Authorization: "Bearer " + key } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error && data.error.message || "Stripe request failed");
  return data;
}
async function onRequest3(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent3(request);
  if (event.httpMethod !== "GET") {
    return json3(405, { error: "Method not allowed" });
  }
  const params = event.queryStringParameters || {};
  if (!checkAuth3(env2, { passphraseHash: params.passphraseHash })) {
    return json3(401, { error: "Not authorized." });
  }
  const key = env2.STRIPE_SECRET_KEY;
  const clientsByEmail = {};
  function touch(email, name, when) {
    const e = (email || "").toLowerCase().trim();
    if (!e) return null;
    if (!clientsByEmail[e]) {
      clientsByEmail[e] = {
        email: e,
        name: name || e,
        invoices: [],
        proposals: [],
        inquiries: [],
        lastActivity: 0,
        totalInvoiced: 0
      };
    }
    if (name) clientsByEmail[e].name = name;
    if (when && when > clientsByEmail[e].lastActivity) clientsByEmail[e].lastActivity = when;
    return clientsByEmail[e];
  }
  __name(touch, "touch");
  try {
    if (key) {
      const data = await stripeGet("/invoices?limit=100&expand[]=data.customer", key);
      data.data.forEach((inv) => {
        const email = inv.customer && inv.customer.email;
        const c = touch(email, inv.customer && inv.customer.name, inv.created * 1e3);
        if (c) {
          c.invoices.push({ id: inv.id, number: inv.number, status: inv.status, total: inv.total, created: inv.created * 1e3 });
          c.totalInvoiced += inv.total || 0;
        }
      });
    }
  } catch (err) {
  }
  const proposals = await listRecords(env2, "proposals");
  proposals.forEach((p) => {
    const c = touch(p.email, p.name, p.createdAt);
    if (c) c.proposals.push({ id: p.id, total: p.total, status: p.status, createdAt: p.createdAt });
  });
  const inquiries = await listRecords(env2, "inquiries");
  inquiries.forEach((i) => {
    const c = touch(i.email, i.name, i.createdAt);
    if (c) c.inquiries.push({ id: i.id, itemCount: (i.items || []).length, createdAt: i.createdAt });
  });
  const clients = Object.values(clientsByEmail).sort((a, b) => b.lastActivity - a.lastActivity);
  return json3(200, { clients });
}
var listRecords, checkAuth3, json3, toEvent3, STRIPE_API;
var init_clients = __esm({
  "api/clients.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ listRecords, checkAuth: checkAuth3, json: json3 } = require_store());
    ({ toEvent: toEvent3 } = require_http());
    STRIPE_API = "https://api.stripe.com/v1";
    __name(stripeGet, "stripeGet");
    __name(onRequest3, "onRequest");
  }
});

// api/content.js
async function onRequest4(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent4(request);
  const params = event.queryStringParameters || {};
  const collection = params.collection;
  if (!ALLOWED.has(collection)) {
    return json4(400, { error: "Unknown or missing collection" });
  }
  if (event.httpMethod === "GET") {
    if (params.id) {
      const record = await getRecord(env2, collection, params.id);
      if (!record) return json4(404, { error: "Not found" });
      return json4(200, record);
    }
    const records = await listRecords2(env2, collection);
    return json4(200, { records });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json4(400, { error: "Bad request body" });
  }
  if (!checkAuth4(env2, payload)) {
    return json4(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    const id = payload.id || newId(collection.replace(/[^a-z]/g, "").slice(0, 4));
    const now = Date.now();
    const existing = payload.id ? await getRecord(env2, collection, payload.id) : null;
    const record = {
      ...payload.data,
      id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };
    await putRecord(env2, collection, id, record);
    return json4(200, { record });
  }
  if (event.httpMethod === "DELETE") {
    if (!params.id) return json4(400, { error: "Missing id" });
    await deleteRecord(env2, collection, params.id);
    return json4(200, { ok: true });
  }
  return json4(405, { error: "Method not allowed" });
}
var listRecords2, getRecord, putRecord, deleteRecord, newId, checkAuth4, json4, toEvent4, ALLOWED;
var init_content = __esm({
  "api/content.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ listRecords: listRecords2, getRecord, putRecord, deleteRecord, newId, checkAuth: checkAuth4, json: json4 } = require_store());
    ({ toEvent: toEvent4 } = require_http());
    ALLOWED = /* @__PURE__ */ new Set([
      "vault-reserve",
      "vault-links",
      "journal",
      "journal-categories",
      "casefiles",
      "wardrobe",
      "curations",
      "playlists",
      "channels",
      "pitches",
      "dispatch-briefs",
      "goals",
      "social-analytics",
      "newsletter",
      "tracked-brands",
      "daily-news"
    ]);
    __name(onRequest4, "onRequest");
  }
});

// api/create-invoice.js
async function stripePost(path, params, key) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(STRIPE_API2 + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error && data.error.message || "Stripe request failed");
  return data;
}
async function stripeGet2(path, key) {
  const res = await fetch(STRIPE_API2 + path, { headers: { Authorization: "Bearer " + key } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error && data.error.message || "Stripe request failed");
  return data;
}
async function onRequest5(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent5(request);
  if (event.httpMethod !== "POST") {
    return json5(405, { error: "Method not allowed" });
  }
  const key = env2.STRIPE_SECRET_KEY;
  if (!key) {
    return json5(500, { error: "Stripe is not configured on the server." });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json5(400, { error: "Bad request body" });
  }
  const expectedHash = env2.INVOICE_PASSPHRASE_HASH;
  if (expectedHash && payload.passphraseHash !== expectedHash) {
    return json5(401, { error: "Not authorized." });
  }
  const { name, email, daysUntilDue } = payload;
  const items = Array.isArray(payload.items) ? payload.items : [];
  const lineItems = items.map((it) => {
    const cents = Math.round(Number(it.amount) * 100);
    const type = (it.type || "").trim();
    const desc = (it.description || "").trim();
    return {
      cents,
      description: type && desc ? `${type} \u2014 ${desc}` : desc || type
    };
  });
  const totalCents = lineItems.reduce((sum, li) => sum + (li.cents || 0), 0);
  const allValid = lineItems.length > 0 && lineItems.every((li) => isFinite(li.cents) && li.cents > 0 && li.description);
  if (!name || !email || !allValid) {
    return json5(400, { error: "Missing or invalid invoice details." });
  }
  try {
    const search = await stripeGet2("/customers/search?query=" + encodeURIComponent(`email:'${email}'`), key);
    let customerId;
    if (search.data && search.data.length) {
      customerId = search.data[0].id;
    } else {
      const customer = await stripePost("/customers", { name, email }, key);
      customerId = customer.id;
    }
    for (const li of lineItems) {
      await stripePost("/invoiceitems", {
        customer: customerId,
        currency: "usd",
        amount: String(li.cents),
        description: li.description
      }, key);
    }
    const invoice = await stripePost("/invoices", {
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: String(daysUntilDue || 7),
      // without this, Stripe does not reliably auto-attach the pending
      // invoiceitems just created above, producing a $0.00 invoice.
      pending_invoice_items_behavior: "include",
      // explicit card rail so Apple Pay (a wallet riding on top of card) is
      // never excluded by some narrower account-level default.
      "payment_settings[payment_method_types][0]": "card"
    }, key);
    const finalized = await stripePost(`/invoices/${invoice.id}/finalize`, {}, key);
    return json5(200, {
      url: finalized.hosted_invoice_url,
      pdf: finalized.invoice_pdf,
      number: finalized.number,
      amount: totalCents
    });
  } catch (err) {
    return json5(500, { error: err.message });
  }
}
var json5, toEvent5, STRIPE_API2;
var init_create_invoice = __esm({
  "api/create-invoice.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ json: json5 } = require_store());
    ({ toEvent: toEvent5 } = require_http());
    STRIPE_API2 = "https://api.stripe.com/v1";
    __name(stripePost, "stripePost");
    __name(stripeGet2, "stripeGet");
    __name(onRequest5, "onRequest");
  }
});

// api/deploy.js
async function onRequest6(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent6(request);
  if (event.httpMethod !== "POST") {
    return json6(405, { error: "Method not allowed" });
  }
  if (!env2.GITHUB_TOKEN) {
    return json6(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json6(400, { error: "Bad request body" });
  }
  if (!checkAuth5(env2, payload)) {
    return json6(401, { error: "Not authorized." });
  }
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env2.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "parispullen-dashboard",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: BRANCH })
    }
  );
  if (res.status === 204) {
    return json6(200, {
      ok: true,
      actionsUrl: `https://github.com/${REPO}/actions/workflows/${WORKFLOW}`
    });
  }
  const detail = await res.text();
  return json6(res.status, { error: `GitHub could not start the workflow: ${res.status}`, detail });
}
var checkAuth5, json6, toEvent6, REPO, WORKFLOW, BRANCH;
var init_deploy = __esm({
  "api/deploy.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth5, json: json6 } = require_store());
    ({ toEvent: toEvent6 } = require_http());
    REPO = "parispullen-git/website";
    WORKFLOW = "deploy.yml";
    BRANCH = "main";
    __name(onRequest6, "onRequest");
  }
});

// api/house-channels-live.js
async function onRequest7(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent7(request);
  if (!env2.GITHUB_TOKEN) {
    return json7(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile3(env2, PATH3);
    if (!result.ok) return json7(result.status, { error: result.error, detail: result.detail });
    return json7(200, { data: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json7(400, { error: "Bad request body" });
  }
  if (!checkAuth6(env2, payload)) {
    return json7(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
      return json7(400, { error: "Missing data object" });
    }
    const result = await writeJsonFile3(env2, PATH3, payload.data, payload.commitMessage || "Update House Channels via dashboard");
    if (!result.ok) return json7(result.status, { error: result.error, detail: result.detail });
    return json7(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json7(405, { error: "Method not allowed" });
}
var checkAuth6, json7, toEvent7, readJsonFile3, writeJsonFile3, PATH3;
var init_house_channels_live = __esm({
  "api/house-channels-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth6, json: json7 } = require_store());
    ({ toEvent: toEvent7 } = require_http());
    ({ readJsonFile: readJsonFile3, writeJsonFile: writeJsonFile3 } = require_github_file());
    PATH3 = "data/house-channels.json";
    __name(onRequest7, "onRequest");
  }
});

// api/house-music-live.js
async function onRequest8(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent8(request);
  if (!env2.GITHUB_TOKEN) {
    return json8(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile4(env2, PATH4);
    if (!result.ok) return json8(result.status, { error: result.error, detail: result.detail });
    return json8(200, { items: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json8(400, { error: "Bad request body" });
  }
  if (!checkAuth7(env2, payload)) {
    return json8(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.items)) {
      return json8(400, { error: "Missing items array" });
    }
    const result = await writeJsonFile4(env2, PATH4, payload.items, payload.commitMessage || "Update House Music via dashboard");
    if (!result.ok) return json8(result.status, { error: result.error, detail: result.detail });
    return json8(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json8(405, { error: "Method not allowed" });
}
var checkAuth7, json8, toEvent8, readJsonFile4, writeJsonFile4, PATH4;
var init_house_music_live = __esm({
  "api/house-music-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth7, json: json8 } = require_store());
    ({ toEvent: toEvent8 } = require_http());
    ({ readJsonFile: readJsonFile4, writeJsonFile: writeJsonFile4 } = require_github_file());
    PATH4 = "data/house-music.json";
    __name(onRequest8, "onRequest");
  }
});

// api/house-rooms-live.js
async function onRequest9(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent9(request);
  if (!env2.GITHUB_TOKEN) {
    return json9(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile5(env2, PATH5);
    if (!result.ok) return json9(result.status, { error: result.error, detail: result.detail });
    return json9(200, { items: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json9(400, { error: "Bad request body" });
  }
  if (!checkAuth8(env2, payload)) {
    return json9(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.items)) {
      return json9(400, { error: "Missing items array" });
    }
    const result = await writeJsonFile5(env2, PATH5, payload.items, payload.commitMessage || "Update House rooms via dashboard");
    if (!result.ok) return json9(result.status, { error: result.error, detail: result.detail });
    return json9(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json9(405, { error: "Method not allowed" });
}
var checkAuth8, json9, toEvent9, readJsonFile5, writeJsonFile5, PATH5;
var init_house_rooms_live = __esm({
  "api/house-rooms-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth8, json: json9 } = require_store());
    ({ toEvent: toEvent9 } = require_http());
    ({ readJsonFile: readJsonFile5, writeJsonFile: writeJsonFile5 } = require_github_file());
    PATH5 = "data/house-rooms.json";
    __name(onRequest9, "onRequest");
  }
});

// api/inquiries.js
async function onRequest10(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent10(request);
  if (event.httpMethod === "POST") {
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      return json10(400, { error: "Bad request body" });
    }
    const { name, email, phone, notes, items } = payload;
    if (!name || !email || !phone || !Array.isArray(items) || !items.length) {
      return json10(400, { error: "Missing required inquiry fields" });
    }
    const id = newId2("inq");
    const record = { id, name, email, phone, notes: notes || "", items, createdAt: Date.now(), status: "new" };
    await putRecord2(env2, COLLECTION, id, record);
    return json10(200, { ok: true, id });
  }
  if (event.httpMethod === "GET") {
    const auth = event.queryStringParameters && event.queryStringParameters.passphraseHash;
    if (!checkAuth9(env2, { passphraseHash: auth })) {
      return json10(401, { error: "Not authorized." });
    }
    const records = await listRecords3(env2, COLLECTION);
    return json10(200, { records });
  }
  return json10(405, { error: "Method not allowed" });
}
var listRecords3, putRecord2, newId2, checkAuth9, json10, toEvent10, COLLECTION;
var init_inquiries = __esm({
  "api/inquiries.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ listRecords: listRecords3, putRecord: putRecord2, newId: newId2, checkAuth: checkAuth9, json: json10 } = require_store());
    ({ toEvent: toEvent10 } = require_http());
    COLLECTION = "inquiries";
    __name(onRequest10, "onRequest");
  }
});

// api/invoices.js
async function stripeGet3(path, key) {
  const res = await fetch(STRIPE_API3 + path, { headers: { Authorization: "Bearer " + key } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error && data.error.message || "Stripe request failed");
  return data;
}
async function onRequest11(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent11(request);
  if (event.httpMethod !== "GET") {
    return json11(405, { error: "Method not allowed" });
  }
  const params = event.queryStringParameters || {};
  if (!checkAuth10(env2, { passphraseHash: params.passphraseHash })) {
    return json11(401, { error: "Not authorized." });
  }
  const key = env2.STRIPE_SECRET_KEY;
  if (!key) return json11(500, { error: "Stripe is not configured on the server." });
  try {
    const data = await stripeGet3("/invoices?limit=100&expand[]=data.customer", key);
    const invoices = data.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      total: inv.total,
      currency: inv.currency,
      customerName: inv.customer && inv.customer.name,
      customerEmail: inv.customer && inv.customer.email,
      created: inv.created * 1e3,
      dueDate: inv.due_date ? inv.due_date * 1e3 : null,
      hostedUrl: inv.hosted_invoice_url,
      pdf: inv.invoice_pdf
    }));
    return json11(200, { invoices });
  } catch (err) {
    return json11(500, { error: err.message });
  }
}
var checkAuth10, json11, toEvent11, STRIPE_API3;
var init_invoices = __esm({
  "api/invoices.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth10, json: json11 } = require_store());
    ({ toEvent: toEvent11 } = require_http());
    STRIPE_API3 = "https://api.stripe.com/v1";
    __name(stripeGet3, "stripeGet");
    __name(onRequest11, "onRequest");
  }
});

// api/journal-live.js
async function onRequest12(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent12(request);
  if (!env2.GITHUB_TOKEN) {
    return json12(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile6(env2, PATH6);
    if (!result.ok) return json12(result.status, { error: result.error, detail: result.detail });
    return json12(200, { posts: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json12(400, { error: "Bad request body" });
  }
  if (!checkAuth11(env2, payload)) {
    return json12(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.posts)) {
      return json12(400, { error: "Missing posts array" });
    }
    const result = await writeJsonFile6(env2, PATH6, payload.posts, payload.commitMessage || "Update Journal entries via dashboard");
    if (!result.ok) return json12(result.status, { error: result.error, detail: result.detail });
    return json12(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json12(405, { error: "Method not allowed" });
}
var checkAuth11, json12, toEvent12, readJsonFile6, writeJsonFile6, PATH6;
var init_journal_live = __esm({
  "api/journal-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth11, json: json12 } = require_store());
    ({ toEvent: toEvent12 } = require_http());
    ({ readJsonFile: readJsonFile6, writeJsonFile: writeJsonFile6 } = require_github_file());
    PATH6 = "data/journal.json";
    __name(onRequest12, "onRequest");
  }
});

// api/network.js
function clean(s, max) {
  return String(s || "").trim().slice(0, max);
}
async function onRequest13(context2) {
  const { request, env: env2 } = context2;
  const url = new URL(request.url);
  if (request.method === "GET") {
    if (!checkAuth12(env2, { passphraseHash: url.searchParams.get("passphraseHash") })) {
      return json13(401, { error: "Not authorized." });
    }
    const records = await listRecords4(env2, COLLECTION2);
    return json13(200, { records });
  }
  if (request.method === "DELETE") {
    if (!checkAuth12(env2, { passphraseHash: url.searchParams.get("passphraseHash") })) {
      return json13(401, { error: "Not authorized." });
    }
    const id = url.searchParams.get("id");
    if (!id) return json13(400, { error: "Missing id" });
    await deleteRecord2(env2, COLLECTION2, id);
    return json13(200, { ok: true });
  }
  if (request.method === "POST") {
    let payload;
    try {
      payload = JSON.parse(await request.text());
    } catch (e) {
      return json13(400, { error: "Bad request body" });
    }
    if (clean(payload.company, 200)) {
      return json13(200, { ok: true });
    }
    const firstName = clean(payload.firstName, 80);
    const lastName = clean(payload.lastName, 80);
    const phone = clean(payload.phone, 40);
    const email = clean(payload.email, 200);
    if (!firstName || !lastName) {
      return json13(400, { error: "First and last name are required." });
    }
    if (!phone && !email) {
      return json13(400, { error: "A phone number or email is required." });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json13(400, { error: "That email address doesn\u2019t look right." });
    }
    const id = newId3("net");
    const now = Date.now();
    const record = {
      id,
      firstName,
      lastName,
      phone,
      email,
      city: clean(payload.city, 80),
      createdAt: now,
      updatedAt: now
    };
    await env2.PP_DATA.put(`${COLLECTION2}/${id}`, JSON.stringify(record));
    return json13(200, { ok: true, firstName });
  }
  return json13(405, { error: "Method not allowed" });
}
var listRecords4, deleteRecord2, newId3, checkAuth12, json13, COLLECTION2;
var init_network = __esm({
  "api/network.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ listRecords: listRecords4, deleteRecord: deleteRecord2, newId: newId3, checkAuth: checkAuth12, json: json13 } = require_store());
    COLLECTION2 = "network";
    __name(clean, "clean");
    __name(onRequest13, "onRequest");
  }
});

// api/_lib/email.js
var require_email = __commonJS({
  "api/_lib/email.js"(exports, module) {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var FROM = "Paris Pullen Atelier <orders@parispullen.com>";
    var SUBJECT = {
      processing: "Your Order is Processing \u2014 Paris Pullen Atelier",
      shipped: "Your Order Has Shipped \u2014 Paris Pullen Atelier",
      arrived: "Your Order Has Arrived \u2014 Paris Pullen Atelier",
      ready_for_pickup: "Your Order is Ready for Pickup \u2014 Paris Pullen Atelier"
    };
    function htmlFor(order, message) {
      return `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">Paris Pullen Atelier</p>
    <p style="font-size:16px;line-height:1.6;">${message}</p>
    <p style="font-size:14px;color:#555;margin-top:24px;">\u2014 Paris Pullen Atelier</p>
  </div>`;
    }
    __name(htmlFor, "htmlFor");
    async function sendOrderStatusEmail3(env2, order) {
      const apiKey = env2.RESEND_API_KEY;
      if (!apiKey) return { skipped: true, reason: "RESEND_API_KEY not set" };
      if (!order.clientEmail) return { skipped: true, reason: "no client email on order" };
      const subject = SUBJECT[order.status];
      if (!subject) return { skipped: true, reason: "unknown status" };
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: FROM,
          to: order.clientEmail,
          subject,
          html: htmlFor(order, order.message)
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { skipped: false, error: data };
      }
      return { skipped: false, id: data.id };
    }
    __name(sendOrderStatusEmail3, "sendOrderStatusEmail");
    module.exports = { sendOrderStatusEmail: sendOrderStatusEmail3 };
  }
});

// api/orders.js
function messageFor(order) {
  const name = (order.clientName || "").split(" ")[0] || "there";
  const item = order.item || "your order";
  switch (order.status) {
    case "processing":
      return `Hi ${name}, this is Paris Pullen Atelier. Your order (${item}) is confirmed and now in processing. We'll let you know as soon as it ships. Thank you for trusting us with this piece.`;
    case "shipped":
      return `Hi ${name}, great news \u2014 your order (${item}) has shipped${order.tracking ? ` (tracking: ${order.tracking})` : ""}. We'll follow up once it arrives.`;
    case "arrived":
      return `Hi ${name}, your order (${item}) has arrived at our atelier. We're doing a final quality check before it's ready for you.`;
    case "ready_for_pickup":
      return `Hi ${name}, your order (${item}) is ready for pickup. Reply here or call us to schedule a time \u2014 we look forward to seeing you.`;
    default:
      return "";
  }
}
async function onRequest14(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent13(request);
  if (event.httpMethod === "OPTIONS") return json14(200, {});
  if (event.httpMethod === "GET") {
    const q = event.queryStringParameters || {};
    if (!checkAuth13(env2, { passphraseHash: q.passphraseHash })) return json14(401, { error: "unauthorized" });
    const records = await listRecords5(env2, COLLECTION3);
    const orders = records.map((o) => ({ ...o, statusLabel: STATUS_LABEL[o.status], message: messageFor(o) }));
    orders.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return json14(200, { orders, statuses: STATUSES });
  }
  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return json14(400, { error: "invalid json" });
    }
    if (!checkAuth13(env2, body)) return json14(401, { error: "unauthorized" });
    const { invoiceId, clientName, clientEmail, item, status, tracking, sendEmail } = body;
    if (!invoiceId) return json14(400, { error: "invoiceId required" });
    if (status && !STATUSES.includes(status)) return json14(400, { error: "invalid status" });
    const existing = await getRecord2(env2, COLLECTION3, invoiceId) || {
      invoiceId,
      createdAt: Date.now()
    };
    const statusChanged = status && status !== existing.status;
    const updated = {
      ...existing,
      clientName: clientName ?? existing.clientName ?? "",
      clientEmail: clientEmail ?? existing.clientEmail ?? "",
      item: item ?? existing.item ?? "",
      status: status ?? existing.status ?? "processing",
      tracking: tracking ?? existing.tracking ?? "",
      updatedAt: Date.now()
    };
    await putRecord3(env2, COLLECTION3, invoiceId, updated);
    const result = { ...updated, statusLabel: STATUS_LABEL[updated.status], message: messageFor(updated) };
    let emailResult = null;
    if (sendEmail && statusChanged) {
      emailResult = await sendOrderStatusEmail(env2, result);
    }
    return json14(200, { order: result, email: emailResult });
  }
  if (event.httpMethod === "DELETE") {
    const q = event.queryStringParameters || {};
    if (!checkAuth13(env2, { passphraseHash: q.passphraseHash })) return json14(401, { error: "unauthorized" });
    if (!q.invoiceId) return json14(400, { error: "invoiceId required" });
    await deleteRecord3(env2, COLLECTION3, q.invoiceId);
    return json14(200, { ok: true });
  }
  return json14(405, { error: "method not allowed" });
}
var getRecord2, putRecord3, deleteRecord3, listRecords5, checkAuth13, json14, sendOrderStatusEmail, toEvent13, COLLECTION3, STATUSES, STATUS_LABEL;
var init_orders = __esm({
  "api/orders.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ getRecord: getRecord2, putRecord: putRecord3, deleteRecord: deleteRecord3, listRecords: listRecords5, checkAuth: checkAuth13, json: json14 } = require_store());
    ({ sendOrderStatusEmail } = require_email());
    ({ toEvent: toEvent13 } = require_http());
    COLLECTION3 = "orders";
    STATUSES = ["processing", "shipped", "arrived", "ready_for_pickup"];
    STATUS_LABEL = {
      processing: "Processing",
      shipped: "Shipped",
      arrived: "Arrived",
      ready_for_pickup: "Ready for Pickup"
    };
    __name(messageFor, "messageFor");
    __name(onRequest14, "onRequest");
  }
});

// api/proposals.js
async function onRequest15(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent14(request);
  const params = event.queryStringParameters || {};
  if (event.httpMethod === "GET") {
    if (params.id) {
      const record = await getRecord3(env2, COLLECTION4, params.id);
      if (!record) return json15(404, { error: "Not found" });
      return json15(200, record);
    }
    if (!checkAuth14(env2, { passphraseHash: params.passphraseHash })) {
      return json15(401, { error: "Not authorized." });
    }
    const records = await listRecords6(env2, COLLECTION4);
    return json15(200, { records });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json15(400, { error: "Bad request body" });
  }
  if (!checkAuth14(env2, payload)) {
    return json15(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    const { name, email, items, expiresInDays, notes } = payload;
    if (!name || !email || !Array.isArray(items) || !items.length) {
      return json15(400, { error: "Missing required proposal fields" });
    }
    const id = payload.id || newId4("prop");
    const existing = payload.id ? await getRecord3(env2, COLLECTION4, id) : null;
    const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const record = {
      id,
      name,
      email,
      items,
      total,
      notes: notes || "",
      status: existing && existing.status || "draft",
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now(),
      expiresAt: Date.now() + Number(expiresInDays || 14) * 864e5
    };
    await putRecord4(env2, COLLECTION4, id, record);
    return json15(200, { record });
  }
  if (event.httpMethod === "DELETE") {
    if (!params.id) return json15(400, { error: "Missing id" });
    await deleteRecord4(env2, COLLECTION4, params.id);
    return json15(200, { ok: true });
  }
  return json15(405, { error: "Method not allowed" });
}
var listRecords6, getRecord3, putRecord4, deleteRecord4, newId4, checkAuth14, json15, toEvent14, COLLECTION4;
var init_proposals = __esm({
  "api/proposals.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ listRecords: listRecords6, getRecord: getRecord3, putRecord: putRecord4, deleteRecord: deleteRecord4, newId: newId4, checkAuth: checkAuth14, json: json15 } = require_store());
    ({ toEvent: toEvent14 } = require_http());
    COLLECTION4 = "proposals";
    __name(onRequest15, "onRequest");
  }
});

// node-built-in-modules:crypto
import libDefault from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault;
  }
});

// api/stripe-webhook.js
function messageFor2(order) {
  const name = (order.clientName || "").split(" ")[0] || "there";
  const item = order.item || "your order";
  return `Hi ${name}, this is Paris Pullen Atelier. Your order (${item}) is confirmed and now in processing. We'll let you know as soon as it ships. Thank you for trusting us with this piece.`;
}
function verifySignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
async function onRequest16(context2) {
  const { request, env: env2 } = context2;
  if (request.method !== "POST") return new Response("method not allowed", { status: 405 });
  const secret = env2.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();
  if (secret) {
    const sigHeader = request.headers.get("stripe-signature");
    if (!verifySignature(rawBody, sigHeader, secret)) {
      return new Response("invalid signature", { status: 400 });
    }
  }
  let evt;
  try {
    evt = JSON.parse(rawBody);
  } catch (e) {
    return new Response("invalid json", { status: 400 });
  }
  if (evt.type === "invoice.paid") {
    const invoice = evt.data.object;
    const invoiceId = invoice.id;
    const clientEmail = invoice.customer_email || invoice.customer_address && invoice.customer_address.email || "";
    const clientName = invoice.customer_name || "";
    const item = invoice.lines && invoice.lines.data && invoice.lines.data.map((l) => l.description).filter(Boolean).join(", ") || "your order";
    const existing = await getRecord4(env2, COLLECTION5, invoiceId) || { invoiceId, createdAt: Date.now() };
    if (!existing.status) {
      const updated = {
        ...existing,
        clientName: existing.clientName || clientName,
        clientEmail: existing.clientEmail || clientEmail,
        item: existing.item || item,
        status: "processing",
        updatedAt: Date.now()
      };
      await putRecord5(env2, COLLECTION5, invoiceId, updated);
      const result = { ...updated, statusLabel: STATUS_LABEL2.processing, message: messageFor2(updated) };
      await sendOrderStatusEmail2(env2, result).catch(() => {
      });
    }
  }
  return json16(200, { received: true });
}
var crypto, getRecord4, putRecord5, json16, sendOrderStatusEmail2, COLLECTION5, STATUS_LABEL2;
var init_stripe_webhook = __esm({
  "api/stripe-webhook.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    crypto = require_crypto();
    ({ getRecord: getRecord4, putRecord: putRecord5, json: json16 } = require_store());
    ({ sendOrderStatusEmail: sendOrderStatusEmail2 } = require_email());
    COLLECTION5 = "orders";
    STATUS_LABEL2 = {
      processing: "Processing",
      shipped: "Shipped",
      arrived: "Arrived",
      ready_for_pickup: "Ready for Pickup"
    };
    __name(messageFor2, "messageFor");
    __name(verifySignature, "verifySignature");
    __name(onRequest16, "onRequest");
  }
});

// api/wardrobe-live.js
async function onRequest17(context2) {
  const { request, env: env2 } = context2;
  const event = await toEvent15(request);
  if (!env2.GITHUB_TOKEN) {
    return json17(500, { error: "GITHUB_TOKEN is not configured on this Pages project." });
  }
  if (event.httpMethod === "GET") {
    const result = await readJsonFile7(env2, PATH7);
    if (!result.ok) return json17(result.status, { error: result.error, detail: result.detail });
    return json17(200, { items: result.data, sha: result.sha });
  }
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json17(400, { error: "Bad request body" });
  }
  if (!checkAuth15(env2, payload)) {
    return json17(401, { error: "Not authorized." });
  }
  if (event.httpMethod === "POST") {
    if (!Array.isArray(payload.items)) {
      return json17(400, { error: "Missing items array" });
    }
    const result = await writeJsonFile7(env2, PATH7, payload.items, payload.commitMessage || "Update Wardrobe via dashboard");
    if (!result.ok) return json17(result.status, { error: result.error, detail: result.detail });
    return json17(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }
  return json17(405, { error: "Method not allowed" });
}
var checkAuth15, json17, toEvent15, readJsonFile7, writeJsonFile7, PATH7;
var init_wardrobe_live = __esm({
  "api/wardrobe-live.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ({ checkAuth: checkAuth15, json: json17 } = require_store());
    ({ toEvent: toEvent15 } = require_http());
    ({ readJsonFile: readJsonFile7, writeJsonFile: writeJsonFile7 } = require_github_file());
    PATH7 = "data/wardrobe.json";
    __name(onRequest17, "onRequest");
  }
});

// _middleware.js
async function onRequest18(context2) {
  const { request, env: env2, next } = context2;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return next();
  const singleDir = SINGLE_PAGE_DIR[url.hostname];
  if (singleDir) {
    if (url.pathname !== "/") return next();
    const assetUrl2 = new URL(request.url);
    assetUrl2.pathname = "/" + singleDir + "/";
    return env2.ASSETS.fetch(new Request(assetUrl2, request));
  }
  const dir3 = SUBDOMAIN_DIR[url.hostname];
  if (!dir3) return next();
  const assetUrl = new URL(request.url);
  assetUrl.pathname = "/" + dir3 + url.pathname;
  return env2.ASSETS.fetch(new Request(assetUrl, request));
}
var SUBDOMAIN_DIR, SINGLE_PAGE_DIR;
var init_middleware = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_5938275070350543();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    SUBDOMAIN_DIR = {
      "dante.parispullen.com": "dantesimpson",
      "burnsbrims.parispullen.com": "burnsbrims",
      "harvey.parispullen.com": "harveycummings",
      "ynnt.parispullen.com": "yournewnailtech",
      "goodwill.parispullen.com": "goodwillgrooming",
      "el.parispullen.com": "ellambert",
      "threepiece.parispullen.com": "threepieceentertainment"
    };
    SINGLE_PAGE_DIR = {
      "links.parispullen.com": "links"
    };
    __name(onRequest18, "onRequest");
  }
});

// ../.wrangler/tmp/pages-9dkKQy/functionsRoutes-0.5938275070350543.mjs
var routes;
var init_functionsRoutes_0_5938275070350543 = __esm({
  "../.wrangler/tmp/pages-9dkKQy/functionsRoutes-0.5938275070350543.mjs"() {
    init_casefiles_live();
    init_charlotte_live();
    init_clients();
    init_content();
    init_create_invoice();
    init_deploy();
    init_house_channels_live();
    init_house_music_live();
    init_house_rooms_live();
    init_inquiries();
    init_invoices();
    init_journal_live();
    init_network();
    init_orders();
    init_proposals();
    init_stripe_webhook();
    init_wardrobe_live();
    init_middleware();
    routes = [
      {
        routePath: "/api/casefiles-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/charlotte-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/clients",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/content",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/create-invoice",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/api/deploy",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/house-channels-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      },
      {
        routePath: "/api/house-music-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest8]
      },
      {
        routePath: "/api/house-rooms-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest9]
      },
      {
        routePath: "/api/inquiries",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest10]
      },
      {
        routePath: "/api/invoices",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest11]
      },
      {
        routePath: "/api/journal-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest12]
      },
      {
        routePath: "/api/network",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest13]
      },
      {
        routePath: "/api/orders",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest14]
      },
      {
        routePath: "/api/proposals",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest15]
      },
      {
        routePath: "/api/stripe-webhook",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest16]
      },
      {
        routePath: "/api/wardrobe-live",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest17]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest18],
        modules: []
      }
    ];
  }
});

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_5938275070350543();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_5938275070350543();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../Users/mac/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
