import Component from '@ember/component';
import layout from '../../templates/components/basic-tooltip/content-component';

export default Component.extend({
  layout,

  actions: {
    mouseEnter() {
      this.get('updateContentHovering')(true);
    },

    mouseLeave() {
      this.get('updateContentHovering')(false);
    }
  }
});
