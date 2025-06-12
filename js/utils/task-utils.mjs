import { drawTasks, grouper, taskform } from "./utils.mjs";
import { flow, html, querySelect, searchQuery, updateElement } from "../std.mjs";

import ajax from "../ajax.mjs";

const [statusmsg] = querySelect('.statusmsg'),
	[projectContainer] = querySelect('.container'),
	creds = localStorage.login ? JSON.parse(localStorage.login) : {};

	const { pid, t } = searchQuery;

const state = {};

const draw = () => flow(
	ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
	project => updateElement(projectContainer, [html('h1', {}, project[0].name), 
	taskform(project)]),
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
					return flow(
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

export { buttons }