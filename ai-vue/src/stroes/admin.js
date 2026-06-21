
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const isCollapse = ref(false)
  const toggleIsCollapse = () => {
    isCollapse.value = !isCollapse.value
  }
  return {
    isCollapse,
    toggleIsCollapse
  }


})
export default useAdminStore