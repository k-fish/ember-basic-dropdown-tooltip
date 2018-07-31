import Component from '@ember/component';
import layout from '../../templates/components/basic-tooltip/target-component';

import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Component.extend({
  layout,

  targetHovering: false,

  contentHovering: false,

  _targetHovering: false,

  _contentHovering: false,

  wasHovering: computed.or('_targetHovering', '_contentHovering'),

  isHovering: computed.or('targetHovering', 'contentHovering'),

  didRender() {
    const wasHovering = this.get('wasHovering');
    const isHovering = this.get('isHovering');

    if (!wasHovering && isHovering) {
      this.get('dropdown.actions.open')();
    }

    if (wasHovering && !isHovering) {
      this.get('dropdown.actions.close')();
    }
  },

  didReceiveAttrs() {
    this.didReceiveTargetHovering();
    this.didReceiveContentHovering();
  },

  didReceiveTargetHovering() {
    if (this.get('targetHovering') !== this.get('_targetHovering')) {
      this.set('_targetHovering', this.get('targetHovering'));
    }
  },

  didReceiveContentHovering() {
    if (this.get('contentHovering') !== this.get('_contentHovering')) {
      this.set('_contentHovering', this.get('contentHovering'));
    }
  },

  actions: {
    mouseEnter() {
      this.get('updateTargetHovering')(true);
    },
    mouseLeave() {
      this.get('updateTargetHovering')(false);
    }
  }
});
