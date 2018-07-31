import Component from '@ember/component';
import layout from '../templates/components/basic-tooltip';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

const SUPPORTED_POSITIONS = {
  ABOVE: 'above',
  BELOW: 'below',
  LEFT: 'left',
  RIGHT: 'right'
};

const POSITION_OPPOSITES = {
  above: 'below',
  below: 'above',
  left: 'right',
  right: 'left'
};

const DEFAULT_HORIZONTAL_OFFSET = 17;
const DEFAULT_VERTICAL_OFFSET = 13;

const DEFAULT_POSITION = SUPPORTED_POSITIONS.ABOVE;

const DEFAULT_POSITION_PREFERENCE = [
  SUPPORTED_POSITIONS.ABOVE,
  SUPPORTED_POSITIONS.BELOW,
  SUPPORTED_POSITIONS.LEFT,
  SUPPORTED_POSITIONS.RIGHT
];

const ARROW_TIP_OFFSET = 5;
const ARROW_SIZE = 10;
const OFFSET = ARROW_TIP_OFFSET + ARROW_SIZE;

const HOVER_DELAY = 250; // milliseconds after hovering when tooltip will try to close. Should be above 0 if there is distance between tooltip and the target elements.

const _testPosition = function(positionName, {
    containerWidth,
    containerHeight,
    popoverHeight,
    popoverWidth,
    targetTop,
    targetLeft,
    targetHeight,
    targetWidth
}) {
  switch(positionName) {
    case 'above':
      return popoverHeight <= targetTop - OFFSET;

    case 'below':
      return popoverHeight <= containerHeight - (targetTop + targetHeight) - OFFSET;

    case 'left':
      return popoverWidth <= targetLeft - OFFSET;

    case 'right':
      return popoverWidth <= containerWidth - (targetLeft + targetWidth) - OFFSET;
  }
};

const _calculateHorizontalPosition = function({
  targetLeft,
  targetWidth,
  popoverWidth,
  popoverMargins
}, position) {
  switch(position) {
    case 'left':
      return {
        left: targetLeft - popoverWidth - popoverMargins.left - DEFAULT_HORIZONTAL_OFFSET - 2
      };

    case 'right':
      return {
        left: targetLeft + targetWidth - popoverMargins.left + DEFAULT_HORIZONTAL_OFFSET + 2
      };

    case 'above':
    case 'below':
      return {
        left: targetLeft + (targetWidth / 2) - ((popoverWidth + popoverMargins.left + popoverMargins.right) / 2)
      };
  }
};

const _calculateVerticalPosition = function({
  targetTop,
  targetHeight,
  popoverHeight,
  popoverMargins
}, position) {
  switch(position) {
    case 'above':
      return {
        top: targetTop - popoverHeight - popoverMargins.top
      };

    case 'below':
      return {
        top: targetTop + targetHeight - popoverMargins.top
      };

    case 'left':
    case 'right':
      return {
        top: targetTop + (targetHeight / 2) - ((popoverHeight + popoverMargins.top + popoverMargins.bottom) / 2)
      };
  }
};

export default Component.extend({
  layout,

  positionPreference: 'right',

  contentHovering: false,

  targetHovering: false,

  didReceiveAttrs() {
    this._super(...arguments);

    let positionPreference = this.get('positionPreference');

    if (typeof positionPreference == 'string') {
      positionPreference = [positionPreference];
      this.set('positionPreference', positionPreference);
    }
    positionPreference.forEach(function(value, index) {
      if (!Object.values(SUPPORTED_POSITIONS).includes(value)) {
        throw `positionPreference "${value}" is not supported`;
      }
    });
  },

  _supportedPositions: SUPPORTED_POSITIONS,

  _positionPreference: computed('positionPreference', function() {
    const positionPreference = this.get('positionPreference');
    let preferenceOrder = positionPreference;

    // Add opposite positions in order
    positionPreference.forEach(function(positionName) {
      let oppositePositionName = POSITION_OPPOSITES[positionName];
      if (preferenceOrder.indexOf(oppositePositionName) === -1) {
        preferenceOrder.push(oppositePositionName);
      }
    });

    // Now just fill in the missing position names based on their
    // order in the default DEFAULT_POSITION_PREFERENCE list
    DEFAULT_POSITION_PREFERENCE.forEach(function(positionName) {
      if (preferenceOrder.indexOf(positionName) === -1) {
        preferenceOrder.push(positionName);
      }
    });

    return preferenceOrder;
  }),

  calculatePosition(options, target, popover) {
    const targetClientBoundingRect = target.getBoundingClientRect();
    const popoverClientBoundingRect = popover.getBoundingClientRect();

    let {
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight
    } = targetClientBoundingRect;

    const popoverStyles = window.getComputedStyle(popover);
    const popoverMargins = {
      left: parseFloat(popoverStyles.marginLeft),
      right: parseFloat(popoverStyles.marginRight),
      top: parseFloat(popoverStyles.marginTop),
      bottom: parseFloat(popoverStyles.marginBottom)
    };

    const {
      top: popoverTop,
      left: popoverLeft,
      height: popoverHeight,
      width: popoverWidth
    } = popoverClientBoundingRect;

    targetTop = targetTop + window.scrollY;
    const containerWidth = window.innerWidth - window.scrollX;
    const containerHeight = window.innerHeight - window.scrollY;

    const boundingSizes = {
      containerWidth,
      containerHeight,
      popoverMargins,
      targetTop,
      targetLeft,
      targetWidth,
      targetHeight,
      popoverHeight,
      popoverWidth,
      popoverTop,
      popoverLeft
    };

    let position = null;
    for (var i = 0; i < options.positionPreference.length; i++) {
      if (_testPosition(options.positionPreference[i], boundingSizes)) {
        position = options.positionPreference[i];
        break;
      }
    }

    this.set('currentPosition', position);

    const horizontalPosition = _calculateHorizontalPosition(boundingSizes, position);
    const verticalPosition = _calculateVerticalPosition(boundingSizes, position);

    const popoverStyle = Object.assign({}, horizontalPosition, verticalPosition);

    return {
      style: popoverStyle,
      position
    };
  },

  isHovering: computed.or('targetHovering', 'contentHovering'),

  handleHover() {
    if (this.get('isHovering') && !this.get('dropdownAPI.isOpen')) {
      this.get('dropdownAPI.actions.open')();
    }

    run.later(() => {
      if (!this.get('isHovering') && this.get('dropdownAPI.isOpen')) {
        this.get('dropdownAPI.actions.close')();
      }
    }, HOVER_DELAY);
  },

  actions: {
    calculatePosition(options, ...rest) {
      const positionData = this.calculatePosition(options, ...rest);

      return positionData;
    },

    updateTargetHovering(state) {
      this.set('targetHovering', state);
      this.handleHover();
    },

    updateContentHovering(state) {
      this.set('contentHovering', state);
      this.handleHover();
    }
  }
});
