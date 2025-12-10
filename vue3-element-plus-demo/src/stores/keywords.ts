import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useKeyWordsStore = defineStore('keyLogin', () => {
  const keyWords = ref()

  function search(key:string) {
    keyWords.value = key
  }

  return { keyWords,search }
})
