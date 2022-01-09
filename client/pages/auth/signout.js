import { useEffect } from 'react'
import Router from 'next/router'

import useRequest from '../../hooks/use-request'

export default () => {
	const { doRequest } = useRequest({
		method: 'post',
		url: '/api/users/sign-out',
		onSuccess: () => Router.push('/'),
	})

	useEffect(() => {
		doRequest()
	}, [])

	return <div>Signing you out...</div>
}
