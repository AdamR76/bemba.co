import { flow, html, querySelect, updateElement } from './std.mjs'

import ajax from './ajax.mjs';

const [container] = querySelect('.container');

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const showProjects = projects => html('ul', {}, projects.map(project => html('li', {}, html('a', { href: `project.html?pid=${project.projectid}&t=${project.token}` }, project.name))))

flow(
	ajax({ path: 'users/checktoken', data: creds }),
	([login]) => {
		if (login.ok) return flow(
			ajax({ path: 'projects/getprojects', data: { token: creds.token } }),
			projects => updateElement(container, showProjects(projects))
		)
		return location = '/login.html'
	}
);
