<template>
  <el-dialog
    :model-value="visible"
    @close="$emit('close')"
    title="编辑收支记录"
    width="400px"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="收支类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio-button label="income">收入</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="金额" prop="amount">
        <el-input
          v-model="form.amount"
          type="number"
          placeholder="请输入金额"
          @input="handleAmountInput"
        />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类">
          <el-option
            v-for="category in currentCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          placeholder="请输入备注"
          rows="2"
        />
      </el-form-item>
      
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const formRef = ref(null)
const form = ref({
  type: 'expense',
  amount: null,
  category: '',
  note: '',
  date: new Date()
})

// 分类数据
const categories = {
  income: [
    { label: '工资', value: '工资' },
    { label: '奖金', value: '奖金' },
    { label: '投资', value: '投资' },
    { label: '其他', value: '其他' }
  ],
  expense: [
    { label: '餐饮', value: '餐饮' },
    { label: '交通', value: '交通' },
    { label: '购物', value: '购物' },
    { label: '娱乐', value: '娱乐' },
    { label: '其他', value: '其他' }
  ]
}

// 当前类型对应的分类
const currentCategories = computed(() => {
  return categories[form.value.type] || []
})

// 验证规则
const rules = {
  type: [
    { required: true, message: '请选择收支类型', trigger: 'change' }
  ],
  amount: [
    { 
      required: true, 
      validator: (rule, value, callback) => {
        if (!value || value <= 0) {
          callback(new Error('金额必须大于0'))
        } else {
          callback()
        }
      }, 
      trigger: ['blur', 'input']
    }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 监听record变化，更新表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    form.value = {
      ...newRecord,
      amount: newRecord.amount,
      date: new Date(newRecord.datetime || newRecord.date)
    }
  }
}, { immediate: true, deep: true })

// 监听收支类型变化，更新分类
watch(() => form.value.type, (newType) => {
  const categoryList = categories[newType]
  if (categoryList && categoryList.length > 0) {
    form.value.category = categoryList[0].value
  }
})

// 处理金额输入
const handleAmountInput = (value) => {
  form.value.amount = parseFloat(value) || null
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const editedRecord = {
      ...form.value,
      id: props.record.id
    }
    
    emit('submit', editedRecord)
    emit('close')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>