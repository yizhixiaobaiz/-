<template>
  <div class="ai-chat-container">
    <div class="ai-chat-header">
      <h3>AI智能助手</h3>
      <div class="header-buttons">
        <el-button type="primary" size="small" @click="openSkillManager">
          技能管理
        </el-button>
        <el-button type="primary" size="small" @click="openModelConfig">
          切换模型
        </el-button>
      </div>
    </div>
    
    <div class="chat-content">
      <div class="chat-main">
        <div class="chat-messages" id="chat-messages">
          <div v-for="(message, index) in chatHistory" :key="index" :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
            {{ message.content }}
          </div>
          <div v-if="isLoading" class="message loading-message">
            AI正在思考...
          </div>
        </div>
        
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            placeholder="输入你的问题..."
            :disabled="isLoading"
            @keyup.enter="sendMessage"
            @keyup.enter.shift="addNewline"
          ></el-input>
          <div class="button-group">
            <el-button 
              type="primary" 
              @click="sendMessage"
              :disabled="isLoading || !inputMessage.trim()"
            >
              发送
            </el-button>
            <el-button 
              type="danger" 
              @click="stopGeneration"
              :disabled="!isLoading"
            >
              停止
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- AI萌宠 -->
      <div class="ai-pet-container">
        <div class="ai-pet">
          <img 
            :src="petImage" 
            alt="AI萌宠"
            class="pet-image"
          >
          <div class="pet-name">AI萌宠</div>
        </div>
      </div>
    </div>
    

    
    <!-- 模型配置弹窗 -->
    <el-dialog
      v-model="modelConfigVisible"
      title="切换模型配置"
      width="400px"
    >
      <el-form :model="modelConfig" label-width="80px">
        <el-form-item label="API Keys">
          <div v-for="(key, index) in modelConfig.apiKeys" :key="index" class="api-key-item">
            <el-input
              v-model="modelConfig.apiKeys[index]"
              placeholder="输入API Key"
              style="margin-bottom: 8px"
            ></el-input>
            <el-button 
              type="danger" 
              size="small"
              @click="removeApiKey(index)"
              :disabled="modelConfig.apiKeys.length <= 1"
            >
              删除
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addApiKey">
            添加API Key
          </el-button>
        </el-form-item>
        <el-form-item label="API 端点">
          <el-input
            v-model="modelConfig.apiBase"
            placeholder="输入API端点"
          ></el-input>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input
            v-model="modelConfig.modelName"
            placeholder="输入模型名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modelConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="saveModelConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 技能管理弹窗 -->
    <el-dialog
      v-model="skillManagerVisible"
      title="技能管理"
      width="600px"
    >
      <div class="skill-manager-container">
        <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <el-button type="primary" size="small" @click="addSkill">
            添加技能
          </el-button>
          <label style="display: inline-block;">
            <input 
              type="file" 
              ref="zipFileInput" 
              accept=".zip,.skill" 
              @change="handleFileSelect"
              style="display: none"
            >
            <el-button 
              type="warning" 
              size="small" 
              :loading="isUploading"
              @click="zipFileInput?.click()"
              style="background-color: #f59e0b; border-color: #f59e0b; color: white;"
            >
              📦 导入skill.zip技能包
            </el-button>
          </label>
        </div>
        
        <el-table :data="userSkills" style="width: 100%">
          <el-table-column prop="name" label="技能名称" width="180" />
          <el-table-column prop="description" label="技能描述" />
          <el-table-column prop="keywords" label="关键词" width="200">
            <template #default="scope">
              <span>{{ scope.row.keywords.join(', ') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="editSkill(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteSkill(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 技能编辑弹窗 -->
      <el-dialog
        v-model="skillEditVisible"
        :title="editingSkill.id ? '编辑技能' : '添加技能'"
        width="400px"
      >
        <el-form :model="editingSkill" label-width="80px">
          <el-form-item label="技能名称">
            <el-input v-model="editingSkill.name" placeholder="输入技能名称" />
          </el-form-item>
          <el-form-item label="技能描述">
            <el-input
              v-model="editingSkill.description"
              placeholder="输入技能描述"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="editingSkill.keywordsText"
              placeholder="输入关键词，用逗号分隔"
            />
            <span class="form-tip">提示：关键词用于AI识别用户意图，如"查询天气"、"添加任务"等</span>
          </el-form-item>
          <el-form-item label="技能代码">
            <el-input
              v-model="editingSkill.code"
              placeholder="输入技能执行代码"
              type="textarea"
              :rows="5"
            />
            <span class="form-tip">提示：使用JavaScript代码实现技能逻辑，返回处理结果</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="skillEditVisible = false">取消</el-button>
            <el-button type="primary" @click="saveSkill">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 聊天历史
const chatHistory = ref([])

// 从本地存储加载聊天历史
const loadChatHistory = () => {
  const savedHistory = localStorage.getItem('aiChatHistory')
  if (savedHistory) {
    try {
      const parsedHistory = JSON.parse(savedHistory)
      if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
        chatHistory.value = parsedHistory
        return
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }
  }
  // 如果没有保存的历史或加载失败，使用默认消息
  chatHistory.value = [
    {
      role: 'ai',
      content: '你好！我是AI智能助手，你可以：\n- 查询记账数据："查看本月支出"\n- 添加交易记录："添加一笔餐饮支出100元"\n- 分析财务状况："分析我的消费习惯"\n- 普通聊天："你好吗？"'
    }
  ]
}

// 保存聊天历史到本地存储
const saveChatHistory = () => {
  localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory.value))
}

