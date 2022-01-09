const OrderIndex = ({ orders }) => {
	return (
		<div>
			<ul>
				{orders.map((order) => {
					return (
						<li key={order.id}>
							{order.ticket.title} - {order.status}
						</li>
					)
				})}
			</ul>
		</div>
	)
}

OrderIndex.getInitialProps = async (ctx, client) => {
	const { data: orders } = await client.get('/api/orders')
	console.log(orders)
	return { orders }
}

export default OrderIndex
