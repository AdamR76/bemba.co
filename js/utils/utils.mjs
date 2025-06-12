import { flow, html, querySelect, searchQuery, updateElement } from "../std.mjs";

import ajax from "../ajax.mjs";
import { buttons } from "./task-utils.mjs";
import { drawMetrics } from "./metrics.mjs";

const [container] = querySelect('.container');

const { pid, t } = searchQuery;
const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const chunk = (arr, size) => {
	if (!arr.length) return [];
	const head = arr.slice(0, size);
	const tail = arr.slice(size);
	return [head, ...chunk(tail, size)];
};

const onSubmit = (evt, fn) => {
	evt.preventDefault();
	const values = chunk(
			querySelect('.taskform input, .taskform textarea, .taskform select')
					.map(el => ({ [el.name]: el.value })), 7)
			.map((el, idx) => Object.assign(...el, { weight: idx + 1, pid }));
	console.log({ values, pid, creds })
	flow(
			ajax({ path: 'projects/updatetasks', data: { values, creds } }),
			() => ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
			project => updateElement(container, fn(project))
	)
};


const taskform = project => html('form', 
	{ draggable: true, onsubmit: evt => onSubmit(evt, taskform), className: 'taskform' },
	[drawMetrics(project), ...grouper(project).map(drawTasks), html('button', { type: 'submit', className: 'btn' }, 'Update Tasks')].flat(Infinity));


const drawTasks = projects => {
	const [{ projectcat }] = projects;
	return html('details', { open: true }, [html('summary', {}, projectcat), ...projects.map(project => html('div', {
		className: 'flex row flexwrap task',
		draggable: true,
		'data-projectitemid': project.projectitemid,
		ondragstart: evt => {
			evt.dataTransfer.setData('text/plain', project.projectitemid);
			evt.target.classList.add('dragging');
		},
		ondragend: evt => {
			evt.target.classList.remove('dragging');
		},
		ondragover: evt => {
			evt.preventDefault();
			const draggingElement = document.querySelector('.dragging');
			const targetElement = evt.currentTarget;
			if (draggingElement && targetElement !== draggingElement) {
				const rect = targetElement.getBoundingClientRect();
				const midY = rect.top + rect.height / 2;
				if (evt.clientY < midY) {
					targetElement.parentNode.insertBefore(draggingElement, targetElement);
				} else {
					targetElement.parentNode.insertBefore(draggingElement, targetElement.nextSibling);
				}
			}
		},
		ondrop: evt => evt.preventDefault(),
	}, [
		html('div', { className: 'flex column' }, [
			html('label', {}, [
				'Task Title',
				html('input', { type: 'text', value: project.title, name: 'title' })
			]),
			html('label', {}, [
				'Task Description',
				html('textarea', { value: project.description, name: 'description' })
			]),
			html('div', { className: 'deleteContainer flex row around', 'data-project': project.projectitemid },
				buttons(project))
		]),
		html('div', {}, [
			html('label', {}, [
				'Phase',
				html('select', { name: 'phase', 'data-id': project?.projectitemid }, project.phases.map(phase =>
					html('option', { value: phase.phaseid, selected: phase.phaseid === project.phaseid }, phase.phase)))
			]),
			html('label', {}, [
				'Due',
				html('input', {
					type: 'date', defaultValue: project?.duedate?.split('T')[0],
					name: 'duedate', 'data-id': project?.projectitemid
				}),
			]),
			html('label', {}, [
				'Assign To',
				html('select', { name: 'assignto', 'data-id': project.projectitemid },
					project.users.concat({ name: 'Not Assigned', userid: 0 })
						.reverse().map(user =>
							html('option', { value: user.userid, selected: user.userid === project.assignto }, user.name))),
			]),
			html('input', { type: 'hidden', name: 'projectitemid', value: project.projectitemid }),
			html('input', { type: 'hidden', name: 'projectcatid', value: project.projectcatid })
		]),
	]))]);
};

const grouper = tasks => {
	const groupedCats = new Map();
	tasks.forEach(task => {
		const { projectcatid } = task;
		if (!groupedCats.has(projectcatid)) {
			groupedCats.set(projectcatid, []);
		}
		groupedCats.get(projectcatid).push(task);
	});

	return Array.from(groupedCats.values());

}



export {
	chunk,
	drawTasks,
	grouper,
	taskform
}