// 输入消息
const inputMessage = ref('')

// 加载状态
const isLoading = ref(false)

// 模型配置
const modelConfigVisible = ref(false)
const modelConfig = ref({
  apiKeys: ['sk-6621a79cba0846058e4e6ff54d9e54e4'],
  apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  modelName: 'qwen3-max'
})

// 技能管理
const skillManagerVisible = ref(false)
const skillEditVisible = ref(false)
const userSkills = ref([])
const editingSkill = ref({
  id: '',
  name: '',
  description: '',
  keywords: [],
  keywordsText: '',
  code: ''
})
const isUploading = ref(false)
const zipFileInput = ref(null)

// 触发文件选择
const triggerZipUpload = () => {
  zipFileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    handleZipUpload({ raw: file })
  }
  // 清空 input 以便重复选择同一文件
  event.target.value = ''
}

// 从本地存储加载技能
const loadSkills = () => {
  const savedSkills = localStorage.getItem('aiUserSkills')
  if (savedSkills) {
    try {
      const parsedSkills = JSON.parse(savedSkills)
      if (Array.isArray(parsedSkills)) {
        userSkills.value = parsedSkills
      }
    } catch (error) {
      console.error('加载技能失败:', error)
    }
  }
  
  // 如果没有技能，添加默认技能
    if (userSkills.value.length === 0) {
      const defaultSkills = [
        {
          id: '1',
          name: '查询天气',
          description: '查询指定城市的天气信息',
          keywords: ['天气', '气温', '下雨', '晴天', '预报'],
          code: 'const match = message.match(/(北京|上海|广州|深圳|杭州|成都|武汉|西安|海南)/); const city = match ? match[0] : "未知城市"; return "今天" + city + "的天气晴朗，气温25℃，适合外出活动。"'
        },
        {
          id: '2',
          name: '添加任务',
          description: '添加新的待办任务',
          keywords: ['添加任务', '待办', 'todo', '任务'],
          code: 'const task = message.replace(/添加任务|待办|todo|任务/, "").trim(); return "已添加任务: " + task'
        },
        {
          id: '3',
          name: '计算',
          description: '执行数学计算',
          keywords: ['计算', '加', '减', '乘', '除', '等于'],
          code: 'const expression = message.replace(/计算|等于/, "").trim(); try { const result = eval(expression); return "计算结果: " + expression + " = " + result; } catch (e) { return "计算表达式错误，请检查输入。"; }'
        }
      ]
      userSkills.value = defaultSkills
      saveSkills()
    }
}

