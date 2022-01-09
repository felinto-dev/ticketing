import { Stan } from 'node-nats-streaming';

import { Subjects } from './subjects';

interface Event {
	subject: Subjects;
	data: any;
}

export abstract class Publisher<T extends Event> {
	abstract readonly subject: T['subject'];

	abstract onPublish() : void

	constructor(
		protected readonly client: Stan
	) { }
	
	publish(data: T['data']): Promise<void> {
		return new Promise((resolve, reject) => {
			this.client.publish(
				this.subject,
				JSON.stringify((data)),
				(err) => {
					if (err) {
						return reject(err)
					}

					console.log('Event published to subject', this.subject)
					resolve()
				}
			)
		})
	}
}
