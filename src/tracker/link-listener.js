import { delegate, parseUrl } from 'dom-utils';
import { extractFieldsFrom, isTrackable } from '../utils';

export default class LinkListener {
  /**
   *
   * @param {Tracker} tracker
   * @param {object} options
   */
  constructor(tracker, options = {}) {
    // Prevent execution when disabled or unsupported
    if (!options.enabled) return;

    this.tracker = tracker;
    const defaults = {
      selector: 'a',
      shouldTrackLink: LinkListener.shouldTrackLink,
      callback: undefined,
    };
    this.opts = Object.assign(defaults, options);

    this.handleInteractions = this.handleInteractions.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);

    this.delegates = {};

    const eventHandlers = [
      { event: 'click', fn: this.handleInteractions },
      { event: 'contextmenu', fn: this.handleContextMenu },
    ];
    for (let i = 0; i < eventHandlers.length; i += 1) {
      const handler = eventHandlers[i];
      this.delegates[handler.event] = delegate(
        document,
        handler.event,
        this.opts.selector,
        handler.fn,
        { composed: true, useCapture: true },
      );
    }
  }

  handleContextMenu(event, link) {
    if (this.opts.shouldTrackLink(link, parseUrl)) {
      const fields = extractFieldsFrom(link);

      const eventOpts = {
        callback: this.opts.callback,
      };
      this.tracker.execute('event', 'contextmenu', fields, eventOpts);
    }
  }

  handleInteractions(event, link) {
    if (!this.opts.shouldTrackLink(link, parseUrl)) return;
    const fields = extractFieldsFrom(link);

    const eventOpts = {
      callback: this.opts.callback,
    };

    // The Beacon API will now be used exclusively, so we no longer need to check
    // if a link will unload the page.
    // Send the event directly.
    this.tracker.execute('event', 'click', fields, eventOpts);
  }

  /**
   * Determines if the link should be tracked.
   *
   * @param {Element} element
   * @param {Function} urlParser
   * @return {boolean}
   */
  static shouldTrackLink(element, urlParser) {
    const href = element.getAttribute('href');
    const url = urlParser(href);
    return url.protocol.slice(0, 4) === 'http' && isTrackable(element, 'click');
  }

  /**
   * Destroys all event listeners.
   */
  destroy() {
    const keys = Object.keys(this.delegates);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      this.delegates[key].destroy();
    }
  }
}
