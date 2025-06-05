import { flow, html, querySelect, searchQuery, updateElement } from './std.mjs';

import ajax from './ajax.mjs';
import { buttons } from './utils/tableInfo.mjs';

const [container] = querySelect('.container'),
    [statusmsg] = querySelect('.statusmsg');

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const { pid, t } = searchQuery;

const attachStyle = (parent = document.head) => {
    const style = html('link', { rel: 'stylesheet', href: '../project.css' });

    if (parent) parent.append(style);

    return style;
};

const drawTasks = project => {
    return html('div', {
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
        ondrop: evt => {
            evt.preventDefault();
            const sourceId = evt.dataTransfer.getData('text/plain');
            const targetId = evt.currentTarget.dataset.projectitemid;

            if (sourceId !== targetId) {

                console.log('data:', {
                    sourceId,
                    targetId,
                    pid
                })
                // flow(
                //     ajax({ 
                //         path: 'projects/updatetaskorder', 
                //         data: { 
                //             sourceId,
                //             targetId,
                //             pid
                //         } 
                //     }),
                //     ([res]) => {
                //         if (res.status === 'ok') {
                //             statusmsg.classList.add('success');
                //             updateElement(statusmsg, 'Task order updated');
                //             setTimeout(() => updateElement(statusmsg, ''), 3000);
                //         }
                //     }
                // ).catch(err => {
                //     console.error(err);
                //     statusmsg.classList.add('error');
                //     updateElement(statusmsg, 'Failed to update task order');
                //     setTimeout(() => updateElement(statusmsg, ''), 3000);
                // });
            }
        }
    }, [
        html('label', {}, [
            'Task Title',
            html('input', { type: 'text', value: project.title, name: 'title' })
        ]),
        html('label', {}, [
            'Task Description',
            html('input', { type: 'text', value: project.description, name: 'description' })
        ]),
        html('label', {}, [
            'Phase',
            html('select', { name: 'phase', 'data-id': project?.projectitemid }, project.phases.map(phase => html('option', { value: phase.phaseid, selected: phase.phaseid === project.phaseid }, phase.phase)))
        ]),
        html('label', {}, [
            'Due',
            html('input', { type: 'date', defaultValue: project?.duedate?.split('T')[0], name: 'duedate', 'data-id': project?.projectitemid }),
        ]),
        html('label', {}, [
            'Assign To',
            html('select', { name: 'assignto', 'data-id': project.projectitemid }, project.users.concat({ name: 'Not Assigned', userid: 0 }).reverse().map(user => html('option', { value: user.userid, selected: user.userid === project.assignto }, user.name))),
        ]),
        html('button', {
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
        html('div', { className: 'deleteContainer flex row around', 'data-project': project.projectitemid },
            buttons(project))
    ]);
};

flow(
    ajax({ path: 'users/checktoken', data: creds }),
    ([login]) => {
        if (login.ok) return flow(
            ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
            project => updateElement(container, [html('h1', {}, project[0].name), html('div', { draggable: true }, project.map(drawTasks))])
        )
        return location = '/login.html'
    }
);

attachStyle();