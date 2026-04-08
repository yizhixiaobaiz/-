const express = require('express');
const router = express.Router();

// 导入OpenAI客户端
const { OpenAI } = require('openai');

// 处理AI聊天请求
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory, modelConfig } = req.body;
    
    // 验证必要参数
    if (!message || !modelConfig || !modelConfig.apiKeys || modelConfig.apiKeys.length === 0) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 从聊天历史中提取消息，确保角色正确
    const messages = chatHistory
      .filter(item => item.content && item.content.trim()) // 过滤掉空内容的消息
      .map(item => ({
        role: item.role === 'ai' ? 'assistant' : item.role,
        content: item.content
      }));
    
    // 如果没有有效的消息，添加当前消息
    if (messages.length === 0) {
      messages.push({
        role: 'user',
        content: message
      });
    }
    
    // 尝试使用每个API密钥
    let lastError;
    for (const apiKey of modelConfig.apiKeys) {
      try {
        // 创建OpenAI客户端
        const client = new OpenAI({
          apiKey: apiKey,
          baseURL: modelConfig.apiBase || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        });
        
        // 调用API
        const completion = await client.chat.completions.create({
          model: modelConfig.modelName || 'qwen3-max',
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7,
          extra_body: { "enable_thinking": false },
          stream: false
        });
        
        // 返回成功响应
        return res.json({
          response: completion.choices[0].message.content
        });
      } catch (error) {
        lastError = error;
        console.error('API key failed:', apiKey, error.message);
        // 继续尝试下一个API密钥
        continue;
      }
    }
    
    // 如果所有API密钥都失败，返回更详细的错误信息
    return res.status(401).json({
      error: lastError ? `API调用失败: ${lastError.message}` : '所有API密钥都失败，请检查API密钥配置'
    });
    
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      error: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;