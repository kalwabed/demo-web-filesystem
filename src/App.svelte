<script>
import { onMount } from 'svelte'
import { init } from 'pell'

let fileContent = ''
let isNewFile = false
let newFilenameInput = ''
let files = []
let editor = null
let selectedFilename = ''

async function getFileHandle(name, props) {
  const dirHandle = await getDirHandle()
  const fileHandle = await dirHandle.getFileHandle(name, props)

  return fileHandle
}

async function getDirHandle(props) {
  const opfsRoot = await navigator.storage.getDirectory()
  const dirHandle = await opfsRoot.getDirectoryHandle('main', {create:true, ...props})

  return dirHandle
}

async function createFile() {
  if (!newFilenameInput) {
    toggleInputFilename()
    return
  }

  const fileHandle = await getFileHandle(newFilenameInput,{create: true})
  await showListOfFile()
  toggleInputFilename()
  newFilenameInput = ''
  
  return fileHandle
}

async function showListOfFile() {
  const dirHandle = await getDirHandle()
  const arr=[]

  for await (let name of dirHandle.keys()) {
    arr.push(name)
  }

  files = arr
}

async function getFile(name) {
  const fileHandle = await getFileHandle(name??newFilenameInput)
  const file = await fileHandle.getFile()
  
  return file
}

async function writeToFile() {
  const file = await getFileHandle(selectedFilename)
  const writable = await file.createWritable()

  await writable.write(fileContent)
  await writable.close()

  alert('File saved!')
}

async function showFileContent(name) {
  selectedFilename = name
  const file = await getFile(name)
  const text= await file.text()

  fileContent = text
  editor.content.innerHTML = text
}

function toggleInputFilename() {
  selectedFilename = ''
  if (!isNewFile) {
    setTimeout(() => {
      document.getElementById('input-filename').focus()
    }, 50)
  }
  isNewFile = !isNewFile
}

async function deleteFile() {
  const file = await getFileHandle(selectedFilename)
  await file.remove()
  alert('File has been removed!')
  selectedFilename = ''
  await showListOfFile()
}

onMount(async ()=> {
  editor = init({
    element: document.getElementById('pell'),
    onChange: html => {
      fileContent = html
    },
    styleWithCSS: true,
    actions: [
      'bold',
      'italic',
      'code',
      'underline',
      'strikethrough',
    ]
  })

  await showListOfFile()
})
</script>

<main class="flex mt10 max-w-screen-xl mx-auto h-420px">
  <div class="b b-gray3 mr8 rd shadow w-35rem">
    <div class="flex py3 px2 justify-between">
        <button class:hidden={isNewFile} class="py1 px4 bg-gray50 b b-gray3 hover:bg-gray2 c-gray9 rd transition font-semibold text-sm" on:click={toggleInputFilename}>New file</button>
        <button class:hidden={!selectedFilename} class="py1 px4 bg-red6 b b-red7 hover:bg-red8 c-red1 rd transition font-semibold text-sm" on:click={deleteFile}>Delete</button>
        <input class:hidden={!isNewFile} on:keydown={key=>key.code === 'Enter' ? createFile():null} bind:value={newFilenameInput} class="wfull py1 px2 b rd outline-none focus:ring-2" id="input-filename" placeholder="New file name" />
  </div>
    <ul class="flex flex-col b-t b-t-gray3">
      {#if files.length === 0}
      	<p class="c-gray text-sm mx-auto py8">Empty</p>
      {/if}
      {#each files as filename}
        <li >
          <button class={`p2 wfull text-left hover:bg-pink3 transition c-pink9 inline-flex items-center gap2 ${selectedFilename === filename ? 'bg-pink2 hover:bg-pink-3' : ''}`} on:click={()=>showFileContent(filename)}><i class="i-ph:file block"/> {filename}</button>
        </li>
      {/each}
    </ul>
  </div>
  <div class="b b-gray-3 rd shadow p4 wfull hfull">
    <p class:hidden={selectedFilename} class="c-gray text-center text-sm">Here we go. Welcome!!</p>
    <div class:hidden={!selectedFilename}>
      <div id="pell" class="shadow b b-gray2"></div>
      <div class="flex items-center gap4 pt4">
        <button class="bg-zinc2 px4 py1 font-semibold text-sm b b-zinc3 rd text-center c-zinc9 hover:bg-zinc3 transition" on:click={() => selectedFilename = ''}>Cancel</button>
        <button class="bg-blue2 px4 py1 font-semibold text-sm b b-blue3 rd text-center c-blue9 hover:bg-blue3 transition" on:click={writeToFile}>Save</button>
      </div>
    </div>
  </div>
</main>

<style>
:global(html,body,#app) {
  height: 100%;
}
</style>
