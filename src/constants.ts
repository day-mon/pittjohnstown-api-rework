import axios from "axios";

export const client = axios.create()
client.interceptors.request.use((config) => {
    if (config.headers === undefined) return
    config.headers['request-startTime'] = new Date().getTime();
    config.headers['User-Agent'] = "Pitt Johnstown Unofficial API"
    return config
})

client.interceptors.response.use((response) => {
    const currentTime = new Date().getTime()
    if (response.config.headers === undefined) return
    const startTime = response.config.headers['request-startTime'] as number
    console.log(`${response.config.method?.toUpperCase()} Request to [${response.config.url}] took: ${String(currentTime - startTime)} ms`)
    return response
})
