<template>
   <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="action-btn">
      <slot name="buttons"></slot>
    </div>
   </div>
</template>

<script setup lang="ts">
 const props = defineProps({
  title: {
    type: String,
    default: '知识库'
  }
 })
</script>

<style scoped lang="scss">
.page-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
  .page-title{
    font-size: 20px;
    font-weight: bold;
    color: #303133;
  }
  .action-btn{
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
