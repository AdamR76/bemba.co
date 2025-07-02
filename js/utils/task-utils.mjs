/* eslint-disable id-length */
import { flow, html, querySelect, searchQuery, updateElement } from "../std.mjs";

import ajax from "../ajax.mjs";
import { taskform } from "./utils.mjs";

const [statusmsg] = querySelect('.statusmsg'),
	[projectContainer] = querySelect('.container'),
	creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const { pid, t } = searchQuery;

const state = {};

const draw = () => flow(
	ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
	project => updateElement(projectContainer, taskform(project)),
	() => querySelect('.addtheform')[0].reset()
).catch(err => {
	console.error(err);
	statusmsg.classList.add('error');
	updateElement(statusmsg, 'Something went wrong. Please try again later.')
})

const buttons = project => html('button', {
	onclick: evt => {
		evt.preventDefault();
		state.delete = evt.target.value;
		console.log(state);
		const [deleteContainer] = querySelect(`.project${state.delete}`);
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
						console.error(err);
						statusmsg.classList.add('error');
						return updateElement(statusmsg, 'Something went wrong. Please try again later.')
					})
				}
			},
				'Delete'
			)
		]
		)
	},
	value: project.projectitemid,
	className: 'btn',
},
	'Delete Task'
);

export { buttons }