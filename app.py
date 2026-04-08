from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)

# 配置静态文件服务
app.static_folder = 'static'
app.static_url_path = '/static'

# 为bqb文件夹添加静态文件路由
from flask import send_from_directory

@app.route('/bqb/<path:filename>')
def serve_bqb(filename):
    return send_from_directory('bqb', filename)

# 初始化默认OpenAI客户端
def create_client(api_key, base_url):
    return OpenAI(
        api_key=api_key,
        base_url=base_url,
    )

# 默认客户端
default_client = create_client(
    "sk-6621a79cba0846058e4e6ff54d9e54e4",
    "https://dashscope.aliyuncs.com/compatible-mode/v1"
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        # 获取模型配置
        api_keys = data.get('apiKeys', ["sk-6621a79cba0846058e4e6ff54d9e54e4"])
        api_endpoint = data.get('apiEndpoint', "https://dashscope.aliyuncs.com/compatible-mode/v1")
        model_name = data.get('modelName', "qwen3-max")
        
        # 获取对话历史
        messages = data.get('messages', [{"role": "user", "content": message}])
        
        # 尝试使用每个API密钥
        for api_key in api_keys:
            try:
                # 创建客户端
                client = create_client(api_key, api_endpoint)
                
                # 调用API
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=4096,
                    temperature=0.7,
                    extra_body={"enable_thinking": False},
                    stream=False
                )
                
                response = completion.choices[0].message.content
                return jsonify({'response': response})
            except Exception as e:
                # 记录错误但继续尝试下一个密钥
                print(f"API key {api_key} failed: {str(e)}")
                continue
        
        # 所有密钥都失败
        return jsonify({'error': 'All API keys failed. Please check your configuration.'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)