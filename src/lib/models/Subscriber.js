export class Subscriber {
  /**
  * @type {string}
  */
  id

  /**
    * @type {string}
    */
  name

  /**
  * @type {Array}
  */
  events

  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.events = data.events;
  }

  toMongoObject() {
    return {
      _id: this.id,
      name: this.name,
      events: this.events
    };
  }
}