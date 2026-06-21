<template>
  <el-form :model="formData"  ref="ruleFormRef">
    <el-row :gutter="24">
       <template v-for="item in formItemAttrs" :key="item.prop">
        <!-- 表单项 -->
        <el-col v-bind="item.col">
           <el-form-item :label="item.label" :prop="item.prop">
             <!-- 使用 v-if 替代 component 以确保 slot (el-option) 渲染更可靠 -->
             <el-input 
               v-if="item.comp === 'input'"
               v-model="formData[item.prop]"
               :placeholder="item.placeholder"
             />
             <el-select 
               v-else-if="item.comp === 'select'"
               v-model="formData[item.prop]"
               :placeholder="item.placeholder"
               style="width: 100%"
             >
               <el-option label="全部" value=""/>
               <el-option
                v-for="option in item.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
               />
             </el-select>
           </el-form-item>
        </el-col>
    
    </template>
    </el-row>
<!-- 按钮行 -->
    <el-row>
       <el-button type="primary" @click="handleSearch">查询</el-button>
    <el-button type="primary" @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
  
   
  </el-form>
</template>

<script setup>
import { ref, reactive ,computed} from 'vue'
const props=defineProps({
  formItem:{
    type:Array,
    default:()=>[]
  }
})
const emit=defineEmits(['search','reset'])
const formItemAttrs=computed(()=>{
  const {formItem}=props
  formItem.forEach(item=>{
    item.col={xs:24,sm:12,md:8,lg:6,xl:6}
  })
  return formItem
})


// 表单数据对象
const formData=reactive({})
// 表单引用
const ruleFormRef = ref()

const isComp=(comp)=>{
  return{
    input:'el-input',
    select:'el-select'
  }[comp]
}
//查询方法
const handleSearch=()=>{
  console.log(formData,'查询');
  emit('search',formData)
}

// 重置表单
const handleReset=(formEl)=>{
   if(!formEl) return
   formEl.resetFields()
  emit('reset',formData)
}
</script>
