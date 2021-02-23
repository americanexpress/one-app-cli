(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["service-worker-client"],{

/***/ "./node_modules/@americanexpress/one-service-worker/index.min.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@americanexpress/one-service-worker/index.min.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

!function (e, n) {
   true ? n(exports) : undefined;
}(this, function (e) {
  "use strict";

  function t(e) {
    return (t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
      return typeof e;
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    })(e);
  }

  var n = {
    development: !1,
    events: !0,
    nonStandard: !0,
    navigationPreload: !0
  };

  function r() {
    return n;
  }

  function o() {
    return n.events;
  }

  function i() {
    return n.navigationPreload;
  }

  function a() {
    return "ServiceWorkerGlobalScope" in self;
  }

  function u() {
    return "serviceWorker" in navigator;
  }

  function c() {
    return "Notification" in self;
  }

  function s() {
    return "PushManager" in self;
  }

  function f() {
    return "SyncManager" in self;
  }

  function l() {
    return "caches" in self;
  }

  function v() {
    return !1 === navigator.onLine;
  }

  var d,
      h = ((d = Error) && (p.__proto__ = d), (p.prototype = Object.create(d && d.prototype)).constructor = p);

  function p(e, n) {
    d.call(this, e), n instanceof d && (this.message = [this.message, n.message].filter(function (e) {
      return !!e;
    }).join("::"), this.stack = n.stack);
  }

  function m(e, n) {
    return void 0 === e && (e = "Service Worker"), new h("[" + e + " failed]", n);
  }

  var g = function (e, n) {
    return void 0 === e && (e = "Service Worker"), new h("[" + e + " not supported]", n);
  };

  function y(e) {
    void 0 === e && (e = {});
    var n = e.key;
    void 0 === n && (n = "");
    var t = e.type;
    return void 0 === t && (t = "string"), new h("Expected value of " + n + " to be an Array of " + t + "s\n");
  }

  function b(e) {
    void 0 === e && (e = {});
    var n = e.key;
    return void 0 === n && (n = ""), new h("Expected " + n + " value to match enumerable values\n\t[" + (S[n] || []).join(", ") + "]\n");
  }

  function w(e) {
    void 0 === e && (e = {});
    var n = e.key;
    void 0 === n && (n = "");
    var t = e.keys;
    return void 0 === t && (t = []), new h("Unknown key " + n + " given, expected one of:\n\t{ " + t.join(", ") + " }\n");
  }

  var N = {
    url: "string",
    path: "string",
    partition: "string",
    strategy: "string",
    shell: "string",
    scope: "string",
    cache: "string",
    cacheName: "string",
    updateViaCache: "string",
    offline: "object",
    precache: "object",
    maxAge: "number",
    maxResources: "number",
    maxContentSize: "number",
    timeout: "number",
    strict: "boolean"
  },
      S = {
    updateViaCache: ["all", "imports", "none"]
  },
      k = function (e) {
    void 0 === e && (e = {});
    var n = e.key;
    void 0 === n && (n = "");
    var t = e.type;
    return new h("Expected " + n + " value to be a " + (t || N[n]) + "\n");
  };

  function P(e) {
    void 0 === e && (e = {});
    var n = e.ignoreSearch,
        t = e.ignoreMethod,
        r = e.ignoreVary,
        i = e.cacheName,
        o = {};
    if ("boolean" == typeof n && (o.ignoreSearch = n), "boolean" == typeof t && (o.ignoreMethod = t), "boolean" == typeof r && (o.ignoreVary = r), "string" == typeof i && (o.cacheName = i), 0 < Object.keys(o).length) return o;
  }

  function j(e) {
    var t = e || {};
    return {
      get: function (e) {
        return e ? t[e] : t;
      },
      set: function (e, n) {
        return t[e] = n, t;
      }
    };
  }

  function E(e, i) {
    void 0 === e && (e = []), void 0 === i && (i = function () {});
    var n,
        o = (void 0 === (n = [].concat(e)) && (n = []), n.forEach(function (e) {
      if ("function" != typeof e) throw k({
        key: "middleware",
        type: "function"
      });
    }), n);
    return function (e) {
      for (var n = [].concat(o), t = j(i(e)), r = !1; 0 < n.length;) {
        if (r = n.shift()(e, t)) break;
      }

      return r;
    };
  }

  function q(n, t) {
    return void 0 === n && (n = []), function (e) {
      return void 0 === e && (e = []), E([].concat(n, e), t);
    };
  }

  var x = new Map(),
      O = new Map();

  function M(e, n) {
    var t, r, i;
    o() && (t = x.get(e) || new Set(), (r = O.get(e) || new Set()).add(n), 2 < r.size && [].concat(r).reverse().filter(function (e, n) {
      return 2 < n;
    }).forEach(function (e) {
      return r.delete(e);
    }), O.set(e, r), i = j(), t.forEach(function (e) {
      return e(n, i);
    }));
  }

  function R(n, e) {
    var t;
    o() && (Array.isArray(e) ? e.forEach(function (e) {
      return R(n, e);
    }) : ((t = x.get(n) || new Set()).add(e), O.has(n) && O.get(n).forEach(e), x.set(n, t)));
  }

  function W(e, n) {
    var t;
    o() && x.has(e) && ((t = x.get(e)).delete(n), 0 === t.size ? (O.has(e) && O.delete(e), x.delete(e)) : x.set(e, t));
  }

  function C(e, t) {
    return void 0 === e && (e = []), void 0 === t && (t = self), o() && e.forEach(function (e) {
      var n;
      e in t && null === t[e] && (n = e.replace("on", ""), t.addEventListener(n, function (e) {
        return M(n, e);
      }));
    });
  }

  function A(e) {
    return e ? new Uint8Array((n = e.replace(/"/g, ""), t = ("" + n + "=".repeat((4 - n.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/"), self.atob(t).split("").map(function (e) {
      return e.charCodeAt(0);
    }))) : new Uint8Array(0);
    var n, t;
  }

  function U(e) {
    return a() ? Promise.resolve(self.registration) : u() ? navigator.serviceWorker.getRegistration(e) : Promise.reject(g());
  }

  function _() {
    return a() ? Promise.resolve([self.registration]) : u() ? navigator.serviceWorker.getRegistrations() : Promise.reject(g());
  }

  function D() {
    return U().then(function (e) {
      var n = e.installing,
          t = e.waiting,
          r = e.active;
      return n || t || r;
    });
  }

  function T() {
    return U().then(function (e) {
      return s() && e ? e.pushManager.getSubscription() : Promise.resolve();
    });
  }

  var V = "__sw",
      B = "/",
      I = "one-cache";

  function z(e) {
    return void 0 === e && (e = I), [V, e].join(B);
  }

  var H = {
    cacheName: z(I)
  };

  function K(e) {
    if (e) return e instanceof Request ? e : new Request(e);
  }

  function F(e) {
    return void 0 === e && (e = H.cacheName), caches.open(e);
  }

  function L(n, e) {
    if (!e) return caches.match(K(n));
    var t = P(e);
    return F(t.cacheName).then(function (e) {
      return e.match(K(n), t);
    });
  }

  function J(n, e) {
    return void 0 === n && (n = []), void 0 === e && (e = H), F(P(e).cacheName).then(function (e) {
      return e.addAll(n.map(K));
    });
  }

  function G(n, t, e) {
    return void 0 === e && (e = H), F(P(e).cacheName).then(function (e) {
      return e.put(K(n), t);
    });
  }

  function Y(n, e) {
    void 0 === e && (e = H);
    var t = P(e);
    return F(e.cacheName).then(function (e) {
      return e.delete(K(n), t);
    });
  }

  function Q(e) {
    return (e ? Promise.resolve([].concat(e)) : caches.keys()).then(function (e) {
      return Promise.all(e.map(function (t) {
        return F(t).then(function (n) {
          return n.keys().then(function (e) {
            return [e, n, t];
          });
        });
      }));
    });
  }

  function X(o, a) {
    return void 0 === o && (o = function () {
      return !0;
    }), void 0 === a && (a = function () {
      return !0;
    }), Q().then(function (e) {
      var i = [];
      return e.forEach(function (e) {
        var n = e[0],
            t = e[1],
            r = e[2];
        a(r) ? i.push(caches.delete(r)) : n.forEach(function (e) {
          o(e, r) && i.push(t.delete(e));
        });
      }), Promise.all(i);
    });
  }

  var Z = "__meta";

  function $() {
    return z(Z);
  }

  function ee(e) {
    return void 0 === e && (e = I), "/" + $() + "/" + e;
  }

  function ne(e) {
    return new Request(ee(e));
  }

  function te(e) {
    void 0 === e && (e = {});
    var n = e.url,
        t = e.data;
    void 0 === t && (t = {});
    var r = new Headers({});
    return r.append("content-type", "application/json"), new Response(JSON.stringify(t), {
      url: n,
      headers: r,
      status: 200
    });
  }

  function re(e) {
    return L(ne(e), {
      cacheName: $()
    }).then(function (e) {
      return e ? e.json() : Promise.resolve({});
    });
  }

  function ie(e) {
    void 0 === e && (e = {});
    var n = e.url;
    return re(e.cacheName).then(function (e) {
      return n ? e[new Request(n).url] || {} : e;
    });
  }

  function oe(e) {
    void 0 === e && (e = {});
    var a = e.url,
        u = e.cacheName,
        c = e.metadata;
    return re(u).then(function (e) {
      var n,
          t,
          r = ne(u),
          i = null,
          o = null;
      if (a) n = new Request(a), o = n.url, i = Object.assign({}, e, ((t = {})[o] = c, t));else {
        if (!c) return Promise.resolve(o);
        i = c;
      }
      return G(r.clone(), te({
        url: r.url,
        data: i
      }), {
        cacheName: $()
      }).then(function () {
        return o ? i[o] : i;
      });
    });
  }

  function ae(e) {
    void 0 === e && (e = {});
    var i = e.url,
        o = e.cacheName;
    return re(o).then(function (e) {
      var n = Object.assign({}, e),
          t = ne(o),
          r = !1;
      return i ? (delete n[new Request(i).url], r = !0, 0 === Object.keys(n).length ? Y(t, {
        cacheName: $()
      }) : oe({
        metadata: n,
        cacheName: o
      }).then(function () {
        return r;
      })) : o ? Y(t, {
        cacheName: $()
      }) : r;
    });
  }

  function ue() {}

  function ce(e) {
    void 0 === e && (e = {});
    var n = e.route;
    return void 0 === n && (n = "/manifest.webmanifest"), new Request(n);
  }

  var se = {
    name: "one_service_worker_app",
    short_name: "app",
    start_url: "/index.html"
  };

  function fe() {
    return l() && a();
  }

  var le = z("router");
  var ve = "expires";
  var de = q(),
      he = q(),
      pe = q(),
      me = q(),
      ge = q(),
      ye = q();
  a() ? C(["onunhandledrejection", "onerror", "oninstall", "onactivate", "onmessage", "onfetch", "onsync", "onpush", "onnotificationclick", "onnotificationclose"]) : u() && (R("registration", function (e) {
    C(["onupdatefound"], e), C(["onstatechange"], e.installing || e.waiting || e.active);
  }), R("statechange", function (e) {
    return M(e.target.state, e);
  }), navigator.serviceWorker.ready.then(function (e) {
    return C(["oncontrollerchange", "onmessage", "onerror"], navigator.serviceWorker), e;
  })), e.ENUMS = S, e.OneServiceWorkerError = h, e.TYPES = N, e.add = function (n, e) {
    return void 0 === e && (e = H), F(P(e).cacheName).then(function (e) {
      return e.add(K(n));
    });
  }, e.addAll = J, e.appShell = function (e) {
    void 0 === e && (e = {});
    var n = e.route;
    void 0 === n && (n = "/index.html");
    var r = e.cacheName;

    if (void 0 === r && (r = "offline"), a()) {
      var i = K(n);
      return function (t) {
        if (v()) {
          if ("navigate" === t.request.mode) return t.respondWith(L(i.clone(), {
            cacheName: r
          })), !0;
        } else t.request.url === i.url && t.waitUntil(fetch(i.clone()).then(function (e) {
          var n;
          200 <= (n = e).status && n.status < 300 && t.waitUntil(G(i.clone(), e.clone(), {
            cacheName: r
          }));
        }));

        return !1;
      };
    }

    return ue;
  }, e.cacheBusting = function (n, t) {
    return fe() ? function (e) {
      e.waitUntil(X(n, t));
    } : ue;
  }, e.cacheDelimiter = B, e.cachePrefix = V, e.cacheRouter = function (e) {
    void 0 === e && (e = {});
    var n = e.cacheName,
        t = e.match,
        u = e.fetchOptions;
    if (!fe()) return ue;

    var r = function () {
      return !1;
    };

    "function" == typeof t ? r = t : t instanceof RegExp && (r = function (e) {
      var n = e.request.url;
      return t.test(n);
    });
    var i,
        c = (i = n) ? z(i) : le;
    return function (a, e) {
      if (r(a)) return e.set("cacheName", c), e.set("request", a.request.clone()), a.respondWith(L(a.request.clone()).then(function (e) {
        return e || (n = {
          waitUntil: function (e) {
            return a.waitUntil(e);
          },
          request: a.request,
          cacheName: c,
          fetchOptions: u
        }, t = n.request, r = n.cacheName, i = n.waitUntil, o = n.fetchOptions, fetch(t.clone(), o).then(function (e) {
          return i(G(t.clone(), e.clone(), {
            cacheName: r
          })), e;
        }));
        var n, t, r, i, o;
      })), !0;
    };
  }, e.cacheStrategy = function () {
    return fe() ? function (n) {
      return n.waitUntil(L(n.request.clone()).then(function (e) {
        return e && n.respondWith(e);
      })), !0;
    } : ue;
  }, e.calls = O, e.clear = X, e.clientsClaim = function () {
    return function (e) {
      a() && e.waitUntil(self.clients.claim());
    };
  }, e.configure = function (e) {
    return void 0 === e && (e = Object.create(null)), n = Object.assign({}, n, e);
  }, e.createCacheEntryName = function (e) {
    return console.warn("[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.", "createCacheEntryName"), ee(e);
  }, e.createCacheName = z, e.createMetaCacheEntryName = ee, e.createMetaCacheName = $, e.createMetaRequest = ne, e.createMetaResponse = te, e.createMiddleware = E, e.createMiddlewareContext = j, e.createMiddlewareFactory = q, e.defaultCacheName = I, e.defaultCacheOptions = H, e.deleteMetaData = ae, e.emit = M, e.emitter = C, e.entries = Q, e.enumerableException = b, e.errorFactory = function (e, n) {
    return void 0 === n && (n = function (e) {
      return e;
    }), function () {
      return n(e());
    };
  }, e.escapeHatch = function () {
    return _().then(function (e) {
      return e && 0 < e.length ? Promise.all(e.map(function (e) {
        return e.unregister().then(function () {
          return M("unregister", e), e;
        });
      })) : Promise.resolve([]);
    });
  }, e.escapeHatchRoute = function (e) {
    void 0 === e && (e = {});
    var n = e.route;
    void 0 === n && (n = "/__sw/__escape");
    var t = e.response;
    void 0 === t && (t = new Response(null, {
      status: 202,
      statusText: "OK"
    }));
    var r = e.clearCache;
    void 0 === r && (r = !0);
    var i = K(n).url;
    return function (e) {
      if (e.request.url === i) return e.respondWith(t.clone()), r && e.waitUntil(X()), e.waitUntil(self.registration.unregister()), !0;
    };
  }, e.eventListeners = x, e.expectedArrayOfType = y, e.expectedType = k, e.expiration = function (e) {
    void 0 === e && (e = {});
    var u = e.maxAge;
    return void 0 === u && (u = 24192e5), l() && a() ? function (e, n) {
      var r,
          i,
          o,
          a = n.get().request;
      a && a instanceof Request && (r = e.request.url, i = new Date().getTime(), o = i - u, e.waitUntil(ie({
        url: r
      }).then(function (e) {
        var n,
            t = e[ve] || 0;
        return ve in e && t < o ? ae({
          url: r
        }).then(function () {
          return Y(a.clone());
        }) : oe({
          url: r,
          metadata: Object.assign({}, e, ((n = {})[ve] = i + u, n))
        });
      })));
    } : function () {};
  }, e.failedToInstall = function (e, n) {
    return void 0 === e && (e = "Service Worker"), new h("[" + e + " failed to install]", n);
  }, e.failure = m, e.getCacheOptions = P, e.getConfig = r, e.getMetaData = ie, e.getMetaStore = re, e.getNotifications = function () {
    return U().then(function (e) {
      return c() && e ? e.getNotifications() : Promise.resolve([]);
    });
  }, e.getRegistration = U, e.getRegistrations = _, e.getSubscription = T, e.getTags = function () {
    return U().then(function (e) {
      return f() && e ? e.sync.getTags() : Promise.resolve([]);
    });
  }, e.getWorker = D, e.has = function (e) {
    return void 0 === e && (e = H.cacheName), caches.has(e);
  }, e.isBackgroundSyncSupported = f, e.isCacheStorageSupported = l, e.isDevelopment = function () {
    return n.development;
  }, e.isEventsEnabled = o, e.isIndexedDBSupported = function () {
    return "indexedDB" in self;
  }, e.isNavigationPreloadEnabled = i, e.isNonStandardEnabled = function () {
    return n.nonStandard;
  }, e.isNotificationSupported = c, e.isOffline = v, e.isPermissionsSupported = function () {
    return "permissions" in navigator;
  }, e.isPushSupported = s, e.isServiceWorker = a, e.isServiceWorkerSupported = u, e.keys = function (n, e) {
    void 0 === e && (e = H);
    var t = P(e);
    return F(t.cacheName).then(function (e) {
      return e.keys(K(n), t);
    });
  }, e.manifest = function (i, e) {
    if (!a()) return function () {};
    var o = ce({
      route: e
    });
    return function (e) {
      return t = (n = {
        event: e,
        request: o
      }).event, r = n.request, t.request.url === r.url && (e.respondWith(function (e) {
        void 0 === e && (e = {});
        var n = e.event;
        void 0 === n && (n = {
          request: ce()
        });
        var t = e.manifest;
        return void 0 === t && (t = se), new Response(JSON.stringify(t), {
          url: n.request.url,
          status: 200,
          headers: new Headers({
            "content-type": "application/json"
          })
        });
      }({
        event: e,
        manifest: i
      })), !0);
      var n, t, r;
    };
  }, e.match = L, e.matchAll = function (n, e) {
    void 0 === e && (e = H);
    var t = P(e);
    return Array.isArray(n) ? Promise.all(n.map(function (e) {
      return L(e, t);
    })) : F(t.cacheName).then(function (e) {
      return e.matchAll(K(n), t);
    });
  }, e.messageContext = function (e) {
    void 0 === e && (e = {});
    var o = e.getID;
    void 0 === o && (o = function () {
      return "id";
    });
    var a = e.transformData;
    return void 0 === a && (a = function (e) {
      return e;
    }), function (e, n) {
      var t, r, i;
      e.data && (r = (t = "json" in e.data ? e.data.json() : e.data)[o()], i = function (e, n) {
        var t = {};

        for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && -1 === n.indexOf(r) && (t[r] = e[r]);

        return t;
      }(t, [String(o())]), r && (n.set("id", r), n.set("data", a(i, e, n))));
    };
  }, e.messenger = function (o) {
    return void 0 === o && (o = {}), function (e, n) {
      var t = n.get(),
          r = t.id,
          i = t.data;
      r in o && e.waitUntil(o[r](i, e, n));
    };
  }, e.metaDataCacheName = Z, e.navigationPreloadActivation = function () {
    return a() ? function (e) {
      i() && e.waitUntil(U().then(function (e) {
        return e.navigationPreload.enable();
      }));
    } : ue;
  }, e.navigationPreloadResponse = function (t) {
    return void 0 === t && (t = function (e) {
      return fetch(e.request.clone());
    }), a() ? function (n) {
      if (i() && !1 === v() && "navigate" === n.request.mode) return n.respondWith(n.preloadResponse.then(function (e) {
        return e || t(n);
      })), !0;
    } : ue;
  }, e.normalizeRequest = K, e.notEnabled = function (e, n) {
    return void 0 === e && (e = "Events"), new h("[" + e + " not enabled]", n);
  }, e.notSupported = g, e.off = W, e.on = R, e.onActivate = he, e.onFetch = ye, e.onInstall = de, e.onMessage = pe, e.onPush = me, e.onSync = ge, e.once = function (r, i) {
    o() && R(r, function e(n, t) {
      W(r, e), i(n, t);
    });
  }, e.open = F, e.postMessage = function (n, t) {
    return a() && (t instanceof Client || t instanceof WindowClient) ? Promise.resolve(t.postMessage(n)) : D().then(function (e) {
      return e ? Promise.resolve(e.postMessage(n, t)) : Promise.resolve();
    });
  }, e.precache = function (n, e) {
    void 0 === n && (n = []), void 0 === e && (e = {});
    var t = e.cacheName;
    return fe() && 0 !== n.length ? function (e) {
      e.waitUntil(J(n, {
        cacheName: z(t)
      }));
    } : ue;
  }, e.put = G, e.register = function (e, n) {
    void 0 === n && (n = {});
    var t = n.scope;
    void 0 === t && (t = "/");
    var r = n.updateViaCache;
    return void 0 === r && (r = "none"), a() ? Promise.resolve(self.registration) : u() ? navigator.serviceWorker.register(e, {
      scope: t,
      updateViaCache: r
    }).then(function (e) {
      return M("register", e), e;
    }).catch(function (e) {
      return Promise.reject(m("Registration", e));
    }) : Promise.reject(g());
  }, e.registerTag = function (n) {
    return U().then(function (e) {
      return f() && e ? e.sync.register(n).then(function (e) {
        return M("registertag", e), e;
      }) : Promise.resolve();
    });
  }, e.remove = Y, e.removeAll = function (e, n) {
    void 0 === e && (e = []), void 0 === n && (n = H);
    var t = P(n);
    return F(t.cacheName).then(function (n) {
      return Promise.all(e.map(function (e) {
        return n.delete(K(e), t);
      }));
    });
  }, e.setMetaData = oe, e.showNotification = function (n, t) {
    return U().then(function (e) {
      return c() && e ? e.showNotification(n, t) : Promise.resolve();
    });
  }, e.skipWaiting = function () {
    return function (e) {
      a() && e.waitUntil(self.skipWaiting());
    };
  }, e.subscribe = function (e) {
    void 0 === e && (e = {});
    var r = e.userVisibleOnly;
    void 0 === r && (r = !0);
    var i = e.applicationServerKey;
    return void 0 === i && (i = ""), U().then(function (e) {
      if (s() && e) {
        var n = i;
        n instanceof Uint8Array == !1 && (n = A(n));
        var t = {
          userVisibleOnly: r,
          applicationServerKey: n
        };
        return e.pushManager.subscribe(t).then(function (e) {
          return M("subscribe", e), e;
        }).catch(function (e) {
          return Promise.reject(m("Push Subscribe", e));
        });
      }

      return Promise.resolve();
    });
  }, e.unknownEventName = function (e) {
    void 0 === e && (e = {});
    var n = e.eventName;
    void 0 === n && (n = "");
    var t = e.enabledEvents;
    return void 0 === t && (t = []), new h(['event name "' + n + '" is not a supported event, please select one of the following:\n', "[" + t.join(",\t") + "]"].join("\n"));
  }, e.unknownKey = w, e.unregister = function (e) {
    return U(e).then(function (e) {
      return e ? e.unregister().then(function () {
        return M("unregister", e), e;
      }) : Promise.resolve();
    });
  }, e.unsubscribe = function () {
    return U().then(function (e) {
      return s() && e ? T().then(function (e) {
        return e ? e.unsubscribe().then(function (e) {
          return M("unsubscribe", e), e;
        }).catch(function (e) {
          return Promise.reject(m("Push Unsubscribe", e));
        }) : Promise.resolve(e);
      }) : Promise.resolve(!1);
    });
  }, e.update = function (e) {
    return U(e).then(function (e) {
      return e ? e.update() : Promise.resolve();
    });
  }, e.urlBase64ToUint8Array = A, e.validateInput = function (n, e) {
    void 0 === e && (e = !0);
    var i = [],
        o = Object.keys(n);
    return o.map(function (e) {
      return [e, n[e], t(n[e])];
    }).forEach(function (e) {
      var n = e[0],
          t = e[1],
          r = e[2];
      n in N == !1 ? i.push(w({
        key: n,
        keys: o
      })) : r !== N[n] && i.push(k({
        key: n
      })), ["offline", "precache"].includes(n) && !1 === Array.isArray(t) && i.push(y({
        key: n,
        type: "string"
      })), n in S && !1 === S[n].includes(t) && i.push(b({
        key: n
      }));
    }), e && i.forEach(function (e) {
      console.warn(e);
    }), i;
  }, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});

/***/ }),

