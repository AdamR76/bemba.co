import { drawTasks, grouper } from "./utils/utils.mjs";
import { flow, formData, html, querySelect, searchQuery, updateElement, waitAll } from "./std.mjs";

import ajax from "./ajax.mjs";

const [container] = querySelect('.addform'),
	[statusmsg] = querySelect('.statusmsg'),
	[projectContainer] = querySelect('.container');

const { pid, t } = searchQuery;

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const state = {}

const addform = (users, cats, fn) => html('form', {
	className: 'flex column addtheform',
	onsubmit: evt => {
		evt.preventDefault();
		const values = Object.assign(Object.fromEntries(Object.entries(formData(evt.target))
			.map(([key, value]) => [key, key === 'assignto' && value === '0' ? null : value])), { pid });
			console.log(values)
		flow(
			ajax({ path: 'projects/addtaskitem', data: values }),
			() => ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
			project => updateElement(projectContainer, [html('h1', {}, project[0].name), ...grouper(project).map(drawTasks), html('button', { type: 'submit', className: 'btn' }, 'Update Tasks')]),
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
		'Category',
		state.newcat
			? html('input', { type: 'text', name: 'cat' })
			: html('select', { name: 'cat' }, cats.map(cat => html('option', { value: cat.projectcatid }, cat.projectcat)))
	]),
	html('label', {}, [
		'Add New Category?', // preserve state
		html('input', {
			type: 'checkbox', onclick: evt => {
				evt.preventDefault();
				state.newcat = state.newcat ? 0 : 1;
				return fn();
			},
			checked: state.newcat
		})
	]),
	html('label', {}, [
		'Due Date',
		html('input', { type: 'date', name: 'duedate', required: true })
	]),
	html('button', { type: 'submit', className: 'btn' }, 'Add Task')
]);

const draw = () =>
	flow(
		Promise.all([
			ajax({ path: 'projects/getusers', data: { pid, t } }),
			ajax({ path: 'projects/getprojectcats', data: { pid, t } })
		]),
		waitAll,
		([users, cats]) => updateElement(container, [html('h2', {}, 'Add Task'), addform(users, cats, draw)])
	).catch(console.error)

draw();