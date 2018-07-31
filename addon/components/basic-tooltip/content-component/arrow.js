import Component from '@ember/component';
import layout from '../../../templates/components/basic-tooltip/content-component/arrow';

export default Component.extend({
  layout,

  _arrowPositionStyle() {
    const arrow = this.element.querySelector('.popover-arrow');

    if (!arrow) {
      return;
    }

    const arrowClientBoundingRect = arrow.getBoundingClientRect();

    const arrowStyles = window.getComputedStyle(arrow);
    const arrowBorderWidths = {
      horizontal: parseFloat(arrowStyles.borderRightWidth),
      vertical: parseFloat(arrowStyles.borderTopWidth)
    };
    const arrowMargins = {
      left: parseFloat(arrowStyles.marginLeft),
      right: parseFloat(arrowStyles.marginRight),
      top: parseFloat(arrowStyles.marginTop),
      bottom: parseFloat(arrowStyles.marginBottom)
    };

    /*
      This is the height of the arrow's box after it's been rotated. So an arrow
      with a width and height of 15px will actually be 17px tall and wide when rotated.
      It's the size of the box that contains the "diamond" shape of the arrow.
    */
    let {
      width: arrowRotatedWidth,
      height: arrowRotatedHeight
    } = arrowClientBoundingRect;

    const arrowSizes = {
      arrowMargins,
      arrowRotatedWidth: arrowRotatedWidth - arrowBorderWidths.horizontal,
      arrowRotatedHeight: arrowRotatedHeight - arrowBorderWidths.vertical,
      arrowDefinedWidth: arrow.clientWidth,
      arrowDefinedHeight: arrow.clientHeight
    };


    const borderWidths = arrowStyles.getPropertyValue('border-width').split('px').filter(width => parseFloat(width));
    const borderWidth = borderWidths.length ? parseFloat(borderWidths[0]) : 0;

    let borderRotatedWidth = 0;
    const arrowTransform = arrowStyles.getPropertyValue("transform");
    if (arrowTransform && arrowTransform.includes('matrix')) {
      const arrowRotations = arrowTransform.split('(')[1].split(')')[0].split(',');
      borderRotatedWidth = borderWidth / arrowRotations[0];
    }

    // Assumes transform origin of arrow is left at default.
    const transformOriginHorizontalOffset = (arrowRotatedWidth - (arrow.clientWidth + borderWidth)) / 2;
    const transformOriginVerticalOffset = (arrowRotatedHeight - (arrow.clientHeight + borderWidth)) / 2;

    const halfBorderWidth = borderRotatedWidth / 2;

    const horizontalOffset = (arrowRotatedWidth / 2) - transformOriginHorizontalOffset;
    const verticalOffset = (arrowRotatedHeight / 2) - transformOriginVerticalOffset;

    const horizontal = this.get('arrowPosition') === 'left' ? `right: calc(-${horizontalOffset}px - ${halfBorderWidth}px)` : `left: calc(-${horizontalOffset}px + ${halfBorderWidth}px)`;

    const vertical = `top: calc(50% - ${verticalOffset}px)`;

    return `${horizontal}; ${vertical}`;
  },

  didRender() {
    this.set('arrowPositionStyle', this._arrowPositionStyle());
  }
});
