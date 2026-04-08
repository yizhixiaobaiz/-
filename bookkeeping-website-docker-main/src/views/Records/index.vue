<template>
  <div class="records-container">
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
    
    <h1>记账记录</h1>
    <RecordList />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Document, DataAnalysis, Setting } from '@element-plus/icons-vue'
import RecordList from '../../components/business/RecordList.vue'
import Login from '../../components/business/Login.vue'

// 路由实例
const router = useRouter()
const activeMenu = ref('/records') // 当前激活的导航项

// 处理导航点击
const handleNavClick = (index) => {
  console.log('导航点击:', index)
  activeMenu.value = index
}
</script>

<style scoped>
.records-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
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

.records-container h1 {
  text-align: center;
  color: #303133;
  margin: 20px 0;
  font-size: 24px;
}

@media (max-width: 768px) {
  .records-container h1 {
    font-size: 20px;
    margin: 15px 0;
  }
}
</style>