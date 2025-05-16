import { flow, formData, html, querySelect, updateElement } from "./std.mjs";

import ajax from "./ajax.mjs";

const [container] = querySelect('.container');


const loginForm = html('form', {
	onsubmit: evt => {
		evt.preventDefault();
		const values = formData(evt.target);
		flow(
			ajax({ path: 'users/login', data: values }),
			([login]) => {
				localStorage.login = JSON.stringify(login);
				return location = '/projects.html'
			}
		).catch(console.error)
	}
}, [
	html('label', {}, [
		'Email',
		html('input', { type: 'email', name: 'email', required: true })
	]),
	html('label', {}, [
		'Password',
		html('input', { name: 'password', type: 'password', required: true })
	]),
	html('button', { className: 'btn' }, 'Login')
]);

updateElement(container, loginForm);