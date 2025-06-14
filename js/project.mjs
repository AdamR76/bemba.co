/* eslint-disable id-length */
import { flow, html, querySelect, searchQuery, updateElement } from './std.mjs';

import ajax from './ajax.mjs';
import { taskform } from './utils/utils.mjs';

const [container] = querySelect('.container'),
    [statusmsg] = querySelect('.statusmsg');

const creds = localStorage.login ? JSON.parse(localStorage.login) : {};

const { pid, t } = searchQuery;

const attachStyle = (parent = document.head) => {
    const style = html('link', { rel: 'stylesheet', href: '../project.css' });

    if (parent) parent.append(style);

    return style;
};

flow(
    ajax({ path: 'users/checktoken', data: creds }),
    ([login]) => {
        if (login?.ok) return flow(
            ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
            project => project[0]?.name ? updateElement(container, [
                html('h1', {}, project[0].name),
                taskform(project)
            ])
                : updateElement(container, html('p', {}, 'No tasks yet'))
        )
        return location = '/login.html'
    }
).catch(err => {
    statusmsg.classList.add('error')
    updateElement(statusmsg, 'Something went wrong. Please try logging in again')
    console.error(err)
});

attachStyle();