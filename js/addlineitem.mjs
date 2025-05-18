import { flow, formData, html, querySelect, searchQuery, updateElement } from "./std.mjs";
import { headers, renderers } from "./utils/tableInfo.mjs";

import ajax from "./ajax.mjs";
import table from "./table.mjs";

const [container] = querySelect('.addform'),
	[statusmsg] = querySelect('.statusmsg'),
	[projectContainer] = querySelect('.container');

const { pid, t } = searchQuery;

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const addform = users => html('form', {
	className: 'flex column addtheform',
	onsubmit: evt => {
		evt.preventDefault();
		const values = Object.assign(Object.fromEntries(Object.entries(formData(evt.target))
			.map(([key, value]) => [key, key === 'assignto' && value === '0' ? null : value])), { pid });
		flow(
			ajax({ path: 'projects/addtaskitem', data: values }),
			() => ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
			project => updateElement(projectContainer, [html('h1', {}, project[0].name), table(project, renderers, headers, '', '')]),
			() => querySelect('.addtheform')[0].reset()
		).catch(err => {
			console.error(err);
			statusmsg.classList.add('error');
			updateElement(statusmsg, 'Something went wrong. Please try again later.')
		})
	}
}, [
	html('label', {}, [
		'Task Name',
		html('input', { type: 'text', name: 'title', required: true })
	]),
	html('label', {}, [
		'Task Description',
		html('textarea', { name: 'description' })
	]),
	html('label', {}, [
		'Assign To',
		html('select', { name: 'assignto' }, users.concat({ name: 'Not Assigned', userid: 0 })
			.map(user => html('option', { value: user.userid, selected: user.userid === 0 }, user.name)))
	]),
	html('label', {}, [
		'Due Date',
		html('input', { type: 'date', name: 'duedate', required: true })
	]),
	html('button', { type: 'submit', className: 'btn' }, 'Add Task')
]);


flow(
	ajax({ path: 'projects/getusers', data: { pid, t } }),
	users => updateElement(container, [html('h2', {}, 'Add Task'), addform(users)])
).catch(console.error)
