import ajax from "./ajax.mjs";
import { flow } from "./std.mjs";

const creds = JSON.parse(localStorage.login);

flow(
	ajax({ path: 'user/login', data: creds }),
	([login]) => login.ok ? '' : location = '/'
).catch(console.error)