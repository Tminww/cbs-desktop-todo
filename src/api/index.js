export const api = {
  sendPing: async () => {
    console.log('send ping')
    const response = await window.backend.sendPing('ping')
    console.log(response)
  },

  saveFile: async (args) => {
    console.log('save', args)
    return await window.backend.saveFile(args)
  },
  openFile: async (args) => {
    console.log('load', args)
    const response = await window.backend.openFile(args)
    return response
  },
}