// 保存技能到本地存储
const saveSkills = () => {
  localStorage.setItem('aiUserSkills', JSON.stringify(userSkills.value))
}

// 打开技能管理
const openSkillManager = () => {
  loadSkills()
  skillManagerVisible.value = true
}

// 添加技能
const addSkill = () => {
  editingSkill.value = {
    id: Date.now().toString(),
    name: '',
    description: '',
    keywords: [],
    keywordsText: '',
    code: ''
  }
  skillEditVisible.value = true
}

// 编辑技能
const editSkill = (skill) => {
  editingSkill.value = {
    ...skill,
    keywordsText: skill.keywords.join(', ')
  }
  skillEditVisible.value = true
}

// 保存技能
const saveSkill = () => {
  // 验证表单
  if (!editingSkill.value.name) {
    ElMessage.warning('请输入技能名称')
    return
  }
  
  // 处理关键词
  const keywords = editingSkill.value.keywordsText
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword)
  
  const skillData = {
    ...editingSkill.value,
    keywords
  }
  
  // 移除临时字段
  delete skillData.keywordsText
  
  // 检查是添加还是编辑
  const index = userSkills.value.findIndex(s => s.id === skillData.id)
  if (index === -1) {
    // 添加新技能
    userSkills.value.push(skillData)
  } else {
    // 更新现有技能
    userSkills.value[index] = skillData
  }
  
  // 保存到本地存储
  saveSkills()
  
  // 关闭弹窗
  skillEditVisible.value = false
  ElMessage.success('技能保存成功')
}

// 删除技能
const deleteSkill = (id) => {
  userSkills.value = userSkills.value.filter(skill => skill.id !== id)
  saveSkills()
  ElMessage.success('技能删除成功')
}

// 技能判断逻辑
const detectSkill = (message) => {
  for (const skill of userSkills.value) {
    for (const keyword of skill.keywords) {
      if (message.includes(keyword)) {
        return skill
      }
    }
  }
  return null
}

// 执行技能
const executeSkill = (skill, message) => {
  try {
    // 创建一个安全的执行环境
    const skillContext = {
      message,
      console: console
    }
    
    // 执行技能代码
    const result = eval(`(function() { ${skill.code} })()`)
    return result
  } catch (error) {
    console.error('执行技能失败:', error)
    return `执行技能时发生错误: ${error.message}`
  }
}

// 解析YAML格式的SKILL.md文件
const parseSkillMd = (content) => {
  try {
    const skillData = {
      name: '',
      description: '',
      keywords: [],
      code: ''
    }
    
    // 尝试提取YAML部分（---之间的内容）
    const yamlMatch = content.match(/^---[\s\S]*?---/m)
    if (yamlMatch) {
      const yamlContent = yamlMatch[0].replace(/^---|---$/g, '').trim()
      
      // 解析YAML
      const yamlLines = yamlContent.split('\n')
      let currentField = null
      let multiLineValue = ''
      
      for (const line of yamlLines) {
        const trimmedLine = line.trim()
        if (trimmedLine.includes(':')) {
          if (currentField) {
            // 保存上一个多字段值
            skillData[currentField] = multiLineValue.trim()
          }
          
          const [key, ...valueParts] = trimmedLine.split(':')
          const keyLower = key.trim().toLowerCase()
          const value = valueParts.join(':').trim()
          
          if (keyLower === 'name') {
            skillData.name = value
            currentField = null
          } else if (keyLower === 'description') {
            skillData.description = value
            currentField = null
          } else if (keyLower === 'keywords') {
            if (value) {
              skillData.keywords = value.split(',').map(k => k.trim())
            }
            currentField = null
          } else if (keyLower === 'code') {
            currentField = 'code'
            multiLineValue = ''
          }
        } else if (currentField) {
          // 处理多行代码（包括空行）
          multiLineValue += line + '\n'
        }
      }
      
      // 保存最后一个字段
      if (currentField) {
        skillData[currentField] = multiLineValue.trim()
      }
    }
    
    // 提取Markdown中的指令部分作为代码
    if (!skillData.code) {
      const markdownContent = content.replace(/^---[\s\S]*?---/m, '').trim()
      if (markdownContent) {
        skillData.code = markdownContent
      }
    }
    
    // 如果没有从YAML中提取到名称，尝试从Markdown中提取
    if (!skillData.name) {
      const nameMatch = content.match(/^#\s+(.*)$/m)
      if (nameMatch) {
        skillData.name = nameMatch[1].trim()
      }
    }
    
    // 如果没有从YAML中提取到描述，尝试从Markdown中提取
    if (!skillData.description) {
      const lines = content.split('\n')
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line && !line.startsWith('#') && !line.startsWith('---')) {
          skillData.description = line
          break
        }
      }
    }
    
    return skillData
  } catch (error) {
    console.error('解析SKILL.md失败:', error)
    return null
  }
}

