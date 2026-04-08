<template>
  <div class="skill-manager-page">
    <div class="page-header">
      <h2>技能管理中心</h2>
      <p>管理和导入你的AI技能包</p>
    </div>

    <div class="content-wrapper">
      <el-card class="action-card">
        <div class="action-section">
          <div class="action-item">
            <div class="action-icon">📦</div>
            <div class="action-info">
              <h3>导入技能包</h3>
              <p>上传ZIP格式的技能包文件</p>
            </div>
            <div class="action-button">
              <input 
                type="file" 
                ref="zipFileInput" 
                accept=".zip" 
                @change="handleFileSelect"
                style="display: none"
              >
              <el-button 
                type="primary" 
                :loading="isUploading"
                @click="zipFileInput?.click()"
                size="large"
              >
                {{ isUploading ? '⏳ 导入中...' : '📦 选择skill.zip' }}
              </el-button>
            </div>
          </div>
          
          <div class="action-item">
            <div class="action-icon">➕</div>
            <div class="action-info">
              <h3>添加新技能</h3>
              <p>手动创建自定义技能</p>
            </div>
            <div class="action-button">
              <el-button type="success" @click="openAddSkill" size="large">
              ➕ 添加技能
            </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="skills-card">
        <template #header>
          <div class="card-header">
            <span>已安装技能 ({{ userSkills.length }})</span>
            <el-button type="info" size="small" @click="loadSkills">
              🔄 刷新
            </el-button>
          </div>
        </template>
        
        <el-table 
          :data="userSkills" 
          style="width: 100%"
          v-loading="isLoading"
        >
          <el-table-column prop="name" label="技能名称" width="180" />
          <el-table-column prop="description" label="技能描述" />
          <el-table-column prop="keywords" label="关键词" width="200">
            <template #default="scope">
              <el-tag 
                v-for="(keyword, index) in scope.row.keywords" 
                :key="index"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ keyword }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
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
      </el-card>
    </div>

    <!-- 技能编辑弹窗 -->
    <el-dialog
      v-model="skillEditVisible"
      :title="editingSkill.id ? '编辑技能' : '添加技能'"
      width="500px"
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
            :rows="6"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const userSkills = ref([])
const isLoading = ref(false)
const isUploading = ref(false)
const skillEditVisible = ref(false)
const zipFileInput = ref(null)

const editingSkill = ref({
  id: '',
  name: '',
  description: '',
  keywords: [],
  keywordsText: '',
  code: ''
})

const loadSkills = () => {
  isLoading.value = true
  try {
    const savedSkills = localStorage.getItem('aiUserSkills')
    if (savedSkills) {
      const parsedSkills = JSON.parse(savedSkills)
      if (Array.isArray(parsedSkills)) {
        userSkills.value = parsedSkills
      }
    }
    
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
  } catch (error) {
    console.error('加载技能失败:', error)
    ElMessage.error('加载技能失败')
  } finally {
    isLoading.value = false
  }
}

const saveSkills = () => {
  localStorage.setItem('aiUserSkills', JSON.stringify(userSkills.value))
}

const openAddSkill = () => {
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

const editSkill = (skill) => {
  editingSkill.value = {
    ...skill,
    keywordsText: skill.keywords.join(', ')
  }
  skillEditVisible.value = true
}

const saveSkill = () => {
  if (!editingSkill.value.name) {
    ElMessage.warning('请输入技能名称')
    return
  }
  
  const keywords = editingSkill.value.keywordsText
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword)
  
  const skillData = {
    ...editingSkill.value,
    keywords
  }
  
  delete skillData.keywordsText
  
  const index = userSkills.value.findIndex(s => s.id === skillData.id)
  if (index === -1) {
    userSkills.value.push(skillData)
  } else {
    userSkills.value[index] = skillData
  }
  
  saveSkills()
  skillEditVisible.value = false
  ElMessage.success('技能保存成功')
}

const deleteSkill = (id) => {
  userSkills.value = userSkills.value.filter(skill => skill.id !== id)
  saveSkills()
  ElMessage.success('技能删除成功')
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
    ElMessage.warning('请上传zip格式的文件')
    return
  }
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.warning('文件大小超过10MB限制')
    return
  }
  
  isUploading.value = true
  
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const JSZipModule = await import('jszip')
        const JSZip = JSZipModule.default
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(e.target.result)
        
        const skills = []
        
        for (const [filename, zipFile] of Object.entries(zipContent.files)) {
          if (filename.endsWith('.json') && !zipFile.dir) {
            const content = await zipFile.async('string')
            const skillData = JSON.parse(content)
            
            if (skillData.name && skillData.description && skillData.keywords && skillData.code) {
              skillData.id = Date.now().toString() + Math.floor(Math.random() * 1000)
              skills.push(skillData)
            }
          }
        }
        
        if (skills.length > 0) {
          userSkills.value.push(...skills)
          saveSkills()
          ElMessage.success(`成功导入 ${skills.length} 个技能`)
        } else {
          ElMessage.warning('未找到有效的技能文件')
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
  
  event.target.value = ''
}

onMounted(() => {
  loadSkills()
})
</script>

<style scoped>
.skill-manager-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 32px;
  margin: 0 0 10px 0;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.action-card {
  margin-bottom: 20px;
}

.action-section {
  display: flex;
  gap: 20px;
}

.action-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.action-icon {
  font-size: 48px;
}

.action-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.action-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.action-button {
  margin-left: auto;
}

.skills-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: bold;
  font-size: 16px;
}

.form-tip {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
