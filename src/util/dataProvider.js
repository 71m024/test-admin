import { fetchUtils } from 'react-admin'
import { stringify } from 'query-string'
import { ENTRYPOINT }  from '../config/entrypoint'

const httpClient = fetchUtils.fetchJson
const cachedToken = undefined

const isIri = v => typeof v === 'string' && v.includes('/')
const iriToPlainId = iri => (typeof iri === 'string') && isIri(iri) ?  iri.split('/').at(-1) : iri
const extractIriPrefix = iri => isIri(iri) ? iri.split('/').slice(0,-1).join('/') + '/' : ''
const addTokenToParams = params => {
    if (!params.headers) {
        params.headers = new Headers({ Accept: 'application/json' })
    }
    const { token } = cachedToken ? { token : cachedToken } : JSON.parse(localStorage.getItem('auth'))
    params.headers.set('Authorization', `Bearer ${token}`)
    return params
}

const dataProvider = {
    getList: (resource, params) => {
        const { page, perPage } = params.pagination
        const { field, order } = params.sort
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        }
        const url = `${ENTRYPOINT}/${resource}?${stringify(query)}`
        params = addTokenToParams(params)
        return httpClient(url, params).then(({ headers, json }) => ({
            data: json,
            total: 10,
        }))
    },

    getOne: (resource, params) => {

        /**
         * This is only needed because of api-platform which wants to send IRI's.
         * If api-platform would sende plain-id's this wouldn't be needed.
         */
        params.id = iriToPlainId(params.id)

        params = addTokenToParams(params)
        return httpClient(`${ENTRYPOINT}/${resource}/${params.id}`, params).then(({ json }) => ({
            data: json,
        }))
    },

    getMany: (resource, params) => {

        /**
         * This is only needed because of api-platform which wants to send IRI's.
         * If api-platform would sende plain-id's this wouldn't be needed.
         */
        const iriPrefix = params.ids.length > 0 ? extractIriPrefix(params.ids[0]) : ''
        params.ids = params.ids.map(v => iriToPlainId(v))

        const query = {
            filter: JSON.stringify({ id: params.ids }),
        }
        const url = `${ENTRYPOINT}/${resource}?${stringify(query)}`
        params = addTokenToParams(params)
        return httpClient(url, params).then(({ json }) => ({
            data: json.map(resource => ({ ...resource, id: iriPrefix + resource.id }) )
        }))
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination
        const { field, order } = params.sort
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        }
        const url = `${ENTRYPOINT}/${resource}?${stringify(query)}`

        params = addTokenToParams(params)
        return httpClient(url, params).then(({ headers, json }) => ({
            data: json,
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }))
    },

    update: (resource, params) => {
        params = addTokenToParams(params)
        params.method = 'PUT'
        params.body = JSON.stringify(params.data)
        return httpClient(`${ENTRYPOINT}/${resource}/${params.id}`, params)
            .then(({ json }) => ({ data: json }))
    },


    updateMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        }
        params = addTokenToParams(params)
        params.method = 'PUT'
        params.body = JSON.stringify(params.data)
        return httpClient(`${ENTRYPOINT}/${resource}?${stringify(query)}`, params)
            .then(({ json }) => ({ data: json }))
    },

    create: (resource, params) => {
        params = addTokenToParams(params)
        params.method = 'POST'
        params.body = JSON.stringify(params.data)
        return httpClient(`${ENTRYPOINT}/${resource}`, params)
            .then(({ json }) => ({data: { ...params.data, id: json.id }}))
    },

    delete: (resource, params) => {
        params = addTokenToParams(params)
        params.method = 'DELETE'
        return httpClient(`${ENTRYPOINT}/${resource}/${params.id}`, params)
            .then(({ json }) => ({ data: json }))
    },

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        }
        params = addTokenToParams(params)
        params.method = 'DELETE'
        return httpClient(`${ENTRYPOINT}/${resource}?${stringify(query)}`, params)
            .then(({ json }) => ({ data: json }))
    }
}

export default dataProvider