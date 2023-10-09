<script>
import { onMount } from 'svelte'
import { init } from 'pell'
import Footer from './lib/footer.svelte';
import Header from './lib/header.svelte';

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
    ],
    classes: {
      actionbar: 'pell-actionbar'
    }
  })

  await showListOfFile()
})
</script>

<Header />
<main class="flex flex-col md:flex-row gap8 md:gap0 mt10 max-w-screen-xl wfull mx-auto md:h-xl h-3xl px4 md:px0">
  <div class="b b-zinc7 rd md:(rd-r-0 rd-l) shadow bg-zinc9 wfull h-550px overflow-y-auto md:w-35rem md:h-auto">
    <div class="flex py3 px2 justify-between">
        <button class={`py1 px4 bg-neutral9 b b-neutral6 hover:bg-neutral8 c-neutral1 rd transition font-semibold text-sm items-center gap-2 ${!isNewFile ? 'inline-flex' : 'hidden'}`} on:click={toggleInputFilename}>New file <i class="i-ph:plus block"/></button>
        <button class={`py1 px4 bg-red8 b b-red5 hover:bg-red7 c-red1 rd transition font-semibold text-sm items-center gap-2 ${selectedFilename ? 'inline-flex' : 'hidden'}`} on:click={deleteFile}>Delete <i class="i-ph:trash block"/></button>
        <input class:hidden={!isNewFile} on:keydown={key=>key.code === 'Enter' ? createFile():null} bind:value={newFilenameInput} class="wfull py1 px2 b rd outline-none focus:ring-2 bg-zinc-8 b-zinc-7 c-zinc-1" id="input-filename" placeholder="New file name" />
        <button class={`py1 px4 ml2 bg-neutral9 b b-neutral6 hover:bg-neutral8 c-neutral1 rd transition font-semibold text-sm items-center gap-2 ${isNewFile ? 'inline-flex' : 'hidden'}`} on:click={createFile}>Add</button>
  </div>
    <ul class="flex flex-col b-t b-t-zinc7">
      {#if files.length === 0}
      	<p class="c-gray text-sm mx-auto py8">Empty</p>
      {/if}
      {#each files as filename}
        <li >
          <button class={`p2 wfull text-left hover:bg-violet8 c-violet1 inline-flex items-center gap2 ${selectedFilename === filename ? 'bg-violet9 hover:bg-violet-9' : ''}`} on:click={()=>showFileContent(filename)}><i class="i-ph:file block"/> {filename}</button>
        </li>
      {/each}
    </ul>
  </div>
  <div class="b b-zinc-7 rd md:(rd-l-0 rd-r) shadow p4 wfull hfull bg-zinc9 c-zinc1">
    <p class:hidden={selectedFilename} class="c-gray text-center text-sm mt-1/3">Welcome! Click any file to edit</p>
    <div class:hidden={!selectedFilename}>
      <b class="text-2xl">{selectedFilename}</b>
      <div id="pell" class="shadow b b-zinc7 mt4"></div>
      <div class="flex items-center gap4 pt4">
        <button class="bg-zinc8 px4 py1 font-semibold text-sm b b-zinc5 rd text-center c-zinc1 hover:bg-zinc7 transition" on:click={() => selectedFilename = ''}>Cancel</button>
        <button class="bg-blue8 px4 py1 font-semibold text-sm b b-blue5 rd text-center c-blue1 hover:bg-blue7 transition" on:click={writeToFile}>Save</button>
      </div>
    </div>
  </div>
</main>

<Footer/>

<style>
:global(html,body,#app) {
  height: 100%;
}

:global(#app) {
  display: flex;
  flex-direction: column;
}

:global(body) {
  background-image: url(/bg.svg);
  object-position: center;
  object-fit: fill;
  background-color: black;
}

:global(.pell-actionbar) {
  background-color: #27272a;
  border-color: #334155;
}

:global(.pell-button-selected) {
  background-color: #334155;
}
</style>
