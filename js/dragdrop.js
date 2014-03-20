(function(exports) {

  const activateDelay = 300;

  function DragDrop() {
    window.addEventListener('touchstart', this);
    window.addEventListener('touchmove', this);
    window.addEventListener('touchend', this);
  }

  DragDrop.prototype = {

    /**
     * The current touchmove target.
     * @type {DomElement}
     */
    target: null,

    /**
     * Begins the drag/drop interaction.
     * Enlarges the icon.
     * Sets additional data to make the touchmove handler faster.
     */
    begin: function() {
      this.active = true;
      this.target.classList.add('active');

      this.xAdjust = this.target.clientWidth / 2;
      this.yAdjust = this.target.clientHeight / 2;

      var identifier = this.target.dataset.identifier;
      this.icon = app.icons[identifier];
    },

    /**
     * General event handler.
     */
    handleEvent: function(e) {
      switch(e.type) {
          case 'touchstart':
            this.target = e.touches[0].target;
            this.timeout = setTimeout(this.begin.bind(this),
              this.activateDelay);
            break;
          case 'touchmove':
            if (!this.active || !this.icon) {
              return;
            }

            e.stopImmediatePropagation();
            e.preventDefault();

            var touch = e.touches[0];
            this.icon.transform(
              touch.pageX - this.xAdjust,
              touch.pageY - this.yAdjust);

            // Reposition in the icons array if necessary.
            // Find the icon with the closest X/Y position of the move,
            // and insert ours before it.
            // Todo: this could be more efficient with a binary search.
            var leastDistance;
            var foundIndex;
            for (var i = 0, iLen = app.items.length; i < iLen; i++) {
              var item = app.items[i];
              var distance = Math.sqrt(
                (touch.pageX - item.x) * (touch.pageX - item.x) +
                (touch.pageY - item.y) * (touch.pageY - item.y));
              if (!leastDistance || distance < leastDistance) {
                leastDistance = distance;
                foundIndex = i;
              }
            }

            // Insert at the found position
            var myIndex = this.icon.itemIndex;
            if (foundIndex !== myIndex) {
              app.items.splice(foundIndex, 0, app.items.splice(myIndex, 1)[0]);
              app.render();
            }

            break;
          case 'touchend':
            this.active = false;
            if (this.target) {
              this.target.classList.remove('active');
            }
            this.target = null;
            clearTimeout(this.activateDelay);
            app.render();

            break;
        }
    }
  };

  exports.DragDrop = DragDrop;

}(window));
