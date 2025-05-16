import { flow, formData, html, querySelect, updateElement } from './std.mjs'

import ajax from './ajax.mjs';

const [container] = querySelect('.container');


const signup = html('form', {
	className: 'flex column signup',
	onsubmit: evt => {
		evt.preventDefault();
		const values = formData(evt.target);
		flow(
			ajax({ path: 'users/signup', data: values }),
			console.log
		)
	}
}, [
	html('label', {}, [
		'Name',
		html('input', { type: 'text', name: 'name', placeholder: 'John Doe', required: true })
	]),
	html('label', {}, [
		'Email',
		html('input', { type: 'email', name: 'email', placeholder: 'john@doe.com', required: true })
	]),
	html('label', {}, [
		'Password',
		html('input', { type: 'password', name: 'password', required: true, minlength: 10 })
	]),
	html('button', { type: 'submit' , className: 'btn'}, 'Get to Managing')
]);

updateElement(container, signup)