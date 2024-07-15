import { ReadableStream } from 'web-streams-polyfill/ponyfill/es6'; // 如果你的环境不支持ReadableStream，可能需要这个polyfill

interface Props {
  key: string;
  message: string;
  api: string;
}

const chatHandler = async ({ api, key, message }: Props): Promise<any> => {
  let responses = {
    st: 'error',
    data: 'error'
  };

  try {
    const response = await fetch(api + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 1,
        max_tokens: 250
      })
    });

    if (response.body) {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
          reader.releaseLock();
        }
      });

      // 从stream中读取数据
      const data = await new Response(stream).json();
      responses = {
        st: 'success',
        data
      };
    }
  } catch (error) {
    console.error('Error calling the chat API:', error);
    responses = {
      st: 'error',
      data: error
    };
  }

  return responses;
}

export default chatHandler;
