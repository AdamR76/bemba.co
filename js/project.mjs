import { flow, html, querySelect, searchQuery, updateElement } from './std.mjs';
import { headers, renderers } from './utils/tableInfo.mjs';

import ajax from './ajax.mjs';
import table from './table.mjs'

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
		if (login.ok) return flow(
			ajax({ path: 'projects/getproject', data: { token: creds.token, t, pid } }),
			project => updateElement(container, [html('h1', {}, project[0].name), table(project, renderers, headers, '', '')])
		)
		return location = '/login.html'
	}
);

attachStyle();