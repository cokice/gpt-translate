// useApi.js
const useApi = (): { api: string, key: string } => {
  // 如果是客户端
  if (typeof window !== 'undefined') {
    // 不推荐在客户端直接使用 API key
    return {
      api: localStorage.getItem('gpt-translate-api') ?? 'https://api.openai.com/v1/',
      key: ''
    }
  } else {
    // 服务器端，从环境变量中获取 API 信息
    return {
      api: process.env.GPT_API_URL ?? '',
      key: process.env.GPT_API_KEY ?? ''
    }
  }
}

export default useApi;
