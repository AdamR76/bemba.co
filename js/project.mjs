import { flow, html, querySelect, searchQuery, updateElement } from './std.mjs';

import ajax from './ajax.mjs';
import table from './table.mjs'

const [container] = querySelect('.container');

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
		phases: project => html('select', { name: 'phase' }, project.phases.map(phase => html('option', { value: phase.phaseid, selected: phase.phaseid === project.phaseid }, phase.phase))),
		duedate: project => html('input', { type: 'date', defaultValue: project.duedate.split('T')[0] }),
		title: project => html('input', { type: 'text', name: 'title', value: project.title }),
		description: project => html('textarea', { name: 'description', value: project.description }),
		update: project => html('button', { className: 'btn', value: project.projectitemid }, 'Update Task'),
		assignto: project => html('select', { name: 'assignto' }, project.users.concat({ name: 'Not Assigned', userid: 0 }).map(user => html('option', { value: user.userid, selected: user.userid === project.assignto || user.userid === 0 }, user.name)))
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