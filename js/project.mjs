import { flow, html, querySelect, searchQuery, updateElement } from './std.mjs';

import ajax from './ajax.mjs';
import table from './table.mjs'

const [container] = querySelect('.container'),
	[statusmsg] = querySelect('.statusmsg');

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const { pid, t } = searchQuery;

const headers = {
	name: null,
	projectitemid: null,
	title: 'Task Title',
	duedate: 'Due',
	phaseid: null,
	phases: 'Phase',
	projectid: null,
	description: 'Task Description',
	update: 'Update Row',
	users: null,
	assignto: 'Assigned To'
},
	renderers = {
		phases: project => html('select', { name: 'phase', 'data-id': project.projectitemid }, project.phases.map(phase => html('option', { value: phase.phaseid, selected: phase.phaseid === project.phaseid }, phase.phase))),
		duedate: project => html('input', { type: 'date', defaultValue: project.duedate.split('T')[0], name: 'duedate', 'data-id': project.projectitemid }),
		title: project => html('input', { type: 'text', name: 'title', value: project.title, 'data-id': project.projectitemid }),
		description: project => html('textarea', { name: 'description', value: project.description, 'data-id': project.projectitemid }),
		update: project => html('button', { className: 'btn', value: project.projectitemid, onclick: evt => {
			evt.preventDefault();
			const rowid = evt.target.value,
				values = Object.assign(Object.fromEntries(querySelect(`[data-id='${rowid}']`).map(val => [val.name, val.value])), { rowid });
				values.assignto = values.assignto === '0' ? null : Number(values.assignto)
				


				return flow(
					ajax({ path: 'projects/updatetaskitem', data: values }),
					([res]) => {
						if (res.status === 'ok') {
							statusmsg.classList.add('success');
							updateElement(statusmsg, 'Task Successfully Updated');
							return setTimeout(() => updateElement(statusmsg, ''), 3000);
						}
					}
				).catch(err => {
					console.error(err);
					statusmsg.classList.add('error');
					updateElement(statusmsg, 'Something went wrong. Please try again later');
					return setTimeout(() => updateElement(statusmsg, ''), 3000)
				})
		} }, 'Update Task'),
		assignto: project => html('select', { name: 'assignto', 'data-id': project.projectitemid }, project.users.concat({ name: 'Not Assigned', userid: 0 })
			.reverse().map(user => html('option', { value: user.userid, selected: user.userid === project.assignto }, user.name)))
	};

const attachStyle = (parent = document.head) => {
	const style = html('link', { rel: 'stylesheet', href: '../project.css' });

	if (parent) parent.append(style);

	return style;
};

flow(
	ajax({ path: 'users/checktoken', data: creds }),
	([login]) => {
		if (login.ok) return flow(
			ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
			project => updateElement(container, [html('h1', {}, project[0].name), table(project, renderers, headers, '', '')])
		)
		return location = '/login.html'
	}
);

attachStyle();