// 处理zip文件上传
const handleZipUpload = async (fileObj) => {
  const file = fileObj.raw
  if (!file) return
  
  // 检查文件类型
  if (!file.name.endsWith('.zip') && !file.name.endsWith('.skill')) {
    ElMessage.warning('请上传zip或skill格式的文件')
    return
  }
  
  // 检查文件大小 (最大 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.warning('文件大小超过10MB限制')
    return
  }
  
  isUploading.value = true
  
  try {
    // 读取zip文件
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // 动态加载JSZip库
        const JSZipModule = await import('jszip')
        const JSZip = JSZipModule.default
        const zip = new JSZip()
        
        // 解析zip文件
        const zipContent = await zip.loadAsync(e.target.result)
        
        // 提取技能文件
        const skills = []
        
        // 遍历zip文件中的所有文件
        for (const [filename, zipFile] of Object.entries(zipContent.files)) {
          if (!zipFile.dir) {
            // 支持大小写不敏感的SKILL.md文件
            const lowerFilename = filename.toLowerCase()
            if (lowerFilename === 'skill.md' || lowerFilename.endsWith('/skill.md')) {
              // 读取SKILL.md文件
              const content = await zipFile.async('string')
              const skillData = parseSkillMd(content)
              
              // 验证技能数据结构
              if (skillData && (skillData.name || skillData.description)) {
                // 生成唯一ID
                skillData.id = Date.now().toString() + Math.floor(Math.random() * 1000)
                // 确保keywords是数组
                if (!Array.isArray(skillData.keywords)) {
                  skillData.keywords = []
                }
                skills.push(skillData)
              }
            } else if (filename.endsWith('.json')) {
              // 读取JSON文件（保持向后兼容）
              const content = await zipFile.async('string')
              const skillData = JSON.parse(content)
              
              // 验证技能数据结构
              if (skillData.name && skillData.description && skillData.keywords && skillData.code) {
                // 生成唯一ID
                skillData.id = Date.now().toString() + Math.floor(Math.random() * 1000)
                skills.push(skillData)
              }
            }
          }
        }
        
        if (skills.length > 0) {
          // 添加到技能库
          userSkills.value.push(...skills)
          // 保存到本地存储
          saveSkills()
          ElMessage.success(`成功导入 ${skills.length} 个技能`)
        } else {
          ElMessage.warning('未找到有效的技能文件（SKILL.md或.json）')
        }
      } catch (error) {
        console.error('解析zip文件失败:', error)
        ElMessage.error('解析zip文件失败: ' + error.message)
      } finally {
        isUploading.value = false
      }
    }
    reader.onerror = () => {
      ElMessage.error('读取文件失败')
      isUploading.value = false
    }
    reader.readAsArrayBuffer(file)
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + error.message)
    isUploading.value = false
  }
}

// AI萌宠图片
const petImage = ref('/bqb/Q版企鹅服少女表情包生成.png')

// 超时定时器
let timeoutTimer = null
let abortController = null

