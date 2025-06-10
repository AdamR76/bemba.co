import { flow, html, querySelect, searchQuery, updateElement } from "../std.mjs";

import ajax from "../ajax.mjs";
import table from "../table.mjs";

const [statusmsg] = querySelect('.statusmsg'),
	[projectContainer] = querySelect('.container'),
	creds = localStorage.login ? JSON.parse(localStorage.login) : {};

	const { pid, t } = searchQuery;

const state = {};

const draw = () => flow(
	ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
	project => updateElement(projectContainer, [html('h1', {}, project[0].name), table(project, renderers, headers, '', '')]),
	() => querySelect('.addtheform')[0].reset()
).catch(err => {
	console.error(err);
	statusmsg.classList.add('error');
	updateElement(statusmsg, 'Something went wrong. Please try again later.')
})

const buttons = project => html('button', {
	onclick: evt => {
		evt.preventDefault();
		state.delete = evt.target.dataset.id;
		console.log(state);
		const [deleteContainer] = querySelect(`[data-project='${state.delete}']`);
		return state.delete && updateElement(deleteContainer, [
			html('button', {
				className: 'btn',
				onclick: evt => {
					evt.preventDefault();
					delete state.delete;
					updateElement(deleteContainer, buttons(project))
				}

			},
				'Cancel'
			),
			html('button', {
				className: 'btn',
				onclick: evt => {
					evt.preventDefault();
					flow(
						ajax({ path: 'projects/deleteitem', data: { itemid: state.delete } }),
						() => delete state.delete,
						() => draw()
					).catch(err => {
						console.error(err),
						statusmsg.classList.add('error');
						updateElement(statusmsg, 'Something went wrong. Please try again later.')
					})
				}
			},
				'Delete'
			)
		]
		)
	},
	'data-id': project.projectitemid,
	className: 'btn',
},
	'Delete Task'
);

const renderers = {
		phases: project => html('select', { name: 'phase', 'data-id': project?.projectitemid }, project.phases.map(phase => html('option', { value: phase.phaseid, selected: phase.phaseid === project.phaseid }, phase.phase))),
		duedate: project => html('input', { type: 'date', defaultValue: project?.duedate?.split('T')[0], name: 'duedate', 'data-id': project?.projectitemid }),
		title: project => html('input', { type: 'text', name: 'title', value: project?.title, 'data-id': project?.projectitemid }),
		description: project => html('textarea', { name: 'description', value: project?.description, 'data-id': project?.projectitemid }),
		update: project => html('button', {
			className: 'btn', value: project.projectitemid, onclick: evt => {
				evt.preventDefault();
				const rowid = evt.target.value,
					values = Object.assign(Object.fromEntries(querySelect(`[data-id='${rowid}']`)
						.map(val => [val.name, val.name === 'assignto' && val.value === '0' ? null : val.value])), { rowid });



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
			}
		}, 'Update'),
		assignto: project => html('select', { name: 'assignto', 'data-id': project.projectitemid }, project.users.concat({ name: 'Not Assigned', userid: 0 })
			.reverse().map(user => html('option', { value: user.userid, selected: user.userid === project.assignto }, user.name))),
		delete: project => html('div', { className: 'deleteContainer flex row around', 'data-project': project.projectitemid },
			buttons(project))
	};

export { renderers, buttons }