<template>
  <div class="ai-container">
    <el-card class="ai-card">
      <template #header>
        <div class="card-header">
          <span>AI智能助手</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item><router-link to="/">首页</router-link></el-breadcrumb-item>
            <el-breadcrumb-item>AI助手</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
      
      <div class="ai-content">
        <AIChat />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import AIChat from '../../components/business/AIChat.vue'
</script>

<style scoped>
.ai-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.ai-card {
  height: calc(100vh - 80px);
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: bold;
}

.ai-content {
  height: calc(100% - 60px);
  overflow: hidden;
}
</style>