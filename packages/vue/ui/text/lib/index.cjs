'use strict';

const vue = require('vue');

const script = /* @__PURE__ */ vue.defineComponent({
  __name: "Text",
  props: {
    variant: { type: null, required: false, default: "body" }
  },
  setup(__props) {
    const props = __props;
    const anchor = vue.computed(
      () => props.variant === "body" ? "p" : typeof props.variant === "number" ? `h${props.variant}` : props.variant
    );
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(vue.unref(anchor)), null, {
        default: vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      });
    };
  }
});

script.__file = "src/Text.vue";
