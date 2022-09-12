export class QueueEvent {
  /**
   * @type {string}
   */
  id;

  /**
   * @type {string}
   */
  event_id;

  /**
   * @type {string}
   */
  event;

  /**
   * @type {string}
   */
  contract;

  /**
   * @type {string}
   */
  subscriber;

  constructor(event, subscriber) {
    this.id = event.id + "_" + subscriber;
    this.event_id = event.id;
    this.event = event.event;
    this.contract = event.contract;
    this.subscriber = subscriber;
  }

  toMongoObject() {
    return {
      _id: this.id,
      event_id: this.event_id,
      event: this.event,
      contract: this.contract,
      subscriber: this.subscriber,
    };
  }
}