// 情绪与图片映射
const emotionImages = {
  happy: '/bqb/Q版企鹅服少女表情包生成 (1).png',
  sad: '/bqb/Q版企鹅服少女表情包生成 (2).png',
  angry: '/bqb/Q版企鹅服少女表情包生成 (3).png',
  thinking: '/bqb/Q版企鹅服少女表情包生成 (4).png',
  surprised: '/bqb/Q版企鹅服少女表情包生成 (5).png'
}

// 从本地存储加载配置
const loadModelConfig = () => {
  const savedConfig = localStorage.getItem('aiModelConfig')
  if (savedConfig) {
    try {
      const parsedConfig = JSON.parse(savedConfig)
      // 验证配置格式
      if (parsedConfig.apiKeys && Array.isArray(parsedConfig.apiKeys) && parsedConfig.apiBase && parsedConfig.modelName) {
        modelConfig.value = parsedConfig
      } else {
        console.error('配置格式错误，使用默认配置')
        // 保留默认配置
      }
    } catch (error) {
      console.error('加载配置失败，使用默认配置:', error)
      // 保留默认配置
    }
  }
}

// 保存配置到本地存储
const saveModelConfig = () => {
  localStorage.setItem('aiModelConfig', JSON.stringify(modelConfig.value))
  modelConfigVisible.value = false
  ElMessage.success('模型配置已保存')
}

// 添加API Key
const addApiKey = () => {
  modelConfig.value.apiKeys.push('')
}

// 移除API Key
const removeApiKey = (index) => {
  if (modelConfig.value.apiKeys.length > 1) {
    modelConfig.value.apiKeys.splice(index, 1)
  }
}

// 打开模型配置
const openModelConfig = () => {
  loadModelConfig()
  modelConfigVisible.value = true
}

// 自动滚动到最新消息
const scrollToBottom = () => {
  setTimeout(() => {
    const chatMessages = document.getElementById('chat-messages')
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }, 100)
}

