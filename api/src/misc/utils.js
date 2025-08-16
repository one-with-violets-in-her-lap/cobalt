import { request } from "undici";
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

export async function getRedirectingURL(url, dispatcher, headers) {
    const params = {
        dispatcher,
        method: 'HEAD',
        headers,
        redirect: 'manual'
    };
    const getParams = {
        ...params,
        method: 'GET',
    };

    const callback = (r) => {
        if (redirectStatuses.has(r.statusCode) && r.headers['location']) {
            return r.headers['location'];
        }
    }

    /*
        try request() with HEAD & GET,
        then do the same with fetch
        (fetch is required for shortened reddit links)
    */

    let location = await request(url, params)
        .then(callback).catch(() => null);

    location ??= await request(url, getParams)
        .then(callback).catch(() => null);

    location ??= await fetch(url, params)
        .then(callback).catch(() => null);

    location ??= await fetch(url, getParams)
        .then(callback).catch(() => null);

    return location;
}

export function merge(a, b) {
    for (const k of Object.keys(b)) {
        if (Array.isArray(b[k])) {
            a[k] = [...(a[k] ?? []), ...b[k]];
        } else if (typeof b[k] === 'object') {
            a[k] = merge(a[k], b[k]);
        } else {
            a[k] = b[k];
        }
    }

    return a;
}

/**
 * Splits array into chunks
 *
 * @template TItem
 * @param {TItem[]} items - The array of items to be split into chunks
 * @param {number} chunkSize - The maximum size of each chunk. Must be greater than 0
 * @returns {TItem[][]} An array of chunks
 * @throws {Error} Throws an error if `chunkSize` is less than or equal to 0
 */
export function getChunked(items, chunkSize) {
    const chunks = []

    if (chunkSize <= 0) {
	throw new Error('Chunk size must be greater than 0')
    }

    for (let index = 0; index < items.length; index += chunkSize) {
	chunks.push(items.slice(index, index + chunkSize))
    }

    return chunks
}

export function splitFilenameExtension(filename) {
    const parts = filename.split('.');
    const ext = parts.pop();

    if (!parts.length) {
        return [ ext, "" ]
    } else {
        return [ parts.join('.'), ext ]
    }
}

export function zip(a, b) {
    return a.map((value, i) => [ value, b[i] ]);
}

export function isURL(input) {
    try {
        new URL(input);
        return true;
    } catch {
        return false;
    }
}
