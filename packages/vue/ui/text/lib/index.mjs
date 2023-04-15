import { defineComponent, computed, openBlock, createBlock, resolveDynamicComponent, unref, withCtx, renderSlot } from 'vue';

const script = /* @__PURE__ */ defineComponent({
  __name: "Text",
  props: {
    variant: { type: null, required: false, default: "body" }
  },
  setup(__props) {
    const props = __props;
    const anchor = computed(
      () => props.variant === "body" ? "p" : typeof props.variant === "number" ? `h${props.variant}` : props.variant
    );
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(unref(anchor)), null, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
        /* FORWARDED */
      });
    };
  }
});

script.__file = "src/Text.vue";
