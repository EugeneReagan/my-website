(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  ["pages-index-index~pages-order-order~pages-start-start"], {
    "0812": function(t, e, n) {
      "use strict";
      var i = n("de34"),
          a = n.n(i);
      a.a;
    },
    // Other dependencies...

    // Component Configuration
    "2056": function(t, e, n) {
      "use strict";
      n("7a82");
      var i = n("4ea4").default;
      Object.defineProperty(e, "__esModule", {
        value: !0
      }), e.default = void 0;

      var debounce = (func, delay) => {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => func.apply(this, args), delay);
        };
      };

      var r = {
        name: "u-image",
        mixins: [uni.$u.mpMixin, uni.$u.mixin],
        data: function() {
          return {
            isError: false,
            loading: true,
            opacity: 1,
            durationTime: this.duration,
            backgroundStyle: {},
            show: false,
            isNavigating: false, // Prevent rapid clicks
          };
        },
        watch: {
          src: {
            immediate: true,
            handler: function(t) {
              if (t) {
                this.isError = false;
                this.loading = true;
              } else {
                this.isError = true;
              }
            },
          },
        },
        computed: {
          wrapStyle: function() {
            var t = {};
            return {
              ...t,
              width: this.$u.addUnit(this.width),
              height: this.$u.addUnit(this.height),
              borderRadius: this.shape === "circle" ? "10000px" : uni.$u.addUnit(this.radius),
              overflow: this.radius > 0 ? "hidden" : "visible",
              ...uni.$u.addStyle(this.customStyle),
            };
          },
        },
        mounted: function() {
          this.show = true;
        },
        methods: {
          onClick: debounce(function() {
            if (this.isNavigating) return;
            this.isNavigating = true;

            // Emit the click event and start navigation
            this.$emit("click");

            setTimeout(() => {
              this.isNavigating = false; // Reset navigation flag
            }, 500); // Delay to prevent multiple rapid clicks
          }, 300), // Throttle to avoid excessive execution

          onErrorHandler: function(t) {
            this.loading = false;
            this.isError = true;
            this.$emit("error", t);
          },
          onLoadHandler: function() {
            this.loading = false;
            this.isError = false;
            this.$emit("load");
            this.removeBgColor();
          },
          removeBgColor: function() {
            this.backgroundStyle = {
              backgroundColor: "transparent",
            };
          },
        },
      };
      e.default = r;
    },

    // Navigation Component Fix
    "50fc": function(t, e, n) {
      "use strict";
      n.d(e, "b", function() {
        return a;
      });
      n.d(e, "c", function() {
        return r;
      });
      n.d(e, "a", function() {
        return i;
      });

      var i = {
          uTabbar: n("c0e9").default,
          uTabbarItem: n("ef56").default,
          uImage: n("d6b1").default,
        },
        a = function() {
          var t = this,
              e = t.$createElement,
              n = t._self._c || e;
          return n(
            "v-uni-view",
            [
              n("u-tabbar", {
                staticClass: "u-flex-x font-size-12 font-white",
                attrs: {
                  bgColor: t.bgColor,
                  fixed: true,
                  placeholder: true,
                  safeAreaInsetBottom: true,
                },
              }, [
                n("u-tabbar-item", {
                  staticClass: "u-flex-self-end m-b-5",
                }, [
                  n(
                    "v-uni-navigator",
                    {
                      staticClass: "u-flex-y u-flex-items-center",
                      attrs: {
                        slot: "inactive-icon",
                        url: "/pages/index/index",
                        "animation-type": "none",
                      },
                      slot: "inactive-icon",
                    },
                    [
                     