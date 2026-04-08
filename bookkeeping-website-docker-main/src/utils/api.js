const API_BASE_URL = '/api'

// 获取存储的 token
const getToken = () => {
  return localStorage.getItem('token')
}

// 设置 token
const setToken = (token) => {
  localStorage.setItem('token', token)
}

// 移除 token
const removeToken = () => {
  localStorage.removeItem('token')
}

// 通用请求方法
const request = async (url, options = {}) => {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  console.log('发起 API 请求:', {
    url: `${API_BASE_URL}${url}`,
    method: options.method || 'GET',
    headers,
    body: options.body
  })
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    })
    
    console.log('收到 API 响应:', {
      status: response.status,
      ok: response.ok
    })
    
    // 先检查响应是否为空
    const text = await response.text()
    console.log('响应文本:', text)
    
    const data = text ? JSON.parse(text) : {}
    
    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`)
    }
    
    console.log('解析后的数据:', data)
    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// 认证相关 API
const authAPI = {
  // 用户注册
  register: async (username, password) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    
    if (data.success && data.data.token) {
      setToken(data.data.token)
    }
    
    return data
  },
  
  // 用户登录
  login: async (username, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    
    if (data.success && data.data.token) {
      setToken(data.data.token)
    }
    
    return data
  },
  
  // 验证令牌
  verify: async () => {
    return request('/auth/verify')
  },
  
  // 退出登录
  logout: () => {
    removeToken()
  }
}

// 记录相关 API
const recordAPI = {
  // 获取所有记录
  getAll: async () => {
    return request('/records')
  },
  
  // 添加记录
  add: async (record) => {
    return request('/records', {
      method: 'POST',
      body: JSON.stringify(record)
    })
  },
  
  // 更新记录
  update: async (id, record) => {
    return request(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record)
    })
  },
  
  // 删除记录
  delete: async (id) => {
    return request(`/records/${id}`, {
      method: 'DELETE'
    })
  },
  
  // 获取统计数据
  getStats: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return request(`/records/stats?${params.toString()}`)
  }
}

// 分类相关 API
const categoryAPI = {
  // 获取所有分类
  getAll: async () => {
    return request('/categories')
  },
  
  // 添加分类
  add: async (name, type) => {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, type })
    })
  },
  
  // 更新分类
  update: async (id, name, type) => {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, type })
    })
  },
  
  // 删除分类
  delete: async (id) => {
    return request(`/categories/${id}`, {
      method: 'DELETE'
    })
  }
}

export default {
  auth: authAPI,
  record: recordAPI,
  category: categoryAPI,
  getToken,
  setToken,
  removeToken
}
