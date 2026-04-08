<template>
  <div class="skills-container">
    <el-card class="skills-card">
      <template #header>
        <div class="card-header">
          <span>技能管理</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item><router-link to="/">首页</router-link></el-breadcrumb-item>
            <el-breadcrumb-item>技能管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </template>
      
      <div class="skills-content">
        <SkillManager />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import SkillManager from '../../components/business/SkillManager.vue'
</script>

<style scoped>
.skills-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.skills-card {
  border-radius: 8px;
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

.skills-content {
  margin: -20px;
}
</style>
