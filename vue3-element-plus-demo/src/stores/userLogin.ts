import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserLoginStore = defineStore('userLogin', () => {
  const username = ref()

  function login(uname:string) {
    username.value = uname
  }

  return { username,login }
},{
  persist:{
    key:'userInfo',
    storage: localStorage
  }
})
