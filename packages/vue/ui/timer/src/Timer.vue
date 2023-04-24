<template>
  <div>
    <div
      v-if="currentTime"
      class="text-center"
    >
      <Text variant="h3">
        <span v-if="hours">{{ formatTime(days * 24 + hours) }}:</span><span>{{ formatTime(minutes) }}:{{ formatTime(seconds) }}</span>
      </Text>
    </div>
    <div class="text-center" />
    <slot>
      <Text
        v-if="!currentTime"
        variant="h3"
      >
        Time's Up!
      </Text>
    </slot>
  </div>
</template>

<script>
import Text from '@arroyodev-llc/components.vue.ui.text';

export default {
  components: { Text },
  filters: {},
  props: {
    deadline: {
      type: String,
      required: true,
    },
    speed: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      currentTime: Date.parse(this.deadline) - Date.parse(new Date()),
    };
  },
  computed: {
    seconds() {
      return Math.floor((this.currentTime / 1000) % 60);
    },
    minutes() {
      return Math.floor((this.currentTime / 1000 / 60) % 60);
    },
    hours() {
      return Math.floor((this.currentTime / (1000 * 60 * 60)) % 24);
    },
    days() {
      return Math.floor(this.currentTime / (1000 * 60 * 60 * 24));
    },
  },
  mounted() {
    setTimeout(this.countdown, 1000);
  },
  methods: {
    countdown() {
      this.currentTime = Date.parse(this.deadline) - Date.parse(new Date());

      if (this.currentTime > 0) {
        setTimeout(this.countdown, this.speed);
      } else {
        this.currentTime = null;
        this.$emit('times-up', this.timerId);
      }
    },
    formatTime(value) {
      if (value < 10) {
        return '0' + value;
      }
      return value;
    },
  },
};
</script>
