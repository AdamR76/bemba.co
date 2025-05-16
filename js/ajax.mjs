import { urAjax } from "./std.mjs";

const ajaxUrl = location.hostname.includes('local')
? 'http://bemba.ajax.localhost:1338'
: 'bemba.ajax';

const ajax = urAjax(ajaxUrl, { expandSingleResultSet: false });

export default ajax;