/***/ "./src/client/service-worker/client.js":
/*!*********************************************!*\
  !*** ./src/client/service-worker/client.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return serviceWorkerClient; });
/* harmony import */ var _americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @americanexpress/one-service-worker */ "./node_modules/@americanexpress/one-service-worker/index.min.js");
/* harmony import */ var _americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/client/service-worker/constants.js");
/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */


function serviceWorkerClient({
  scope,
  scriptUrl,
  webManifestUrl,
  offlineUrl,
  onError
}) {
  // We listen for any messages that come in from the service worker
  Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["on"])('message', [Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["messageContext"])(), Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["messenger"])({
    [_constants__WEBPACK_IMPORTED_MODULE_1__["ERROR_MESSAGE_ID_KEY"]]: onError
  })]);
  Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["on"])('register', () => {
    // to preload the the offline shell and manifest into the cache,
    // we only need to fetch them if they are missing since the
    // service worker will cache them
    Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["match"])(offlineUrl).then(response => {
      if (!response) fetch(offlineUrl);
    });
    Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["match"])(webManifestUrl).then(response => {
      if (!response) fetch(webManifestUrl);
    });
  }); // as the first basis, we would register the service worker before performing anything else.

  return Object(_americanexpress_one_service_worker__WEBPACK_IMPORTED_MODULE_0__["register"])(scriptUrl, {
    scope
  });
}

/***/ }),

/***/ "./src/client/service-worker/constants.js":
/*!************************************************!*\
  !*** ./src/client/service-worker/constants.js ***!
  \************************************************/
/*! exports provided: ERROR_MESSAGE_ID_KEY, OFFLINE_CACHE_NAME */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ERROR_MESSAGE_ID_KEY", function() { return ERROR_MESSAGE_ID_KEY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OFFLINE_CACHE_NAME", function() { return OFFLINE_CACHE_NAME; });
/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
// messaging keys
const ERROR_MESSAGE_ID_KEY = 'error'; // cache names

const OFFLINE_CACHE_NAME = 'offline';

/***/ })

}]);
//# sourceMappingURL=service-worker-client.js.map