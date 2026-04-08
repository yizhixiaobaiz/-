<template>
  <div class="settings-container">
    <!-- 顶部导航栏 -->
    <div class="nav-container">
      <el-menu :default-active="activeMenu" class="nav-menu" mode="horizontal" router @select="handleNavClick">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Document /></el-icon>
          <span>记录</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
      <Login />
    </div>
    
    <h1>设置</h1>
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
        </div>
      </template>
      <div class="category-management">
        <h3>支出分类</h3>
        <el-button type="primary" size="small" @click="addCategory('expense')">添加分类</el-button>
        <el-list>
          <el-list-item v-for="category in expenseCategories" :key="category.id">
            <div class="category-item">
              <span>{{ category.name }}</span>
              <div class="category-actions">
                <el-button size="small" @click="editCategory(category)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCategory(category.id)">删除</el-button>
              </div>
            </div>
          </el-list-item>
        </el-list>
        
        <h3 style="margin-top: 30px;">收入分类</h3>
        <el-button type="primary" size="small" @click="addCategory('income')">添加分类</el-button>
        <el-list>
          <el-list-item v-for="category in incomeCategories" :key="category.id">
            <div class="category-item">
              <span>{{ category.name }}</span>
              <div class="category-actions">
                <el-button size="small" @click="editCategory(category)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCategory(category.id)">删除</el-button>
              </div>
            </div>
          </el-list-item>
        </el-list>
      </div>
    </el-card>
    
    <el-card class="setting-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      <ImportExport />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Document, DataAnalysis, Setting } from '@element-plus/icons-vue'
import ImportExport from '../../components/business/ImportExport.vue'
import Login from '../../components/business/Login.vue'

// 路由实例
const router = useRouter()
const activeMenu = ref('/settings') // 当前激活的导航项

// 处理导航点击
const handleNavClick = (index) => {
  console.log('导航点击:', index)
  activeMenu.value = index
}

const expenseCategories = ref([
  { id: 1, name: '餐饮' },
  { id: 2, name: '交通' },
  { id: 3, name: '购物' },
  { id: 4, name: '娱乐' },
  { id: 5, name: '其他' }
])

const incomeCategories = ref([
  { id: 1, name: '工资' },
  { id: 2, name: '奖金' },
  { id: 3, name: '投资' },
  { id: 4, name: '其他' }
])

const addCategory = (type) => {
  console.log('添加分类:', type)
}

const editCategory = (category) => {
  console.log('编辑分类:', category)
}

const deleteCategory = (id) => {
  console.log('删除分类:', id)
}

const exportData = () => {
  console.log('导出数据')
}

const importData = () => {
  console.log('导入数据')
}

const clearData = () => {
  console.log('清空数据')
}
</script>

<style scoped>
.settings-container {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  margin-bottom: 20px;
}

.nav-menu {
  flex: 1;
  background-color: transparent;
  box-shadow: none;
}

.setting-card {
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.category-actions {
  display: flex;
  gap: 10px;
}

.data-management {
  display: flex;
  gap: 10px;
}
</style>