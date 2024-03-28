import { buildQuery } from '../utils';

export default class EventTransport {
  /**
   * Constructor.
   *
   * @param {object} options
   * @param {string} options.domain The backend domain.
   * @param {import("../logger.js").Logger} options.logger
   */
  constructor({ domain, logger } = {}) {
    if (!domain) throw new Error('The NativeX tenant domain is required');
    this.domain = domain.replace(/\/+$/, '');
    this.logger = logger;
  }

  /**
   * Sends an event to the backend.
   * 
   * @typedef MindfulFields
   * @prop {string} [cre]
   * @prop {string} [li]
   * @prop {string} ns
   * @prop {string} unit
   * 
   *
   * @param {string} action The event action, e.g. `view`, `load` or `click`
   * @param {object} fields The event fields
   * @param {string} fields.pid The placement ID
   * @param {string} fields.cid The campaign ID
   * @param {string} fields.uuid The unique request UUID
   * @param {string} fields.cre The creative ID
   * @param {object} fields.kv The request custom key/values
   * @param {object} options The event options
   * @param {?Function} options.callback The callback to fire once complete.
   * @param {MindfulFields} [options.mindful]
   */
  send(
    action,
    {
      pid,
      cid,
      uuid,
      cre,
      kv,
    } = {},
    { callback, mindful } = {},
  ) {
    const act = String(action).trim().toLowerCase();
    if (!act) {
      this.logger.warn('No event action was provided. Preventing send.');
      return;
    }
    const params = {
      pid,
      cid,
      uuid,
      cre,
      kv,
      _: Date.now(),
    };

    this.sendBeacon(act, params, callback);
    if (!mindful?.cre) return;
    const event = {
      action,
      category: 'Native Website Creative',
      entity: {
        id: mindful.cre,
        ns: `mindful.${mindful.ns}.advertising-creative`,
      },
    };
    if (!window.p1events) return;
    window.p1events('track', event);
  }

  /**
   * Sends the event using the Beacon API.
   * Will fallback with an `img` element if the beacon wasn't queued.
   *
   * @private
   * @param {string} act
   * @param {object} params
   * @param {?Function} callback
   */
  sendBeacon(act, params, callback) {
    const url = this.buildEventUrl(act, params);
    const queued = navigator.sendBeacon(url);
    if (queued && typeof callback === 'function') callback(act, params);
  }

  /**
   * Builds an fully-qualified event URL for the provided action and paramaters
   *
   * @private
   * @param {string} action
   * @param {object} params
   */
  buildEventUrl(act, params) {
    const query = buildQuery(params);
    const endpoint = `/e/${act}.gif?${query}`;
    return this.createUrl(endpoint);
  }

  /**
   * Creates a URL using the provided endoint with the configured domain.
   *
   * @param {string} endpoint
   * @return {string}
   */
  createUrl(endpoint) {
    return `${this.domain}/${endpoint.replace(/^\/+/, '')}`;
  }
}
