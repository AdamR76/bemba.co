import { flow, formData, html, querySelect, updateElement, waitAll } from './std.mjs'

import ajax from './ajax.mjs';

const [container] = querySelect('.container');

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const showProjects = projects =>
	html('ul', {}, projects.map(project =>
		html('li', {}, html('a', { href: `project.html?pid=${project.projectid}&t=${project.token}` }, project.name))));

const addNewProject = users => html('form', {
	onsubmit: evt => {
		evt.preventDefault();
		const values = formData(evt.target),
			users = Object.keys(values).map(Number).filter(Boolean).map(user => values[user] && user);
		const projectdata = Object.assign(values, { users });
		console.log(projectdata)
		return flow(
			ajax({ path: 'projects/addproject', data: projectdata }),
			({ projectid, token }) => location = `/project.html?pid=${projectid}&t=${token}`,
		).catch(console.error)
	}
}, [
	html('label', {}, [
		'Project Name',
		html('input', { type: 'text', name: 'projectname', required: true })
	]),
	html('label', { className: 'flex column' }, [
		'Users',
		...users.map(user => html('span', {}, [html('input', { type: 'checkbox', name: user.userid }), user.name]))
	]),
	html('button', { className: 'btn' }, 'Create Project')
]);

flow(
	ajax({ path: 'users/checktoken', data: creds }),
	([login]) => {
		if (login.ok) return flow(
			Promise.all([
				ajax({ path: 'projects/getprojects', data: { token: creds.token } }),
				ajax({ path: 'projects/getallusers', data: {} })
			]),
			waitAll,
			([projects, users]) =>
				updateElement(container, [
					showProjects(projects),
					html('h2', {}, 'Add New Project'),
					addNewProject(users)
				])
		)
		return location = '/login.html'
	}
).catch(err => {
	console.error(err);
	return location = '/login.html'
});
