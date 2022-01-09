import { Publisher, OrderCancelledEvent, Subjects } from "@felinto-gittix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;

	onPublish(): void {
			
	}
}
