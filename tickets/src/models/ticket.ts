import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
	title: string;
	price: number;
	userId: string;
}

interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	userId: string;
	version: number;
	orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc
}

const ticketSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	orderId: {
		type: String,
		required: false,
	},
}, {
	toJSON: {
		transform(doc, ret) {
			ret.id = ret._id
			delete ret._id
			delete ret.__v
		}
	},
})

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket(attrs)
}
ticketSchema.plugin(updateIfCurrentPlugin)
ticketSchema.set('versionKey', 'version')

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket };
