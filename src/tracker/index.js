import LinkListener from './link-listener';
import EventTransport from './event-transport';
import ViewListener from './view-listener';
import { Logger } from '../logger';

const listeners = [];

export default class Tracker {
  /**
   * Constructor.
   *
   * @param {?object} options
   * @param {boolean} [options.trackLinks=true] Whether to track links.
   */
  constructor(options = {}) {
    const defaults = {
      trackLinks: true,
      debug: false,
      onLinkTrack: undefined,
    };
    const opts = { ...defaults, ...options };
    this.opts = opts;
    this.logger = new Logger({ enabled: opts.debug });

    const transport = new EventTransport({
      domain: opts.domain,
      logger: this.logger,
    });
    this.commands = {
      event: transport.send.bind(transport),
    };
    listeners.push(new LinkListener(this, {
      enabled: opts.trackLinks,
      callback: opts.onLinkTrack,
    }));
    listeners.push(new ViewListener(this, {}));
  }

  /**
   * Executes a command on the tracker.
   *
   * @param {string} command
   * @param {...object} args
   */
  execute(command, ...args) {
    if (this.commands[command]) {
      if (this.opts.debug) {
        // eslint-disable-next-line no-console
        console.info('FORTNIGHT', 'Tracker.execute', command, ...args);
      }
      this.commands[command](...args);
    }
  }

  /**
   * The tracker instance is being destroyed.
   * Destroy all event listeners.
   */
  destroy() { // eslint-disable-line class-methods-use-this
    for (let i = 0; i < listeners.length; i += 1) {
      const listener = listeners[i];
      listener.destroy();
    }
  }
}
