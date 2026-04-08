<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加收支记录"
    width="500px"
    @close="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
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
          prefix-icon="el-icon-money"
          @input="handleAmountInput"
        />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-select
          v-model="form.category"
          placeholder="请选择分类"
        >
          <el-option
            v-for="category in currentCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          placeholder="请输入备注"
          rows="3"
        />
      </el-form-item>
      
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
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
  }
})

const emit = defineEmits(['close', 'submit'])

const dialogVisible = ref(props.visible)
const formRef = ref(null)

const form = ref({
  type: 'expense',
  amount: null,
  category: '',
  note: '',
  date: new Date()
})

const rules = {
  type: [
    { required: true, message: '请选择收支类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: ['blur', 'input'] },
    { type: 'number', message: '请输入正确的金额', trigger: ['blur', 'input'] },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('请输入金额'))
        } else if (Number(value) <= 0) {
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

const currentCategories = computed(() => {
  return categories[form.value.type]
})

// 监听收支类型变化，重置分类
watch(() => form.value.type, (newVal) => {
  form.value.category = ''
})

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('close')
    resetForm()
  }
})

const resetForm = () => {
  form.value = {
    type: 'expense',
    amount: '',
    category: '',
    note: '',
    date: new Date()
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleAmountInput = (value) => {
  // 确保金额是数字类型
  if (value === '') {
    form.value.amount = null
  } else {
    form.value.amount = Number(value)
  }
  // 触发验证
  if (formRef.value) {
    formRef.value.validateField('amount')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    console.log('表单验证通过，准备提交数据:', form.value)
    
    const transaction = {
      ...form.value,
      amount: Number(form.value.amount), // 确保金额是数字类型
      date: form.value.date.toISOString().split('T')[0]
    }
    
    console.log('提交的交易数据:', transaction)
    emit('submit', transaction)
    console.log('已触发submit事件')
    dialogVisible.value = false
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