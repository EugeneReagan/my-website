(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  ["pages-index-index~pages-order-order~pages-start-start"],
  {
    "2056": function (t, e, n) {
      "use strict";
      n("7a82");
      var i = n("4ea4").default;
      Object.defineProperty(e, "__esModule", { value: !0 });
      e.default = void 0;

      const debounce = (func, delay) => {
        let timer;
        return function (...args) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => func.apply(this, args), delay);
        };
      };

      var component = {
        name: "u-image",
        mixins: [uni.$u.mpMixin, uni.$u.mixin],
        data: function () {
          return {
            isError: false,
            loading: true,
            opacity: 1,
            durationTime: this.duration,
            backgroundStyle: {},
            show: false,
            isNavigating: false, // To prevent rapid clicks
          };
        },
        watch: {
          src: {
            immediate: true,
            handler: function (newSrc) {
              this.isError = !newSrc;
              this.loading = !!newSrc;
            },
          },
        },
        computed: {
          wrapStyle: function () {
            return {
              width: this.$u.addUnit(this.width),
              height: this.$u.addUnit(this.height),
              borderRadius: this.shape === "circle" ? "10000px" : this.$u.addUnit(this.radius),
              overflow: this.radius > 0 ? "hidden" : "visible",
              ...this.$u.addStyle(this.customStyle),
            };
          },
        },
        mounted: function () {
          this.show = true;
        },
        methods: {
          onClick: debounce(function () {
            if (this.isNavigating) return;
            this.isNavigating = true;
            this.$emit("click");
            setTimeout(() => (this.isNavigating = false), 500);
          }, 300),

          onErrorHandler: function () {
            this.loading = false;
            this.isError = true;
            this.$emit("error");
          },

          onLoadHandler: function () {
            this.loading = false;
            this.isError = false;
            this.$emit("load");
            this.backgroundStyle = { backgroundColor: "transparent" };
          },
        },
      };

      e.default = component;
    },

    "50fc": function (t, e, n) {
      "use strict";
      n.d(e, "b", () => render);
      n.d(e, "c", () => staticRenderFns);
      n.d(e, "a", () => component);

      const component = {
        uTabbar: n("c0e9").default,
        uTabbarItem: n("ef56").default,
        uImage: n("d6b1").default,
      };

      const render = function () {
        var t = this,
          e = t.$createElement,
          n = t._self._c || e;
        return n("v-uni-view", [
          n(
            "u-tabbar",
            {
              staticClass: "u-flex-x font-size-12 font-white",
              attrs: {
                bgColor: t.bgColor,
                fixed: true,
                placeholder: true,
                safeAreaInsetBottom: true,
              },
            },
            [
              n("u-tabbar-item", { staticClass: "u-flex-self-end m-b-5" }, [
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
                    n("u-image", {
                      staticClass: "m-b-5",
                      attrs: {
                        mode: "aspectFit",
                        width: "23",
                        height: "23",
                        src: "/static/BG-015.png",
                      },
                    }),
                    n(
                      "v-uni-text",
                      {
                        staticClass: "u-line-1",
                        class: { "text-underline": 0 === t.tabCurrent },
                      },
                      [t._v(t._s(t.$t("index")))]
                    ),
                  ],
                  1
                ),
              ]),
              n("u-tabbar-item", { staticClass: "u-flex-self-end m-b-5" }, [
                n(
                  "v-uni-navigator",
                  {
                    staticClass: "u-flex-y u-flex-items-center",
                    attrs: {
                      slot: "inactive-icon",
                      url: "/pages/start/start",
                      "animation-type": "none",
                    },
                    slot: "inactive-icon",
                  },
                  [
                    n("v-uni-view", {
                      staticStyle: {
                        width: "100rpx",
                        height: "100rpx",
                        "background-color": "#fff",
                        "border-radius": "50%",
                        padding: "20rpx",
                      },
                    }),
                    n(
                      "v-uni-text",
                      {
                        staticClass: "u-line-1",
                        class: { "text-underline": 1 === t.tabCurrent },
                      },
                      [t._v(t._s(t.$t("start")))]
                    ),
                  ],
                  1
                ),
              ]),
            ],
            1
          ),
        ]);
      };

      const staticRenderFns = [];
    },
  },
]);