// 发送消息
const sendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return
  
  // 添加用户消息到聊天历史
  chatHistory.value.push({ role: 'user', content: message })
  inputMessage.value = ''
  isLoading.value = true
  
  // 自动滚动到最新消息
  scrollToBottom()
  
  // 显示AI正在思考的状态
  updatePetEmotion('thinking')
  
  // 设置超时定时器
  timeoutTimer = setTimeout(() => {
    if (isLoading.value) {
      ElMessage.warning('模型可能已断开或token已耗尽，请检查配置后重试')
      isLoading.value = false
      updatePetEmotion('sad')
      scrollToBottom()
    }
  }, 30000)
  
  try {
    // 检测是否匹配技能
    const matchedSkill = detectSkill(message)
    
    if (matchedSkill) {
      // 执行技能
      const skillResult = executeSkill(matchedSkill, message)
      // 添加技能执行结果到聊天历史
      chatHistory.value.push({ role: 'ai', content: skillResult })
      // 更新AI萌宠情绪
      updatePetEmotion('happy')
      // 自动滚动到最新消息
      scrollToBottom()
    } else {
      // 调用AI模型
      abortController = new AbortController()
      
      // 检查API Key是否有效
      if (!modelConfig.value.apiKeys || !modelConfig.value.apiKeys[0]) {
        throw new Error('请在模型配置中设置有效的API Key')
      }
      
      // 发送请求到后端API
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${modelConfig.value.apiKeys[0]}`
          },
          body: JSON.stringify({
            message: message,
            chatHistory: chatHistory.value,
            modelConfig: modelConfig.value
          }),
          signal: abortController.signal,
          timeout: 25000 // 设置25秒超时
        })
        
        // 清除超时定时器
        clearTimeout(timeoutTimer)
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('API Key无效或已过期，请检查配置')
          } else if (response.status === 504) {
            throw new Error('后端服务超时，请稍后重试')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        
        const data = await response.json()
        
        if (data.response) {
          // 添加AI回复到聊天历史
          chatHistory.value.push({ role: 'ai', content: data.response })
          // 更新AI萌宠情绪
          updatePetEmotion(analyzeEmotion(data.response))
          // 自动滚动到最新消息
          scrollToBottom()
        } else if (data.error) {
          chatHistory.value.push({ role: 'ai', content: `错误: ${data.error}` })
          updatePetEmotion('sad')
          scrollToBottom()
        }
      } catch (apiError) {
        if (apiError.name === 'AbortError') {
          throw apiError
        } else if (apiError.name === 'TypeError' && apiError.message.includes('Failed to fetch')) {
          throw new Error('无法连接到后端服务，请检查网络连接和服务状态')
        } else {
          throw apiError
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      chatHistory.value.push({ role: 'ai', content: `错误: ${error.message}` })
      updatePetEmotion('sad')
      scrollToBottom()
    }
  } finally {
    isLoading.value = false
    // 清除超时定时器
    clearTimeout(timeoutTimer)
  }
}

// 停止生成
const stopGeneration = () => {
  if (abortController) {
    abortController.abort()
    isLoading.value = false
    chatHistory.value.push({ role: 'ai', content: '生成已停止' })
    updatePetEmotion('surprised')
    // 清除超时定时器
    clearTimeout(timeoutTimer)
  }
}

// 添加换行
const addNewline = (event) => {
  inputMessage.value += '\n'
}

// 分析情绪
const analyzeEmotion = (text) => {
  if (text.includes('好的') || text.includes('可以') || text.includes('很高兴') || text.includes('开心')) {
    return 'happy'
  } else if (text.includes('抱歉') || text.includes('无法') || text.includes('错误') || text.includes('失败')) {
    return 'sad'
  } else if (text.includes('生气') || text.includes('愤怒') || text.includes('不满')) {
    return 'angry'
  } else if (text.includes('思考') || text.includes('考虑') || text.includes('想')) {
    return 'thinking'
  } else if (text.includes('惊讶') || text.includes('惊喜') || text.includes('没想到')) {
    return 'surprised'
  } else {
    return 'happy'
  }
}

// 更新宠物情绪
const updatePetEmotion = (emotion) => {
  petImage.value = emotionImages[emotion] || '/bqb/Q版企鹅服少女表情包生成.png'
}

// 监听聊天历史变化，自动保存
watch(chatHistory, () => {
  saveChatHistory()
}, { deep: true })

// 组件挂载时加载配置、聊天历史和技能
onMounted(() => {
  loadModelConfig()
  loadChatHistory()
  loadSkills()
  // 初始加载时滚动到最新消息
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #000000;
  color: white;
  z-index: 10;
}

.ai-chat-header h3 {
  margin: 0;
  font-size: 18px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.skill-manager-container {
  padding: 10px 0;
}

.skill-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.upload-zip {
  display: inline-block;
}

.upload-zip .el-button {
  white-space: nowrap;
}

.form-tip {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.chat-content {
  flex: 1;
  display: flex;
  padding: 20px;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #1a1a1a;
  border: 1px solid #d4af37;
  border-radius: 8px;
}

.message {
  margin-bottom: 15px;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;
}

.user-message {
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #d4af37;
  align-self: flex-end;
  margin-left: 50px;
}

.ai-message {
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #d4af37;
  align-self: flex-start;
  margin-right: 50px;
}

.loading-message {
  color: #d4af37;
  font-style: italic;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area .el-input {
  flex: 1;
}

.input-area .el-input__inner {
  background-color: #2a2a2a;
  border: 1px solid #d4af37;
  color: white;
}

.input-area .el-input__inner::placeholder {
  color: #999999;
}

.button-group {
  display: flex;
  gap: 10px;
}

.ai-pet-container {
  width: 200px;
  padding: 20px;
  background-color: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ai-pet {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  animation: bounce 2s infinite, pulse 2s infinite;
  transition: transform 0.3s ease;
}

.pet-image:hover {
  transform: scale(1.1);
}

.pet-name {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.api-key-item {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.api-key-item .el-input {
  flex: 1;
}

/* 动画效果 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #f4d03f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-chat-container {
    flex-direction: column;
  }
  
  .ai-pet-container {
    width: 100%;
    height: 200px;
    flex-direction: row;
  }
  
  .pet-image {
    width: 100px;
    height: 100px;
  }
}
</style>