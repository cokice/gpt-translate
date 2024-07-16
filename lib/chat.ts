interface Props {
  key: string;
  message: string;
  api: string;
}

const chatHandler = async ({ api, key, message }: Props, onStream: (content: string) => void): Promise<void> => {
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
        max_tokens: 2500,
        stream: true // 启用流式传输
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedResult = '';

    while (true) {
      const { done, value } = await reader?.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedResult += chunk;

      // Process each complete JSON message in the accumulated result
      while (accumulatedResult.indexOf('\n') !== -1) {
        const newlineIndex = accumulatedResult.indexOf('\n');
        const line = accumulatedResult.slice(0, newlineIndex).trim();
        accumulatedResult = accumulatedResult.slice(newlineIndex + 1);

        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6); // Remove "data: "
          if (jsonStr.trim() === "[DONE]") {
            onStream(''); // Signal the end of the stream
            break;
          }

          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices[0]?.delta?.content || '';
            if (content) {
              onStream(content);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
    }
  } catch (error) {
    onStream(`Error: ${error.message}`);
  }
}

export default chatHandler;
